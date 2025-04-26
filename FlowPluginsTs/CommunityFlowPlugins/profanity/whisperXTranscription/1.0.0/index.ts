import { getFileName } from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'WhisperX Transcription',
  description: 'Submit audio to WhisperX service for transcription with word-level timestamps',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'audio,profanity,transcription',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faClosedCaptioning',
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
      label: 'WhisperX Service URL',
      name: 'serviceUrl',
      type: 'string',
      defaultValue: '192.168.1.250',
      inputUI: {
        type: 'text',
      },
      tooltip: 'URL of the WhisperX service',
    },
    {
      label: 'WhisperX Service Port',
      name: 'servicePort',
      type: 'string',
      defaultValue: '9000',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Port of the WhisperX service',
    },
    {
      label: 'Language',
      name: 'language',
      type: 'string',
      defaultValue: 'en',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Language code for transcription (e.g., en, fr, es)',
    },
    {
      label: 'Save Transcription JSON',
      name: 'saveJson',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Save the transcription result as a JSON file alongside the audio file',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Transcription successful',
    },
    {
      number: 2,
      tooltip: 'Transcription failed',
    },
  ],
});

/**
 * Sends a file to the WhisperX service for transcription
 * 
 * @param audioFile - Path to the audio file
 * @param serviceUrl - URL of the WhisperX service
 * @param servicePort - Port of the WhisperX service
 * @param language - Language code for transcription
 * @param jobLog - Function to log messages
 * @returns The transcription result or null if failed
 */
async function transcribeWithWhisperXService(
  audioFile: string,
  serviceUrl: string,
  servicePort: string,
  language: string,
  jobLog: (text: string) => void
): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      jobLog(`Transcribing audio file: ${audioFile}`);
      
      // Read the audio file
      const fileData = fs.readFileSync(audioFile);
      
      // Generate a boundary for multipart/form-data
      const boundary = `----WebKitFormBoundary${Math.random().toString(16).substr(2)}`;
      
      // Create the multipart/form-data payload
      const payload = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from(`Content-Disposition: form-data; name="audio_file"; filename="${path.basename(audioFile)}"\r\n`),
        Buffer.from(`Content-Type: audio/wav\r\n\r\n`),
        fileData,
        Buffer.from(`\r\n--${boundary}--\r\n`)
      ]);
      
      // Set up the HTTP request options
      const options = {
        hostname: serviceUrl,
        port: parseInt(servicePort, 10),
        path: `/asr?engine=whisperx&task=transcribe&language=${language}&word_timestamps=true&output=json`,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length
        }
      };
      
      jobLog(`Sending request to WhisperX service at http://${serviceUrl}:${servicePort}/asr`);
      
      // Send the request
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              const result = JSON.parse(data);
              jobLog('Transcription successful!');
              resolve(result);
            } catch (error: any) {
              jobLog(`Error parsing transcription result: ${error.message}`);
              reject(error);
            }
          } else {
            jobLog(`HTTP Error: ${res.statusCode} ${res.statusMessage}`);
            jobLog(`Response data: ${data}`);
            reject(new Error(`HTTP Error: ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (error) => {
        jobLog(`Error sending request to WhisperX service: ${error.message}`);
        reject(error);
      });
      
      // Send the payload
      req.write(payload);
      req.end();
      
    } catch (error: any) {
      jobLog(`Error in transcribeWithWhisperXService: ${error.message}`);
      reject(error);
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting WhisperX transcription for profanity redaction');

  try {
    // Get the audio file path
    let audioFilePath = args.inputs.audioFilePath as string;
    const serviceUrl = args.inputs.serviceUrl as string;
    const servicePort = args.inputs.servicePort as string;
    const language = args.inputs.language as string;
    const saveJson = args.inputs.saveJson as boolean;

    // If no audio file path is provided, use the one from the previous plugin
    if (!audioFilePath) {
      if (args.variables?.user?.centerChannelPath) {
        audioFilePath = args.variables.user.centerChannelPath;
        args.jobLog(`Using center channel path from previous plugin: ${audioFilePath}`);
      } else if (args.variables?.user?.extractedAudioPath) {
        audioFilePath = args.variables.user.extractedAudioPath;
        args.jobLog(`Using extracted audio path from previous plugin: ${audioFilePath}`);
      } else {
        args.jobLog('No audio file path provided and none found in variables');
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 2, // Failed
          variables: args.variables,
        };
      }
    }

    // Check if the audio file exists
    if (!fs.existsSync(audioFilePath)) {
      args.jobLog(`Audio file does not exist: ${audioFilePath}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    args.jobLog(`Using WhisperX service at ${serviceUrl}:${servicePort}`);
    args.jobLog(`Language: ${language}`);

    // Transcribe the audio using the WhisperX service
    const transcription = await transcribeWithWhisperXService(
      audioFilePath,
      serviceUrl,
      servicePort,
      language,
      args.jobLog
    );

    if (!transcription) {
      args.jobLog('Transcription failed');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Log some information about the transcription
    if (transcription.segments && transcription.segments.length > 0) {
      args.jobLog(`Transcription has ${transcription.segments.length} segments`);
      
      // Log a few sample segments
      const sampleCount = Math.min(3, transcription.segments.length);
      for (let i = 0; i < sampleCount; i++) {
        const segment = transcription.segments[i];
        args.jobLog(`Segment ${i + 1}: ${segment.start.toFixed(2)}s - ${segment.end.toFixed(2)}s: "${segment.text}"`);
      }
    } else if (transcription.text) {
      args.jobLog(`Transcription text: ${transcription.text.substring(0, 100)}...`);
    } else {
      args.jobLog('Transcription format is not recognized');
    }

    // Save the transcription to a JSON file if requested
    if (saveJson) {
      const audioDir = path.dirname(audioFilePath);
      const fileName = getFileName(audioFilePath);
      const jsonFilePath = `${audioDir}/${fileName}_transcription.json`;
      
      fs.writeFileSync(jsonFilePath, JSON.stringify(transcription, null, 2));
      args.jobLog(`Saved transcription to: ${jsonFilePath}`);
    }

    // Update variables for downstream plugins
    args.variables = {
      ...args.variables,
      user: {
        ...args.variables.user,
        transcriptionData: JSON.stringify(transcription),
        audioFilePath, // Keep track of the audio file path
      },
    };

    args.jobLog('WhisperX transcription completed successfully');

    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in WhisperX transcription: ${errorMessage}`);
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