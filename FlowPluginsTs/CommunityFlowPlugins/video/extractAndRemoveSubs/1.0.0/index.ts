import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

const details = ():IpluginDetails => ({
  name: 'Extract and Remove Subtitles',
  description: 'Extracts English subtitles to SRT and removes all subtitles from the container',
  style: {
    borderColor: '#3498db',
  },
  tags: 'video,subtitle,extract,remove',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faClosedCaptioning',
  inputs: [
    {
      label: 'Extract English Subtitles',
      name: 'extractEnglish',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Extract English subtitles (non-SDH, non-commentary) to SRT file',
    },
    {
      label: 'Remove All Subtitles',
      name: 'removeAll',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Remove all subtitles from the container',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Success - Subtitles processed as requested',
    },
    {
      number: 2,
      tooltip: 'No subtitles found in file',
    },
    {
      number: 3,
      tooltip: 'Error occurred during processing',
    },
  ],
});

const plugin = async (args:IpluginInputArgs):Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  try {
    // Check if file has subtitles
    if (!args.inputFileObj.ffProbeData?.streams) {
      args.jobLog('No stream data found in file');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // No subtitles found
        variables: args.variables,
      };
    }

    const subtitleStreams = args.inputFileObj.ffProbeData.streams.filter(
      stream => stream.codec_type === 'subtitle'
    );

    if (subtitleStreams.length === 0) {
      args.jobLog('No subtitle streams found in file');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // No subtitles found
        variables: args.variables,
      };
    }

    args.jobLog(`Found ${subtitleStreams.length} subtitle streams`);

    // Find English subtitle streams (non-SDH, non-commentary)
    const englishSubtitleStreams = subtitleStreams.filter(stream => {
      const language = stream.tags?.language?.toLowerCase() === 'eng' || 
                       stream.tags?.language?.toLowerCase() === 'en';
      
      // Check if it's not SDH or commentary
      const title = (stream.tags?.title || '').toLowerCase();
      const notSDH = !title.includes('sdh') && !title.includes('hearing');
      const notCommentary = !title.includes('comment');
      
      return language && notSDH && notCommentary;
    });

    args.jobLog(`Found ${englishSubtitleStreams.length} English subtitle streams (non-SDH, non-commentary)`);

    // Extract English subtitles if requested and available
    if (args.inputs.extractEnglish && englishSubtitleStreams.length > 0) {
      // Get the first English subtitle stream
      const englishSubStream = englishSubtitleStreams[0];
      const streamIndex = args.inputFileObj.ffProbeData.streams.indexOf(englishSubStream);
      
      // Get file path information
      const filePath = args.inputFileObj.file;
      const fileDir = path.dirname(filePath);
      const fileName = path.basename(filePath, path.extname(filePath));
      const srtFilePath = path.join(fileDir, `${fileName}.srt`);
      
      // Extract subtitle to SRT file
      const extractCommand = `"${args.ffmpegPath}" -i "${filePath}" -map 0:${streamIndex} -c:s srt "${srtFilePath}"`;
      
      args.jobLog(`Extracting English subtitle to: ${srtFilePath}`);
      args.jobLog(`Command: ${extractCommand}`);
      
      try {
        const { stdout, stderr } = await execAsync(extractCommand);
        args.jobLog(`FFmpeg stdout: ${stdout}`);
        args.jobLog(`FFmpeg stderr: ${stderr}`);
        args.jobLog('English subtitle extracted successfully');
      } catch (error) {
        const extractError = error as Error;
        args.jobLog(`Error extracting subtitle: ${extractError.message}`);
        // Continue with the process even if extraction fails
      }
    }

    // Remove all subtitles from container if requested
    if (args.inputs.removeAll) {
      // Initialize FFmpeg command if not already initialized
      if (!args.variables.ffmpegCommand.init) {
        args.variables.ffmpegCommand = {
          init: true,
          inputFiles: [args.inputFileObj._id],
          streams: args.inputFileObj.ffProbeData.streams.map(stream => ({
            ...stream,
            removed: false,
            forceEncoding: false,
            inputArgs: [],
            outputArgs: [],
          })),
          container: args.inputFileObj.container,
          hardwareDecoding: false,
          shouldProcess: true,
          overallInputArguments: [],
          overallOuputArguments: [],
        };
      }
      
      // Mark all subtitle streams for removal
      args.variables.ffmpegCommand.streams.forEach(stream => {
        if (stream.codec_type === 'subtitle') {
          stream.removed = true;
        }
      });
      
      args.jobLog('All subtitle streams marked for removal from container');
    }

    // Return success output
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (err) {
    const error = err as Error;
    args.jobLog(`Error in Extract and Remove Subtitles plugin: ${error.message}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 3, // Error
      variables: {
        ...args.variables,
        flowFailed: true,
      },
    };
  }
};

export {
  details,
  plugin,
};