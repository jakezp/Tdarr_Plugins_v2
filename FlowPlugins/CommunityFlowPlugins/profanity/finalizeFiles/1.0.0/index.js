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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var fs_1 = require("fs");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
var cliUtils_1 = require("../../../../FlowHelpers/1.0.0/cliUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Finalize Files',
    description: 'Replace original file with redacted version and copy SRT files to original directory',
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'file,replace,copy,srt',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faFileExport',
    inputs: [
        {
            label: 'Replace Original File',
            name: 'replaceOriginalFile',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Replace the original file with the redacted version',
        },
        {
            label: 'Copy SRT Files',
            name: 'copySrtFiles',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Copy SRT files to the original directory',
        },
        {
            label: 'Copy or Move SRTs',
            name: 'copyOrMoveSrts',
            type: 'string',
            defaultValue: 'copy',
            inputUI: {
                type: 'dropdown',
                options: [
                    'copy',
                    'move',
                ],
            },
            tooltip: 'Specify whether to copy or move the SRT files',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Files finalized successfully',
        },
        {
            number: 2,
            tooltip: 'Failed to finalize files',
        },
    ],
}); };
exports.details = details;
/**
 * Find all SRT files in a directory and its subdirectories
 * @param directory Directory to search in
 * @returns Array of SRT file paths
 */
function findSrtFiles(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var results, entries, _i, entries_1, entry, fullPath, subDirResults, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    results = [];
                    return [4 /*yield*/, fs_1.promises.readdir(directory, { withFileTypes: true })];
                case 1:
                    entries = _a.sent();
                    _i = 0, entries_1 = entries;
                    _a.label = 2;
                case 2:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 6];
                    entry = entries_1[_i];
                    fullPath = path.join(directory, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 4];
                    return [4 /*yield*/, findSrtFiles(fullPath)];
                case 3:
                    subDirResults = _a.sent();
                    results.push.apply(results, subDirResults);
                    return [3 /*break*/, 5];
                case 4:
                    if (entry.isFile() && entry.name.toLowerCase().endsWith('.srt')) {
                        // Add SRT files to results
                        results.push(fullPath);
                    }
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [2 /*return*/, results];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error reading directory ".concat(directory, ":"), error_1);
                    return [2 /*return*/, []];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Find SRT files in the working directory and its parent directories
 * @param workingDir The working directory
 * @param maxDepth Maximum depth to search up the directory tree
 * @returns Array of SRT file paths
 */
