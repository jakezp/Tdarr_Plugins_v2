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
 * Find all SRT files in a directory and its subdirectories
 * @param directory Directory to search in
 * @returns Array of SRT file paths
 */
async function findSrtFiles(directory: string): Promise<string[]> {
  try {
    const results: string[] = [];
    
    // Read the directory contents
    const entries = await fsp.readdir(directory, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subDirResults = await findSrtFiles(fullPath);
        results.push(...subDirResults);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.srt')) {
        // Add SRT files to results
        results.push(fullPath);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

/**
 * Find SRT files in the working directory and its parent directories
 * @param workingDir The working directory
 * @param maxDepth Maximum depth to search up the directory tree
 * @returns Array of SRT file paths
 */
async function findSrtFilesInWorkingArea(workingDir: string, maxDepth: number = 3): Promise<string[]> {
  const results: string[] = [];
  
  // Search in the working directory and its subdirectories
  const workingDirResults = await findSrtFiles(workingDir);
  results.push(...workingDirResults);
  
  // Search in parent directories up to maxDepth
  let currentDir = workingDir;
  for (let i = 0; i < maxDepth; i++) {
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached the root directory
      break;
    }
    
    const parentResults = await findSrtFiles(parentDir);
    results.push(...parentResults);
    
    currentDir = parentDir;
  }
  
  return results;
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
        operation: 'move', // Use move instead of copy to avoid leaving the _redacted file behind
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

      // Check if we have a subtitle path in variables
      let srtFiles: string[] = [];
      
      if (args.variables?.user?.subtitlePath) {
        // Use the subtitle path from variables
        const subtitlePath = args.variables.user.subtitlePath;
        args.jobLog(`Found subtitle path in variables: ${subtitlePath}`);
        
        // Check if the file exists
        try {
          await fsp.access(subtitlePath, fs.constants.F_OK);
          args.jobLog(`Subtitle file exists at: ${subtitlePath}`);
          srtFiles.push(subtitlePath);
        } catch (error) {
          args.jobLog(`Subtitle file not found at: ${subtitlePath}. Error: ${error}`);
          // If the file doesn't exist, we'll fall back to searching
        }
      }
      
      // If no subtitle path was found or the file doesn't exist, search for SRT files
      if (srtFiles.length === 0) {
        args.jobLog('Searching for SRT files in working area');
        
        // First check the temp directory where the subtitle might have been generated
        const tempDir = path.dirname(currentPath);
        args.jobLog(`Checking temp directory: ${tempDir}`);
        const tempDirFiles = await findSrtFiles(tempDir);
        
        if (tempDirFiles.length > 0) {
          args.jobLog(`Found ${tempDirFiles.length} SRT files in temp directory`);
          srtFiles.push(...tempDirFiles);
        } else {
          // If no files found in temp directory, search more broadly
          args.jobLog('No SRT files found in temp directory, searching more broadly');
          srtFiles = await findSrtFilesInWorkingArea(currentDir);
        }
      }
      
      args.jobLog(`Found ${srtFiles.length} SRT files: ${srtFiles.join(', ')}`);

      // Process each SRT file
      for (const srtFile of srtFiles) {
        const srtFileName = path.basename(srtFile);
        
        // Create a new file name based on the original file name
        // Always use the original filename without any suffix
        const newSrtFileName = `${originalFileName}.srt`;
        const newSrtPath = path.join(originalDir, newSrtFileName);
        
        args.jobLog(`Using original filename for SRT: ${newSrtFileName}`);
        
        // Create a temporary path for the SRT file
        const tempSrtPath = `${newSrtPath}.tmp`;
        
        args.jobLog(`Moving ${srtFile} to temporary path: ${tempSrtPath}`);
        
        try {
          // First move the SRT file to a temporary path
          await fileMoveOrCopy({
            operation: 'move', // Always move to avoid leaving _redacted files behind
            sourcePath: srtFile,
            destinationPath: tempSrtPath,
            args,
          });
          
          // Check if the destination SRT file exists
          const destSrtExists = await fs.promises.access(newSrtPath)
            .then(() => true)
            .catch(() => false);
          
          // Delete the destination SRT file if it exists
          if (destSrtExists) {
            args.jobLog(`Deleting existing SRT file: ${newSrtPath}`);
            await fsp.unlink(newSrtPath);
          }
          
          // Move the temporary SRT file to the final path
          await fileMoveOrCopy({
            operation: 'move',
            sourcePath: tempSrtPath,
            destinationPath: newSrtPath,
            args,
          });
          
          args.jobLog(`Successfully moved SRT file to ${newSrtPath}`);
        } catch (error) {
          args.jobLog(`Error handling SRT file: ${error}`);
        }
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