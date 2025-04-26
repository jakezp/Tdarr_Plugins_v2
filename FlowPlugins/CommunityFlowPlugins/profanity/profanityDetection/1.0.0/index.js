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
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Profanity Detection',
    description: 'Analyze transcription to identify profanity and generate segments to redact',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'audio,profanity,transcription',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faFilter',
    inputs: [
        {
            label: 'Profanity Filter Level',
            name: 'filterLevel',
            type: 'string',
            defaultValue: 'medium',
            inputUI: {
                type: 'dropdown',
                options: [
                    'mild',
                    'medium',
                    'strong',
                ],
            },
            tooltip: 'Level of profanity filtering (mild, medium, strong)',
        },
        {
            label: 'Buffer Time (seconds)',
            name: 'bufferTime',
            type: 'string',
            defaultValue: '0.2',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Time buffer to add before and after profanity words (in seconds)',
        },
        {
            label: 'Save Profanity JSON',
            name: 'saveJson',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Save the detected profanity segments as a JSON file alongside the audio file',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Profanity detected',
        },
        {
            number: 2,
            tooltip: 'No profanity detected',
        },
        {
            number: 3,
            tooltip: 'No transcription data available',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, filterLevel, bufferTime, saveJson, transcriptionData, audioFilePath, profanityModule, isProfanity, profanitySegments, segments, i, segment, j, wordObj, word, start, end, audioDir, fileName, jsonFilePath, errorMessage;
    var _a, _b;
    return __generator(this, function (_c) {
        lib = require('../../../../../methods/lib')();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
        args.inputs = lib.loadDefaultValues(args.inputs, details);
        args.jobLog('Starting profanity detection for redaction');
        try {
            filterLevel = args.inputs.filterLevel;
            bufferTime = parseFloat(args.inputs.bufferTime);
            saveJson = args.inputs.saveJson;
            args.jobLog("Using profanity filter level: ".concat(filterLevel));
            args.jobLog("Using buffer time: ".concat(bufferTime, " seconds"));
            // Get the transcription data from the previous plugin
            if (!((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.transcriptionData)) {
                args.jobLog('No transcription data available');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 3,
                        variables: args.variables,
                    }];
            }
            transcriptionData = JSON.parse(args.variables.user.transcriptionData);
            audioFilePath = args.variables.user.audioFilePath;
            if (!transcriptionData.segments || !Array.isArray(transcriptionData.segments)) {
                args.jobLog('Transcription data does not contain segments');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 3,
                        variables: args.variables,
                    }];
            }
            profanityModule = require('../../../../../Community/profanityList');
            isProfanity = profanityModule.isProfanity;
            profanitySegments = [];
            segments = transcriptionData.segments;
            args.jobLog("Processing ".concat(segments.length, " transcription segments"));
            for (i = 0; i < segments.length; i++) {
                segment = segments[i];
                // Skip segments without words
                if (!segment.words || !Array.isArray(segment.words)) {
                    continue;
                }
                // Check each word for profanity
                for (j = 0; j < segment.words.length; j++) {
                    wordObj = segment.words[j];
                    word = wordObj.word.trim();
                    // Skip punctuation and empty words
                    if (!word || word.match(/^[.,!?;:'"()\-\s]+$/)) {
                        continue;
                    }
                    // Check if the word is profanity
                    if (isProfanity(word, filterLevel)) {
                        start = Math.max(0, wordObj.start - bufferTime);
                        end = wordObj.end + bufferTime;
                        profanitySegments.push({
                            word: word,
                            start: start,
                            end: end,
                            segmentId: segment.id,
                        });
                        args.jobLog("Detected profanity: \"".concat(word, "\" at ").concat(start.toFixed(2), "s - ").concat(end.toFixed(2), "s"));
                    }
                }
            }
            // Check if any profanity was detected
            if (profanitySegments.length === 0) {
                args.jobLog('No profanity detected in the transcription');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            }
            args.jobLog("Detected ".concat(profanitySegments.length, " profanity segments"));
            // Save the profanity segments to a JSON file if requested
            if (saveJson && audioFilePath) {
                audioDir = path.dirname(audioFilePath);
                fileName = path.basename(audioFilePath, path.extname(audioFilePath));
                jsonFilePath = "".concat(audioDir, "/").concat(fileName, "_profanity.json");
                fs.writeFileSync(jsonFilePath, JSON.stringify({
                    filterLevel: filterLevel,
                    bufferTime: bufferTime,
                    segments: profanitySegments,
                }, null, 2));
                args.jobLog("Saved profanity segments to: ".concat(jsonFilePath));
            }
            // Update variables for downstream plugins
            args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { profanitySegments: JSON.stringify(profanitySegments), profanityFilterLevel: filterLevel, profanityBufferTime: bufferTime.toString() }) });
            args.jobLog('Profanity detection completed successfully');
            return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
        }
        catch (error) {
            errorMessage = error instanceof Error ? error.message : 'Unknown error';
            args.jobLog("Error in profanity detection: ".concat(errorMessage));
            return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 3,
                    variables: args.variables,
                }];
        }
        return [2 /*return*/];
    });
}); };
exports.plugin = plugin;
