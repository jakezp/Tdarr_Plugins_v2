"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var flowUtils_1 = require("../../../../FlowHelpers/1.0.0/interfaces/flowUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Keep First AC3 Audio Stream Only',
    description: 'WARNING: This plugin is risky and should only be used in specific cases like profanity filtering. '
        + 'It checks if the first audio stream is AC3 codec, and if so, removes all other audio streams. '
        + 'If the first audio stream is not AC3, the process will fail. '
        + 'This can result in loss of audio tracks including commentary, foreign languages, etc.',
    style: {
        borderColor: '#ff6b6b', // Red to indicate potential risk
    },
    tags: 'audio,ac3,filter,profanity',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: '🔊',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'First audio stream is AC3 and other audio streams were removed',
        },
        {
            number: 2,
            tooltip: 'First audio stream is not AC3, process failed',
        },
    ],
}); };
exports.details = details;
var plugin = function (args) {
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    // Check if ffmpegCommand is initialized
    (0, flowUtils_1.checkFfmpegCommandInit)(args);
    // Find all audio streams
    var audioStreams = args.variables.ffmpegCommand.streams.filter(function (stream) { return stream.codec_type === 'audio'; });
    // If no audio streams found, fail
    if (audioStreams.length === 0) {
        args.jobLog('No audio streams found in the file');
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 2,
            variables: args.variables,
        };
    }
    // Get the first audio stream
    var firstAudioStream = audioStreams[0];
    // Check if the first audio stream is AC3
    if (firstAudioStream.codec_name.toLowerCase() !== 'ac3') {
        args.jobLog("First audio stream (index ".concat(firstAudioStream.index, ") is not AC3, it's ").concat(firstAudioStream.codec_name));
        return {
            outputFileObj: args.inputFileObj,
            outputNumber: 2,
            variables: args.variables,
        };
    }
    // First audio stream is AC3, keep it and remove all other audio streams
    args.jobLog("First audio stream (index ".concat(firstAudioStream.index, ") is AC3, keeping only this audio stream"));
    // Mark all other audio streams for removal
    var removedCount = 0;
    args.variables.ffmpegCommand.streams.forEach(function (stream) {
        if (stream.codec_type === 'audio' && stream.index !== firstAudioStream.index) {
            // eslint-disable-next-line no-param-reassign
            stream.removed = true;
            removedCount += 1;
            args.jobLog("Removing audio stream index ".concat(stream.index));
        }
    });
    args.jobLog("Kept AC3 audio stream index ".concat(firstAudioStream.index, " and removed ").concat(removedCount, " other audio streams"));
    // Set shouldProcess to true to ensure FFmpeg processes the file
    args.variables.ffmpegCommand.shouldProcess = true;
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: 1,
        variables: args.variables,
    };
};
exports.plugin = plugin;
