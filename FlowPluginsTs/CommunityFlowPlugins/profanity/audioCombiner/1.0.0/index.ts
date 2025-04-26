import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getFileName } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';
import * as fs from 'fs';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Audio Combiner',
  description: 'Combine redacted center channel with original audio stream',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'audio,profanity,combine',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faVolumeUp',
  inputs: [
    {
      label: 'Original Audio Path',
      name: 'originalAudioPath',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Path to the original audio file (leave empty to use the file from the previous plugin)',
    },
    {
      label: 'Redacted Center Channel Path',
      name: 'redactedCenterPath',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Path to the redacted center channel file (leave empty to use the file from the previous plugin)',
    },
    {
      label: 'Output Format',
      name: 'outputFormat',
      type: 'string',
      defaultValue: 'ac3',
      inputUI: {
        type: 'dropdown',
        options: [
          'ac3',
          'eac3',
          'aac',
          'same',
        ],
      },
      tooltip: 'Format for the combined audio output',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Audio combination successful',
    },
    {
      number: 2,
      tooltip: 'Audio combination failed',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting audio combination for profanity redaction');

  try {
    // Get the inputs
    let originalAudioPath = args.inputs.originalAudioPath as string;
    let redactedCenterPath = args.inputs.redactedCenterPath as string;
    const outputFormat = args.inputs.outputFormat as string;

    // If no original audio path is provided, use the one from the previous plugin
    if (!originalAudioPath) {
      if (args.variables?.user?.extractedAudioPath) {
        originalAudioPath = args.variables.user.extractedAudioPath;
        args.jobLog(`Using extracted audio path from previous plugin: ${originalAudioPath}`);
      } else {
        args.jobLog('No original audio path provided and none found in variables');
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 2, // Failed
          variables: args.variables,
        };
      }
    }

    // If no redacted center channel path is provided, use the one from the previous plugin
    if (!redactedCenterPath) {
      if (args.variables?.user?.redactedAudioPath) {
        redactedCenterPath = args.variables.user.redactedAudioPath;
        args.jobLog(`Using redacted center channel path from previous plugin: ${redactedCenterPath}`);
      } else {
        args.jobLog('No redacted center channel path provided and none found in variables');
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 2, // Failed
          variables: args.variables,
        };
      }
    }

    // Create output file path in the same directory as the original audio
    const audioDir = path.dirname(originalAudioPath);
    const fileName = getFileName(originalAudioPath);
    let fileExt = path.extname(originalAudioPath);
    
    if (outputFormat !== 'same') {
      fileExt = `.${outputFormat}`;
    }
    
    const outputFilePath = `${audioDir}/${fileName}_combined${fileExt}`;

    // Create a temporary script file with the FFmpeg command
    const scriptDir = audioDir;
    const scriptPath = `${scriptDir}/ffmpeg_combine_${Date.now()}.sh`;
    
    // Build the FFmpeg command to replace the center channel
    // We'll use the channelmap filter to extract all channels from the original audio
    // Then replace the center channel with the redacted one and recombine
    const ffmpegCmd = `${args.ffmpegPath} -y -i "${originalAudioPath}" -i "${redactedCenterPath}" -filter_complex "[0:a]channelsplit=channel_layout=5.1[FL][FR][FC][LFE][BL][BR];[1:a]aformat=channel_layouts=mono[redactedFC];[FL][FR][redactedFC][LFE][BL][BR]amerge=inputs=6[out]" -map "[out]" -c:a ${outputFormat === 'same' ? 'copy' : outputFormat} "${outputFilePath}"`;
    
    // Write the script file
    fs.writeFileSync(scriptPath, ffmpegCmd);
    fs.chmodSync(scriptPath, '755'); // Make it executable
    
    args.jobLog(`Created FFmpeg combine script: ${scriptPath}`);
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
      args.jobLog('FFmpeg audio combination failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }
    
    args.jobLog(`Audio combination successful: ${outputFilePath}`);
    
    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        combinedAudioPath: outputFilePath,
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
    args.jobLog(`Error in audio combination: ${errorMessage}`);
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