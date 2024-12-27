import * as vscode from 'vscode';
import { commandIdChurn, commandIdClearChurn } from '../commands/compute-churn';
import { commandIdClearLoc, commandIdLoc } from '../commands/compute-loc';
import { ObservableLike } from '../observable-like';
import { ReadableAppState } from '../app-state';
import { getWorkspaceFolder } from '../get-ws-folder';

export class ControlsWebViewProvider implements vscode.WebviewViewProvider {

    constructor(private readonly context: vscode.ExtensionContext,
                private readonly computationState$: ObservableLike<ReadableAppState>
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        // Set up the Webview
        webviewView.webview.options = {
            enableScripts: true
        };

        // HTML content for the Webview
        webviewView.webview.html = this.getHtmlContent();

        const webviewMsgHandlers: Record<string, () => void | Thenable<void>> = {
            computeChurn: () => vscode.commands.executeCommand(commandIdChurn),
            clearChurn: () => vscode.commands.executeCommand(commandIdClearChurn),
            computeLoc: () => vscode.commands.executeCommand(commandIdLoc),
            clearLoc: () => vscode.commands.executeCommand(commandIdClearLoc),
            computeAll: async () => {
                await vscode.commands.executeCommand(commandIdChurn);
                await vscode.commands.executeCommand(commandIdLoc);
            },
            clearAll: async () => {
                await vscode.commands.executeCommand(commandIdClearChurn);
                await vscode.commands.executeCommand(commandIdClearLoc);
            }
        };

        // Handle messages from the Webview
        webviewView.webview.onDidReceiveMessage(async message => {
            const handler = webviewMsgHandlers[message.command];
            if (typeof handler === 'function') {
                await handler();
            }
        });

        const sub = this.computationState$.subscribe(s => {
            webviewView?.webview?.postMessage?.({ computationState: s, hasWorkspaceFolder: !!getWorkspaceFolder() });
        });

        webviewView.onDidDispose(() => {
            sub.unsubscribe();
        });

        webviewView.onDidChangeVisibility(() => {
            //
        });
    }

    private getHtmlContent(): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Controls</title>
    <style>
        html, body {
            height: 100%;
            width: 100%;
            padding: 0;
            margin: 0;
        }
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }

        .btn-container {
            display: flex;
            flex-direction: column;
            align-items: stretch;
        }

        button {
            font-family: var(--vscode-font-family);
            color: var(--vscode-button-foreground);
            background: var(--vscode-button-background);
            border: 1px solid transparent;
            border-radius: 4px;
            padding: 4px 16px;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            margin: 10px;
        }

        button:hover {
            background: var(--vscode-button-hoverBackground);
        }

        button:focus {
            outline: 2px solid var(--vscode-focusBorder);
        }

        button:active {
            background: var(--vscode-button-hoverBackground);
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        button:disabled {
            color: var(--vscode-disabledForeground);
            background: var(--vscode-button-disabledBackground, #d4d4d4); /* Initial background */
            border: 1px solid var(--vscode-button-disabledBorder, #ccc);
            cursor: not-allowed;
            box-shadow: none;
            opacity: 0.6;
        }

        button.comp-animation {
            animation: disabled-pulse 2s infinite ease-in-out; /* Periodic animation */
        }

        @keyframes disabled-pulse {
            0% {
                background: var(--vscode-button-disabledBackground, #d4d4d4);
            }
            50% {
                background: var(--vscode-button-hoverBackground, #e0e0e0); /* Slightly lighter */
            }
            100% {
                background: var(--vscode-button-disabledBackground, #d4d4d4);
            }
        }

    </style>
</head>
<body>
    <div class="btn-container">
        <button id="computeAllButton">Compute Metrics 🔥🐘</button>
        <button id="clearAllButton">Clear 🗑️</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const registerButton = (buttonElement, uiCommandId) => {
            buttonElement.addEventListener('click', () => {
            vscode.postMessage({ command: uiCommandId });
        });
        };
        const computeBtn = document.getElementById('computeAllButton');
        const clearBtn = document.getElementById('clearAllButton');
        registerButton(computeBtn, 'computeAll');
        registerButton(clearBtn, 'clearAll');
        // set tooltip for buttons
        computeBtn.title = 'Collect churn and complexity data of the codebase';
        clearBtn.title = 'Clear churn and complexity data';
        
        window.addEventListener('message', (event) => {
            /*
            structure of event.data.computationState is as follows:
            interface AppState {
                metricIdToState: Record<string, MetricState | undefined>;
            }

            interface MetricState {
                computation: MetricComputationState;
                isDataPresent: boolean;
            }

            export const enum MetricComputationState {
                IDLE,
                RUNNING,
            }
            */
            const state = event.data.computationState;
            const hasWorkspaceFolder = event.data.hasWorkspaceFolder;
            console.log(state, Object.values(state.metricIdToState));
            const isAnyComputationActive = Object.values(state.metricIdToState)
                .some(metricState => metricState?.computation === 1);
            const isAnyDataPresent = Object.values(state.metricIdToState)
                .some(metricState => metricState?.isDataPresent);
            // buttons are non-interactable when any computation is active
            [computeBtn, clearBtn].forEach(btn => btn.disabled = !hasWorkspaceFolder || isAnyComputationActive);
            [computeBtn, clearBtn].forEach(btn => btn.classList.toggle('comp-animation', isAnyComputationActive));
            // clear button is hidden when no data is present
            clearBtn.style.visibility = isAnyDataPresent ? 'visible' : 'hidden';
            // update the button text of the compute button
            computeBtn.innerText = isAnyDataPresent ? 'Update Metrics 🔥🐘' : 'Collect Metrics 🔥🐘';
        });
    </script>
</body>
</html>
`;
    }
}