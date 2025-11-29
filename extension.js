"use strict";
const vscode = require("vscode");
const languageclient = require("vscode-languageclient");
const { exec } = require("node:child_process");
const path = require("path");
const fs = require("fs");

let client;

function activate(context) {
  try {
    // Determine binary name based on platform
    const platform = process.platform;
    const binaryName = platform === "win32" ? "egglog-language-server.exe" : "egglog-language-server";
    const binaryPath = path.join(context.extensionPath, "target", "release", binaryName);
    
    let serverOptions;
    if (fs.existsSync(binaryPath)) {
      // Use pre-built binary (for packaged extension)
      console.log(`Using binary at: ${binaryPath}`);
      serverOptions = {
        command: binaryPath,
        args: [],
      };
    } else {
      // Fall back to cargo run (for development)
      console.log("Binary not found, falling back to cargo run");
      serverOptions = {
        command: "cargo",
        args: [
          "+stable",
          "run",
          "--release",
          "--manifest-path",
          path.join(context.extensionPath, "Cargo.toml"),
        ],
      };
    }
    
    const clientOptions = {
      documentSelector: [
        {
          scheme: "file",
          language: "egglog",
        },
      ],
    };
    client = new languageclient.LanguageClient(
      "egglog",
      "Egglog Language Server",
      serverOptions,
      clientOptions
    );
    context.subscriptions.push(client.start());
  } catch (e) {
    vscode.window.showErrorMessage(
      "egglog-language-server couldn't be started: " + e.message
    );
    console.error("Extension activation error:", e);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("egglog.egglog_run", async function () {
      const document = vscode.window.activeTextEditor.document;
      document.save().then(() => {
        const relativeFile = document.uri.fsPath;

        let process_exec = new vscode.ProcessExecution("egglog", [
          relativeFile
        ]);

        const task = new vscode.Task({ type: "process" }, vscode.TaskScope.Workspace, "egglog", "egglog", process_exec);
        // https://github.com/microsoft/vscode/issues/157756
        task.definition.command = "egglog";

        vscode.tasks.executeTask(task);
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("egglog.egglog_desugar", async function () {
      const document = vscode.window.activeTextEditor.document;
      document.save().then(() => {
        const relativeFile = document.uri.fsPath;

        let process_exec = new vscode.ProcessExecution("egglog", [
          "--show", "desugared-egglog",
          relativeFile
        ]);

        const task = new vscode.Task({ type: "process" }, vscode.TaskScope.Workspace, "egglog-desugar", "egglog", process_exec);
        task.definition.command = "egglog";

        vscode.tasks.executeTask(task);
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "egglog.egglog_dot_preview",
      async function () {
        const document = vscode.window.activeTextEditor.document;
        document.save().then(() => {
          const relativeFile = document.uri.fsPath;

          const command = `egglog --to-dot ${relativeFile}`;
          exec(command).on("exit", (code) => {
            if (code === 0) {
              const dotFile = vscode.Uri.parse(
                relativeFile.replace(/\.egg$/, "") + ".dot"
              );
              vscode.workspace.openTextDocument(dotFile).then((doc) => {
                vscode.window.showTextDocument(doc, 1, false);
              });
            } else {
              vscode.window.showErrorMessage(
                `${command} exited with code ${code}`
              );
            }
          });
        });
      }
    )
  );
}

function deactivate() {
  if (client) return client.stop();
}

module.exports = { activate, deactivate };
