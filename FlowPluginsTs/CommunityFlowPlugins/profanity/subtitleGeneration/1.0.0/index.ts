import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';
import * as fs from 'fs';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Subtitle Generation',
  description: 'Generate subtitles with profanity words redacted',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'subtitle,profanity,srt',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faClosedCaptioning',
  inputs: [
    {
      label: 'Output File Path',
      name: 'outputFilePath',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Path to save the subtitle file (leave empty to use the original video path)',
    },
    {
      label: 'Redaction Character',
      name: 'redactionChar',
      type: 'string',
      defaultValue: '*',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Character to use for redacting profanity words',
    },
    {
      label: 'Save Next to Video',
      name: 'saveNextToVideo',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Save the subtitle file next to the original video file',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Subtitle generation successful',
    },
    {
      number: 2,
      tooltip: 'No transcription data available',
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
 * Interface for a word in the transcription
 */
interface IWord {
  word: string;
  start: number;
  end: number;
}

/**
 * Interface for a segment in the transcription
 */
interface ISegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words: IWord[];
}

/**
 * Convert seconds to SRT time format (HH:MM:SS,mmm)
 * @param seconds Time in seconds
 * @returns Time in SRT format
 */
function secondsToSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Redact profanity words in a segment
 * @param segment Transcription segment
 * @param profanitySegments Array of profanity segments
 * @param redactionChar Character to use for redaction
 * @returns Redacted text
 */
function redactProfanityInSegment(
  segment: ISegment,
  profanitySegments: IProfanitySegment[],
  redactionChar: string,
): string {
  // If the segment has no words, return the text as is
  if (!segment.words || segment.words.length === 0) {
    return segment.text;
  }
  
  // Create a copy of the words array to work with
  const words = [...segment.words];
  
  // Extract the actual profanity words from the segments
  const profanityWordsSet = new Set<string>();
  profanitySegments.forEach(segment => {
    // Clean the word and add it to the set
    const cleanWord = segment.word.toLowerCase().replace(/[.,!?;:'"()\-\s]+/g, '');
    profanityWordsSet.add(cleanWord);
  });
  
  // Log the profanity words for debugging
  console.log(`Profanity words: ${Array.from(profanityWordsSet).join(', ')}`);
  
  // Redact ONLY words that exactly match profanity words
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanWord = word.word.toLowerCase().replace(/[.,!?;:'"()\-\s]+/g, '');
    
    // Only redact if the word is in the profanity list
    if (profanityWordsSet.has(cleanWord)) {
      // Redact the word
      words[i] = {
        ...word,
        word: redactionChar.repeat(word.word.length),
      };
      console.log(`Redacted word: ${cleanWord}`);
    }
  }
  
  // Reconstruct the text with redacted words
  return words.map(w => w.word).join(' ');
}

/**
 * Generate SRT content from transcription data with profanity redacted
 * @param transcriptionData Transcription data from WhisperX
 * @param profanitySegments Array of profanity segments
 * @param redactionChar Character to use for redaction
 * @returns SRT content as a string
 */
function generateSrtContent(
  transcriptionData: any,
  profanitySegments: IProfanitySegment[],
  redactionChar: string,
): string {
  // Log profanity segments for debugging
  console.log(`Number of profanity segments for SRT generation: ${profanitySegments.length}`);
  if (profanitySegments.length > 0) {
    console.log(`First few profanity segments: ${JSON.stringify(profanitySegments.slice(0, 3))}`);
  }
  if (!transcriptionData.segments || !Array.isArray(transcriptionData.segments)) {
    return '';
  }
  
  const segments = transcriptionData.segments;
  let srtContent = '';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const segmentNumber = i + 1;
    const startTime = secondsToSrtTime(segment.start);
    const endTime = secondsToSrtTime(segment.end);
    const redactedText = redactProfanityInSegment(segment, profanitySegments, redactionChar);
    
    srtContent += `${segmentNumber}\n`;
    srtContent += `${startTime} --> ${endTime}\n`;
    srtContent += `${redactedText}\n\n`;
  }
  
  return srtContent;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting subtitle generation with profanity redaction');

  try {
    // Get the inputs
    let outputFilePath = args.inputs.outputFilePath as string;
    const redactionChar = args.inputs.redactionChar as string;
    const saveNextToVideo = args.inputs.saveNextToVideo as boolean;

    // Get the transcription data from the previous plugin
    if (!args.variables?.user?.transcriptionData) {
      args.jobLog('No transcription data available');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // No transcription data
        variables: args.variables,
      };
    }

    // Parse the transcription data
    const transcriptionData = JSON.parse(args.variables.user.transcriptionData);

    // Get the profanity segments from the previous plugin
    if (!args.variables?.user?.profanitySegments) {
      args.jobLog('No profanity segments found in variables, generating subtitles without redaction');
    }

    // Parse the profanity segments
    const profanitySegments: IProfanitySegment[] = args.variables?.user?.profanitySegments 
      ? JSON.parse(args.variables.user.profanitySegments) 
      : [];

    args.jobLog(`Found ${profanitySegments.length} profanity segments to redact in subtitles`);

    // Generate SRT content
    const srtContent = generateSrtContent(transcriptionData, profanitySegments, redactionChar);

    if (!srtContent) {
      args.jobLog('Failed to generate SRT content');
      throw new Error('Failed to generate SRT content');
    }

    // Determine the output file path
    if (!outputFilePath) {
      if (saveNextToVideo && args.inputFileObj?._id) {
        // Save next to the original video file
        const videoPath = args.inputFileObj._id;
        const videoDir = path.dirname(videoPath);
        const videoName = path.basename(videoPath, path.extname(videoPath));
        outputFilePath = `${videoDir}/${videoName}_redacted.en.srt`;
      } else {
        // Save in the same directory as the audio file
        const audioFilePath = args.variables?.user?.centerChannelPath || 
                             args.variables?.user?.extractedAudioPath || 
                             args.variables?.user?.audioFilePath;
        
        if (audioFilePath) {
          const audioDir = path.dirname(audioFilePath);
          const audioName = path.basename(audioFilePath, path.extname(audioFilePath));
          outputFilePath = `${audioDir}/${audioName}_redacted.en.srt`;
        } else {
          args.jobLog('No output file path provided and no input file path found');
          throw new Error('No output file path provided and no input file path found');
        }
      }
    }

    // Write the SRT file
    fs.writeFileSync(outputFilePath, srtContent);
    args.jobLog(`Subtitle file saved to: ${outputFilePath}`);

    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        subtitlePath: outputFilePath,
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
    args.jobLog(`Error in subtitle generation: ${errorMessage}`);
    throw error;
  }
};

export {
  details,
  plugin,
};