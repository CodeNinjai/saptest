"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displaySimpleExtArtifactsInstallProgress = void 0;
const fs = require("fs");
const tail_1 = require("tail");
const vscode = require("vscode");
const messages_1 = require("./i18n/messages");
const metadata_reader_1 = require("./metadata-reader");
const YEOMAN_UI_CMD = "yeomanUI._notifyGeneratorsChange";
let outputChannel;
let isInstallSucceed = true;
function doBeginSimpleInstallActivities() {
    // Notify yeoman ui to refresh itself with in progress generators metadata
    vscode.commands.executeCommand(YEOMAN_UI_CMD, metadata_reader_1.calculateYeomanSet(process.env.SIMPLE_EXTENSION_METADATA));
}
function doFinishSimpleInstallActivities() {
    // Notify end of extensions installation (npm packages & VSCode Extensions).
    if (isInstallSucceed) {
        vscode.window.showInformationMessage(messages_1.messages.FINISH_INSTALL_EXTENSIONS);
    }
    else {
        vscode.window
            .showErrorMessage(messages_1.messages.ERROR_INSTALL_EXTENSIONS, messages_1.messages.GO_TO_CONSOLE_LOG_OUTPUT)
            .then((selectedItem) => {
            if (selectedItem !== undefined) {
                outputChannel.show();
            }
        });
    }
    // Notify yeoman ui to refresh itself
    vscode.commands.executeCommand(YEOMAN_UI_CMD, []);
}
/*
 * Create an output channel and display the simple extension framework trace file
 */
function displaySimpleExtArtifactsInstallProgress(fileName, numOfRetries = 2, timeoutWait = 30000) {
    return __awaiter(this, void 0, void 0, function* () {
        const options = {
            separator: /[\r]{0,1}\n/,
            fromBeginning: true,
            fsWatchOptions: { persistent: true },
            logger: console,
            useWatchFile: true
        };
        const fileNameOrig = `${fileName}.orig`;
        // Avoid watching the log file on non-first activation
        try {
            yield fs.promises.access(fileNameOrig, fs.constants.F_OK);
            return;
        }
        catch (err) {
            console.debug(`First wing-api activation, start watching ${fileName}`);
        }
        let tail;
        if (!outputChannel) {
            outputChannel = vscode.window.createOutputChannel("Extensions Install Agent");
        }
        const simpleExtPackagesPromise = new Promise((resolve, reject) => {
            try {
                let firstTime = true;
                // There are two install processes: simple-ext-fw and theia. Both have end messages.
                let remainNumberOfInstallProcesses = 2;
                tail = new tail_1.Tail(fileName, options);
                tail.on("line", (lineData) => {
                    if (lineData.startsWith("FW ERROR:")) {
                        isInstallSucceed = false;
                    }
                    if (lineData.includes("END_OF_SIMPLE_PACKAGES_INSTALLS")) {
                        remainNumberOfInstallProcesses--;
                        if (remainNumberOfInstallProcesses === 0) {
                            tail.unwatch();
                            fs.rename(fileName, fileNameOrig, renameErr => {
                                if (renameErr) {
                                    console.error("ERROR: " + renameErr);
                                }
                            });
                            resolve();
                        }
                        else {
                            // currently separate between the two installation processes, later we need to have single summary
                            outputChannel.append("\n\n");
                        }
                    }
                    else {
                        outputChannel.appendLine(lineData);
                    }
                    if (firstTime) {
                        doBeginSimpleInstallActivities();
                        firstTime = false;
                    }
                });
                tail.on("error", (error) => {
                    outputChannel.appendLine("Error: simple extensions trace file read error");
                    vscode.window
                        .showErrorMessage(messages_1.messages.ERROR_INSTALL_EXTENSIONS, messages_1.messages.GO_TO_CONSOLE_LOG_OUTPUT)
                        .then((selectedItem) => {
                        if (selectedItem !== undefined) {
                            outputChannel.show();
                        }
                    });
                    reject(error);
                });
            }
            catch (e) {
                console.log("Error: ", e.message);
                wait(timeoutWait).then(() => {
                    if (numOfRetries !== 0) {
                        displaySimpleExtArtifactsInstallProgress(fileName, --numOfRetries);
                    }
                });
            }
        });
        return simpleExtPackagesPromise.then(() => {
            doFinishSimpleInstallActivities();
        });
    });
}
exports.displaySimpleExtArtifactsInstallProgress = displaySimpleExtArtifactsInstallProgress;
/*
 * This is a promise resolver for async timeout
 * @param {number} timeoutWait between retries.
 * returns Promise<void>
 */
function wait(timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => setTimeout(resolve, timeout));
    });
}
//# sourceMappingURL=simple-extension-yo-output.js.map