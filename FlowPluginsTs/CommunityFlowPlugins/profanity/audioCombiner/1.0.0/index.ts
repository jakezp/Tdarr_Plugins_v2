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
    
    // Get audio stream info using ffprobe
    const ffprobeCmd = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-select_streams', 'a:0',
      originalAudioPath,
    ];

    args.jobLog('Getting audio stream info with ffprobe');
    
    // Create a temporary file to store the ffprobe output
    const tempOutputPath = `${path.dirname(originalAudioPath)}/ffprobe_output_${Date.now()}.json`;
    
    // Run ffprobe with output to file
    const ffprobeFileCmd = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-select_streams', 'a:0',
      '-o', tempOutputPath,
      originalAudioPath,
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
    
    // Initialize variables with fallback values
    let channels = 6; // Default for 5.1 audio
    let sampleRate = '48000'; // Standard sample rate
    let bitRate = '448k'; // Good quality for 5.1 audio
    let codec = outputFormat === 'same' ? 'ac3' : outputFormat;
    let channelLayout = '5.1'; // Assume 5.1 as default
    
    try {
      await ffprobeFileCli.runCli();
      
      // Read the output file
      if (fs.existsSync(tempOutputPath)) {
        const stdoutContent = fs.readFileSync(tempOutputPath, 'utf8');
        const streamInfo = JSON.parse(stdoutContent);
        
        if (streamInfo && streamInfo.streams && streamInfo.streams.length > 0) {
          const audioInfo = streamInfo.streams[0];
          
          // Extract audio parameters (with fallbacks if values are missing)
          channels = audioInfo.channels || 6;
          sampleRate = audioInfo.sample_rate || '48000';
          bitRate = audioInfo.bit_rate ? `${Math.ceil(parseInt(audioInfo.bit_rate, 10) / 1000)}k` : '448k';
          codec = outputFormat === 'same' ? (audioInfo.codec_name || 'ac3') : outputFormat;
          channelLayout = audioInfo.channel_layout || '5.1';
          
          args.jobLog(`Detected audio: ${channels} channels, ${sampleRate}Hz, ${bitRate}bps, codec: ${codec}, layout: ${channelLayout}`);
        } else {
          args.jobLog('No audio streams found in the file');
        }
        
        // Clean up the temporary file
        fs.unlinkSync(tempOutputPath);
      }
    } catch (error) {
      args.jobLog(`Error getting audio info: ${error}`);
    }
    
    // No need for fallbacks here since we initialized with defaults
    // and provided fallbacks during extraction
    
    // Verify we have a 5.1 or greater channel layout
    if (channels < 6) {
      args.jobLog(`Warning: Original audio has only ${channels} channels, expected at least 6 for 5.1 audio`);
      args.jobLog('Will attempt to process anyway, but results may not be as expected');
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
    
    // Use a more robust approach with pan filter instead of channelsplit
    // This avoids the "unconnected output" error by not creating unused outputs
    let filterComplex = '';
    
    // Log the exact channel layout for debugging
    args.jobLog(`Creating filter complex for channel layout: "${channelLayout}"`);
    
    if (channelLayout === '5.1') {
      // For standard 5.1:
      // 1. Zero out the center channel from original audio
      // 2. Format the redacted center channel as mono
      // 3. Merge them and map to proper 5.1 channels
      filterComplex = `[0:a]pan=5.1|FL=FL|FR=FR|FC=0|LFE=LFE|BL=BL|BR=BR[no_center];` +
                      `[1:a]aformat=channel_layouts=mono[redacted_center];` +
                      `[no_center][redacted_center]amerge=inputs=2,pan=5.1|FL=FL-0|FR=FR-0|FC=FC-1|LFE=LFE-0|BL=BL-0|BR=BR-0[out]`;
    } else if (channelLayout === '5.1(side)') {
      // For 5.1(side) layout:
      // Same approach but with side channels (SL/SR) instead of back channels (BL/BR)
      filterComplex = `[0:a]pan=5.1(side)|FL=FL|FR=FR|FC=0|LFE=LFE|SL=SL|SR=SR[no_center];` +
                      `[1:a]aformat=channel_layouts=mono[redacted_center];` +
                      `[no_center][redacted_center]amerge=inputs=2,pan=5.1(side)|FL=FL-0|FR=FR-0|FC=FC-1|LFE=LFE-0|SL=SL-0|SR=SR-0[out]`;
    } else if (channelLayout === '7.1') {
      // For 7.1 layout:
      // Same approach but with all 8 channels
      filterComplex = `[0:a]pan=7.1|FL=FL|FR=FR|FC=0|LFE=LFE|BL=BL|BR=BR|SL=SL|SR=SR[no_center];` +
                      `[1:a]aformat=channel_layouts=mono[redacted_center];` +
                      `[no_center][redacted_center]amerge=inputs=2,pan=7.1|FL=FL-0|FR=FR-0|FC=FC-1|LFE=LFE-0|BL=BL-0|BR=BR-0|SL=SL-0|SR=SR-0[out]`;
    } else {
      // For unknown layouts, try a generic approach that should work for most surround formats
      args.jobLog(`Warning: Using generic approach for unknown channel layout: ${channelLayout}`);
      
      // Use a simpler approach that should work for most surround formats
      filterComplex = `[0:a]pan=5.1|FL=FL|FR=FR|FC=0|LFE=LFE|BL=BL|BR=BR[no_center];` +
                      `[1:a]aformat=channel_layouts=mono[redacted_center];` +
                      `[no_center][redacted_center]amerge=inputs=2,pan=5.1|FL=FL-0|FR=FR-0|FC=FC-1|LFE=LFE-0|BL=BL-0|BR=BR-0[out]`;
    }
    
    args.jobLog(`Generated filter complex: ${filterComplex}`);
    
    // Build the complete FFmpeg command with quality parameters
    const ffmpegCmd = `${args.ffmpegPath} -y -i "${originalAudioPath}" -i "${redactedCenterPath}" -filter_complex "${filterComplex}" -map "[out]" -c:a ${codec} -ar ${sampleRate} -b:a ${bitRate} "${outputFilePath}"`;
    
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