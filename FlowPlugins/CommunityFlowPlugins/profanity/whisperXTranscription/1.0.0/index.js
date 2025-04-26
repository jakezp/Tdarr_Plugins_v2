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
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var http = __importStar(require("http"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'WhisperX Transcription',
    description: 'Submit audio to WhisperX service for transcription with word-level timestamps',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'audio,profanity,transcription',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faClosedCaptioning',
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
            label: 'WhisperX Service URL',
            name: 'serviceUrl',
            type: 'string',
            defaultValue: '192.168.1.250',
            inputUI: {
                type: 'text',
            },
            tooltip: 'URL of the WhisperX service',
        },
        {
            label: 'WhisperX Service Port',
            name: 'servicePort',
            type: 'string',
            defaultValue: '9000',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Port of the WhisperX service',
        },
        {
            label: 'Language',
            name: 'language',
            type: 'string',
            defaultValue: 'en',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Language code for transcription (e.g., en, fr, es)',
        },
        {
            label: 'Save Transcription JSON',
            name: 'saveJson',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Save the transcription result as a JSON file alongside the audio file',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Transcription successful',
        },
        {
            number: 2,
            tooltip: 'Transcription failed',
        },
    ],
}); };
exports.details = details;
/**
 * Sends a file to the WhisperX service for transcription
 *
 * @param audioFile - Path to the audio file
 * @param serviceUrl - URL of the WhisperX service
 * @param servicePort - Port of the WhisperX service
 * @param language - Language code for transcription
 * @param jobLog - Function to log messages
 * @returns The transcription result or null if failed
 */
function transcribeWithWhisperXService(audioFile, serviceUrl, servicePort, language, jobLog) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    try {
                        jobLog("Transcribing audio file: ".concat(audioFile));
                        // Read the audio file
                        var fileData = fs.readFileSync(audioFile);
                        // Generate a boundary for multipart/form-data
                        var boundary = "----WebKitFormBoundary".concat(Math.random().toString(16).substr(2));
                        // Create the multipart/form-data payload
                        var payload = Buffer.concat([
                            Buffer.from("--".concat(boundary, "\r\n")),
                            Buffer.from("Content-Disposition: form-data; name=\"audio_file\"; filename=\"".concat(path.basename(audioFile), "\"\r\n")),
                            Buffer.from("Content-Type: audio/wav\r\n\r\n"),
                            fileData,
                            Buffer.from("\r\n--".concat(boundary, "--\r\n"))
                        ]);
                        // Set up the HTTP request options
                        var options = {
                            hostname: serviceUrl,
                            port: parseInt(servicePort, 10),
                            path: "/asr?engine=whisperx&task=transcribe&language=".concat(language, "&word_timestamps=true&output=json"),
                            method: 'POST',
                            headers: {
                                'Content-Type': "multipart/form-data; boundary=".concat(boundary),
                                'Content-Length': payload.length
                            }
                        };
                        jobLog("Sending request to WhisperX service at http://".concat(serviceUrl, ":").concat(servicePort, "/asr"));
                        // Send the request
                        var req = http.request(options, function (res) {
                            var data = '';
                            res.on('data', function (chunk) {
                                data += chunk;
                            });
                            res.on('end', function () {
                                if (res.statusCode === 200) {
                                    try {
                                        var result = JSON.parse(data);
                                        jobLog('Transcription successful!');
                                        resolve(result);
                                    }
                                    catch (error) {
                                        jobLog("Error parsing transcription result: ".concat(error.message));
                                        reject(error);
                                    }
                                }
                                else {
                                    jobLog("HTTP Error: ".concat(res.statusCode, " ").concat(res.statusMessage));
                                    jobLog("Response data: ".concat(data));
                                    reject(new Error("HTTP Error: ".concat(res.statusCode)));
                                }
                            });
                        });
                        req.on('error', function (error) {
                            jobLog("Error sending request to WhisperX service: ".concat(error.message));
                            reject(error);
                        });
                        // Send the payload
                        req.write(payload);
                        req.end();
                    }
                    catch (error) {
                        jobLog("Error in transcribeWithWhisperXService: ".concat(error.message));
                        reject(error);
                    }
                })];
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, audioFilePath, serviceUrl, servicePort, language, saveJson, transcription, sampleCount, i, segment, audioDir, fileName, jsonFilePath, error_1, errorMessage;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting WhisperX transcription for profanity redaction');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                audioFilePath = args.inputs.audioFilePath;
                serviceUrl = args.inputs.serviceUrl;
                servicePort = args.inputs.servicePort;
                language = args.inputs.language;
                saveJson = args.inputs.saveJson;
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
                    else {
                        args.jobLog('No audio file path provided and none found in variables');
                        return [2 /*return*/, {
                                outputFileObj: args.inputFileObj,
                                outputNumber: 2,
                                variables: args.variables,
                            }];
                    }
                }
                // Check if the audio file exists
                if (!fs.existsSync(audioFilePath)) {
                    args.jobLog("Audio file does not exist: ".concat(audioFilePath));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Using WhisperX service at ".concat(serviceUrl, ":").concat(servicePort));
                args.jobLog("Language: ".concat(language));
                return [4 /*yield*/, transcribeWithWhisperXService(audioFilePath, serviceUrl, servicePort, language, args.jobLog)];
            case 2:
                transcription = _e.sent();
                if (!transcription) {
                    args.jobLog('Transcription failed');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                // Log some information about the transcription
                if (transcription.segments && transcription.segments.length > 0) {
                    args.jobLog("Transcription has ".concat(transcription.segments.length, " segments"));
                    sampleCount = Math.min(3, transcription.segments.length);
                    for (i = 0; i < sampleCount; i++) {
                        segment = transcription.segments[i];
                        args.jobLog("Segment ".concat(i + 1, ": ").concat(segment.start.toFixed(2), "s - ").concat(segment.end.toFixed(2), "s: \"").concat(segment.text, "\""));
                    }
                }
                else if (transcription.text) {
                    args.jobLog("Transcription text: ".concat(transcription.text.substring(0, 100), "..."));
                }
                else {
                    args.jobLog('Transcription format is not recognized');
                }
                // Save the transcription to a JSON file if requested
                if (saveJson) {
                    audioDir = path.dirname(audioFilePath);
                    fileName = (0, fileUtils_1.getFileName)(audioFilePath);
                    jsonFilePath = "".concat(audioDir, "/").concat(fileName, "_transcription.json");
                    fs.writeFileSync(jsonFilePath, JSON.stringify(transcription, null, 2));
                    args.jobLog("Saved transcription to: ".concat(jsonFilePath));
                }
                // Update variables for downstream plugins
                args.variables = __assign(__assign({}, args.variables), { user: __assign(__assign({}, args.variables.user), { transcriptionData: JSON.stringify(transcription), audioFilePath: audioFilePath }) });
                args.jobLog('WhisperX transcription completed successfully');
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 3:
                error_1 = _e.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                args.jobLog("Error in WhisperX transcription: ".concat(errorMessage));
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
