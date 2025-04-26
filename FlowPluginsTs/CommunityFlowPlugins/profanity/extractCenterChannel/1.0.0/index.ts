import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getFileName, getPluginWorkDir } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Extract Center Channel',
  description: 'Extract center channel from 5.1 audio for profanity redaction',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'audio,profanity',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faVolumeUp',
  inputs: [
    {
      label: 'Audio File Path',
      name: 'audioFilePath',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Path to the audio file (leave empty to use the file from the previous plugin)',
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
          'wav',
          'mp3',
          'aac',
        ],
      },
      tooltip: 'Format for the extracted center channel',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Center channel extraction successful',
    },
    {
      number: 2,
      tooltip: 'Center channel extraction failed',
    },
    {
      number: 3,
      tooltip: 'Not a 5.1 audio stream (skipped)',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting center channel extraction for profanity redaction');

  try {
    // Get the audio file path
    let audioFilePath = args.inputs.audioFilePath as string;
    const outputFormat = args.inputs.outputFormat as string;

    // If no audio file path is provided, use the one from the previous plugin
    if (!audioFilePath) {
      if (args.variables?.user?.extractedAudioPath) {
        audioFilePath = args.variables.user.extractedAudioPath;
        args.jobLog(`Using audio file path from previous plugin: ${audioFilePath}`);
      } else {
        args.jobLog('No audio file path provided and none found in variables');
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 2, // Failed
          variables: args.variables,
        };
      }
    }

    // Check if the audio has 6 channels (5.1)
    const channelCount = args.variables?.user?.extractedAudioChannels 
      ? parseInt(args.variables.user.extractedAudioChannels, 10) 
      : 0;

    if (channelCount !== 6) {
      args.jobLog(`Audio does not have 6 channels (5.1). Found ${channelCount} channels.`);
      args.jobLog('Skipping center channel extraction');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 3, // Not 5.1 audio
        variables: args.variables,
      };
    }

    // Use the same temp folder that the whole workflow is working in
    // Extract the directory from the input audio path
    const audioDir = audioFilePath.substring(0, audioFilePath.lastIndexOf('/'));
    const fileName = getFileName(audioFilePath);
    const outputFilePath = `${audioDir}/${fileName}_center.${outputFormat}`;

    args.jobLog(`Extracting center channel from 5.1 audio: ${audioFilePath}`);
    args.jobLog(`Output format: ${outputFormat}`);
    args.jobLog(`Output file: ${outputFilePath}`);

    // Build FFmpeg command to extract center channel
    // The pan filter extracts the center channel (third channel in 5.1)
    const ffmpegArgs = [
      '-i', audioFilePath,
      '-filter_complex', 'pan=mono|c0=c2',
      '-c:a',
    ];

    // Add codec based on output format
    switch (outputFormat) {
      case 'mp3':
        ffmpegArgs.push('libmp3lame');
        ffmpegArgs.push('-q:a', '2'); // High quality
        break;
      case 'ac3':
        ffmpegArgs.push('ac3');
        ffmpegArgs.push('-b:a', '192k');
        break;
      case 'aac':
        ffmpegArgs.push('aac');
        ffmpegArgs.push('-b:a', '192k');
        break;
      default:
        // WAV or other formats
        ffmpegArgs.push('pcm_s16le');
        break;
    }

    // Add output file path
    ffmpegArgs.push(outputFilePath);

    args.jobLog(`Executing FFmpeg command to extract center channel`);

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
      args.jobLog('FFmpeg center channel extraction failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    args.jobLog(`Center channel extraction successful: ${outputFilePath}`);

    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        centerChannelPath: outputFilePath,
        centerChannelFormat: outputFormat,
        originalAudioPath: audioFilePath, // Keep track of the original audio path for recombination later
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
    args.jobLog(`Error extracting center channel: ${errorMessage}`);
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