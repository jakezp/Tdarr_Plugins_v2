import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Keep First AC3 Audio Stream Only',
  description: 'WARNING: This plugin is risky and should only be used in specific cases like profanity filtering. '
    + 'It checks if the first audio stream is AC3 codec, and if so, removes all other audio streams. '
    + 'If the first audio stream is not AC3, the process will fail. '
    + 'This can result in loss of audio tracks including commentary, foreign languages, etc.',
  style: {
    borderColor: '#ff6b6b', // Red to indicate potential risk
  },
  tags: 'audio,ac3,filter,profanity',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: '🔊',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'First audio stream is AC3 and other audio streams were removed',
    },
    {
      number: 2,
      tooltip: 'First audio stream is not AC3, process failed',
    },
  ],
});

const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  try {
    // Get the file path
    const filePath = args.inputFileObj._id;
    if (!filePath) {
      args.jobLog('No input file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Fail
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

    // Find all audio streams
    const audioStreams = streamInfo.streams.filter((stream: any) => stream.codec_type === 'audio');

    // If no audio streams found, fail
    if (audioStreams.length === 0) {
      args.jobLog('No audio streams found in the file');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Fail
        variables: args.variables,
      };
    }

    // Get the first audio stream
    const firstAudioStream = audioStreams[0];
    
    // Check if the first audio stream is AC3
    if (firstAudioStream.codec_name.toLowerCase() !== 'ac3') {
      args.jobLog(`First audio stream (index ${firstAudioStream.index}) is not AC3, it's ${firstAudioStream.codec_name}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Fail
        variables: args.variables,
      };
    }

    // First audio stream is AC3, keep it and remove all other audio streams
    args.jobLog(`First audio stream (index ${firstAudioStream.index}) is AC3, keeping only this audio stream`);
    
    // Build the map arguments to keep only the first audio stream
    const mapArgs: string[] = [];
    
    // Map all video streams
    const videoStreams = streamInfo.streams.filter((stream: any) => stream.codec_type === 'video');
    videoStreams.forEach((stream: any) => {
      mapArgs.push('-map', `0:${stream.index}`);
    });
    
    // Map only the first audio stream
    mapArgs.push('-map', `0:${firstAudioStream.index}`);
    
    // Map all subtitle streams
    const subtitleStreams = streamInfo.streams.filter((stream: any) => stream.codec_type === 'subtitle');
    subtitleStreams.forEach((stream: any) => {
      mapArgs.push('-map', `0:${stream.index}`);
    });
    
    // Create a temporary output file
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath);
    const outputFilePath = `${fileDir}/${fileName}_ac3only${fileExt}`;

    // Build the ffmpeg command
    const ffmpegArgs = [
      '-i', filePath,
      ...mapArgs,
      '-c', 'copy',
      '-map_metadata', '0',  // Copy all metadata from input
      '-map_metadata:s:a:0', '0:s:a:0',  // Copy audio stream metadata
      outputFilePath,
    ];

    args.jobLog(`Executing FFmpeg command to keep only the first AC3 audio stream`);
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
      args.jobLog('FFmpeg command failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Replace the original file with the new file
    const fs = require('fs');
    fs.unlinkSync(filePath);
    fs.renameSync(outputFilePath, filePath);

    args.jobLog(`Successfully kept only the first AC3 audio stream`);

    return {
      outputFileObj: {
        _id: filePath,
      },
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in keepFirstAc3AudioStream plugin: ${errorMessage}`);
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