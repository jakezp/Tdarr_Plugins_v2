import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Update Stream Tags and Remux to MKV',
  description: 'Update stream tags, add profanity_filtered tag, and remux to MKV container to ensure metadata is preserved',
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
      cli: '/usr/lib/jellyfin-ffmpeg/ffprobe',
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
        cli: '/usr/lib/jellyfin-ffmpeg/ffprobe',
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
    let videoStreamIndex = 0;
    
    // First pass: analyze streams to determine language for redacted audio
    // We want to use the same language as the original audio if possible
    let originalAudioLanguage = defaultLanguage;
    let originalAudioFound = false;
    
    for (const stream of streamInfo.streams) {
      if (stream.codec_type === 'audio' && stream.index > 0) {
        // This is not the first audio stream, so it's likely the original
        if (stream.tags?.language && stream.tags.language !== 'und') {
          originalAudioLanguage = stream.tags.language;
          originalAudioFound = true;
          args.jobLog(`Found original audio language: ${originalAudioLanguage}`);
          break;
        }
      }
    }
    
    // If we didn't find an original audio stream with a language, try to get it from the first audio stream
    if (!originalAudioFound) {
      for (const stream of streamInfo.streams) {
        if (stream.codec_type === 'audio') {
          if (stream.tags?.language && stream.tags.language !== 'und') {
            originalAudioLanguage = stream.tags.language;
            args.jobLog(`Using first audio stream language: ${originalAudioLanguage}`);
            break;
          }
        }
      }
    }
    
    // Second pass: update metadata for all streams
    streamInfo.streams.forEach((stream: any, index: number) => {
      if (stream.codec_type === 'video') {
        // Set language for video streams
        metadataArgs.push(`-metadata:s:v:${videoStreamIndex}`, `language=${defaultLanguage}`);
        
        // Add description if it doesn't exist
        if (!stream.tags?.title) {
          metadataArgs.push(`-metadata:s:v:${videoStreamIndex}`, `title=Video`);
        }
        
        videoStreamIndex++;
      } else if (stream.codec_type === 'audio') {
        // Get codec and language
        const codec = stream.codec_name?.toUpperCase() || 'AC3';
        
        // For the first audio stream (redacted), use the language from the original audio
        // For other streams, use their existing language or the default
        let lang;
        if (audioStreamIndex === 0) {
          // First audio stream is the redacted one - use the original audio language
          lang = originalAudioLanguage;
          args.jobLog(`Setting redacted audio language to: ${lang}`);
        } else {
          // Other audio streams - use their existing language or default
          lang = stream.tags?.language || defaultLanguage;
        }
        
        // Set title based on whether it's the first audio stream (redacted) or not (original)
        let title;
        let displayLang = lang.toUpperCase();
        
        // Map language codes to display names
        if (lang === 'eng') displayLang = 'English';
        else if (lang === 'fre' || lang === 'fra') displayLang = 'French';
        else if (lang === 'ger' || lang === 'deu') displayLang = 'German';
        else if (lang === 'spa') displayLang = 'Spanish';
        else if (lang === 'ita') displayLang = 'Italian';
        else if (lang === 'jpn') displayLang = 'Japanese';
        else if (lang === 'chi' || lang === 'zho') displayLang = 'Chinese';
        
        if (audioStreamIndex === 0) {
          // First audio stream is the redacted one
          title = redactedAudioTitle
            .replace('{CODEC}', codec)
            .replace('{LANG}', displayLang);
        } else {
          // Other audio streams are original
          title = originalAudioTitle
            .replace('{CODEC}', codec)
            .replace('{LANG}', displayLang);
        }
        
        // Add metadata arguments
        metadataArgs.push(`-metadata:s:a:${audioStreamIndex}`, `title=${title}`);
        metadataArgs.push(`-metadata:s:a:${audioStreamIndex}`, `language=${lang}`);
        
        // Set the first audio stream as default and add profanity_filtered tag
        if (audioStreamIndex === 0) {
          metadataArgs.push(`-disposition:a:${audioStreamIndex}`, 'default');
          // Add custom 'profanity_filtered' tag to the first audio stream (redacted/Family)
          metadataArgs.push(`-metadata:s:a:${audioStreamIndex}`, `profanity_filtered=true`);
          args.jobLog(`Adding profanity_filtered tag to audio stream ${audioStreamIndex}`);
        } else {
          metadataArgs.push(`-disposition:a:${audioStreamIndex}`, 'none');
        }
        
        audioStreamIndex++;
      } else if (stream.codec_type === 'subtitle') {
        // Get language
        const lang = stream.tags?.language || defaultLanguage;
        
        // Map language codes to display names
        let displayLang = lang.toUpperCase();
        if (lang === 'eng') displayLang = 'English';
        else if (lang === 'fre' || lang === 'fra') displayLang = 'French';
        else if (lang === 'ger' || lang === 'deu') displayLang = 'German';
        else if (lang === 'spa') displayLang = 'Spanish';
        else if (lang === 'ita') displayLang = 'Italian';
        else if (lang === 'jpn') displayLang = 'Japanese';
        else if (lang === 'chi' || lang === 'zho') displayLang = 'Chinese';
        
        // Set title
        const title = subtitleTitle.replace('{LANG}', displayLang);
        
        // Add metadata arguments
        metadataArgs.push(`-metadata:s:s:${subtitleStreamIndex}`, `title=${title}`);
        metadataArgs.push(`-metadata:s:s:${subtitleStreamIndex}`, `language=${lang}`);
        
        subtitleStreamIndex++;
      }
    });
    
    args.jobLog(`Setting language tags for ${videoStreamIndex} video streams, ${audioStreamIndex} audio streams, and ${subtitleStreamIndex} subtitle streams`);

    // Create an output file with _tagged suffix - always use MKV container
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    // Always use MKV extension to ensure metadata is preserved
    const outputFilePath = `${fileDir}/${fileName}_tagged.mkv`;
    
    args.jobLog(`Remuxing to MKV container to ensure metadata tags are preserved`);
    args.jobLog(`Output file path: ${outputFilePath}`);

    // Build the ffmpeg command
    const ffmpegArgs = [
      '-y',  // Automatically overwrite output files
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

    // Keep the tagged file as a separate file (don't replace the original)
    args.jobLog(`Stream tags updated successfully`);
    args.jobLog(`Tagged file created at: ${outputFilePath}`);

    // Log all variables for debugging
    args.jobLog(`Variables before return: ${JSON.stringify(args.variables?.user || {})}`);

    // Set the redactedVideoPath variable to the tagged file path
    return {
      outputFileObj: {
        _id: outputFilePath, // Use the tagged file as the output
      },
      outputNumber: 1, // Success
      variables: {
        ...args.variables,
        user: {
          ...args.variables?.user,
          redactedVideoPath: outputFilePath, // Point to the tagged file
        },
      },
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