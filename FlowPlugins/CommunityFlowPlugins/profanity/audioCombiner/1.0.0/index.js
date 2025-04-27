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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Audio Combiner',
    description: 'Combine redacted center channel with original audio stream',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'audio,profanity,combine',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faVolumeUp',
    inputs: [
        {
            label: 'Original Audio Path',
            name: 'originalAudioPath',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to the original audio file (leave empty to use the file from the previous plugin)',
        },
        {
            label: 'Redacted Center Channel Path',
            name: 'redactedCenterPath',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to the redacted center channel file (leave empty to use the file from the previous plugin)',
        },
        {
            label: 'Output Format',
            name: 'outputFormat',
            type: 'string',
            defaultValue: 'ac3',
            inputUI: {
                type: 'dropdown',
                options: [
                    'ac3',
                    'eac3',
                    'aac',
                    'same',
                ],
            },
            tooltip: 'Format for the combined audio output',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Audio combination successful',
        },
        {
            number: 2,
            tooltip: 'Audio combination failed',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, originalAudioPath, redactedCenterPath, outputFormat, ffprobeCmd, tempOutputPath, ffprobeFileCmd, ffprobeFileCli, channels, sampleRate, bitRate, codec, channelLayout, stdoutContent, streamInfo, audioInfo, error_1, audioDir, fileName, fileExt, outputFilePath, scriptDir, scriptPath, filterComplex, ffmpegCmd, ffmpegArgs, cli, res, error_2, errorMessage;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting audio combination for profanity redaction');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 7, , 8]);
                originalAudioPath = args.inputs.originalAudioPath;
                redactedCenterPath = args.inputs.redactedCenterPath;
                outputFormat = args.inputs.outputFormat;
                // If no original audio path is provided, use the one from the previous plugin
                if (!originalAudioPath) {
                    if ((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.extractedAudioPath) {
                        originalAudioPath = args.variables.user.extractedAudioPath;
                        args.jobLog("Using extracted audio path from previous plugin: ".concat(originalAudioPath));
                    }
                    else {
                        args.jobLog('No original audio path provided and none found in variables');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 2,
                                variables: args.variables,
                            }];
                    }
                }
                // If no redacted center channel path is provided, use the one from the previous plugin
                if (!redactedCenterPath) {
                    if ((_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.redactedAudioPath) {
                        redactedCenterPath = args.variables.user.redactedAudioPath;
                        args.jobLog("Using redacted center channel path from previous plugin: ".concat(redactedCenterPath));
                    }
                    else {
                        args.jobLog('No redacted center channel path provided and none found in variables');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 2,
                                variables: args.variables,
                            }];
                    }
                }
                ffprobeCmd = [
                    '-v', 'quiet',
                    '-print_format', 'json',
                    '-show_streams',
                    '-select_streams', 'a:0',
                    originalAudioPath,
                ];
                args.jobLog('Getting audio stream info with ffprobe');
                tempOutputPath = "".concat(path.dirname(originalAudioPath), "/ffprobe_output_").concat(Date.now(), ".json");
                ffprobeFileCmd = [
                    '-v', 'quiet',
                    '-print_format', 'json',
                    '-show_streams',
                    '-select_streams', 'a:0',
                    '-o', tempOutputPath,
                    originalAudioPath,
                ];
                ffprobeFileCli = new cliUtils_1.CLI({
                    cli: '/usr/lib/jellyfin-ffmpeg/ffprobe',
                    spawnArgs: ffprobeFileCmd,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: tempOutputPath,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                channels = 6;
                sampleRate = '48000';
                bitRate = '448k';
                codec = outputFormat === 'same' ? 'ac3' : outputFormat;
                channelLayout = '5.1';
                _e.label = 2;
            case 2:
                _e.trys.push([2, 4, , 5]);
                return [4 /*yield*/, ffprobeFileCli.runCli()];
            case 3:
                _e.sent();
                // Read the output file
                if (fs.existsSync(tempOutputPath)) {
                    stdoutContent = fs.readFileSync(tempOutputPath, 'utf8');
                    streamInfo = JSON.parse(stdoutContent);
                    if (streamInfo && streamInfo.streams && streamInfo.streams.length > 0) {
                        audioInfo = streamInfo.streams[0];
                        // Extract audio parameters (with fallbacks if values are missing)
                        channels = audioInfo.channels || 6;
                        sampleRate = audioInfo.sample_rate || '48000';
                        bitRate = audioInfo.bit_rate ? "".concat(Math.ceil(parseInt(audioInfo.bit_rate, 10) / 1000), "k") : '448k';
                        codec = outputFormat === 'same' ? (audioInfo.codec_name || 'ac3') : outputFormat;
                        channelLayout = audioInfo.channel_layout || '5.1';
                        args.jobLog("Detected audio: ".concat(channels, " channels, ").concat(sampleRate, "Hz, ").concat(bitRate, "bps, codec: ").concat(codec, ", layout: ").concat(channelLayout));
                    }
                    else {
                        args.jobLog('No audio streams found in the file');
                    }
                    // Clean up the temporary file
                    fs.unlinkSync(tempOutputPath);
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _e.sent();
                args.jobLog("Error getting audio info: ".concat(error_1));
                return [3 /*break*/, 5];
            case 5:
                // No need for fallbacks here since we initialized with defaults
                // and provided fallbacks during extraction
                // Verify we have a 5.1 or greater channel layout
                if (channels < 6) {
                    args.jobLog("Warning: Original audio has only ".concat(channels, " channels, expected at least 6 for 5.1 audio"));
                    args.jobLog('Will attempt to process anyway, but results may not be as expected');
                }
                audioDir = path.dirname(originalAudioPath);
                fileName = (0, fileUtils_1.getFileName)(originalAudioPath);
                fileExt = path.extname(originalAudioPath);
                if (outputFormat !== 'same') {
                    fileExt = ".".concat(outputFormat);
                }
                outputFilePath = "".concat(audioDir, "/").concat(fileName, "_combined").concat(fileExt);
                scriptDir = audioDir;
                scriptPath = "".concat(scriptDir, "/ffmpeg_combine_").concat(Date.now(), ".sh");
                filterComplex = '';
                if (channelLayout === '5.1' || channelLayout === '5.1(side)') {
                    filterComplex = '[0:a]channelsplit=channel_layout=5.1[FL][FR][FC][LFE][BL][BR];[1:a]aformat=channel_layouts=mono[redactedFC];[FL][FR][redactedFC][LFE][BL][BR]amerge=inputs=6[out]';
                }
                else if (channelLayout === '7.1') {
                    filterComplex = '[0:a]channelsplit=channel_layout=7.1[FL][FR][FC][LFE][BL][BR][SL][SR];[1:a]aformat=channel_layouts=mono[redactedFC];[FL][FR][redactedFC][LFE][BL][BR][SL][SR]amerge=inputs=8[out]';
                }
                else {
                    // Default to 5.1 for unknown layouts
                    filterComplex = '[0:a]channelsplit=channel_layout=5.1[FL][FR][FC][LFE][BL][BR];[1:a]aformat=channel_layouts=mono[redactedFC];[FL][FR][redactedFC][LFE][BL][BR]amerge=inputs=6[out]';
                    args.jobLog("Warning: Unrecognized channel layout: ".concat(channelLayout, ", defaulting to 5.1 processing"));
                }
                ffmpegCmd = "".concat(args.ffmpegPath, " -y -i \"").concat(originalAudioPath, "\" -i \"").concat(redactedCenterPath, "\" -filter_complex \"").concat(filterComplex, "\" -map \"[out]\" -c:a ").concat(codec, " -ar ").concat(sampleRate, " -b:a ").concat(bitRate, " \"").concat(outputFilePath, "\"");
                // Write the script file
                fs.writeFileSync(scriptPath, ffmpegCmd);
                fs.chmodSync(scriptPath, '755'); // Make it executable
                args.jobLog("Created FFmpeg combine script: ".concat(scriptPath));
                args.jobLog("FFmpeg command: ".concat(ffmpegCmd));
                ffmpegArgs = [
                    scriptPath
                ];
                cli = new cliUtils_1.CLI({
                    cli: '/bin/sh',
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
            case 6:
                res = _e.sent();
                // Clean up the script file
                try {
                    fs.unlinkSync(scriptPath);
                }
                catch (err) {
                    args.jobLog("Warning: Could not delete temporary script file: ".concat(err));
                }
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg audio combination failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Audio combination successful: ".concat(outputFilePath));
                // Update variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { combinedAudioPath: outputFilePath }) });
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: outputFilePath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 7:
                error_2 = _e.sent();
                errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                args.jobLog("Error in audio combination: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
