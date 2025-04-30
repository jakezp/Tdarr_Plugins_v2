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
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Subtitle Generation',
    description: 'Generate subtitles with profanity words redacted',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'subtitle,profanity,srt',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faClosedCaptioning',
    inputs: [
        {
            label: 'Output File Path',
            name: 'outputFilePath',
            type: 'string',
            defaultValue: '',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Path to save the subtitle file (leave empty to use the original video path)',
        },
        {
            label: 'Redaction Character',
            name: 'redactionChar',
            type: 'string',
            defaultValue: '*',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Character to use for redacting profanity words',
        },
        {
            label: 'Save Next to Video',
            name: 'saveNextToVideo',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Save the subtitle file next to the original video file',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Subtitle generation successful',
        },
        {
            number: 2,
            tooltip: 'No transcription data available',
        },
    ],
}); };
exports.details = details;
/**
 * Convert seconds to SRT time format (HH:MM:SS,mmm)
 * @param seconds Time in seconds
 * @returns Time in SRT format
 */
function secondsToSrtTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor(seconds % 60);
    var milliseconds = Math.floor((seconds % 1) * 1000);
    return "".concat(hours.toString().padStart(2, '0'), ":").concat(minutes.toString().padStart(2, '0'), ":").concat(secs.toString().padStart(2, '0'), ",").concat(milliseconds.toString().padStart(3, '0'));
}
/**
 * Redact profanity words in a segment
 * @param segment Transcription segment
 * @param profanitySegments Array of profanity segments
 * @param redactionChar Character to use for redaction
 * @returns Redacted text
 */
function redactProfanityInSegment(segment, profanitySegments, redactionChar) {
    // If the segment has no words, return the text as is
    if (!segment.words || segment.words.length === 0) {
        return segment.text;
    }
    // Create a copy of the words array to work with
    var words = __spreadArray([], segment.words, true);
    // Extract the actual profanity words from the segments
    var profanityWordsSet = new Set();
    profanitySegments.forEach(function (segment) {
        // Clean the word and add it to the set
        var cleanWord = segment.word.toLowerCase().replace(/[.,!?;:'"()\-\s]+/g, '');
        profanityWordsSet.add(cleanWord);
    });
    // Log the profanity words for debugging
    console.log("Profanity words: ".concat(Array.from(profanityWordsSet).join(', ')));
    // Redact ONLY words that exactly match profanity words
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        var cleanWord = word.word.toLowerCase().replace(/[.,!?;:'"()\-\s]+/g, '');
        // Only redact if the word is in the profanity list
        if (profanityWordsSet.has(cleanWord)) {
            // Redact the word
            words[i] = __assign(__assign({}, word), { word: redactionChar.repeat(word.word.length) });
            console.log("Redacted word: ".concat(cleanWord));
        }
    }
    // Reconstruct the text with redacted words
    return words.map(function (w) { return w.word; }).join(' ');
}
/**
 * Generate SRT content from transcription data with profanity redacted
 * @param transcriptionData Transcription data from WhisperX
 * @param profanitySegments Array of profanity segments
 * @param redactionChar Character to use for redaction
 * @returns SRT content as a string
 */
function generateSrtContent(transcriptionData, profanitySegments, redactionChar) {
    // Log profanity segments for debugging
    console.log("Number of profanity segments for SRT generation: ".concat(profanitySegments.length));
    if (profanitySegments.length > 0) {
        console.log("First few profanity segments: ".concat(JSON.stringify(profanitySegments.slice(0, 3))));
    }
    if (!transcriptionData.segments || !Array.isArray(transcriptionData.segments)) {
        return '';
    }
    var segments = transcriptionData.segments;
    var srtContent = '';
    for (var i = 0; i < segments.length; i++) {
        var segment = segments[i];
        var segmentNumber = i + 1;
        var startTime = secondsToSrtTime(segment.start);
        var endTime = secondsToSrtTime(segment.end);
        var redactedText = redactProfanityInSegment(segment, profanitySegments, redactionChar);
        srtContent += "".concat(segmentNumber, "\n");
        srtContent += "".concat(startTime, " --> ").concat(endTime, "\n");
        srtContent += "".concat(redactedText, "\n\n");
    }
    return srtContent;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, outputFilePath, redactionChar, saveNextToVideo, transcriptionData, profanitySegments, srtContent, videoPath, videoDir, videoName, audioFilePath, audioDir, audioName, errorMessage;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    return __generator(this, function (_p) {
        lib = require('../../../../../methods/lib')();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
        args.inputs = lib.loadDefaultValues(args.inputs, details);
        args.jobLog('Starting subtitle generation with profanity redaction');
        try {
            outputFilePath = args.inputs.outputFilePath;
            redactionChar = args.inputs.redactionChar;
            saveNextToVideo = args.inputs.saveNextToVideo;
            // Get the transcription data from the previous plugin
            if (!((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.transcriptionData)) {
                args.jobLog('No transcription data available');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            }
            transcriptionData = JSON.parse(args.variables.user.transcriptionData);
            // Get the profanity segments from the previous plugin
            if (!((_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.profanitySegments)) {
                args.jobLog('No profanity segments found in variables, generating subtitles without redaction');
            }
            profanitySegments = ((_f = (_e = args.variables) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.profanitySegments)
                ? JSON.parse(args.variables.user.profanitySegments)
                : [];
            args.jobLog("Found ".concat(profanitySegments.length, " profanity segments to redact in subtitles"));
            srtContent = generateSrtContent(transcriptionData, profanitySegments, redactionChar);
            if (!srtContent) {
                args.jobLog('Failed to generate SRT content');
                throw new Error('Failed to generate SRT content');
            }
            // Determine the output file path
            if (!outputFilePath) {
                if (saveNextToVideo && ((_g = args.inputFileObj) === null || _g === void 0 ? void 0 : _g._id)) {
                    videoPath = args.inputFileObj._id;
                    videoDir = path.dirname(videoPath);
                    videoName = path.basename(videoPath, path.extname(videoPath));
                    outputFilePath = "".concat(videoDir, "/").concat(videoName, "_redacted.en.srt");
                }
                else {
                    audioFilePath = ((_j = (_h = args.variables) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.centerChannelPath) ||
                        ((_l = (_k = args.variables) === null || _k === void 0 ? void 0 : _k.user) === null || _l === void 0 ? void 0 : _l.extractedAudioPath) ||
                        ((_o = (_m = args.variables) === null || _m === void 0 ? void 0 : _m.user) === null || _o === void 0 ? void 0 : _o.audioFilePath);
                    if (audioFilePath) {
                        audioDir = path.dirname(audioFilePath);
                        audioName = path.basename(audioFilePath, path.extname(audioFilePath));
                        outputFilePath = "".concat(audioDir, "/").concat(audioName, "_redacted.en.srt");
                    }
                    else {
                        args.jobLog('No output file path provided and no input file path found');
                        throw new Error('No output file path provided and no input file path found');
                    }
                }
            }
            // Write the SRT file
            fs.writeFileSync(outputFilePath, srtContent);
            args.jobLog("Subtitle file saved to: ".concat(outputFilePath));
            // Update variables for downstream plugins
            args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { subtitlePath: outputFilePath }) });
            // Return the original input file object, not the SRT file
            // This ensures the next plugin gets the video file as input, not the SRT file
            return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
        }
        catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Unknown error';
            args.jobLog("Error in subtitle generation: ".concat(errorMessage));
            throw error;
        }
        return [2 /*return*/];
    });
}); };
exports.plugin = plugin;
