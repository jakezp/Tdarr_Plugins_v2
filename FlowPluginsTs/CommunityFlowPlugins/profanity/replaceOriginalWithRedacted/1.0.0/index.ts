import { promises as fsp } from 'fs';
import fileMoveOrCopy from '../../../../FlowHelpers/1.0.0/fileMoveOrCopy';
import {
  fileExists,
  getContainer, getFileAbosluteDir, getFileName,
} from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Replace Original With Redacted',
  description: `
  Replace the original file with the redacted file from the variables.
  This plugin is specifically designed for the profanity filter workflow.
  `,
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'file,replace,redacted,profanity',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faExchangeAlt',
  inputs: [],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  try {
    // Get the original file path
    const originalFilePath = args.originalLibraryFile._id;
    if (!originalFilePath) {
      args.jobLog('No original file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    }

    // Get the redacted file path from variables
    let redactedFilePath = args.variables?.user?.redactedVideoPath;
    if (!redactedFilePath) {
      args.jobLog('No redacted video path found in variables');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    }

    args.jobLog(`Original file: ${originalFilePath}`);
    args.jobLog(`Redacted file: ${redactedFilePath}`);

    // Check if the files are the same
    if (originalFilePath === redactedFilePath) {
      args.jobLog('Original file and redacted file are the same, no need to replace');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    }

    // Check if the redacted file exists
    const redactedFileExists = await fileExists(redactedFilePath);
    if (!redactedFileExists) {
      args.jobLog(`Redacted file does not exist: ${redactedFilePath}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    }

    // Get the original file directory and name
    const originalDir = path.dirname(originalFilePath);
    const originalName = path.basename(originalFilePath, path.extname(originalFilePath));
    
    // Get the redacted file extension
    const redactedExt = path.extname(redactedFilePath);
    
    // Create the new file path
    const newPath = path.join(originalDir, `${originalName}${redactedExt}`);
    const newPathTmp = `${newPath}.tmp`;
    
    args.jobLog(`New path: ${newPath}`);
    args.jobLog(`Temporary path: ${newPathTmp}`);

    // Copy the redacted file to a temporary file
    await fileMoveOrCopy({
      operation: 'copy',
      sourcePath: redactedFilePath,
      destinationPath: newPathTmp,
      args,
    });

    // Check if the original file exists
    const originalFileExists = await fileExists(originalFilePath);
    if (originalFileExists) {
      args.jobLog(`Deleting original file: ${originalFilePath}`);
      await fsp.unlink(originalFilePath);
    }

    // Rename the temporary file to the original file name
    await fileMoveOrCopy({
      operation: 'move',
      sourcePath: newPathTmp,
      destinationPath: newPath,
      args,
    });

    args.jobLog(`Successfully replaced original file with redacted file`);

    return {
      outputFileObj: {
        _id: newPath,
      },
      outputNumber: 1,
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error replacing original file with redacted file: ${errorMessage}`);
    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1,
      variables: args.variables,
    };
  }
};

export {
  details,
  plugin,
};