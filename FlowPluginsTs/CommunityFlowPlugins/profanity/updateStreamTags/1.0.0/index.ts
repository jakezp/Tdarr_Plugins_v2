import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Update Stream Tags',
  description: 'Update stream tags and names in the redacted container',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'metadata,streams,tags',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faTags',
  inputs: [
    {
      label: 'Redacted Audio Stream Title',
      name: 'redactedAudioTitle',
      type: 'string',
      defaultValue: '{CODEC} - {LANG} - Family',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Title for the redacted audio stream. Use {CODEC} and {LANG} as placeholders.',
    },
    {
      label: 'Original Audio Stream Title',
      name: 'originalAudioTitle',
      type: 'string',
      defaultValue: '{CODEC} - {LANG} - Original',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Title for the original audio stream. Use {CODEC} and {LANG} as placeholders.',
    },
    {
      label: 'Subtitle Title',
      name: 'subtitleTitle',
      type: 'string',
      defaultValue: 'Family ({LANG})',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Title for the subtitle file. Use {LANG} as a placeholder.',
    },
    {
      label: 'Default Language',
      name: 'defaultLanguage',
      type: 'string',
      defaultValue: 'eng',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Default language code to use if language cannot be detected.',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Stream tags updated successfully',
    },
    {
      number: 2,
      tooltip: 'Failed to update stream tags',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting update of stream tags and names');

  try {
    // Get the inputs
    const redactedAudioTitle = args.inputs.redactedAudioTitle as string;
    const originalAudioTitle = args.inputs.originalAudioTitle as string;
    const subtitleTitle = args.inputs.subtitleTitle as string;
    const defaultLanguage = args.inputs.defaultLanguage as string;

    // Get the file path
    const filePath = args.inputFileObj._id;
    if (!filePath) {
      args.jobLog('No input file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Get stream info using ffprobe
    const ffprobeCmd = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      filePath,
    ];

    args.jobLog('Getting stream info with ffprobe');
    const ffprobeCli = new CLI({
      cli: 'ffprobe',
      spawnArgs: ffprobeCmd,
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath: '',
      inputFileObj: args.inputFileObj,
      logFullCliOutput: args.logFullCliOutput,
      updateWorker: args.updateWorker,
      args,
    });

    const ffprobeResult = await ffprobeCli.runCli();
    if (ffprobeResult.cliExitCode !== 0) {
      args.jobLog('Failed to get stream info with ffprobe');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Parse the ffprobe output
    let streamInfo;
    try {
      // The output might be in different properties depending on the CLI implementation
      // Since we don't have direct access to stdout, we'll use a workaround
      // We'll create a temporary file to store the ffprobe output
      const fs = require('fs');
      const tempOutputPath = `${path.dirname(filePath)}/ffprobe_output_${Date.now()}.json`;
      
      // Run ffprobe again with output to file
      const ffprobeFileCmd = [
        '-v', 'quiet',
        '-print_format', 'json',
        '-show_streams',
        '-o', tempOutputPath,
        filePath,
      ];
      
      const ffprobeFileCli = new CLI({
        cli: 'ffprobe',
        spawnArgs: ffprobeFileCmd,
        spawnOpts: {},
        jobLog: args.jobLog,
        outputFilePath: tempOutputPath,
        inputFileObj: args.inputFileObj,
        logFullCliOutput: args.logFullCliOutput,
        updateWorker: args.updateWorker,
        args,
      });
      
      await ffprobeFileCli.runCli();
      
      // Read the output file
      if (fs.existsSync(tempOutputPath)) {
        const stdoutContent = fs.readFileSync(tempOutputPath, 'utf8');
        streamInfo = JSON.parse(stdoutContent);
        
        // Clean up the temporary file
        fs.unlinkSync(tempOutputPath);
      } else {
        throw new Error('Failed to get ffprobe output');
      }
    } catch (error) {
      args.jobLog(`Error parsing ffprobe output: ${error}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    if (!streamInfo || !streamInfo.streams) {
      args.jobLog('No stream info found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Build the ffmpeg command to update stream metadata
    const metadataArgs: string[] = [];
    let audioStreamIndex = 0;
    let subtitleStreamIndex = 0;

    // Process each stream
    streamInfo.streams.forEach((stream: any, index: number) => {
      if (stream.codec_type === 'audio') {
        // Get codec and language
        const codec = stream.codec_name?.toUpperCase() || 'AC3';
        const lang = stream.tags?.language || defaultLanguage;
        
        // Set title based on whether it's the first audio stream (redacted) or not (original)
        let title;
        if (audioStreamIndex === 0) {
          // First audio stream is the redacted one
          title = redactedAudioTitle
            .replace('{CODEC}', codec)
            .replace('{LANG}', lang.toUpperCase());
        } else {
          // Other audio streams are original
          title = originalAudioTitle
            .replace('{CODEC}', codec)
            .replace('{LANG}', lang.toUpperCase());
        }
        
        // Add metadata arguments
        metadataArgs.push(`-metadata:s:a:${audioStreamIndex}`, `title=${title}`);
        metadataArgs.push(`-metadata:s:a:${audioStreamIndex}`, `language=${lang}`);
        
        // Set the first audio stream as default
        if (audioStreamIndex === 0) {
          metadataArgs.push(`-disposition:a:${audioStreamIndex}`, 'default');
        } else {
          metadataArgs.push(`-disposition:a:${audioStreamIndex}`, 'none');
        }
        
        audioStreamIndex++;
      } else if (stream.codec_type === 'subtitle') {
        // Get language
        const lang = stream.tags?.language || defaultLanguage;
        
        // Set title
        const title = subtitleTitle.replace('{LANG}', lang.toUpperCase());
        
        // Add metadata arguments
        metadataArgs.push(`-metadata:s:s:${subtitleStreamIndex}`, `title=${title}`);
        metadataArgs.push(`-metadata:s:s:${subtitleStreamIndex}`, `language=${lang}`);
        
        subtitleStreamIndex++;
      }
    });

    // Create a temporary output file
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath);
    const outputFilePath = `${fileDir}/${fileName}_tagged${fileExt}`;

    // Build the ffmpeg command
    const ffmpegArgs = [
      '-i', filePath,
      '-map', '0',
      '-c', 'copy',
      ...metadataArgs,
      outputFilePath,
    ];

    args.jobLog(`Executing FFmpeg command to update stream tags`);
    args.jobLog(`FFmpeg arguments: ${ffmpegArgs.join(' ')}`);

    // Execute FFmpeg command
    const cli = new CLI({
      cli: args.ffmpegPath,
      spawnArgs: ffmpegArgs,
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath,
      inputFileObj: args.inputFileObj,
      logFullCliOutput: args.logFullCliOutput,
      updateWorker: args.updateWorker,
      args,
    });

    const res = await cli.runCli();

    if (res.cliExitCode !== 0) {
      args.jobLog('FFmpeg stream tag update failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Replace the original file with the tagged file
    const fs = require('fs');
    fs.unlinkSync(filePath);
    fs.renameSync(outputFilePath, filePath);

    args.jobLog(`Stream tags updated successfully`);

    return {
      outputFileObj: {
        _id: filePath,
      },
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in updating stream tags: ${errorMessage}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2, // Failed
      variables: args.variables,
    };
  }
};

export {
  details,
  plugin,
};