function findSrtFilesInWorkingArea(workingDir, maxDepth) {
    if (maxDepth === void 0) { maxDepth = 3; }
    return __awaiter(this, void 0, void 0, function () {
        var results, workingDirResults, currentDir, i, parentDir, parentResults;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = [];
                    return [4 /*yield*/, findSrtFiles(workingDir)];
                case 1:
                    workingDirResults = _a.sent();
                    results.push.apply(results, workingDirResults);
                    currentDir = workingDir;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < maxDepth)) return [3 /*break*/, 5];
                    parentDir = path.dirname(currentDir);
                    if (parentDir === currentDir) {
                        // Reached the root directory
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, findSrtFiles(parentDir)];
                case 3:
                    parentResults = _a.sent();
                    results.push.apply(results, parentResults);
                    currentDir = parentDir;
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, results];
            }
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, replaceOriginalFile, copySrtFiles, copyOrMoveSrts, originalPath, originalDir, originalFileName, originalExt, redactedVideoPath, redactedVideoExists, ffmpegArgs, cli, res, srtFiles, subtitlePath, error_2, workingDir, tempDirFiles, _i, srtFiles_1, srtFile, srtFileName, newSrtFileName, newSrtPath, tempSrtPath, destSrtExists, error_3, error_4, errorMessage;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting finalization of files');
                _e.label = 1;
            case 1:
                _e.trys.push([1, 24, , 25]);
                replaceOriginalFile = args.inputs.replaceOriginalFile;
                copySrtFiles = args.inputs.copySrtFiles;
                copyOrMoveSrts = args.inputs.copyOrMoveSrts;
                originalPath = args.originalLibraryFile._id;
                if (!originalPath) {
                    args.jobLog('No original file found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                originalDir = path.dirname(originalPath);
                originalFileName = path.basename(originalPath, path.extname(originalPath));
                originalExt = path.extname(originalPath);
                args.jobLog("Original file: ".concat(originalPath));
                args.jobLog("Original directory: ".concat(originalDir));
                redactedVideoPath = '';
                if ((_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.redactedVideoPath) {
                    redactedVideoPath = args.variables.user.redactedVideoPath;
                    args.jobLog("Found redacted video path in variables: ".concat(redactedVideoPath));
                }
                if (!(replaceOriginalFile && redactedVideoPath)) return [3 /*break*/, 5];
                args.jobLog('Replacing original file with redacted video');
                return [4 /*yield*/, fs.promises.access(redactedVideoPath)
                        .then(function () { return true; })
                        .catch(function () { return false; })];
            case 2:
                redactedVideoExists = _e.sent();
                if (!!redactedVideoExists) return [3 /*break*/, 3];
                args.jobLog("Redacted video file not found at: ".concat(redactedVideoPath));
                return [3 /*break*/, 5];
            case 3:
                // Use FFmpeg to copy the file to preserve metadata
                args.jobLog('Using FFmpeg to copy the file with metadata preservation');
                ffmpegArgs = [
                    '-y',
                    '-i', redactedVideoPath,
                    '-map', '0',
                    '-c', 'copy',
                    originalPath,
                ];
                args.jobLog("Executing FFmpeg command to copy file with metadata");
                args.jobLog("FFmpeg arguments: ".concat(ffmpegArgs.join(' ')));
                cli = new cliUtils_1.CLI({
                    cli: args.ffmpegPath,
                    spawnArgs: ffmpegArgs,
                    spawnOpts: {},
                    jobLog: args.jobLog,
                    outputFilePath: originalPath,
                    inputFileObj: args.inputFileObj,
                    logFullCliOutput: args.logFullCliOutput,
                    updateWorker: args.updateWorker,
                    args: args,
                });
                return [4 /*yield*/, cli.runCli()];
            case 4:
                res = _e.sent();
                if (res.cliExitCode !== 0) {
                    args.jobLog('FFmpeg file copy failed');
                }
                else {
                    args.jobLog("Successfully replaced original file with redacted video");
                }
                _e.label = 5;
            case 5:
                if (!copySrtFiles) return [3 /*break*/, 23];
                args.jobLog("".concat(copyOrMoveSrts === 'copy' ? 'Copying' : 'Moving', " SRT files to original directory"));
                srtFiles = [];
                if (!((_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.subtitlePath)) return [3 /*break*/, 9];
                subtitlePath = args.variables.user.subtitlePath;
                args.jobLog("Found subtitle path in variables: ".concat(subtitlePath));
                _e.label = 6;
            case 6:
                _e.trys.push([6, 8, , 9]);
                return [4 /*yield*/, fs_1.promises.access(subtitlePath, fs.constants.F_OK)];
            case 7:
                _e.sent();
                args.jobLog("Subtitle file exists at: ".concat(subtitlePath));
                srtFiles.push(subtitlePath);
                return [3 /*break*/, 9];
            case 8:
                error_2 = _e.sent();
                args.jobLog("Subtitle file not found at: ".concat(subtitlePath, ". Error: ").concat(error_2));
                return [3 /*break*/, 9];
            case 9:
                if (!(srtFiles.length === 0)) return [3 /*break*/, 13];
                args.jobLog('Searching for SRT files in working area');
                workingDir = path.dirname(args.inputFileObj._id);
                args.jobLog("Checking working directory: ".concat(workingDir));
                return [4 /*yield*/, findSrtFiles(workingDir)];
            case 10:
                tempDirFiles = _e.sent();
                if (!(tempDirFiles.length > 0)) return [3 /*break*/, 11];
                args.jobLog("Found ".concat(tempDirFiles.length, " SRT files in working directory"));
                srtFiles.push.apply(srtFiles, tempDirFiles);
                return [3 /*break*/, 13];
            case 11:
                // If no files found in temp directory, search more broadly
                args.jobLog('No SRT files found in working directory, searching more broadly');
                return [4 /*yield*/, findSrtFilesInWorkingArea(workingDir)];
            case 12:
                srtFiles = _e.sent();
                _e.label = 13;
            case 13:
                args.jobLog("Found ".concat(srtFiles.length, " SRT files: ").concat(srtFiles.join(', ')));
                _i = 0, srtFiles_1 = srtFiles;
                _e.label = 14;
            case 14:
                if (!(_i < srtFiles_1.length)) return [3 /*break*/, 23];
                srtFile = srtFiles_1[_i];
                srtFileName = path.basename(srtFile);
                newSrtFileName = "".concat(originalFileName, ".en.srt");
                newSrtPath = path.join(originalDir, newSrtFileName);
                args.jobLog("Using original filename for SRT: ".concat(newSrtFileName));
                tempSrtPath = "".concat(newSrtPath, ".tmp");
                args.jobLog("Moving ".concat(srtFile, " to temporary path: ").concat(tempSrtPath));
                _e.label = 15;
            case 15:
                _e.trys.push([15, 21, , 22]);
                // First move the SRT file to a temporary path
                return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                        operation: 'move',
                        sourcePath: srtFile,
                        destinationPath: tempSrtPath,
                        args: args,
                    })];
            case 16:
                // First move the SRT file to a temporary path
                _e.sent();
                return [4 /*yield*/, fs.promises.access(newSrtPath)
                        .then(function () { return true; })
                        .catch(function () { return false; })];
            case 17:
                destSrtExists = _e.sent();
                if (!destSrtExists) return [3 /*break*/, 19];
                args.jobLog("Deleting existing SRT file: ".concat(newSrtPath));
                return [4 /*yield*/, fs_1.promises.unlink(newSrtPath)];
            case 18:
                _e.sent();
                _e.label = 19;
            case 19: 
            // Move the temporary SRT file to the final path
            return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                    operation: 'move',
                    sourcePath: tempSrtPath,
                    destinationPath: newSrtPath,
                    args: args,
                })];
            case 20:
                // Move the temporary SRT file to the final path
                _e.sent();
                args.jobLog("Successfully moved SRT file to ".concat(newSrtPath));
                return [3 /*break*/, 22];
            case 21:
                error_3 = _e.sent();
                args.jobLog("Error handling SRT file: ".concat(error_3));
                return [3 /*break*/, 22];
            case 22:
                _i++;
                return [3 /*break*/, 14];
            case 23:
                args.jobLog('Files finalized successfully');
                // Always return the original input file object to avoid issues
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 24:
                error_4 = _e.sent();
                errorMessage = error_4 instanceof Error ? error_4.message : 'Unknown error';
                args.jobLog("Error in finalizing files: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 25: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
