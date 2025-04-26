import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Check Audio Channel Count',
  description: 'Check if audio is 5.1, stereo, or mono for profanity redaction',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'audio,profanity',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faVolumeHigh',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'File has 5.1 audio (6 channels)',
    },
    {
      number: 2,
      tooltip: 'File has stereo audio (2 channels)',
    },
    {
      number: 3,
      tooltip: 'File has mono audio (1 channel)',
    },
    {
      number: 4,
      tooltip: 'File has no audio or unsupported channel configuration',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = (args: IpluginInputArgs): IpluginOutputArgs => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Checking audio channel count for profanity redaction routing');

  // Default to output 4 (no audio or unsupported)
  let outputNumber = 4;
  
  // Check if the file has streams data
  if (Array.isArray(args?.inputFileObj?.ffProbeData?.streams)) {
    // Find audio streams
    const audioStreams = args.inputFileObj.ffProbeData.streams.filter(
      (stream) => stream.codec_type === 'audio'
    );
    
    args.jobLog(`Found ${audioStreams.length} audio stream(s)`);
    
    if (audioStreams.length > 0) {
      // Get the first audio stream (typically the default one)
      const primaryAudioStream = audioStreams[0];
      const channelCount = primaryAudioStream.channels;
      
      if (channelCount !== undefined) {
        args.jobLog(`Primary audio stream has ${channelCount} channel(s)`);
        args.jobLog(`Audio codec: ${primaryAudioStream.codec_name || 'unknown'}`);
        
        // Determine output based on channel count
        if (channelCount === 6) {
          args.jobLog('Detected 5.1 audio (6 channels)');
          outputNumber = 1;
        } else if (channelCount === 2) {
          args.jobLog('Detected stereo audio (2 channels)');
          outputNumber = 2;
        } else if (channelCount === 1) {
          args.jobLog('Detected mono audio (1 channel)');
          outputNumber = 3;
        } else {
          args.jobLog(`Unsupported channel configuration: ${channelCount} channels`);
          outputNumber = 4;
        }
        
        // Add audio stream details to variables for downstream plugins
        args.variables = {
          ...args.variables,
          user: {
            ...args.variables.user,
            audioChannelCount: channelCount.toString(),
            audioCodec: primaryAudioStream.codec_name || 'unknown',
            audioStreamIndex: (primaryAudioStream.index || 0).toString(),
          },
        };
      } else {
        args.jobLog('Could not determine channel count for audio stream');
        outputNumber = 4;
      }
    } else {
      args.jobLog('No audio streams found in the file');
    }
  } else {
    args.jobLog('File has no stream data');
  }

  return {
    outputFileObj: args.inputFileObj,
    outputNumber,
    variables: args.variables,
  };
};

export {
  details,
  plugin,
};