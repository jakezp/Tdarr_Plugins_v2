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
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Final Assembly',
    description: 'Combine original video with redacted audio and subtitles',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'video,profanity,assembly',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faFilm',
    inputs: [
        {
            label: 'Output File Path',
            name: 'outputFilePath',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to save the final video file (leave empty to use the original video path with _redacted suffix)',
        },
        {
            label: 'Output Container',
            name: 'outputContainer',
            type: 'string',
            defaultValue: 'mkv',
            inputUI: {
                type: 'dropdown',
                options: [
                    'mkv',
                    'mp4',
                    'same',
                ],
            },
            tooltip: 'Container format for the output file (mkv, mp4, or same as input)',
        },
        {
            label: 'Copy Video Stream',
            name: 'copyVideoStream',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Copy the video stream without re-encoding',
        },
        {
            label: 'Include Original Audio',
            name: 'includeOriginalAudio',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Include the original audio stream in addition to the redacted audio',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Final assembly successful',
        },
        {
            number: 2,
            tooltip: 'Final assembly failed',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, outputFilePath, outputContainer, copyVideoStream, includeOriginalAudio, originalVideoPath, workDir, possibleVideoPath, processedAudioPath, originalDir, originalName, finalExt, scriptDir, scriptPath, ffmpegCmd, ffmpegArgs, cli, res, error_1, errorMessage;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting final assembly of video with redacted audio and subtitles');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                outputFilePath = args.inputs.outputFilePath;
                outputContainer = args.inputs.outputContainer;
                copyVideoStream = args.inputs.copyVideoStream;
                includeOriginalAudio = args.inputs.includeOriginalAudio;
                originalVideoPath = args.originalLibraryFile._id;
                args.jobLog("Original library file path: ".concat(originalVideoPath));
                // Verify this is actually a video file
                if (!originalVideoPath ||
                    originalVideoPath.endsWith('.srt') ||
                    originalVideoPath.endsWith('.ac3') ||
                    originalVideoPath.endsWith('.aac') ||
                    originalVideoPath.endsWith('.mp3')) {
                    args.jobLog("Error: Original library file is not a video file: ".concat(originalVideoPath));
                    // Try to use the input file object as fallback
                    originalVideoPath = args.inputFileObj._id;
                    args.jobLog("Trying input file object path: ".concat(originalVideoPath));
                    // If that's still not a video file, try to find it in the working directory
                    if (!originalVideoPath ||
                        originalVideoPath.endsWith('.srt') ||
                        originalVideoPath.endsWith('.ac3') ||
                        originalVideoPath.endsWith('.aac') ||
                        originalVideoPath.endsWith('.mp3')) {
                        args.jobLog("Error: Input file is not a video file: ".concat(originalVideoPath));
                        workDir = path.dirname(originalVideoPath);
                        possibleVideoPath = path.join(workDir, path.basename(workDir) + '.mkv');
                        args.jobLog("Attempting to use video file: ".concat(possibleVideoPath));
                        if (fs.existsSync(possibleVideoPath)) {
                            args.jobLog("Found video file: ".concat(possibleVideoPath));
                            // Use this as the original video path
                            originalVideoPath = possibleVideoPath;
                        }
                        else {
                            args.jobLog('No original video file found');
                            return [2 /*return*/, {
                                    outputFileObj: args.inputFileObj,
                                    outputNumber: 2,
                                    variables: args.variables,
                                }];
                        }
                    }
                }
                processedAudioPath = (_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.combinedAudioPath;
                // If no combined audio path is found, check if we have a redacted audio path (for stereo files)
                if (!processedAudioPath) {
                    processedAudioPath = (_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.redactedAudioPath;
                    args.jobLog('No combined audio file found, checking for redacted audio (stereo case)');
                    if (!processedAudioPath) {
                        args.jobLog('No processed audio file found (neither combined nor redacted)');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 2,
                                variables: args.variables,
                            }];
                    }
                    args.jobLog("Using redacted audio path for stereo file: ".concat(processedAudioPath));
                }
                else {
                    args.jobLog("Using combined audio path for 5.1 file: ".concat(processedAudioPath));
                }
                // Note: We don't embed subtitles as per user's request
                // The subtitle file will be kept separate alongside the media file
                // We don't need to get the original audio file separately since it's already in the original video container
                // Determine the output file path and container
                if (!outputFilePath) {
                    originalDir = path.dirname(originalVideoPath);
                    originalName = path.basename(originalVideoPath, path.extname(originalVideoPath));
                    finalExt = path.extname(originalVideoPath);
                    if (outputContainer !== 'same') {
                        finalExt = ".".concat(outputContainer);
                    }
                    outputFilePath = "".concat(originalDir, "/").concat(originalName, "_redacted").concat(finalExt);
                }
                scriptDir = path.dirname(originalVideoPath);
                scriptPath = "".concat(scriptDir, "/ffmpeg_assembly_").concat(Date.now(), ".sh");
                ffmpegCmd = "".concat(args.ffmpegPath, " -y");
                // Add input files - original video and processed audio
                ffmpegCmd += " -i \"".concat(originalVideoPath, "\" -i \"").concat(processedAudioPath, "\"");
                // Map video stream from original video
                if (copyVideoStream) {
                    ffmpegCmd += ' -map 0:v -c:v copy'; // Copy all video streams
                }
                else {
                    ffmpegCmd += ' -map 0:v'; // Map all video streams but don't specify codec
                }
                // Map redacted audio stream and set it as default
                ffmpegCmd += ' -map 1:a -c:a copy -disposition:a:0 default';
                // Map original audio streams from original video if requested
                if (includeOriginalAudio) {
                    ffmpegCmd += ' -map 0:a -c:a copy -disposition:a:1 none';
                }
                // Map any subtitle streams from original video (but don't embed SRT file)
                ffmpegCmd += ' -map 0:s? -c:s copy';
                // Add output file
                ffmpegCmd += " \"".concat(outputFilePath, "\"");
                // Write the script file
                fs.writeFileSync(scriptPath, ffmpegCmd);
                fs.chmodSync(scriptPath, '755'); // Make it executable
                args.jobLog("Created FFmpeg assembly script: ".concat(scriptPath));
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
            case 2:
                res = _e.sent();
                // Clean up the script file
                try {
                    fs.unlinkSync(scriptPath);
                }
                catch (err) {
                    args.jobLog("Warning: Could not delete temporary script file: ".concat(err));
                }
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg final assembly failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Final assembly successful: ".concat(outputFilePath));
                // Update variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { finalOutputPath: outputFilePath }) });
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
                args.jobLog("Error in final assembly: ".concat(errorMessage));
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
