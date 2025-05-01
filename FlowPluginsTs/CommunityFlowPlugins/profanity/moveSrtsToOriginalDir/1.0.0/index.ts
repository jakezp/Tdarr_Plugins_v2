import { promises as fsp } from 'fs';
import {
  getContainer, getFileAbosluteDir, getSubStem,
} from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';
import normJoinPath from '../../../../FlowHelpers/1.0.0/normJoinPath';
import fileMoveOrCopy from '../../../../FlowHelpers/1.0.0/fileMoveOrCopy';
import * as path from 'path';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Move SRTs to Original Directory',
  description: `Move subtitle files from the working directory to the original file's directory.
This is specifically designed for the profanity filter workflow.`,
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'subtitle,srt,profanity',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faFileAlt',
  inputs: [
    {
      label: 'File Extensions',
      name: 'fileExtensions',
      type: 'string',
      defaultValue: 'srt,ass',
      inputUI: {
        type: 'text',
      },
      tooltip: 'Specify a comma separated list of subtitle file extensions to move',
    },
    {
      label: 'Rename to Match Original',
      name: 'renameToMatchOriginal',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Rename subtitle files to match the original file name',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Continue to next plugin',
    },
  ],
});

const doOperation = async ({
  args,
  sourcePath,
  destinationPath,
}: {
  args: IpluginInputArgs,
  sourcePath: string,
  destinationPath: string,
}) => {
  args.jobLog(`Input path: ${sourcePath}`);
  args.jobLog(`Output path: ${destinationPath}`);

  if (sourcePath === destinationPath) {
    args.jobLog('Input and output path are the same, skipping move');
  } else {
    args.deps.fsextra.ensureDirSync(getFileAbosluteDir(destinationPath));

    await fileMoveOrCopy({
      operation: 'move',
      sourcePath,
      destinationPath,
      args,
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  try {
    const fileExtensions = String(args.inputs.fileExtensions).split(',').map((row) => row.trim());
    const renameToMatchOriginal = args.inputs.renameToMatchOriginal as boolean;

    // Get the original file path and directory
    const originalPath = args.originalLibraryFile._id;
    if (!originalPath) {
      args.jobLog('No original file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    }

    const originalDir = path.dirname(originalPath);
    const originalFileName = path.basename(originalPath, path.extname(originalPath));
    
    args.jobLog(`Original file: ${originalPath}`);
    args.jobLog(`Original directory: ${originalDir}`);

    // Get the working directory
    const workingDir = getFileAbosluteDir(args.inputFileObj._id);
    args.jobLog(`Working directory: ${workingDir}`);

    // Find subtitle files in the working directory
    const filesInDir = (await fsp.readdir(workingDir))
      .map((row) => ({
        source: `${workingDir}/${row}`,
        destination: renameToMatchOriginal
          ? normJoinPath({
              upath: args.deps.upath,
              paths: [
                originalDir,
                `${originalFileName}.${getContainer(row)}`,
              ],
            })
          : normJoinPath({
              upath: args.deps.upath,
              paths: [
                originalDir,
                row,
              ],
            }),
      }))
      .filter((row) => row.source !== args.originalLibraryFile._id && row.source !== args.inputFileObj._id)
      .filter((row) => fileExtensions.includes(getContainer(row.source)));

    args.jobLog(`Found ${filesInDir.length} subtitle files to move`);

    for (let i = 0; i < filesInDir.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await doOperation({
        args,
        sourcePath: filesInDir[i].source,
        destinationPath: filesInDir[i].destination,
      });
    }

    return {
      outputFileObj: args.inputFileObj,
      outputNumber: 1,
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error moving subtitle files: ${errorMessage}`);
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