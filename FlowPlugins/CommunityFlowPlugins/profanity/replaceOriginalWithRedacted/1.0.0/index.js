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
var fileMoveOrCopy_1 = __importDefault(require("../../../../FlowHelpers/1.0.0/fileMoveOrCopy"));
var fileUtils_1 = require("../../../../FlowHelpers/1.0.0/fileUtils");
var path = __importStar(require("path"));
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Replace Original With Redacted',
    description: "\n  Replace the original file with the redacted file from the variables.\n  This plugin is specifically designed for the profanity filter workflow.\n  ",
    style: {
        borderColor: '#FF5733', // Orange-red color for profanity-related plugins
    },
    tags: 'file,replace,redacted,profanity',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faExchangeAlt',
    inputs: [],
    outputs: [
        {
            number: 1,
            tooltip: 'Continue to next plugin',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, originalFilePath, redactedFilePath, redactedFileExists, originalDir, originalName, redactedExt, newPath, newPathTmp, originalFileExists, error_1, errorMessage;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                _c.label = 1;
            case 1:
                _c.trys.push([1, 8, , 9]);
                originalFilePath = args.originalLibraryFile._id;
                if (!originalFilePath) {
                    args.jobLog('No original file found');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                redactedFilePath = (_b = (_a = args.variables) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.redactedVideoPath;
                if (!redactedFilePath) {
                    args.jobLog('No redacted video path found in variables');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                args.jobLog("Original file: ".concat(originalFilePath));
                args.jobLog("Redacted file: ".concat(redactedFilePath));
                // Check if the files are the same
                if (originalFilePath === redactedFilePath) {
                    args.jobLog('Original file and redacted file are the same, no need to replace');
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                return [4 /*yield*/, (0, fileUtils_1.fileExists)(redactedFilePath)];
            case 2:
                redactedFileExists = _c.sent();
                if (!redactedFileExists) {
                    args.jobLog("Redacted file does not exist: ".concat(redactedFilePath));
                    return [2 /*return*/, {
                            outputFileObj: args.inputFileObj,
                            outputNumber: 1,
                            variables: args.variables,
                        }];
                }
                originalDir = path.dirname(originalFilePath);
                originalName = path.basename(originalFilePath, path.extname(originalFilePath));
                redactedExt = path.extname(redactedFilePath);
                newPath = path.join(originalDir, "".concat(originalName).concat(redactedExt));
                newPathTmp = "".concat(newPath, ".tmp");
                args.jobLog("New path: ".concat(newPath));
                args.jobLog("Temporary path: ".concat(newPathTmp));
                // Copy the redacted file to a temporary file
                return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                        operation: 'copy',
                        sourcePath: redactedFilePath,
                        destinationPath: newPathTmp,
                        args: args,
                    })];
            case 3:
                // Copy the redacted file to a temporary file
                _c.sent();
                return [4 /*yield*/, (0, fileUtils_1.fileExists)(originalFilePath)];
            case 4:
                originalFileExists = _c.sent();
                if (!originalFileExists) return [3 /*break*/, 6];
                args.jobLog("Deleting original file: ".concat(originalFilePath));
                return [4 /*yield*/, fs_1.promises.unlink(originalFilePath)];
            case 5:
                _c.sent();
                _c.label = 6;
            case 6: 
            // Rename the temporary file to the original file name
            return [4 /*yield*/, (0, fileMoveOrCopy_1.default)({
                    operation: 'move',
                    sourcePath: newPathTmp,
                    destinationPath: newPath,
                    args: args,
                })];
            case 7:
                // Rename the temporary file to the original file name
                _c.sent();
                args.jobLog("Successfully replaced original file with redacted file");
                return [2 /*return*/, {
                        outputFileObj: {
                            _id: newPath,
                        },
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 8:
                error_1 = _c.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : 'Unknown error';
                args.jobLog("Error replacing original file with redacted file: ".concat(errorMessage));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: 1,
                        variables: args.variables,
                    }];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.plugin = plugin;
