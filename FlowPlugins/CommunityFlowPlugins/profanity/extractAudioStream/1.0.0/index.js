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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Extract Audio Stream',
    description: 'Extract audio stream from video file while preserving original format',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'audio,profanity',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faVolumeUp',
    inputs: [
        {
            label: 'Stream Index',
            name: 'streamIndex',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Audio stream index to extract (leave empty to use the first audio stream)',
        },
        {
            label: 'Keep Original Codec',
            name: 'keepOriginalCodec',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Keep the original audio codec (recommended for best quality)',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Audio extraction successful',
        },
        {
            number: 2,
            tooltip: 'Audio extraction failed',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, streamIndex_1, keepOriginalCodec, audioStreams, audioCodec, audioStream, workDir, fileName, outputExtension, outputFilePath, ffmpegArgs, cli, res, error_1, errorMessage;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting audio stream extraction for profanity redaction');
                _g.label = 1;
            case 1:
                _g.trys.push([1, 3, , 4]);
                streamIndex_1 = args.inputs.streamIndex;
                keepOriginalCodec = args.inputs.keepOriginalCodec;
                // If no stream index is provided, use the one from the previous plugin or find the first audio stream
                if (!streamIndex_1) {
                    if ((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.audioStreamIndex) {
                        streamIndex_1 = args.variables.user.audioStreamIndex;
                        args.jobLog("Using audio stream index from previous plugin: ".concat(streamIndex_1));
                    }
                    else {
                        // Find the first audio stream
                        if (Array.isArray((_d = (_c = args === null || args === void 0 ? void 0 : args.inputFileObj) === null || _c === void 0 ? void 0 : _c.ffProbeData) === null || _d === void 0 ? void 0 : _d.streams)) {
                            audioStreams = args.inputFileObj.ffProbeData.streams.filter(function (stream) { return stream.codec_type === 'audio'; });
                            if (audioStreams.length > 0) {
                                streamIndex_1 = audioStreams[0].index.toString();
                                args.jobLog("Using first audio stream found: ".concat(streamIndex_1));
                            }
                            else {
                                args.jobLog('No audio streams found in the file');
                                return [2 /*return*/, {
                                        outputFileObj: args.inputFileObj,
                                        outputNumber: 2,
                                        variables: args.variables,
                                    }];
                            }
                        }
                        else {
                            args.jobLog('File has no stream data');
                            return [2 /*return*/, {
                                    outputFileObj: args.inputFileObj,
                                    outputNumber: 2,
                                    variables: args.variables,
                                }];
                        }
                    }
                }
                audioCodec = 'copy';
                if (!keepOriginalCodec) {
                    audioCodec = 'pcm_s16le'; // Use PCM if not keeping original codec
                }
                // Get the audio stream details
                if (!Array.isArray((_f = (_e = args === null || args === void 0 ? void 0 : args.inputFileObj) === null || _e === void 0 ? void 0 : _e.ffProbeData) === null || _f === void 0 ? void 0 : _f.streams)) {
                    args.jobLog('File has no stream data');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                audioStream = args.inputFileObj.ffProbeData.streams.find(function (stream) { return stream.index.toString() === streamIndex_1; });
                if (!audioStream) {
                    args.jobLog("Audio stream with index ".concat(streamIndex_1, " not found"));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Extracting audio stream ".concat(streamIndex_1, " with codec ").concat(audioStream.codec_name));
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                fileName = (0, fileUtils_1.getFileName)(args.inputFileObj._id);
                outputExtension = keepOriginalCodec ? audioStream.codec_name : 'wav';
                outputFilePath = "".concat(workDir, "/").concat(fileName, "_audio.").concat(outputExtension);
                ffmpegArgs = [
                    '-i', args.inputFileObj._id,
                    '-map',
                    "0:".concat(streamIndex_1),
                    '-c:a', audioCodec,
                ];
                // Add additional arguments based on the audio codec
                if (keepOriginalCodec) {
                    // Keep original codec settings
                    ffmpegArgs.push('-copy_unknown');
                }
                else {
                    // Convert to PCM with standard settings
                    ffmpegArgs.push('-ar', '48000');
                    if (audioStream.channels !== undefined) {
                        ffmpegArgs.push('-ac', audioStream.channels.toString());
                    }
                    else {
                        // Default to stereo if channel count is not available
                        ffmpegArgs.push('-ac', '2');
                        args.jobLog('Channel count not available, defaulting to stereo (2 channels)');
                    }
                }
                // Add output file path
                ffmpegArgs.push(outputFilePath);
                args.jobLog("Executing FFmpeg command to extract audio stream");
                cli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: ffmpegArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: outputFilePath,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, cli.runCli()];
            case 2:
                res = _g.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg audio extraction failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Audio extraction successful: ".concat(outputFilePath));
                // Update variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { extractedAudioPath: outputFilePath, extractedAudioCodec: keepOriginalCodec ? audioStream.codec_name : 'pcm_s16le', extractedAudioChannels: audioStream.channels !== undefined
                            ? audioStream.channels.toString()
                            : '2' }) });
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: outputFilePath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 3:
                error_1 = _g.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                args.jobLog("Error extracting audio stream: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
