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
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
var path = __importStar(require("path"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Check Profanity Filtered Tag',
    description: 'Checks if the first audio stream has been processed for profanity (has profanity_filtered tag)',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'metadata,streams,tags,profanity',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faTag',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Audio has been processed (profanity_filtered tag found)',
        },
        {
            number: 2,
            tooltip: 'Audio needs processing (no profanity_filtered tag)',
        },
    ],
}); };
exports.details = details;
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, filePath, ffprobeCmd, ffprobeCli, ffprobeResult, streamInfo, fs, tempOutputPath, ffprobeFileCmd, ffprobeFileCli, stdoutContent, error_1, audioStreams, firstAudioStream, error_2, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Checking for profanity_filtered tag on first audio stream');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
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
                ffprobeResult = _a.sent();
                if (ffprobeResult.cliExitCode !== 0) {
                    args.jobLog('Failed to get stream info with ffprobe');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                streamInfo = void 0;
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
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
                _a.sent();
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
                error_1 = _a.sent();
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
                if (audioStreams.length === 0) {
                    args.jobLog('No audio streams found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                firstAudioStream = audioStreams[0];
                // Check if the first audio stream has the profanity_filtered tag
                if (firstAudioStream.tags && firstAudioStream.tags.profanity_filtered === 'true') {
                    args.jobLog('Found profanity_filtered tag on first audio stream - already processed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                args.jobLog('No profanity_filtered tag found on first audio stream - needs processing');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 7:
                error_2 = _a.sent();
                errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                args.jobLog("Error checking for profanity_filtered tag: ".concat(errorMessage));
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
