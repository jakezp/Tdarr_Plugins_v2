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
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
var path = __importStar(require("path"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Move SRTs to Original Directory',
    description: "Move subtitle files from the working directory to the original file's directory.\nThis is specifically designed for the profanity filter workflow.",
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'subtitle,srt,profanity',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faFileAlt',
    inputs: [
        {
            label: 'File Extensions',
            name: 'fileExtensions',
            type: 'string',
            defaultValue: 'srt,ass',
            inputUI: {
                type: 'text',
            },
            tooltip: 'Specify a comma separated list of subtitle file extensions to move',
        },
        {
            label: 'Rename to Match Original',
            name: 'renameToMatchOriginal',
            type: 'boolean',
            defaultValue: 'true',
            inputUI: {
                type: 'switch',
            },
            tooltip: 'Rename subtitle files to match the original file name',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
var doOperation = function (_a) {
    var args = _a.args, sourcePath = _a.sourcePath, destinationPath = _a.destinationPath;
    return __awaiter(void 0, void 0, void 0, function () {
        var destExists, tempPath, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    args.jobLog("Input path: ".concat(sourcePath));
                    args.jobLog("Output path: ".concat(destinationPath));
                    if (sourcePath === destinationPath) {
                        args.jobLog('Input and output path are the same, skipping move');
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, fs_1.promises.access(destinationPath)
                            .then(function () { return true; })
                            .catch(function () { return false; })];
                case 2:
                    destExists = _b.sent();
                    if (!destExists) return [3 /*break*/, 7];
                    args.jobLog("Destination file already exists: ".concat(destinationPath));
                    tempPath = "".concat(destinationPath, ".tmp");
                    // First copy to temp file
                    return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                            operation: 'copy',
                            sourcePath: sourcePath,
                            destinationPath: tempPath,
                            args: args,
                        })];
                case 3:
                    // First copy to temp file
                    _b.sent();
                    // Delete existing file
                    args.jobLog("Deleting existing file: ".concat(destinationPath));
                    return [4 /*yield*/, fs_1.promises.unlink(destinationPath)];
                case 4:
                    _b.sent();
                    // Rename temp file to final name
                    args.jobLog("Renaming temp file to final name");
                    return [4 /*yield*/, fs_1.promises.rename(tempPath, destinationPath)];
                case 5:
                    _b.sent();
                    // Delete source file since we're doing a move operation
                    args.jobLog("Deleting source file: ".concat(sourcePath));
                    return [4 /*yield*/, fs_1.promises.unlink(sourcePath)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7:
                    // Ensure the destination directory exists
                    args.deps.fsextra.ensureDirSync((0, fileUtils_1.getFileAbosluteDir)(destinationPath));
                    // Move the file directly
                    return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                            operation: 'move',
                            sourcePath: sourcePath,
                            destinationPath: destinationPath,
                            args: args,
                        })];
                case 8:
                    // Move the file directly
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    args.jobLog("Error moving file: ".concat(error_1));
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, fileExtensions_1, renameToMatchOriginal_1, originalPath, originalDir_1, originalFileName_1, subtitlePath, subtitleDir, subtitleExists, subtitleFileName, destFileName, ext, destinationPath, workingDir_1, tempDir_1, allFiles, workingDirFiles, tempDirFiles, error_2, error_3, subtitleFiles, filesInDir, i, error_4, errorMessage;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                _e.label = 1;
            case 1:
                _e.trys.push([1, 18, , 19]);
                fileExtensions_1 = String(args.inputs.fileExtensions).split(',').map(function (row) { return row.trim(); });
                renameToMatchOriginal_1 = args.inputs.renameToMatchOriginal;
                originalPath = args.originalLibraryFile._id;
                if (!originalPath) {
                    args.jobLog('No original file found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                originalDir_1 = path.dirname(originalPath);
                originalFileName_1 = path.basename(originalPath, path.extname(originalPath));
                args.jobLog("Original file: ".concat(originalPath));
                args.jobLog("Original directory: ".concat(originalDir_1));
                subtitlePath = (_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.subtitlePath;
                if (!subtitlePath) return [3 /*break*/, 5];
                args.jobLog("Found subtitle path in variables: ".concat(subtitlePath));
                subtitleDir = path.dirname(subtitlePath);
                args.jobLog("Subtitle directory: ".concat(subtitleDir));
                return [4 /*yield*/, fs_1.promises.access(subtitlePath)
                        .then(function () { return true; })
                        .catch(function () { return false; })];
            case 2:
                subtitleExists = _e.sent();
                if (!subtitleExists) return [3 /*break*/, 4];
                args.jobLog("Subtitle file exists: ".concat(subtitlePath));
                subtitleFileName = path.basename(subtitlePath);
                destFileName = subtitleFileName;
                // Rename if needed
                if (renameToMatchOriginal_1) {
                    ext = path.extname(subtitleFileName);
                    destFileName = "".concat(originalFileName_1).concat(ext);
                }
                destinationPath = path.join(originalDir_1, destFileName);
                return [4 /*yield*/, doOperation({
                        args: args,
                        sourcePath: subtitlePath,
                        destinationPath: destinationPath,
                    })];
            case 3:
                _e.sent();
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 4:
                args.jobLog("Subtitle file does not exist: ".concat(subtitlePath));
                _e.label = 5;
            case 5:
                workingDir_1 = (0, fileUtils_1.getFileAbosluteDir)(args.inputFileObj._id);
                args.jobLog("Working directory: ".concat(workingDir_1));
                tempDir_1 = path.dirname(((_d = (_c = args.variables) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.audioFilePath) || '');
                if (tempDir_1 && tempDir_1 !== '.' && tempDir_1 !== workingDir_1) {
                    args.jobLog("Checking temp directory: ".concat(tempDir_1));
                }
                allFiles = [];
                _e.label = 6;
            case 6:
                _e.trys.push([6, 12, , 13]);
                return [4 /*yield*/, fs_1.promises.readdir(workingDir_1)];
            case 7:
                workingDirFiles = _e.sent();
                allFiles.push.apply(allFiles, workingDirFiles.map(function (file) { return path.join(workingDir_1, file); }));
                if (!(tempDir_1 && tempDir_1 !== '.' && tempDir_1 !== workingDir_1)) return [3 /*break*/, 11];
                _e.label = 8;
            case 8:
                _e.trys.push([8, 10, , 11]);
                return [4 /*yield*/, fs_1.promises.readdir(tempDir_1)];
            case 9:
                tempDirFiles = _e.sent();
                allFiles.push.apply(allFiles, tempDirFiles.map(function (file) { return path.join(tempDir_1, file); }));
                args.jobLog("Found ".concat(tempDirFiles.length, " files in temp directory"));
                return [3 /*break*/, 11];
            case 10:
                error_2 = _e.sent();
                args.jobLog("Error reading temp directory: ".concat(error_2));
                return [3 /*break*/, 11];
            case 11:
                args.jobLog("Found ".concat(allFiles.length, " total files to check"));
                return [3 /*break*/, 13];
            case 12:
                error_3 = _e.sent();
                args.jobLog("Error reading directories: ".concat(error_3));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 13:
                subtitleFiles = allFiles.filter(function (file) {
                    var ext = path.extname(file).toLowerCase().substring(1); // Remove the dot
                    return fileExtensions_1.includes(ext);
                });
                args.jobLog("Found ".concat(subtitleFiles.length, " subtitle files: ").concat(subtitleFiles.join(', ')));
                filesInDir = subtitleFiles.map(function (sourcePath) {
                    var fileName = path.basename(sourcePath);
                    var destFileName = fileName;
                    // Rename if needed
                    if (renameToMatchOriginal_1) {
                        var ext = path.extname(fileName);
                        destFileName = "".concat(originalFileName_1).concat(ext);
                    }
                    var destinationPath = path.join(originalDir_1, destFileName);
                    return {
                        source: sourcePath,
                        destination: destinationPath,
                    };
                })
                    .filter(function (row) { return row.source !== args.originalLibraryFile._id && row.source !== args.inputFileObj._id; });
                args.jobLog("Found ".concat(filesInDir.length, " subtitle files to move"));
                i = 0;
                _e.label = 14;
            case 14:
                if (!(i < filesInDir.length)) return [3 /*break*/, 17];
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, doOperation({
                        args: args,
                        sourcePath: filesInDir[i].source,
                        destinationPath: filesInDir[i].destination,
                    })];
            case 15:
                // eslint-disable-next-line no-await-in-loop
                _e.sent();
                _e.label = 16;
            case 16:
                i += 1;
                return [3 /*break*/, 14];
            case 17: return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
            case 18:
                error_4 = _e.sent();
                errorMessage = error_4 instanceof Error ? error_4.message : 'Unknown error';
                args.jobLog("Error moving subtitle files: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 19: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
