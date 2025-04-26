import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getFileName, getPluginWorkDir } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Extract Audio Stream',
  description: 'Extract audio stream from video file while preserving original format',
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
      label: 'Stream Index',
      name: 'streamIndex',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Audio stream index to extract (leave empty to use the first audio stream)',
    },
    {
      label: 'Keep Original Codec',
      name: 'keepOriginalCodec',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Keep the original audio codec (recommended for best quality)',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Audio extraction successful',
    },
    {
      number: 2,
      tooltip: 'Audio extraction failed',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting audio stream extraction for profanity redaction');

  try {
    // Get the audio stream index to extract
    let streamIndex = args.inputs.streamIndex as string;
    const keepOriginalCodec = args.inputs.keepOriginalCodec as boolean;

    // If no stream index is provided, use the one from the previous plugin or find the first audio stream
    if (!streamIndex) {
      if (args.variables?.user?.audioStreamIndex) {
        streamIndex = args.variables.user.audioStreamIndex;
        args.jobLog(`Using audio stream index from previous plugin: ${streamIndex}`);
      } else {
        // Find the first audio stream
        if (Array.isArray(args?.inputFileObj?.ffProbeData?.streams)) {
          const audioStreams = args.inputFileObj.ffProbeData.streams.filter(
            (stream) => stream.codec_type === 'audio'
          );
          
          if (audioStreams.length > 0) {
            streamIndex = audioStreams[0].index.toString();
            args.jobLog(`Using first audio stream found: ${streamIndex}`);
          } else {
            args.jobLog('No audio streams found in the file');
            return {
              outputFileObj: args.inputFileObj,
              outputNumber: 2, // Failed
              variables: args.variables,
            };
          }
        } else {
          args.jobLog('File has no stream data');
          return {
            outputFileObj: args.inputFileObj,
            outputNumber: 2, // Failed
            variables: args.variables,
          };
        }
      }
    }

    // Get audio codec information
    let audioCodec = 'copy'; // Default to copy (keep original codec)
    if (!keepOriginalCodec) {
      audioCodec = 'pcm_s16le'; // Use PCM if not keeping original codec
    }

    // Get the audio stream details
    if (!Array.isArray(args?.inputFileObj?.ffProbeData?.streams)) {
      args.jobLog('File has no stream data');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    const audioStream = args.inputFileObj.ffProbeData.streams.find(
      (stream) => stream.index.toString() === streamIndex
    );

    if (!audioStream) {
      args.jobLog(`Audio stream with index ${streamIndex} not found`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    args.jobLog(`Extracting audio stream ${streamIndex} with codec ${audioStream.codec_name}`);

    // Create output file path in the plugin work directory
    const workDir = getPluginWorkDir(args);
    const fileName = getFileName(args.inputFileObj._id);
    const outputExtension = keepOriginalCodec ? audioStream.codec_name : 'wav';
    const outputFilePath = `${workDir}/${fileName}_audio.${outputExtension}`;

    // Build FFmpeg command to extract audio
    const ffmpegArgs = [
      '-i', args.inputFileObj._id,
      '-map', `0:${streamIndex}`,
      '-c:a', audioCodec,
    ];

    // Add additional arguments based on the audio codec
    if (keepOriginalCodec) {
      // Keep original codec settings
      ffmpegArgs.push('-copy_unknown');
    } else {
      // Convert to PCM with standard settings
      ffmpegArgs.push('-ar', '48000');
      if (audioStream.channels !== undefined) {
        ffmpegArgs.push('-ac', audioStream.channels.toString());
      } else {
        // Default to stereo if channel count is not available
        ffmpegArgs.push('-ac', '2');
        args.jobLog('Channel count not available, defaulting to stereo (2 channels)');
      }
    }

    // Add output file path
    ffmpegArgs.push(outputFilePath);

    args.jobLog(`Executing FFmpeg command to extract audio stream`);

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
      args.jobLog('FFmpeg audio extraction failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    args.jobLog(`Audio extraction successful: ${outputFilePath}`);

    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        extractedAudioPath: outputFilePath,
        extractedAudioCodec: keepOriginalCodec ? audioStream.codec_name : 'pcm_s16le',
        extractedAudioChannels: audioStream.channels !== undefined
          ? audioStream.channels.toString()
          : '2', // Default to stereo if not available
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
    args.jobLog(`Error extracting audio stream: ${errorMessage}`);
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