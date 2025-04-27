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
var child_process_1 = require("child_process");
var util_1 = require("util");
var path = __importStar(require("path"));
var execAsync = (0, util_1.promisify)(child_process_1.exec);
var details = function () { return ({
    name: 'Extract and Remove Subtitles',
    description: 'Extracts English subtitles to SRT and removes all subtitles from the container',
    style: {
        borderColor: '#3498db',
    },
    tags: 'video,subtitle,extract,remove',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faClosedCaptioning',
    inputs: [
        {
            label: 'Extract English Subtitles',
            name: 'extractEnglish',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Extract English subtitles (non-SDH, non-commentary) to SRT file',
        },
        {
            label: 'Remove All Subtitles',
            name: 'removeAll',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Remove all subtitles from the container',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Success - Subtitles processed as requested',
        },
        {
            number: 2,
            tooltip: 'No subtitles found in file',
        },
        {
            number: 3,
            tooltip: 'Error occurred during processing',
        },
    ],
}); };
exports.details = details;
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, subtitleStreams, englishSubtitleStreams, englishSubStream, streamIndex, filePath, fileDir, fileName, srtFilePath, extractCommand, _a, stdout, stderr, error_1, extractError, err_1, error;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 6, , 7]);
                // Check if file has subtitles
                if (!((_b = args.inputFileObj.ffProbeData) === null || _b === void 0 ? void 0 : _b.streams)) {
                    args.jobLog('No stream data found in file');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                subtitleStreams = args.inputFileObj.ffProbeData.streams.filter(function (stream) { return stream.codec_type === 'subtitle'; });
                if (subtitleStreams.length === 0) {
                    args.jobLog('No subtitle streams found in file');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Found ".concat(subtitleStreams.length, " subtitle streams"));
                englishSubtitleStreams = subtitleStreams.filter(function (stream) {
                    var _a, _b, _c, _d, _e;
                    var language = ((_b = (_a = stream.tags) === null || _a === void 0 ? void 0 : _a.language) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'eng' ||
                        ((_d = (_c = stream.tags) === null || _c === void 0 ? void 0 : _c.language) === null || _d === void 0 ? void 0 : _d.toLowerCase()) === 'en';
                    // Check if it's not SDH or commentary
                    var title = (((_e = stream.tags) === null || _e === void 0 ? void 0 : _e.title) || '').toLowerCase();
                    var notSDH = !title.includes('sdh') && !title.includes('hearing');
                    var notCommentary = !title.includes('comment');
                    return language && notSDH && notCommentary;
                });
                args.jobLog("Found ".concat(englishSubtitleStreams.length, " English subtitle streams (non-SDH, non-commentary)"));
                if (!(args.inputs.extractEnglish && englishSubtitleStreams.length > 0)) return [3 /*break*/, 5];
                englishSubStream = englishSubtitleStreams[0];
                streamIndex = args.inputFileObj.ffProbeData.streams.indexOf(englishSubStream);
                filePath = args.inputFileObj.file;
                fileDir = path.dirname(filePath);
                fileName = path.basename(filePath, path.extname(filePath));
                srtFilePath = path.join(fileDir, "".concat(fileName, ".srt"));
                extractCommand = "\"".concat(args.ffmpegPath, "\" -i \"").concat(filePath, "\" -map 0:").concat(streamIndex, " -c:s srt \"").concat(srtFilePath, "\"");
                args.jobLog("Extracting English subtitle to: ".concat(srtFilePath));
                args.jobLog("Command: ".concat(extractCommand));
                _c.label = 2;
            case 2:
                _c.trys.push([2, 4, , 5]);
                return [4 /*yield*/, execAsync(extractCommand)];
            case 3:
                _a = _c.sent(), stdout = _a.stdout, stderr = _a.stderr;
                args.jobLog("FFmpeg stdout: ".concat(stdout));
                args.jobLog("FFmpeg stderr: ".concat(stderr));
                args.jobLog('English subtitle extracted successfully');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _c.sent();
                extractError = error_1;
                args.jobLog("Error extracting subtitle: ".concat(extractError.message));
                return [3 /*break*/, 5];
            case 5:
                // Remove all subtitles from container if requested
                if (args.inputs.removeAll) {
                    // Initialize FFmpeg command if not already initialized
                    if (!args.variables.ffmpegCommand.init) {
                        args.variables.ffmpegCommand = {
                            init: true,
                            inputFiles: [args.inputFileObj._id],
                            streams: args.inputFileObj.ffProbeData.streams.map(function (stream) { return (__assign(__assign({}, stream), { removed: false, forceEncoding: false, inputArgs: [], outputArgs: [] })); }),
                            container: args.inputFileObj.container,
                            hardwareDecoding: false,
                            shouldProcess: true,
                            overallInputArguments: [],
                            overallOuputArguments: [],
                        };
                    }
                    // Mark all subtitle streams for removal
                    args.variables.ffmpegCommand.streams.forEach(function (stream) {
                        if (stream.codec_type === 'subtitle') {
                            stream.removed = true;
                        }
                    });
                    args.jobLog('All subtitle streams marked for removal from container');
                }
                // Return success output
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 6:
                err_1 = _c.sent();
                error = err_1;
                args.jobLog("Error in Extract and Remove Subtitles plugin: ".concat(error.message));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 3,
                        variables: __assign(__assign({}, args.variables), { flowFailed: true }),
                    }];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
