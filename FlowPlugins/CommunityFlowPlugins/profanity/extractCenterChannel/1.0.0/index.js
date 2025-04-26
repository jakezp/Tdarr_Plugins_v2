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
    name: 'Extract Center Channel',
    description: 'Extract center channel from 5.1 audio for profanity redaction',
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
            label: 'Audio File Path',
            name: 'audioFilePath',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to the audio file (leave empty to use the file from the previous plugin)',
        },
        {
            label: 'Output Format',
            name: 'outputFormat',
            type: 'string',
            defaultValue: 'wav',
            inputUI: {
                type: 'dropdown',
                options: [
                    'wav',
                    'mp3',
                    'ac3',
                    'aac',
                ],
            },
            tooltip: 'Format for the extracted center channel',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Center channel extraction successful',
        },
        {
            number: 2,
            tooltip: 'Center channel extraction failed',
        },
        {
            number: 3,
            tooltip: 'Not a 5.1 audio stream (skipped)',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, audioFilePath, outputFormat, channelCount, workDir, fileName, outputFilePath, ffmpegArgs, cli, res, error_1, errorMessage;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting center channel extraction for profanity redaction');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                audioFilePath = args.inputs.audioFilePath;
                outputFormat = args.inputs.outputFormat;
                // If no audio file path is provided, use the one from the previous plugin
                if (!audioFilePath) {
                    if ((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.extractedAudioPath) {
                        audioFilePath = args.variables.user.extractedAudioPath;
                        args.jobLog("Using audio file path from previous plugin: ".concat(audioFilePath));
                    }
                    else {
                        args.jobLog('No audio file path provided and none found in variables');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 2,
                                variables: args.variables,
                            }];
                    }
                }
                channelCount = ((_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.extractedAudioChannels)
                    ? parseInt(args.variables.user.extractedAudioChannels, 10)
                    : 0;
                if (channelCount !== 6) {
                    args.jobLog("Audio does not have 6 channels (5.1). Found ".concat(channelCount, " channels."));
                    args.jobLog('Skipping center channel extraction');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 3,
                            variables: args.variables,
                        }];
                }
                workDir = (0, fileUtils_1.getPluginWorkDir)(args);
                fileName = (0, fileUtils_1.getFileName)(audioFilePath);
                outputFilePath = "".concat(workDir, "/").concat(fileName, "_center.").concat(outputFormat);
                args.jobLog("Extracting center channel from 5.1 audio: ".concat(audioFilePath));
                args.jobLog("Output format: ".concat(outputFormat));
                args.jobLog("Output file: ".concat(outputFilePath));
                ffmpegArgs = [
                    '-i', audioFilePath,
                    '-filter_complex', 'pan=mono|c0=c2',
                    '-c:a',
                ];
                // Add codec based on output format
                switch (outputFormat) {
                    case 'mp3':
                        ffmpegArgs.push('libmp3lame');
                        ffmpegArgs.push('-q:a', '2'); // High quality
                        break;
                    case 'ac3':
                        ffmpegArgs.push('ac3');
                        ffmpegArgs.push('-b:a', '192k');
                        break;
                    case 'aac':
                        ffmpegArgs.push('aac');
                        ffmpegArgs.push('-b:a', '192k');
                        break;
                    default:
                        // WAV or other formats
                        ffmpegArgs.push('pcm_s16le');
                        break;
                }
                // Add output file path
                ffmpegArgs.push(outputFilePath);
                args.jobLog("Executing FFmpeg command to extract center channel");
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
                res = _e.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg center channel extraction failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Center channel extraction successful: ".concat(outputFilePath));
                // Update variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { centerChannelPath: outputFilePath, centerChannelFormat: outputFormat, originalAudioPath: audioFilePath }) });
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: outputFilePath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 3:
                error_1 = _e.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                args.jobLog("Error extracting center channel: ".concat(errorMessage));
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
