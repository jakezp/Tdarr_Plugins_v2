import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';
import * as fs from 'fs';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Final Assembly',
  description: 'Combine original video with redacted audio and subtitles',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'video,profanity,assembly',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faFilm',
  inputs: [
    {
      label: 'Output File Path',
      name: 'outputFilePath',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Path to save the final video file (leave empty to use the original video path with _redacted suffix)',
    },
    {
      label: 'Output Container',
      name: 'outputContainer',
      type: 'string',
      defaultValue: 'mkv',
      inputUI: {
        type: 'dropdown',
        options: [
          'mkv',
          'mp4',
          'same',
        ],
      },
      tooltip: 'Container format for the output file (mkv, mp4, or same as input)',
    },
    {
      label: 'Copy Video Stream',
      name: 'copyVideoStream',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Copy the video stream without re-encoding',
    },
    {
      label: 'Include Original Audio',
      name: 'includeOriginalAudio',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Include the original audio stream in addition to the redacted audio',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Final assembly successful',
    },
    {
      number: 2,
      tooltip: 'Final assembly failed',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting final assembly of video with redacted audio and subtitles');

  try {
    // Get the inputs
    let outputFilePath = args.inputs.outputFilePath as string;
    const outputContainer = args.inputs.outputContainer as string;
    const copyVideoStream = args.inputs.copyVideoStream as boolean;
    const includeOriginalAudio = args.inputs.includeOriginalAudio as boolean;

    // Get the original video file
    const originalVideoPath = args.inputFileObj._id;
    if (!originalVideoPath) {
      args.jobLog('No original video file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Get the processed audio file - either combined (for 5.1) or directly redacted (for stereo)
    let processedAudioPath = args.variables?.user?.combinedAudioPath;
    
    // If no combined audio path is found, check if we have a redacted audio path (for stereo files)
    if (!processedAudioPath) {
      processedAudioPath = args.variables?.user?.redactedAudioPath;
      args.jobLog('No combined audio file found, checking for redacted audio (stereo case)');
      
      if (!processedAudioPath) {
        args.jobLog('No processed audio file found (neither combined nor redacted)');
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 2, // Failed
          variables: args.variables,
        };
      }
      
      args.jobLog(`Using redacted audio path for stereo file: ${processedAudioPath}`);
    } else {
      args.jobLog(`Using combined audio path for 5.1 file: ${processedAudioPath}`);
    }

    // Note: We don't embed subtitles as per user's request
    // The subtitle file will be kept separate alongside the media file
    
    // We don't need to get the original audio file separately since it's already in the original video container

    // Determine the output file path and container
    if (!outputFilePath) {
      const originalDir = path.dirname(originalVideoPath);
      const originalName = path.basename(originalVideoPath, path.extname(originalVideoPath));
      let finalExt = path.extname(originalVideoPath);
      
      if (outputContainer !== 'same') {
        finalExt = `.${outputContainer}`;
      }
      
      outputFilePath = `${originalDir}/${originalName}_redacted${finalExt}`;
    }

    // Create a temporary script file with the FFmpeg command
    const scriptDir = path.dirname(originalVideoPath);
    const scriptPath = `${scriptDir}/ffmpeg_assembly_${Date.now()}.sh`;
    
    // Build the FFmpeg command
    let ffmpegCmd = `${args.ffmpegPath} -y`;
    
    // Add input files - original video and processed audio
    ffmpegCmd += ` -i "${originalVideoPath}" -i "${processedAudioPath}"`;
    
    // Add mapping options
    if (copyVideoStream) {
      ffmpegCmd += ' -map 0:v:0 -c:v copy'; // Copy video stream
    } else {
      ffmpegCmd += ' -map 0:v:0'; // Map video stream but don't specify codec (use default)
    }
    
    // Map video stream from original video
    if (copyVideoStream) {
      ffmpegCmd += ' -map 0:v -c:v copy'; // Copy all video streams
    } else {
      ffmpegCmd += ' -map 0:v'; // Map all video streams but don't specify codec
    }
    
    // Map redacted audio stream and set it as default
    ffmpegCmd += ' -map 1:a -c:a copy -disposition:a:0 default';
    
    // Map original audio streams from original video if requested
    if (includeOriginalAudio) {
      ffmpegCmd += ' -map 0:a -c:a copy -disposition:a:1 none';
    }
    
    // Map any subtitle streams from original video (but don't embed SRT file)
    ffmpegCmd += ' -map 0:s? -c:s copy';
    
    // Add output file
    ffmpegCmd += ` "${outputFilePath}"`;
    
    // Write the script file
    fs.writeFileSync(scriptPath, ffmpegCmd);
    fs.chmodSync(scriptPath, '755'); // Make it executable
    
    args.jobLog(`Created FFmpeg assembly script: ${scriptPath}`);
    args.jobLog(`FFmpeg command: ${ffmpegCmd}`);
    
    // Execute the script
    const ffmpegArgs = [
      scriptPath
    ];
    
    const cli = new CLI({
      cli: '/bin/sh',
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
    
    // Clean up the script file
    try {
      fs.unlinkSync(scriptPath);
    } catch (err) {
      args.jobLog(`Warning: Could not delete temporary script file: ${err}`);
    }
    
    if (res.cliExitCode !== 0) {
      args.jobLog('FFmpeg final assembly failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }
    
    args.jobLog(`Final assembly successful: ${outputFilePath}`);
    
    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        finalOutputPath: outputFilePath,
      },
    };
    
    return {
      outputFileObj: {
        _id: outputFilePath,
      },
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in final assembly: ${errorMessage}`);
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