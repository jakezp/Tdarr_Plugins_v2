import { promises as fsp } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import fileMoveOrCopy from '../../../../FlowHelpers/1.0.0/fileMoveOrCopy';
import {
  getContainer, getFileAbosluteDir, getFileName,
} from '../../../../FlowHelpers/1.0.0/fileUtils';
import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Finalize Files',
  description: 'Replace original file with redacted version and copy SRT files to original directory',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'file,replace,copy,srt',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faFileExport',
  inputs: [
    {
      label: 'Replace Original File',
      name: 'replaceOriginalFile',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Replace the original file with the redacted version',
    },
    {
      label: 'Copy SRT Files',
      name: 'copySrtFiles',
      type: 'boolean',
      defaultValue: 'true',
      inputUI: {
        type: 'switch',
      },
      tooltip: 'Copy SRT files to the original directory',
    },
    {
      label: 'Copy or Move SRTs',
      name: 'copyOrMoveSrts',
      type: 'string',
      defaultValue: 'copy',
      inputUI: {
        type: 'dropdown',
        options: [
          'copy',
          'move',
        ],
      },
      tooltip: 'Specify whether to copy or move the SRT files',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Files finalized successfully',
    },
    {
      number: 2,
      tooltip: 'Failed to finalize files',
    },
  ],
});

/**
 * Find all SRT files in a directory
 * @param directory Directory to search in
 * @returns Array of SRT file paths
 */
async function findSrtFiles(directory: string): Promise<string[]> {
  try {
    const files = await fsp.readdir(directory);
    return files
      .filter(file => file.toLowerCase().endsWith('.srt'))
      .map(file => path.join(directory, file));
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  args.jobLog('Starting finalization of files');

  try {
    // Get the inputs
    const replaceOriginalFile = args.inputs.replaceOriginalFile as boolean;
    const copySrtFiles = args.inputs.copySrtFiles as boolean;
    const copyOrMoveSrts = args.inputs.copyOrMoveSrts as string;

    // Get the current file path (redacted version)
    const currentPath = args.inputFileObj._id;
    if (!currentPath) {
      args.jobLog('No input file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    // Get the original file path
    const originalPath = args.originalLibraryFile._id;
    if (!originalPath) {
      args.jobLog('No original file found');
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 2, // Failed
        variables: args.variables,
      };
    }

    args.jobLog(`Current file: ${currentPath}`);
    args.jobLog(`Original file: ${originalPath}`);

    // Get the directories
    const currentDir = path.dirname(currentPath);
    const originalDir = path.dirname(originalPath);
    const originalFileName = path.basename(originalPath, path.extname(originalPath));
    const originalExt = path.extname(originalPath);

    args.jobLog(`Current directory: ${currentDir}`);
    args.jobLog(`Original directory: ${originalDir}`);

    // Replace the original file if requested
    let finalPath = currentPath;
    if (replaceOriginalFile) {
      args.jobLog('Replacing original file');

      // Create a temporary path
      const tempPath = `${originalPath}.tmp`;

      // Move the current file to the temporary path
      await fileMoveOrCopy({
        operation: 'copy',
        sourcePath: currentPath,
        destinationPath: tempPath,
        args,
      });

      // Check if the original file exists and is different from the current file
      const originalFileExists = await fs.promises.access(originalPath)
        .then(() => true)
        .catch(() => false);
      
      const currentFileIsNotOriginal = originalPath !== currentPath;

      // Delete the original file if it exists and is different from the current file
      if (originalFileExists && currentFileIsNotOriginal) {
        args.jobLog(`Deleting original file: ${originalPath}`);
        await fsp.unlink(originalPath);
      }

      // Move the temporary file to the original path
      await fileMoveOrCopy({
        operation: 'move',
        sourcePath: tempPath,
        destinationPath: originalPath,
        args,
      });

      finalPath = originalPath;
    }

    // Copy SRT files if requested
    if (copySrtFiles) {
      args.jobLog(`${copyOrMoveSrts === 'copy' ? 'Copying' : 'Moving'} SRT files to original directory`);

      // Find all SRT files in the current directory
      const srtFiles = await findSrtFiles(currentDir);
      args.jobLog(`Found ${srtFiles.length} SRT files`);

      // Process each SRT file
      for (const srtFile of srtFiles) {
        const srtFileName = path.basename(srtFile);
        
        // Create a new file name based on the original file name
        const newSrtFileName = `${originalFileName}${srtFileName.includes('_redacted') ? '_redacted' : ''}.srt`;
        const newSrtPath = path.join(originalDir, newSrtFileName);
        
        args.jobLog(`${copyOrMoveSrts === 'copy' ? 'Copying' : 'Moving'} ${srtFile} to ${newSrtPath}`);
        
        // Copy or move the SRT file
        await fileMoveOrCopy({
          operation: copyOrMoveSrts as 'copy' | 'move',
          sourcePath: srtFile,
          destinationPath: newSrtPath,
          args,
        });
      }
    }

    args.jobLog('Files finalized successfully');

    return {
      outputFileObj: {
        _id: finalPath,
      },
      outputNumber: 1, // Success
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error in finalizing files: ${errorMessage}`);
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