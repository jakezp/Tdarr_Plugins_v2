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
    name: 'Update Stream Tags and Remux to MKV',
    description: 'Update stream tags, add profanity_filtered tag, and remux to MKV container to ensure metadata is preserved',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'metadata,streams,tags',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faTags',
    inputs: [
        {
            label: 'Redacted Audio Stream Title',
            name: 'redactedAudioTitle',
            type: 'string',
            defaultValue: '{CODEC} - {LANG} - Family',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Title for the redacted audio stream. Use {CODEC} and {LANG} as placeholders.',
        },
        {
            label: 'Original Audio Stream Title',
            name: 'originalAudioTitle',
            type: 'string',
            defaultValue: '{CODEC} - {LANG} - Original',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Title for the original audio stream. Use {CODEC} and {LANG} as placeholders.',
        },
        {
            label: 'Subtitle Title',
            name: 'subtitleTitle',
            type: 'string',
            defaultValue: 'Family ({LANG})',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Title for the subtitle file. Use {LANG} as a placeholder.',
        },
        {
            label: 'Default Language',
            name: 'defaultLanguage',
            type: 'string',
            defaultValue: 'eng',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Default language code to use if language cannot be detected.',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Stream tags updated successfully',
        },
        {
            number: 2,
            tooltip: 'Failed to update stream tags',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, redactedAudioTitle_1, originalAudioTitle_1, subtitleTitle_1, defaultLanguage_1, filePath, ffprobeCmd, ffprobeCli, ffprobeResult, streamInfo, fs, tempOutputPath, ffprobeFileCmd, ffprobeFileCli, stdoutContent, error_1, metadataArgs_1, audioStreamIndex_1, subtitleStreamIndex_1, videoStreamIndex_1, originalAudioLanguage_1, originalAudioFound, _i, _a, stream, _b, _c, stream, fileDir, fileName, outputFilePath, ffmpegArgs, cli, res, error_2, errorMessage;
    var _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting update of stream tags and names');
                _h.label = 1;
            case 1:
                _h.trys.push([1, 8, , 9]);
                redactedAudioTitle_1 = args.inputs.redactedAudioTitle;
                originalAudioTitle_1 = args.inputs.originalAudioTitle;
                subtitleTitle_1 = args.inputs.subtitleTitle;
                defaultLanguage_1 = args.inputs.defaultLanguage;
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
                ffprobeResult = _h.sent();
                if (ffprobeResult.cliExitCode !== 0) {
                    args.jobLog('Failed to get stream info with ffprobe');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                streamInfo = void 0;
                _h.label = 3;
            case 3:
                _h.trys.push([3, 5, , 6]);
                fs = require('fs');
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
                _h.sent();
                // Read the output file
                if (fs.existsSync(tempOutputPath)) {
                    stdoutContent = fs.readFileSync(tempOutputPath, 'utf8');
                    streamInfo = JSON.parse(stdoutContent);
                    // Clean up the temporary file
                    fs.unlinkSync(tempOutputPath);
                }
                else {
                    throw new Error('Failed to get ffprobe output');
                }
                return [3 /*break*/, 6];
            case 5:
                error_1 = _h.sent();
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
                metadataArgs_1 = [];
                audioStreamIndex_1 = 0;
                subtitleStreamIndex_1 = 0;
                videoStreamIndex_1 = 0;
                originalAudioLanguage_1 = defaultLanguage_1;
                originalAudioFound = false;
                for (_i = 0, _a = streamInfo.streams; _i < _a.length; _i++) {
                    stream = _a[_i];
                    if (stream.codec_type === 'audio' && stream.index > 0) {
                        // This is not the first audio stream, so it's likely the original
                        if (((_d = stream.tags) === null || _d === void 0 ? void 0 : _d.language) && stream.tags.language !== 'und') {
                            originalAudioLanguage_1 = stream.tags.language;
                            originalAudioFound = true;
                            args.jobLog("Found original audio language: ".concat(originalAudioLanguage_1));
                            break;
                        }
                    }
                }
                // If we didn't find an original audio stream with a language, try to get it from the first audio stream
                if (!originalAudioFound) {
                    for (_b = 0, _c = streamInfo.streams; _b < _c.length; _b++) {
                        stream = _c[_b];
                        if (stream.codec_type === 'audio') {
                            if (((_e = stream.tags) === null || _e === void 0 ? void 0 : _e.language) && stream.tags.language !== 'und') {
                                originalAudioLanguage_1 = stream.tags.language;
                                args.jobLog("Using first audio stream language: ".concat(originalAudioLanguage_1));
                                break;
                            }
                        }
                    }
                }
                // Second pass: update metadata for all streams
                streamInfo.streams.forEach(function (stream, index) {
                    var _a, _b, _c, _d;
                    if (stream.codec_type === 'video') {
                        // Set language for video streams
                        metadataArgs_1.push("-metadata:s:v:".concat(videoStreamIndex_1), "language=".concat(defaultLanguage_1));
                        // Add description if it doesn't exist
                        if (!((_a = stream.tags) === null || _a === void 0 ? void 0 : _a.title)) {
                            metadataArgs_1.push("-metadata:s:v:".concat(videoStreamIndex_1), "title=Video");
                        }
                        videoStreamIndex_1++;
                    }
                    else if (stream.codec_type === 'audio') {
                        // Get codec and language
                        var codec = ((_b = stream.codec_name) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'AC3';
                        // For the first audio stream (redacted), use the language from the original audio
                        // For other streams, use their existing language or the default
                        var lang = void 0;
                        if (audioStreamIndex_1 === 0) {
                            // First audio stream is the redacted one - use the original audio language
                            lang = originalAudioLanguage_1;
                            args.jobLog("Setting redacted audio language to: ".concat(lang));
                        }
                        else {
                            // Other audio streams - use their existing language or default
                            lang = ((_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language) || defaultLanguage_1;
                        }
                        // Set title based on whether it's the first audio stream (redacted) or not (original)
                        var title = void 0;
                        var displayLang = lang.toUpperCase();
                        // Map language codes to display names
                        if (lang === 'eng')
                            displayLang = 'English';
                        else if (lang === 'fre' || lang === 'fra')
                            displayLang = 'French';
                        else if (lang === 'ger' || lang === 'deu')
                            displayLang = 'German';
                        else if (lang === 'spa')
                            displayLang = 'Spanish';
                        else if (lang === 'ita')
                            displayLang = 'Italian';
                        else if (lang === 'jpn')
                            displayLang = 'Japanese';
                        else if (lang === 'chi' || lang === 'zho')
                            displayLang = 'Chinese';
                        if (audioStreamIndex_1 === 0) {
                            // First audio stream is the redacted one
                            title = redactedAudioTitle_1
                                .replace('{CODEC}', codec)
                                .replace('{LANG}', displayLang);
                        }
                        else {
                            // Other audio streams are original
                            title = originalAudioTitle_1
                                .replace('{CODEC}', codec)
                                .replace('{LANG}', displayLang);
                        }
                        // Add metadata arguments
                        metadataArgs_1.push("-metadata:s:a:".concat(audioStreamIndex_1), "title=".concat(title));
                        metadataArgs_1.push("-metadata:s:a:".concat(audioStreamIndex_1), "language=".concat(lang));
                        // Set the first audio stream as default and add profanity_filtered tag
                        if (audioStreamIndex_1 === 0) {
                            metadataArgs_1.push("-disposition:a:".concat(audioStreamIndex_1), 'default');
                            // Add custom 'profanity_filtered' tag to the first audio stream (redacted/Family)
                            metadataArgs_1.push("-metadata:s:a:".concat(audioStreamIndex_1), "profanity_filtered=true");
                            args.jobLog("Adding profanity_filtered tag to audio stream ".concat(audioStreamIndex_1));
                        }
                        else {
                            metadataArgs_1.push("-disposition:a:".concat(audioStreamIndex_1), 'none');
                        }
                        audioStreamIndex_1++;
                    }
                    else if (stream.codec_type === 'subtitle') {
                        // Get language
                        var lang = ((_d = stream.tags) === null || _d === void 0 ? void 0 : _d.language) || defaultLanguage_1;
                        // Map language codes to display names
                        var displayLang = lang.toUpperCase();
                        if (lang === 'eng')
                            displayLang = 'English';
                        else if (lang === 'fre' || lang === 'fra')
                            displayLang = 'French';
                        else if (lang === 'ger' || lang === 'deu')
                            displayLang = 'German';
                        else if (lang === 'spa')
                            displayLang = 'Spanish';
                        else if (lang === 'ita')
                            displayLang = 'Italian';
                        else if (lang === 'jpn')
                            displayLang = 'Japanese';
                        else if (lang === 'chi' || lang === 'zho')
                            displayLang = 'Chinese';
                        // Set title
                        var title = subtitleTitle_1.replace('{LANG}', displayLang);
                        // Add metadata arguments
                        metadataArgs_1.push("-metadata:s:s:".concat(subtitleStreamIndex_1), "title=".concat(title));
                        metadataArgs_1.push("-metadata:s:s:".concat(subtitleStreamIndex_1), "language=".concat(lang));
                        subtitleStreamIndex_1++;
                    }
                });
                args.jobLog("Setting language tags for ".concat(videoStreamIndex_1, " video streams, ").concat(audioStreamIndex_1, " audio streams, and ").concat(subtitleStreamIndex_1, " subtitle streams"));
                fileDir = path.dirname(filePath);
                fileName = path.basename(filePath, path.extname(filePath));
                outputFilePath = "".concat(fileDir, "/").concat(fileName, "_tagged.mkv");
                args.jobLog("Remuxing to MKV container to ensure metadata tags are preserved");
                args.jobLog("Output file path: ".concat(outputFilePath));
                ffmpegArgs = __spreadArray(__spreadArray([
                    '-y',
                    '-i', filePath,
                    '-map', '0',
                    '-c', 'copy'
                ], metadataArgs_1, true), [
                    outputFilePath,
                ], false);
                args.jobLog("Executing FFmpeg command to update stream tags");
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
                res = _h.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg stream tag update failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                // Keep the tagged file as a separate file (don't replace the original)
                args.jobLog("Stream tags updated successfully");
                args.jobLog("Tagged file created at: ".concat(outputFilePath));
                // Log all variables for debugging
                args.jobLog("Variables before return: ".concat(JSON.stringify(((_f = args.variables) === null || _f === void 0 ? void 0 : _f.user) || {})));
                // Set the redactedVideoPath variable to the tagged file path
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: outputFilePath, // Use the tagged file as the output
                        },
                        outputNumber: 1,
                        variables: __assign(__assign({}, args.variables), { user: __assign(__assign({}, (_g = args.variables) === null || _g === void 0 ? void 0 : _g.user), { redactedVideoPath: outputFilePath }) }),
                    }];
            case 8:
                error_2 = _h.sent();
                errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                args.jobLog("Error in updating stream tags: ".concat(errorMessage));
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
