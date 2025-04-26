import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';
import * as fs from 'fs';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Profanity Detection',
  description: 'Analyze transcription to identify profanity and generate segments to redact',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'audio,profanity,transcription',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faFilter',
  inputs: [
    {
      label: 'Profanity Filter Level',
      name: 'filterLevel',
      type: 'string',
      defaultValue: 'medium',
      inputUI: {
        type: 'dropdown',
        options: [
          'mild',
          'medium',
          'strong',
        ],
      },
      tooltip: 'Level of profanity filtering (mild, medium, strong)',
    },
    {
      label: 'Buffer Time (seconds)',
      name: 'bufferTime',
      type: 'string',
      defaultValue: '0.2',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Time buffer to add before and after profanity words (in seconds)',
    },
    {
      label: 'Save Profanity JSON',
      name: 'saveJson',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Save the detected profanity segments as a JSON file alongside the audio file',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Profanity detected',
    },
    {
      number: 2,
      tooltip: 'No profanity detected',
    },
    {
      number: 3,
      tooltip: 'No transcription data available',
    },
  ],
});

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
 * Interface for a profanity segment to redact
 */
interface IProfanitySegment {
  word: string;
  start: number;
  end: number;
  segmentId: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting profanity detection for redaction');

  try {
    // Get the inputs
    const filterLevel = args.inputs.filterLevel as string;
    const bufferTime = parseFloat(args.inputs.bufferTime as string);
    const saveJson = args.inputs.saveJson as boolean;

    args.jobLog(`Using profanity filter level: ${filterLevel}`);
    args.jobLog(`Using buffer time: ${bufferTime} seconds`);

    // Get the transcription data from the previous plugin
    if (!args.variables?.user?.transcriptionData) {
      args.jobLog('No transcription data available');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 3, // No transcription data
        variables: args.variables,
      };
    }

    // Parse the transcription data
    const transcriptionData = JSON.parse(args.variables.user.transcriptionData);
    const audioFilePath = args.variables.user.audioFilePath;

    if (!transcriptionData.segments || !Array.isArray(transcriptionData.segments)) {
      args.jobLog('Transcription data does not contain segments');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 3, // No transcription data
        variables: args.variables,
      };
    }

    // Import the profanity list
    const profanityModule = require('../../profanityList');
    const { isProfanity } = profanityModule;

    // Process each segment to find profanity
    const profanitySegments: IProfanitySegment[] = [];
    const segments: ISegment[] = transcriptionData.segments;

    args.jobLog(`Processing ${segments.length} transcription segments`);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      // Skip segments without words
      if (!segment.words || !Array.isArray(segment.words)) {
        continue;
      }

      // Check each word for profanity
      for (let j = 0; j < segment.words.length; j++) {
        const wordObj = segment.words[j];
        const word = wordObj.word.trim();
        
        // Skip punctuation and empty words
        if (!word || word.match(/^[.,!?;:'"()\-\s]+$/)) {
          continue;
        }

        // Check if the word is profanity
        // Clean the word of any punctuation that might be attached to it
        const cleanWord = word.replace(/[.,!?;:'"()\-\s]+/g, '');
        if (isProfanity(cleanWord, filterLevel)) {
          // Add buffer time to start and end
          const start = Math.max(0, wordObj.start - bufferTime);
          const end = wordObj.end + bufferTime;
          
          profanitySegments.push({
            word,
            start,
            end,
            segmentId: segment.id,
          });
          
          args.jobLog(`Detected profanity: "${word}" (cleaned: "${cleanWord}") at ${start.toFixed(2)}s - ${end.toFixed(2)}s`);
        }
      }
    }

    // Check if any profanity was detected
    if (profanitySegments.length === 0) {
      args.jobLog('No profanity detected in the transcription');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // No profanity detected
        variables: args.variables,
      };
    }

    args.jobLog(`Detected ${profanitySegments.length} profanity segments`);

    // Save the profanity segments to a JSON file if requested
    if (saveJson && audioFilePath) {
      const audioDir = path.dirname(audioFilePath);
      const fileName = path.basename(audioFilePath, path.extname(audioFilePath));
      const jsonFilePath = `${audioDir}/${fileName}_profanity.json`;
      
      fs.writeFileSync(jsonFilePath, JSON.stringify({
        filterLevel,
        bufferTime,
        segments: profanitySegments,
      }, null, 2));
      
      args.jobLog(`Saved profanity segments to: ${jsonFilePath}`);
    }

    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        profanitySegments: JSON.stringify(profanitySegments),
        profanityFilterLevel: filterLevel,
        profanityBufferTime: bufferTime.toString(),
      },
    };

    args.jobLog('Profanity detection completed successfully');

    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1, // Profanity detected
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in profanity detection: ${errorMessage}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 3, // Error
      variables: args.variables,
    };
  }
};

export {
  details,
  plugin,
};