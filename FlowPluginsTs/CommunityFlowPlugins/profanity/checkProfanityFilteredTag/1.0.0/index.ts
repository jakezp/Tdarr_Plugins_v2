import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Check Profanity Filtered Tag',
  description: 'Checks if the first audio stream has been processed for profanity (has profanity_filtered tag)',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'metadata,streams,tags,profanity',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faTag',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Audio has been processed (profanity_filtered tag found)',
    },
    {
      number: 2,
      tooltip: 'Audio needs processing (no profanity_filtered tag)',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Checking for profanity_filtered tag on first audio stream');

  try {
    // Get the file path
    const filePath = args.inputFileObj._id;
    if (!filePath) {
      args.jobLog('No input file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Needs processing
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
        outputNumber: 2, // Needs processing
        variables: args.variables,
      };
    }

    // Parse the ffprobe output
    let streamInfo;
    try {
      // Create a temporary file to store the ffprobe output
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
        outputNumber: 2, // Needs processing
        variables: args.variables,
      };
    }

    if (!streamInfo || !streamInfo.streams) {
      args.jobLog('No stream info found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Needs processing
        variables: args.variables,
      };
    }

    // Find the first audio stream
    const audioStreams = streamInfo.streams.filter((stream: any) => stream.codec_type === 'audio');
    
    if (audioStreams.length === 0) {
      args.jobLog('No audio streams found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Needs processing
        variables: args.variables,
      };
    }

    const firstAudioStream = audioStreams[0];
    
    // Check if the first audio stream has the profanity_filtered tag
    // MKV containers might capitalize the tag as "PROFANITY_FILTERED"
    if (firstAudioStream.tags) {
      // Check for the tag in a case-insensitive way
      const hasProfanityTag = Object.keys(firstAudioStream.tags).some(key =>
        key.toLowerCase() === 'profanity_filtered' &&
        firstAudioStream.tags[key].toLowerCase() === 'true'
      );
      
      if (hasProfanityTag) {
        args.jobLog('Found profanity_filtered tag on first audio stream - already processed');
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 1, // Already processed
          variables: args.variables,
        };
      }
    }
    
    args.jobLog('No profanity_filtered tag found on first audio stream - needs processing');
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2, // Needs processing
      variables: args.variables,
    };
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error checking for profanity_filtered tag: ${errorMessage}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 2, // Needs processing
      variables: args.variables,
    };
  }
};

export {
  details,
  plugin,
};