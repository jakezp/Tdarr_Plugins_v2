"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Check Audio Channel Count',
    description: 'Check if audio is 5.1, stereo, or mono for profanity redaction',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'audio,profanity',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faVolumeHigh',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'File has 5.1 audio (6 channels)',
        },
        {
            number: 2,
            tooltip: 'File has stereo audio (2 channels)',
        },
        {
            number: 3,
            tooltip: 'File has mono audio (1 channel)',
        },
        {
            number: 4,
            tooltip: 'File has no audio or unsupported channel configuration',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) {
    var _a, _b;
    var lib = require('../../../../../methods/lib')();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
    args.inputs = lib.loadDefaultValues(args.inputs, details);
    args.jobLog('Checking audio channel count for profanity redaction routing');
    // Default to output 4 (no audio or unsupported)
    var outputNumber = 4;
    // Check if the file has streams data
    if (Array.isArray((_b = (_a = args === null || args === void 0 ? void 0 : args.inputFileObj) === null || _a === void 0 ? void 0 : _a.ffProbeData) === null || _b === void 0 ? void 0 : _b.streams)) {
        // Find audio streams
        var audioStreams = args.inputFileObj.ffProbeData.streams.filter(function (stream) { return stream.codec_type === 'audio'; });
        args.jobLog("Found ".concat(audioStreams.length, " audio stream(s)"));
        if (audioStreams.length > 0) {
            // Get the first audio stream (typically the default one)
            var primaryAudioStream = audioStreams[0];
            var channelCount = primaryAudioStream.channels;
            if (channelCount !== undefined) {
                args.jobLog("Primary audio stream has ".concat(channelCount, " channel(s)"));
                args.jobLog("Audio codec: ".concat(primaryAudioStream.codec_name || 'unknown'));
                // Determine output based on channel count
                if (channelCount === 6) {
                    args.jobLog('Detected 5.1 audio (6 channels)');
                    outputNumber = 1;
                }
                else if (channelCount === 2) {
                    args.jobLog('Detected stereo audio (2 channels)');
                    outputNumber = 2;
                }
                else if (channelCount === 1) {
                    args.jobLog('Detected mono audio (1 channel)');
                    outputNumber = 3;
                }
                else {
                    args.jobLog("Unsupported channel configuration: ".concat(channelCount, " channels"));
                    outputNumber = 4;
                }
                // Add audio stream details to variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { audioChannelCount: channelCount.toString(), audioCodec: primaryAudioStream.codec_name || 'unknown', audioStreamIndex: (primaryAudioStream.index || 0).toString() }) });
            }
            else {
                args.jobLog('Could not determine channel count for audio stream');
                outputNumber = 4;
            }
        }
        else {
            args.jobLog('No audio streams found in the file');
        }
    }
    else {
        args.jobLog('File has no stream data');
    }
    return {
        outputFileObj: args.inputFileObj,
        outputNumber: outputNumber,
        variables: args.variables,
    };
};
exports.plugin = plugin;
