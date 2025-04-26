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
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var path = __importStar(require("path"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Audio Redaction',
    description: 'Redact (bleep out) profanity segments in audio',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'audio,profanity,redaction',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faVolumeXmark',
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
            label: 'Bleep Frequency (Hz)',
            name: 'bleepFrequency',
            type: 'string',
            defaultValue: '800',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Frequency of the bleep tone in Hz',
        },
        {
            label: 'Bleep Volume',
            name: 'bleepVolume',
            type: 'string',
            defaultValue: '0.4',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Volume of the bleep tone (0.0 to 1.0)',
        },
        {
            label: 'Extra Buffer Time (seconds)',
            name: 'extraBufferTime',
            type: 'string',
            defaultValue: '0.0',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Additional buffer time to add before and after profanity segments (in seconds)',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Audio redaction successful',
        },
        {
            number: 2,
            tooltip: 'Audio redaction failed',
        },
        {
            number: 3,
            tooltip: 'No profanity segments found',
        },
    ],
}); };
exports.details = details;
/**
 * Get non-profanity intervals from profanity segments
 * @param profanitySegments Array of profanity segments
 * @param duration Total duration of the audio file
 * @returns Array of non-profanity intervals
 */
function getNonProfanityIntervals(profanitySegments, duration) {
    var nonProfanityIntervals = [];
    if (!profanitySegments || profanitySegments.length === 0) {
        return [{ start: 0, end: duration }];
    }
    // Sort segments by start time
    var sortedSegments = __spreadArray([], profanitySegments, true).sort(function (a, b) { return a.start - b.start; });
    // Add interval from start to first segment if needed
    if (sortedSegments[0].start > 0) {
        nonProfanityIntervals.push({ start: 0, end: sortedSegments[0].start });
    }
    // Add intervals between segments
    for (var i = 0; i < sortedSegments.length - 1; i++) {
        nonProfanityIntervals.push({
            start: sortedSegments[i].end,
            end: sortedSegments[i + 1].start,
        });
    }
    // Add interval from last segment to end if needed
    if (sortedSegments[sortedSegments.length - 1].end < duration) {
        nonProfanityIntervals.push({
            start: sortedSegments[sortedSegments.length - 1].end,
            end: duration,
        });
    }
    return nonProfanityIntervals;
}
/**
 * Create FFmpeg filter complex for audio redaction
 * @param profanitySegments Array of profanity segments
 * @param nonProfanityIntervals Array of non-profanity intervals
 * @param duration Total duration of the audio file
 * @param bleepFrequency Frequency of the bleep tone in Hz
 * @param bleepVolume Volume of the bleep tone (0.0 to 1.0)
 * @returns FFmpeg filter complex string
 */
