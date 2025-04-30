"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var path = __importStar(require("path"));
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
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, filePath, ffprobeCmd, ffprobeCli, ffprobeResult, streamInfo, fs_1, tempOutputPath, ffprobeFileCmd, ffprobeFileCli, stdoutContent, error_1, audioStreams, firstAudioStream, mapArgs_1, videoStreams, subtitleStreams, fileDir, fileName, fileExt, outputFilePath, ffmpegArgs, cli, res, fs, error_2, errorMessage;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 8, , 9]);
                filePath = args.inputFileObj._id;
                if (!filePath) {
                    args.jobLog('No input file found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                ffprobeCmd = [
                    '-v', 'quiet',
                    '-print_format', 'json',
                    '-show_streams',
                    filePath,
                ];
                args.jobLog('Getting stream info with ffprobe');
                ffprobeCli = new cliUtils_1.CLI({
                    cli: '/usr/lib/jellyfin-ffmpeg/ffprobe',
                    spawnArgs: ffprobeCmd,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: '',
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, ffprobeCli.runCli()];
            case 2:
                ffprobeResult = _b.sent();
                if (ffprobeResult.cliExitCode !== 0) {
                    args.jobLog('Failed to get stream info with ffprobe');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                streamInfo = void 0;
                _b.label = 3;
            case 3:
                _b.trys.push([3, 5, , 6]);
                fs_1 = require('fs');
                tempOutputPath = "".concat(path.dirname(filePath), "/ffprobe_output_").concat(Date.now(), ".json");
                ffprobeFileCmd = [
                    '-v', 'quiet',
                    '-print_format', 'json',
                    '-show_streams',
                    '-o', tempOutputPath,
                    filePath,
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
                return [4 /*yield*/, ffprobeFileCli.runCli()];
            case 4:
                _b.sent();
                // Read the output file
                if (fs_1.existsSync(tempOutputPath)) {
                    stdoutContent = fs_1.readFileSync(tempOutputPath, 'utf8');
                    streamInfo = JSON.parse(stdoutContent);
                    // Clean up the temporary file
                    fs_1.unlinkSync(tempOutputPath);
                }
                else {
                    throw new Error('Failed to get ffprobe output');
                }
                return [3 /*break*/, 6];
            case 5:
                error_1 = _b.sent();
                args.jobLog("Error parsing ffprobe output: ".concat(error_1));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 6:
                if (!streamInfo || !streamInfo.streams) {
                    args.jobLog('No stream info found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                audioStreams = streamInfo.streams.filter(function (stream) { return stream.codec_type === 'audio'; });
                // If no audio streams found, fail
                if (audioStreams.length === 0) {
                    args.jobLog('No audio streams found in the file');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                firstAudioStream = audioStreams[0];
                // Check if the first audio stream is AC3
                if (firstAudioStream.codec_name.toLowerCase() !== 'ac3') {
                    args.jobLog("First audio stream (index ".concat(firstAudioStream.index, ") is not AC3, it's ").concat(firstAudioStream.codec_name));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                // First audio stream is AC3, keep it and remove all other audio streams
                args.jobLog("First audio stream (index ".concat(firstAudioStream.index, ") is AC3, keeping only this audio stream"));
                mapArgs_1 = [];
                videoStreams = streamInfo.streams.filter(function (stream) { return stream.codec_type === 'video'; });
                videoStreams.forEach(function (stream) {
                    mapArgs_1.push('-map', "0:".concat(stream.index));
                });
                // Map only the first audio stream
                mapArgs_1.push('-map', "0:".concat(firstAudioStream.index));
                subtitleStreams = streamInfo.streams.filter(function (stream) { return stream.codec_type === 'subtitle'; });
                subtitleStreams.forEach(function (stream) {
                    mapArgs_1.push('-map', "0:".concat(stream.index));
                });
                fileDir = path.dirname(filePath);
                fileName = path.basename(filePath, path.extname(filePath));
                fileExt = path.extname(filePath);
                outputFilePath = "".concat(fileDir, "/").concat(fileName, "_ac3only").concat(fileExt);
                ffmpegArgs = __spreadArray(__spreadArray([
                    '-i', filePath
                ], mapArgs_1, true), [
                    '-c', 'copy',
                    '-map_metadata', '0',
                    '-map_metadata:s:a:0', '0:s:a:0',
                    outputFilePath,
                ], false);
                args.jobLog("Executing FFmpeg command to keep only the first AC3 audio stream");
                args.jobLog("FFmpeg arguments: ".concat(ffmpegArgs.join(' ')));
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
            case 7:
                res = _b.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg command failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                fs = require('fs');
                fs.unlinkSync(filePath);
                fs.renameSync(outputFilePath, filePath);
                args.jobLog("Successfully kept only the first AC3 audio stream");
                // Log all variables for debugging
                args.jobLog("Variables before return: ".concat(JSON.stringify(((_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) || {})));
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: filePath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 8:
                error_2 = _b.sent();
                errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                args.jobLog("Error in keepFirstAc3AudioStream plugin: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
