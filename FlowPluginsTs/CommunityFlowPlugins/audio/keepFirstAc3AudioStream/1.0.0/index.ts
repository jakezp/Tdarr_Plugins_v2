import { checkFfmpegCommandInit } from '../../../../FlowHelpers/1.0.0/interfaces/flowUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

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

const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  // Check if ffmpegCommand is initialized
  checkFfmpegCommandInit(args);

  // Find all audio streams
  const audioStreams = args.variables.ffmpegCommand.streams.filter(
    (stream) => stream.codec_type === 'audio',
  );

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
  
  // Mark all other audio streams for removal
  let removedCount = 0;
  args.variables.ffmpegCommand.streams.forEach((stream) => {
    if (stream.codec_type === 'audio' && stream.index !== firstAudioStream.index) {
      // eslint-disable-next-line no-param-reassign
      stream.removed = true;
      removedCount += 1;
      args.jobLog(`Removing audio stream index ${stream.index}`);
    }
  });

  args.jobLog(`Kept AC3 audio stream index ${firstAudioStream.index} and removed ${removedCount} other audio streams`);
  
  // Set shouldProcess to true to ensure FFmpeg processes the file
  args.variables.ffmpegCommand.shouldProcess = true;

  return {
    outputFileObj: args.inputFileObj,
    outputNumber: 1, // Success
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};