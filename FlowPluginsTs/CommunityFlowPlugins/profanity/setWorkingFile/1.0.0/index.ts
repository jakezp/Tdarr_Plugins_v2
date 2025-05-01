import {
  IpluginDetails,
  IpluginInputArgs,
  IpluginOutputArgs,
} from '../../../../FlowHelpers/1.0.0/interfaces/interfaces';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
const details = (): IpluginDetails => ({
  name: 'Set Working File',
  description: 'Set the working file to the specified file path. Useful for resetting the working file to the original file after processing.',
  style: {
    borderColor: '#FF5733', // Orange-red color for profanity-related plugins
  },
  tags: 'file,working,reset',
  isStartPlugin: false,
  pType: '',
  requiresVersion: '2.11.01',
  sidebarPosition: -1,
  icon: 'faFileExport',
  inputs: [
    {
      label: 'File Path',
      name: 'filePath',
      type: 'string',
      defaultValue: 'original',
      inputUI: {
        type: 'dropdown',
        options: [
          'original',
          'redacted',
          'custom',
        ],
      },
      tooltip: 'Specify which file to set as the working file',
    },
    {
      label: 'Custom File Path',
      name: 'customFilePath',
      type: 'string',
      defaultValue: '',
      inputUI: {
        type: 'text',
        displayConditions: {
          logic: 'AND',
          sets: [
            {
              logic: 'AND',
              inputs: [
                {
                  name: 'filePath',
                  value: 'custom',
                  condition: '===',
                },
              ],
            },
          ],
        },
      },
      tooltip: 'Specify a custom file path to set as the working file',
    },
  ],
  outputs: [
    {
      number: 1,
      tooltip: 'Working file set successfully',
    },
  ],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const plugin = async (args: IpluginInputArgs): Promise<IpluginOutputArgs> => {
  const lib = require('../../../../../methods/lib')();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
  args.inputs = lib.loadDefaultValues(args.inputs, details);

  try {
    const filePathOption = args.inputs.filePath as string;
    const customFilePath = args.inputs.customFilePath as string;

    let newWorkingFilePath = '';

    // Determine which file to set as the working file
    if (filePathOption === 'original') {
      newWorkingFilePath = args.originalLibraryFile._id;
      args.jobLog(`Setting working file to original file: ${newWorkingFilePath}`);
    } else if (filePathOption === 'redacted') {
      if (args.variables?.user?.redactedVideoPath) {
        newWorkingFilePath = args.variables.user.redactedVideoPath;
        args.jobLog(`Setting working file to redacted video: ${newWorkingFilePath}`);
      } else if (args.variables?.user?.finalOutputPath) {
        newWorkingFilePath = args.variables.user.finalOutputPath;
        args.jobLog(`Setting working file to final output: ${newWorkingFilePath}`);
      } else {
        args.jobLog('No redacted video path found in variables, keeping current working file');
        newWorkingFilePath = args.inputFileObj._id;
      }
    } else if (filePathOption === 'custom' && customFilePath) {
      newWorkingFilePath = customFilePath;
      args.jobLog(`Setting working file to custom path: ${newWorkingFilePath}`);
    } else {
      args.jobLog('No valid file path option selected, keeping current working file');
      newWorkingFilePath = args.inputFileObj._id;
    }

    // Check if the file exists
    const fs = require('fs');
    if (!fs.existsSync(newWorkingFilePath)) {
      args.jobLog(`Warning: File does not exist: ${newWorkingFilePath}`);
    }

    // Return the new working file
    return {
      outputFileObj: {
        _id: newWorkingFilePath,
      },
      outputNumber: 1,
      variables: args.variables,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    args.jobLog(`Error setting working file: ${errorMessage}`);
    
    // Return the current working file
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