import { CLI } from '../../../../FlowHelpers/1.0.0/cliUtils';
import { getFileName } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Audio Redaction',
  description: 'Redact (bleep out) profanity segments in audio',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'audio,profanity,redaction',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faVolumeXmark',
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
      label: 'Bleep Frequency (Hz)',
      name: 'bleepFrequency',
      type: 'string',
      defaultValue: '800',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Frequency of the bleep tone in Hz',
    },
    {
      label: 'Bleep Volume',
      name: 'bleepVolume',
      type: 'string',
      defaultValue: '0.4',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Volume of the bleep tone (0.0 to 1.0)',
    },
    {
      label: 'Extra Buffer Time (seconds)',
      name: 'extraBufferTime',
      type: 'string',
      defaultValue: '0.0',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Additional buffer time to add before and after profanity segments (in seconds)',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Audio redaction successful',
    },
    {
      number: 2,
      tooltip: 'Audio redaction failed',
    },
    {
      number: 3,
      tooltip: 'No profanity segments found',
    },
  ],
});

/**
 * Interface for a profanity segment to redact
 */
interface IProfanitySegment {
  word: string;
  start: number;
  end: number;
  segmentId: number;
}

/**
 * Interface for a non-profanity interval
 */
interface INonProfanityInterval {
  start: number;
  end: number;
}

/**
 * Get non-profanity intervals from profanity segments
 * @param profanitySegments Array of profanity segments
 * @param duration Total duration of the audio file
 * @returns Array of non-profanity intervals
 */
function getNonProfanityIntervals(profanitySegments: IProfanitySegment[], duration: number): INonProfanityInterval[] {
  const nonProfanityIntervals: INonProfanityInterval[] = [];
  
  if (!profanitySegments || profanitySegments.length === 0) {
    return [{ start: 0, end: duration }];
  }
  
  // Sort segments by start time
  const sortedSegments = [...profanitySegments].sort((a, b) => a.start - b.start);
  
  // Add interval from start to first segment if needed
  if (sortedSegments[0].start > 0) {
    nonProfanityIntervals.push({ start: 0, end: sortedSegments[0].start });
  }
  
  // Add intervals between segments
  for (let i = 0; i < sortedSegments.length - 1; i++) {
    nonProfanityIntervals.push({
      start: sortedSegments[i].end,
      end: sortedSegments[i + 1].start,
    });
  }
  
  // Add interval from last segment to end if needed
  if (sortedSegments[sortedSegments.length - 1].end < duration) {
    nonProfanityIntervals.push({
      start: sortedSegments[sortedSegments.length - 1].end,
      end: duration,
    });
  }
  
  return nonProfanityIntervals;
}

/**
 * Create FFmpeg filter complex for audio redaction
 * @param profanitySegments Array of profanity segments
 * @param nonProfanityIntervals Array of non-profanity intervals
 * @param duration Total duration of the audio file
 * @param bleepFrequency Frequency of the bleep tone in Hz
 * @param bleepVolume Volume of the bleep tone (0.0 to 1.0)
 * @returns FFmpeg filter complex string
 */