function createFFmpegFilter(profanitySegments, nonProfanityIntervals, duration, bleepFrequency, bleepVolume) {
    // Create condition for when to mute the original audio (during profanity)
    var dippedVocalsConditions = profanitySegments
        .map(function (segment) { return "between(t,".concat(segment.start, ",").concat(segment.end, ")"); })
        .join('+');
    var dippedVocalsFilter = "[0]volume=0:enable='".concat(dippedVocalsConditions, "'[main]");
    // Create condition for when to mute the bleep (during non-profanity)
    var noBleepsConditions = '';
    if (nonProfanityIntervals.length > 0) {
        noBleepsConditions = nonProfanityIntervals
            .slice(0, -1)
            .map(function (interval) { return "between(t,".concat(interval.start, ",").concat(interval.end, ")"); })
            .join('+');
        var lastInterval = nonProfanityIntervals[nonProfanityIntervals.length - 1];
        if (lastInterval.end === duration) {
            noBleepsConditions += noBleepsConditions ? "+gte(t,".concat(lastInterval.start, ")") : "gte(t,".concat(lastInterval.start, ")");
        }
        else {
            noBleepsConditions += noBleepsConditions ?
                "+between(t,".concat(lastInterval.start, ",").concat(lastInterval.end, ")") :
                "between(t,".concat(lastInterval.start, ",").concat(lastInterval.end, ")");
        }
    }
    var dippedBleepFilter = "sine=f=".concat(bleepFrequency, ",volume=").concat(bleepVolume, ",aformat=channel_layouts=mono,volume=0:enable='").concat(noBleepsConditions, "'[beep]");
    var amixFilter = "[main][beep]amix=inputs=2:duration=first";
    var filterComplex = [
        dippedVocalsFilter,
        dippedBleepFilter,
        amixFilter,
    ].join(';');
    return filterComplex;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, audioFilePath, bleepFrequency, bleepVolume, extraBufferTime_1, profanitySegments, duration, lastSegment, nonProfanityIntervals, filterComplex, audioDir, fileName, fileExt, outputFilePath, ffmpegArgs, cli, res, loudnessInfo, normalizedFileName, normalizedOutputPath, normalizationArgs, normCli, normRes, error_1, errorMessage;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting audio redaction for profanity');
                _l.label = 1;
            case 1:
                _l.trys.push([1, 4, , 5]);
                audioFilePath = args.inputs.audioFilePath;
                bleepFrequency = parseInt(args.inputs.bleepFrequency, 10);
                bleepVolume = parseFloat(args.inputs.bleepVolume);
                extraBufferTime_1 = parseFloat(args.inputs.extraBufferTime);
                // If no audio file path is provided, use the one from the previous plugin
                if (!audioFilePath) {
                    if ((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.centerChannelPath) {
                        audioFilePath = args.variables.user.centerChannelPath;
                        args.jobLog("Using center channel path from previous plugin: ".concat(audioFilePath));
                    }
                    else if ((_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.extractedAudioPath) {
                        audioFilePath = args.variables.user.extractedAudioPath;
                        args.jobLog("Using extracted audio path from previous plugin: ".concat(audioFilePath));
                    }
                    else if ((_f = (_e = args.variables) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.audioFilePath) {
                        audioFilePath = args.variables.user.audioFilePath;
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
                // Get the profanity segments from the previous plugin
                if (!((_h = (_g = args.variables) === null || _g === void 0 ? void 0 : _g.user) === null || _h === void 0 ? void 0 : _h.profanitySegments)) {
                    args.jobLog('No profanity segments found in variables');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 3,
                            variables: args.variables,
                        }];
                }
                profanitySegments = JSON.parse(args.variables.user.profanitySegments);
                if (profanitySegments.length === 0) {
                    args.jobLog('No profanity segments to redact');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 3,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Found ".concat(profanitySegments.length, " profanity segments to redact"));
                // Apply extra buffer time if specified
                if (extraBufferTime_1 > 0) {
                    args.jobLog("Adding extra buffer time of ".concat(extraBufferTime_1, " seconds to each segment"));
                    profanitySegments.forEach(function (segment) {
                        segment.start = Math.max(0, segment.start - extraBufferTime_1);
                        segment.end += extraBufferTime_1;
                    });
                }
                duration = 0;
                if (profanitySegments.length > 0) {
                    lastSegment = profanitySegments.reduce(function (latest, segment) {
                        return segment.end > latest.end ? segment : latest;
                    }, profanitySegments[0]);
                    duration = lastSegment.end + 60; // Add 60 seconds buffer
                }
                else {
                    duration = 3600; // Default to 1 hour if no segments
                }
                args.jobLog("Using audio duration: ".concat(duration, " seconds"));
                nonProfanityIntervals = getNonProfanityIntervals(profanitySegments, duration);
                filterComplex = createFFmpegFilter(profanitySegments, nonProfanityIntervals, duration, bleepFrequency, bleepVolume);
                args.jobLog("Created FFmpeg filter complex: ".concat(filterComplex));
                audioDir = path.dirname(audioFilePath);
                fileName = (0, fileUtils_1.getFileName)(audioFilePath);
                fileExt = path.extname(audioFilePath);
                outputFilePath = "".concat(audioDir, "/").concat(fileName, "_redacted").concat(fileExt);
                ffmpegArgs = [
                    '-i', audioFilePath,
                    '-filter_complex', filterComplex,
                    '-c:a', 'pcm_s16le',
                    outputFilePath,
                ];
                args.jobLog("Executing FFmpeg command to redact audio");
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
                res = _l.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg audio redaction failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Audio redaction successful: ".concat(outputFilePath));
                // Now normalize the redacted audio
                args.jobLog('Normalizing redacted audio');
                loudnessInfo = ((_k = (_j = args.variables) === null || _j === void 0 ? void 0 : _j.user) === null || _k === void 0 ? void 0 : _k.loudnessInfo) || '-24';
                normalizedFileName = "".concat(fileName, "_redacted_normalized").concat(fileExt);
                normalizedOutputPath = "".concat(audioDir, "/").concat(normalizedFileName);
                normalizationArgs = [
                    '-i', outputFilePath,
                    '-bitexact', '-ac', '1',
                    '-strict', '-2',
                    '-af',
                    "loudnorm=I=-24:LRA=7:TP=-2:measured_I=".concat(loudnessInfo, ":linear=true:print_format=summary,volume=0.90"),
                    '-c:a', 'pcm_s16le',
                    normalizedOutputPath,
                ];
                args.jobLog("Executing FFmpeg command to normalize audio");
                normCli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: normalizationArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: normalizedOutputPath,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, normCli.runCli()];
            case 3:
                normRes = _l.sent();
                if (normRes.cliExitCode !== 0) {
                    args.jobLog('FFmpeg audio normalization failed');
                    // Continue with the unnormalized audio
                    args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { redactedAudioPath: outputFilePath }) });
                    return [2 /*return*/, {
                            outputFileObj: {
                                _id: outputFilePath,
                            },
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Audio normalization successful: ".concat(normalizedOutputPath));
                // Update variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { redactedAudioPath: normalizedOutputPath, unnormalizedRedactedAudioPath: outputFilePath }) });
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: normalizedOutputPath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 4:
                error_1 = _l.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                args.jobLog("Error in audio redaction: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
