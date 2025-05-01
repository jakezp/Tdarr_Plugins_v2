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
var normJoinPath_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/normJoinPath"));
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
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    args.jobLog("Input path: ".concat(sourcePath));
                    args.jobLog("Output path: ".concat(destinationPath));
                    if (!(sourcePath === destinationPath)) return [3 /*break*/, 1];
                    args.jobLog('Input and output path are the same, skipping move');
                    return [3 /*break*/, 3];
                case 1:
                    args.deps.fsextra.ensureDirSync((0, fileUtils_1.getFileAbosluteDir)(destinationPath));
                    return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                            operation: 'move',
                            sourcePath: sourcePath,
                            destinationPath: destinationPath,
                            args: args,
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, fileExtensions_1, renameToMatchOriginal_1, originalPath, originalDir_1, originalFileName_1, workingDir_1, filesInDir, i, error_1, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
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
                workingDir_1 = (0, fileUtils_1.getFileAbosluteDir)(args.inputFileObj._id);
                args.jobLog("Working directory: ".concat(workingDir_1));
                return [4 /*yield*/, fs_1.promises.readdir(workingDir_1)];
            case 2:
                filesInDir = (_a.sent())
                    .map(function (row) { return ({
                    source: "".concat(workingDir_1, "/").concat(row),
                    destination: renameToMatchOriginal_1
                        ? (0, normJoinPath_1.default)({
                            upath: args.deps.upath,
                            paths: [
                                originalDir_1,
                                "".concat(originalFileName_1, ".").concat((0, fileUtils_1.getContainer)(row)),
                            ],
                        })
                        : (0, normJoinPath_1.default)({
                            upath: args.deps.upath,
                            paths: [
                                originalDir_1,
                                row,
                            ],
                        }),
                }); })
                    .filter(function (row) { return row.source !== args.originalLibraryFile._id && row.source !== args.inputFileObj._id; })
                    .filter(function (row) { return fileExtensions_1.includes((0, fileUtils_1.getContainer)(row.source)); });
                args.jobLog("Found ".concat(filesInDir.length, " subtitle files to move"));
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < filesInDir.length)) return [3 /*break*/, 6];
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, doOperation({
                        args: args,
                        sourcePath: filesInDir[i].source,
                        destinationPath: filesInDir[i].destination,
                    })];
            case 4:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                _a.label = 5;
            case 5:
                i += 1;
                return [3 /*break*/, 3];
            case 6: return [2 /*return*/, {
                    outputFileObj: args.inputFileObj,
                    outputNumber: 1,
                    variables: args.variables,
                }];
            case 7:
                error_1 = _a.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                args.jobLog("Error moving subtitle files: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
