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
    return;
  }

  try {
    // Check if destination file already exists
    const destExists = await fsp.access(destinationPath)
      .then(() => true)
      .catch(() => false);

    if (destExists) {
      args.jobLog(`Destination file already exists: ${destinationPath}`);
      
      // Create a temporary file path
      const tempPath = `${destinationPath}.tmp`;
      
      // First copy to temp file
      await fileMoveOrCopy({
        operation: 'copy',
        sourcePath,
        destinationPath: tempPath,
        args,
      });
      
      // Delete existing file
      args.jobLog(`Deleting existing file: ${destinationPath}`);
      await fsp.unlink(destinationPath);
      
      // Rename temp file to final name
      args.jobLog(`Renaming temp file to final name`);
      await fsp.rename(tempPath, destinationPath);
      
      // Delete source file since we're doing a move operation
      args.jobLog(`Deleting source file: ${sourcePath}`);
      await fsp.unlink(sourcePath);
    } else {
      // Ensure the destination directory exists
      args.deps.fsextra.ensureDirSync(getFileAbosluteDir(destinationPath));
      
      // Move the file directly
      await fileMoveOrCopy({
        operation: 'move',
        sourcePath,
        destinationPath,
        args,
      });
    }
  } catch (error) {
    args.jobLog(`Error moving file: ${error}`);
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

    // First check if we have a subtitle path in the variables
    let subtitlePath = args.variables?.user?.subtitlePath;
    if (subtitlePath) {
      args.jobLog(`Found subtitle path in variables: ${subtitlePath}`);
      
      // Get the directory of the subtitle file
      const subtitleDir = path.dirname(subtitlePath);
      args.jobLog(`Subtitle directory: ${subtitleDir}`);
      
      // Check if the subtitle file exists
      const subtitleExists = await fsp.access(subtitlePath)
        .then(() => true)
        .catch(() => false);
      
      if (subtitleExists) {
        args.jobLog(`Subtitle file exists: ${subtitlePath}`);
        
        // Move this specific subtitle file
        const subtitleFileName = path.basename(subtitlePath);
        let destFileName = subtitleFileName;
        
        // Rename if needed
        if (renameToMatchOriginal) {
          const ext = path.extname(subtitleFileName);
          // Add language code 'en' for English
          destFileName = `${originalFileName}.en${ext}`;
        }
        
        const destinationPath = path.join(originalDir, destFileName);
        
        await doOperation({
          args,
          sourcePath: subtitlePath,
          destinationPath,
        });
        
        return {
          outputFileObj: args.inputFileObj,
          outputNumber: 1,
          variables: args.variables,
        };
      } else {
        args.jobLog(`Subtitle file does not exist: ${subtitlePath}`);
      }
    }
    
    // If we didn't find a subtitle file from variables, look in the working directory
    // and the temp directory where the SRT files might be created
    const workingDir = getFileAbosluteDir(args.inputFileObj._id);
    args.jobLog(`Working directory: ${workingDir}`);
    
    // Also check the temp directory where the SRT files might be created
    // This is typically a directory like /temp/tdarr-workDir2-XXXXXXX/YYYYYYY/
    const tempDir = path.dirname(args.variables?.user?.audioFilePath || '');
    if (tempDir && tempDir !== '.' && tempDir !== workingDir) {
      args.jobLog(`Checking temp directory: ${tempDir}`);
    }
    
    // Find all files in the working directory
    let allFiles: string[] = [];
    try {
      // Check working directory
      const workingDirFiles = await fsp.readdir(workingDir);
      allFiles.push(...workingDirFiles.map(file => path.join(workingDir, file)));
      
      // Check temp directory if it exists and is different from working directory
      if (tempDir && tempDir !== '.' && tempDir !== workingDir) {
        try {
          const tempDirFiles = await fsp.readdir(tempDir);
          allFiles.push(...tempDirFiles.map(file => path.join(tempDir, file)));
          args.jobLog(`Found ${tempDirFiles.length} files in temp directory`);
        } catch (error) {
          args.jobLog(`Error reading temp directory: ${error}`);
        }
      }
      
      args.jobLog(`Found ${allFiles.length} total files to check`);
    } catch (error) {
      args.jobLog(`Error reading directories: ${error}`);
      return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
      };
    }

    // Filter for subtitle files
    const subtitleFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase().substring(1); // Remove the dot
      return fileExtensions.includes(ext);
    });

    args.jobLog(`Found ${subtitleFiles.length} subtitle files: ${subtitleFiles.join(', ')}`);

    // Map to source and destination paths
    const filesInDir = subtitleFiles.map((sourcePath) => {
      const fileName = path.basename(sourcePath);
      let destFileName = fileName;
      
      // Rename if needed
      if (renameToMatchOriginal) {
        const ext = path.extname(fileName);
        // Add language code 'en' for English
        destFileName = `${originalFileName}.en${ext}`;
      }
      
      const destinationPath = path.join(originalDir, destFileName);
      
      return {
        source: sourcePath,
        destination: destinationPath,
      };
    })
    .filter((row) => row.source !== args.originalLibraryFile._id && row.source !== args.inputFileObj._id);

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