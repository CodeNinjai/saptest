"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const sap = require("@sap/plugin");
const vscode = require("vscode");
const simple_extension_yo_output_1 = require("./simple-extension-yo-output");
function activate(context) {
    console.log('Congratulations, your extension "wing-api" is now active!');
    simple_extension_yo_output_1.displaySimpleExtArtifactsInstallProgress(
    // TODO fetch trace file from a more generic place
    "/extbin/generators/simple-extension-yo-install-output.txt");
    // workaround for LCAP to support vscode command workbench.view.scm that opens git panel in Theia.
    const disposable = vscode.commands.registerCommand("workbench.view.scm", () => {
        vscode.commands.executeCommand("core.collapse.tab");
        vscode.commands.executeCommand("scmView:toggle");
    });
    function registerWattEditor(editor) {
        const editorId = editor.editorId || editor.serviceName;
        if (editor.openerCommand) {
            // this is VS Code native approach, adding a command as opener is not possible
            // the consumer extension is expected to have a when clause that make this command invisible in theia
            // and only visible on VS Code.
            vscode.commands.registerCommand(editor.openerCommand, (resource) => {
                sap.watt.openEditor(editorId, resource);
            });
        }
        if (editor.suffixes) {
            sap.watt.registerOpenHandler(editorId, editor.suffixes, editor.priority || "default");
        }
    }
    function registerProjectTypeResolver(projectTypeIds, globPatterns, acceptor) {
        sap.watt.registerProjectTypeResolver(projectTypeIds, globPatterns, acceptor);
    }
    function registerProjectIdentifier(globPatterns, acceptor) {
        sap.watt.registerProjectIdentifier(globPatterns, acceptor);
    }
    function openUiPart(uiPart) {
        sap.watt.openUiPart(uiPart.serviceName, uiPart.displayName);
    }
    function executeCommand(commandId, value) {
        return sap.watt.executeCommand(commandId, value);
    }
    function onDidOpenWattEditor(listener) {
        sap.watt.onDidOpenWattEditor(listener);
    }
    function onDidCloseWattEditor(listener) {
        sap.watt.onDidCloseWattEditor(listener);
    }
    function onDidActivateWattEditor(listener) {
        sap.watt.onDidActivateWattEditor(listener);
    }
    function onDidChangeWattDocument(listener) {
        sap.watt.onDidChangeWattDocument(listener);
    }
    function registerManagedDialog(dialogId) {
        sap.watt.registerManagedDialog(dialogId);
    }
    context.subscriptions.push(disposable);
    return {
        registerWattEditor,
        openUiPart,
        registerProjectTypeResolver,
        registerProjectIdentifier,
        executeCommand,
        onDidOpenWattEditor,
        onDidCloseWattEditor,
        onDidActivateWattEditor,
        onDidChangeWattDocument,
        registerManagedDialog
    };
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map