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
  name: 'Convert Audio to AC3',
  description: 'Convert all audio streams to AC3 format, downmixing to 5.1 if needed',
  style: {
    borderColor: '#3498db', // Blue color for audio plugins
  },
  tags: 'audio,ac3,conversion,downmix',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faVolumeHigh',
  inputs: [
    {
      label: 'Maximum Bitrate (kbps)',
      name: 'maxBitrate',
      type: 'string',
      defaultValue: '640',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Maximum bitrate for AC3 audio in kbps (will use original bitrate if lower)',
    },
    {
      label: 'Preserve Original Audio',
      name: 'preserveOriginal',
      type: 'boolean',
      defaultValue: 'false',
      inputUI: {
        type: 'dropdown',
        options: [
          'true',
          'false',
        ],
      },
      tooltip: 'Keep the original audio streams alongside the converted AC3 streams',
    },
    {
      label: 'Default Audio Language',
      name: 'defaultLanguage',
      type: 'string',
      defaultValue: 'eng',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Default language code to use if language cannot be detected',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Success (audio conversion completed or no conversion needed)',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting audio conversion to AC3');

  try {
    // Get the inputs
    const maxBitrate = parseInt(args.inputs.maxBitrate as string, 10);
    const preserveOriginal = args.inputs.preserveOriginal === 'true';
    const defaultLanguage = args.inputs.defaultLanguage as string;

    // Get the file path
    const filePath = args.inputFileObj._id;
    if (!filePath) {
      args.jobLog('No input file found');
      throw new Error('No input file found');
    }

    args.jobLog(`Processing file: ${filePath}`);

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
      throw new Error('Failed to get stream info with ffprobe');
    }

    // Parse the ffprobe output
    let streamInfo;
    try {
      // Create a temporary file to store the ffprobe output
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
      throw new Error('No stream info found');
    }

    // Find audio streams
    const audioStreams = streamInfo.streams.filter((stream: any) => stream.codec_type === 'audio');
    
    if (audioStreams.length === 0) {
      args.jobLog('No audio streams found, nothing to convert');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1, // Success (nothing to do)
        variables: args.variables,
      };
    }

    args.jobLog(`Found ${audioStreams.length} audio streams`);

    // Check if any audio streams need conversion
    const streamsToConvert = audioStreams.filter((stream: any) => {
      // Convert if not AC3 or if more than 6 channels
      return stream.codec_name !== 'ac3' || (stream.channels > 6);
    });

    if (streamsToConvert.length === 0) {
      args.jobLog('All audio streams are already AC3 with 6 or fewer channels');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1, // Success (no conversion needed)
        variables: args.variables,
      };
    }

    args.jobLog(`Found ${streamsToConvert.length} audio streams to convert`);

    // Create output file path
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileExt = path.extname(filePath);
    const outputFilePath = `${fileDir}/${fileName}_ac3${fileExt}`;

    // Build FFmpeg command
    const ffmpegArgs = [
      '-i', filePath,
      '-map', '0',
      '-c:v', 'copy',
      '-c:s', 'copy',
      '-c:d', 'copy',
      '-c:t', 'copy',
    ];

    // Process each audio stream
    audioStreams.forEach((stream: any, index: number) => {
      const streamIndex = stream.index;
      const needsConversion = stream.codec_name !== 'ac3' || stream.channels > 6;
      
      if (needsConversion) {
        args.jobLog(`Converting stream ${streamIndex} (${stream.codec_name}, ${stream.channels} channels)`);
        
        // Determine output channels and bitrate
        let outputChannels = stream.channels;
        
        // Calculate appropriate bitrate based on original stream
        let originalBitrate = 0;
        if (stream.bit_rate) {
          originalBitrate = Math.ceil(parseInt(stream.bit_rate, 10) / 1000);
          args.jobLog(`Original bitrate: ${originalBitrate}k`);
        } else {
          // Estimate bitrate based on codec and channels if not available
          if (stream.codec_name === 'truehd' || stream.codec_name === 'dts') {
            originalBitrate = stream.channels * 128; // Rough estimate
          } else if (stream.codec_name === 'eac3') {
            originalBitrate = stream.channels * 96;
          } else if (stream.codec_name === 'aac') {
            originalBitrate = stream.channels * 64;
          } else {
            originalBitrate = stream.channels * 80; // Default estimate
          }
          args.jobLog(`Estimated original bitrate: ${originalBitrate}k (based on codec and channels)`);
        }
        
        // Downmix if more than 6 channels
        if (outputChannels > 6) {
          outputChannels = 6; // 5.1
          args.jobLog(`Downmixing from ${stream.channels} to 5.1 channels`);
        }
        
        // Determine appropriate bitrate for AC3
        let outputBitrate;
        if (outputChannels <= 2) {
          // For stereo, cap at 192k but don't exceed original
          outputBitrate = Math.min(originalBitrate, 192);
        } else if (outputChannels <= 6) {
          // For 5.1, cap at maxBitrate but don't exceed original
          outputBitrate = Math.min(originalBitrate, maxBitrate);
          // Ensure minimum quality for 5.1
          outputBitrate = Math.max(outputBitrate, 384);
        }
        
        args.jobLog(`Using ${outputBitrate}k bitrate for ${outputChannels} channels`);
        
        // Add conversion options
        ffmpegArgs.push(`-c:a:${index}`, 'ac3');
        ffmpegArgs.push(`-b:a:${index}`, `${outputBitrate}k`);
        ffmpegArgs.push(`-ac:a:${index}`, outputChannels.toString());
        
        // Set language if available
        const lang = stream.tags?.language || defaultLanguage;
        ffmpegArgs.push(`-metadata:s:a:${index}`, `language=${lang}`);
        
        // Copy any other metadata
        if (stream.tags?.title) {
          ffmpegArgs.push(`-metadata:s:a:${index}`, `title=${stream.tags.title}`);
        }
      } else if (preserveOriginal) {
        // Stream is already AC3 with 6 or fewer channels, just copy it
        args.jobLog(`Stream ${streamIndex} is already AC3 with ${stream.channels} channels, copying`);
        ffmpegArgs.push(`-c:a:${index}`, 'copy');
      } else {
        // Stream is already AC3 with 6 or fewer channels, just copy it
        args.jobLog(`Stream ${streamIndex} is already AC3 with ${stream.channels} channels, copying`);
        ffmpegArgs.push(`-c:a:${index}`, 'copy');
      }
    });

    // Add output file
    ffmpegArgs.push(outputFilePath);

    args.jobLog(`Executing FFmpeg command to convert audio streams`);
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
      args.jobLog('FFmpeg audio conversion failed');
      throw new Error('FFmpeg audio conversion failed');
    }

    args.jobLog(`Audio conversion successful: ${outputFilePath}`);

    return {
      outputFileObj: {
        _id: outputFilePath,
      },
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in audio conversion: ${errorMessage}`);
    throw error; // Let Tdarr handle the error
  }
};

export {
  details,
  plugin,
};