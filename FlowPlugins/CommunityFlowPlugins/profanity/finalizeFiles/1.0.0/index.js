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
 * Find all SRT files in a directory
 * @param directory Directory to search in
 * @returns Array of SRT file paths
 */
function findSrtFiles(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var files, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs_1.promises.readdir(directory)];
                case 1:
                    files = _a.sent();
                    return [2 /*return*/, files
                            .filter(function (file) { return file.toLowerCase().endsWith('.srt'); })
                            .map(function (file) { return path.join(directory, file); })];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error reading directory ".concat(directory, ":"), error_1);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, replaceOriginalFile, copySrtFiles, copyOrMoveSrts, currentPath, originalPath, currentDir, originalDir, originalFileName, originalExt, finalPath, tempPath, originalFileExists, currentFileIsNotOriginal, srtFiles, _i, srtFiles_1, srtFile, srtFileName, newSrtFileName, newSrtPath, error_2, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                args.jobLog('Starting finalization of files');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 13, , 14]);
                replaceOriginalFile = args.inputs.replaceOriginalFile;
                copySrtFiles = args.inputs.copySrtFiles;
                copyOrMoveSrts = args.inputs.copyOrMoveSrts;
                currentPath = args.inputFileObj._id;
                if (!currentPath) {
                    args.jobLog('No input file found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                originalPath = args.originalLibraryFile._id;
                if (!originalPath) {
                    args.jobLog('No original file found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 2,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Current file: ".concat(currentPath));
                args.jobLog("Original file: ".concat(originalPath));
                currentDir = path.dirname(currentPath);
                originalDir = path.dirname(originalPath);
                originalFileName = path.basename(originalPath, path.extname(originalPath));
                originalExt = path.extname(originalPath);
                args.jobLog("Current directory: ".concat(currentDir));
                args.jobLog("Original directory: ".concat(originalDir));
                finalPath = currentPath;
                if (!replaceOriginalFile) return [3 /*break*/, 7];
                args.jobLog('Replacing original file');
                tempPath = "".concat(originalPath, ".tmp");
                // Move the current file to the temporary path
                return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                        operation: 'copy',
                        sourcePath: currentPath,
                        destinationPath: tempPath,
                        args: args,
                    })];
            case 2:
                // Move the current file to the temporary path
                _a.sent();
                return [4 /*yield*/, fs.promises.access(originalPath)
                        .then(function () { return true; })
                        .catch(function () { return false; })];
            case 3:
                originalFileExists = _a.sent();
                currentFileIsNotOriginal = originalPath !== currentPath;
                if (!(originalFileExists && currentFileIsNotOriginal)) return [3 /*break*/, 5];
                args.jobLog("Deleting original file: ".concat(originalPath));
                return [4 /*yield*/, fs_1.promises.unlink(originalPath)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: 
            // Move the temporary file to the original path
            return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                    operation: 'move',
                    sourcePath: tempPath,
                    destinationPath: originalPath,
                    args: args,
                })];
            case 6:
                // Move the temporary file to the original path
                _a.sent();
                finalPath = originalPath;
                _a.label = 7;
            case 7:
                if (!copySrtFiles) return [3 /*break*/, 12];
                args.jobLog("".concat(copyOrMoveSrts === 'copy' ? 'Copying' : 'Moving', " SRT files to original directory"));
                return [4 /*yield*/, findSrtFiles(currentDir)];
            case 8:
                srtFiles = _a.sent();
                args.jobLog("Found ".concat(srtFiles.length, " SRT files"));
                _i = 0, srtFiles_1 = srtFiles;
                _a.label = 9;
            case 9:
                if (!(_i < srtFiles_1.length)) return [3 /*break*/, 12];
                srtFile = srtFiles_1[_i];
                srtFileName = path.basename(srtFile);
                newSrtFileName = "".concat(originalFileName).concat(srtFileName.includes('_redacted') ? '_redacted' : '', ".srt");
                newSrtPath = path.join(originalDir, newSrtFileName);
                args.jobLog("".concat(copyOrMoveSrts === 'copy' ? 'Copying' : 'Moving', " ").concat(srtFile, " to ").concat(newSrtPath));
                // Copy or move the SRT file
                return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                        operation: copyOrMoveSrts,
                        sourcePath: srtFile,
                        destinationPath: newSrtPath,
                        args: args,
                    })];
            case 10:
                // Copy or move the SRT file
                _a.sent();
                _a.label = 11;
            case 11:
                _i++;
                return [3 /*break*/, 9];
            case 12:
                args.jobLog('Files finalized successfully');
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: finalPath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 13:
                error_2 = _a.sent();
                errorMessage = error_2 instanceof Error ? error_2.message : 'Unknown error';
                args.jobLog("Error in finalizing files: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 2,
                        variables: args.variables,
                    }];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