function createFFmpegFilter(
  profanitySegments: IProfanitySegment[],
  nonProfanityIntervals: INonProfanityInterval[],
  duration: number,
  bleepFrequency: number,
  bleepVolume: number,
): string {
  // Create condition for when to mute the original audio (during profanity)
  const dippedVocalsConditions = profanitySegments
    .map(segment => `between(t,${segment.start},${segment.end})`)
    .join('+');
  
  const dippedVocalsFilter = `[0]volume=0:enable='${dippedVocalsConditions}'[main]`;
  
  // Create condition for when to mute the bleep (during non-profanity)
  let noBleepsConditions = '';
  
  if (nonProfanityIntervals.length > 0) {
    noBleepsConditions = nonProfanityIntervals
      .slice(0, -1)
      .map(interval => `between(t,${interval.start},${interval.end})`)
      .join('+');
    
    const lastInterval = nonProfanityIntervals[nonProfanityIntervals.length - 1];
    if (lastInterval.end === duration) {
      noBleepsConditions += noBleepsConditions ? `+gte(t,${lastInterval.start})` : `gte(t,${lastInterval.start})`;
    } else {
      noBleepsConditions += noBleepsConditions ? 
        `+between(t,${lastInterval.start},${lastInterval.end})` : 
        `between(t,${lastInterval.start},${lastInterval.end})`;
    }
  }
  
  const dippedBleepFilter = `sine=f=${bleepFrequency},volume=${bleepVolume},aformat=channel_layouts=mono,volume=0:enable='${noBleepsConditions}'[beep]`;
  
  const amixFilter = "[main][beep]amix=inputs=2:duration=first";
  
  const filterComplex = [
    dippedVocalsFilter,
    dippedBleepFilter,
    amixFilter,
  ].join(';');
  
  return filterComplex;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting audio redaction for profanity');

  try {
    // Get the inputs
    let audioFilePath = args.inputs.audioFilePath as string;
    const bleepFrequency = parseInt(args.inputs.bleepFrequency as string, 10);
    const bleepVolume = parseFloat(args.inputs.bleepVolume as string);
    const extraBufferTime = parseFloat(args.inputs.extraBufferTime as string);

    // If no audio file path is provided, use the one from the previous plugin
    if (!audioFilePath) {
      if (args.variables?.user?.centerChannelPath) {
        audioFilePath = args.variables.user.centerChannelPath;
        args.jobLog(`Using center channel path from previous plugin: ${audioFilePath}`);
      } else if (args.variables?.user?.extractedAudioPath) {
        audioFilePath = args.variables.user.extractedAudioPath;
        args.jobLog(`Using extracted audio path from previous plugin: ${audioFilePath}`);
      } else if (args.variables?.user?.audioFilePath) {
        audioFilePath = args.variables.user.audioFilePath;
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

    // Get the profanity segments from the previous plugin
    if (!args.variables?.user?.profanitySegments) {
      args.jobLog('No profanity segments found in variables');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 3, // No profanity segments
        variables: args.variables,
      };
    }

    // Parse the profanity segments
    const profanitySegments: IProfanitySegment[] = JSON.parse(args.variables.user.profanitySegments);

    if (profanitySegments.length === 0) {
      args.jobLog('No profanity segments to redact');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 3, // No profanity segments
        variables: args.variables,
      };
    }

    args.jobLog(`Found ${profanitySegments.length} profanity segments to redact`);

    // Apply extra buffer time if specified
    if (extraBufferTime > 0) {
      args.jobLog(`Adding extra buffer time of ${extraBufferTime} seconds to each segment`);
      profanitySegments.forEach(segment => {
        segment.start = Math.max(0, segment.start - extraBufferTime);
        segment.end += extraBufferTime;
      });
    }

    // Try to get a reasonable duration estimate
    // We'll use the end time of the last profanity segment plus some buffer
    let duration = 0;
    if (profanitySegments.length > 0) {
      const lastSegment = profanitySegments.reduce((latest, segment) => 
        segment.end > latest.end ? segment : latest, profanitySegments[0]);
      duration = lastSegment.end + 60; // Add 60 seconds buffer
    } else {
      duration = 3600; // Default to 1 hour if no segments
    }
    args.jobLog(`Using audio duration: ${duration} seconds`);

    // Get non-profanity intervals
    const nonProfanityIntervals = getNonProfanityIntervals(profanitySegments, duration);

    // Create FFmpeg filter complex
    const filterComplex = createFFmpegFilter(
      profanitySegments,
      nonProfanityIntervals,
      duration,
      bleepFrequency,
      bleepVolume,
    );

    args.jobLog(`Created FFmpeg filter complex: ${filterComplex}`);

    // Create output file path in the same directory as the input audio
    const audioDir = path.dirname(audioFilePath);
    const fileName = getFileName(audioFilePath);
    const fileExt = path.extname(audioFilePath);
    const outputFilePath = `${audioDir}/${fileName}_redacted${fileExt}`;

    // Build FFmpeg command to apply the filter
    // Note: We need to wrap the filter_complex in quotes to handle the square brackets properly
    // However, the CLI class will handle the arguments differently depending on the platform
    // So we'll use a different approach to ensure the filter complex is properly quoted
    
    // Create a temporary script file with the FFmpeg command
    const scriptDir = path.dirname(audioFilePath);
    const scriptPath = `${scriptDir}/ffmpeg_redact_${Date.now()}.sh`;
    const ffmpegCmd = `${args.ffmpegPath} -i "${audioFilePath}" -filter_complex "${filterComplex}" -c:a pcm_s16le "${outputFilePath}"`;
    
    // Write the script file
    const fs = require('fs');
    fs.writeFileSync(scriptPath, ffmpegCmd);
    fs.chmodSync(scriptPath, '755'); // Make it executable
    
    args.jobLog(`Created FFmpeg script: ${scriptPath}`);
    args.jobLog(`FFmpeg command: ${ffmpegCmd}`);
    
    // Execute the script
    const ffmpegArgs = [
      scriptPath
    ];

    args.jobLog(`Executing FFmpeg command to redact audio`);

    // Execute FFmpeg command
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

    if (res.cliExitCode !== 0) {
      args.jobLog('FFmpeg audio redaction failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    args.jobLog(`Audio redaction successful: ${outputFilePath}`);

    // Now normalize the redacted audio
    args.jobLog('Normalizing redacted audio');
    
    // Get loudness info from variables if available
    const loudnessInfo = args.variables?.user?.loudnessInfo || '-24';
    
    // Create normalized output file path
    const normalizedFileName = `${fileName}_redacted_normalized${fileExt}`;
    const normalizedOutputPath = `${audioDir}/${normalizedFileName}`;
    
    // Create a temporary script file with the FFmpeg normalization command
    const normScriptPath = `${scriptDir}/ffmpeg_normalize_${Date.now()}.sh`;
    const normCmd = `${args.ffmpegPath} -i "${outputFilePath}" -bitexact -ac 1 -strict -2 -af "loudnorm=I=-24:LRA=7:TP=-2:measured_I=${loudnessInfo}:linear=true:print_format=summary,volume=0.90" -c:a pcm_s16le "${normalizedOutputPath}"`;
    
    // Write the script file
    fs.writeFileSync(normScriptPath, normCmd);
    fs.chmodSync(normScriptPath, '755'); // Make it executable
    
    args.jobLog(`Created FFmpeg normalization script: ${normScriptPath}`);
    args.jobLog(`FFmpeg normalization command: ${normCmd}`);
    
    // Execute the script
    const normalizationArgs = [
      normScriptPath
    ];
    
    args.jobLog(`Executing FFmpeg command to normalize audio`);
    
    // Execute FFmpeg command for normalization
    const normCli = new CLI({
      cli: '/bin/sh',
      spawnArgs: normalizationArgs,
      spawnOpts: {},
      jobLog: args.jobLog,
      outputFilePath: normalizedOutputPath,
      inputFileObj: args.inputFileObj,
      logFullCliOutput: args.logFullCliOutput,
      updateWorker: args.updateWorker,
      args,
    });
    
    const normRes = await normCli.runCli();
    
    // Clean up the script files
    try {
      fs.unlinkSync(scriptPath);
      fs.unlinkSync(normScriptPath);
    } catch (err) {
      args.jobLog(`Warning: Could not delete temporary script files: ${err}`);
    }
    
    if (normRes.cliExitCode !== 0) {
      args.jobLog('FFmpeg audio normalization failed');
      // Continue with the unnormalized audio
      args.variables = {
        ...args.variables,
        user: {
          ...args.variables.user,
          redactedAudioPath: outputFilePath,
        },
      };
      
      return {
        outputFileObj: {
          _id: outputFilePath,
        },
        outputNumber: 1, // Success with unnormalized audio
        variables: args.variables,
      };
    }
    
    args.jobLog(`Audio normalization successful: ${normalizedOutputPath}`);

    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        redactedAudioPath: normalizedOutputPath,
        unnormalizedRedactedAudioPath: outputFilePath,
      },
    };

    return {
      outputFileObj: {
        _id: normalizedOutputPath,
      },
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in audio redaction: ${errorMessage}`);
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