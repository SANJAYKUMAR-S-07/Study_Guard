const vscode = require('vscode');
const http = require('http');
const path = require('path');
const fs = require('fs');

let server;
let serverPort = 0;
let sseResponse = null;
let viewProvider = null;

function activate(context) {
    // 1. Start local server
    startServer(context.extensionUri);

    // 2. Register Sidebar cmdProvider
    viewProvider = new SleepAlarmWebviewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'sleep-alarm.monitorView',
            viewProvider
        )
    );

    // Register a command to launch the browser tracker
    context.subscriptions.push(
        vscode.commands.registerCommand('sleep-alarm.openBrowser', () => {
            if (serverPort > 0) {
                vscode.env.openExternal(vscode.Uri.parse(`http://127.0.0.1:${serverPort}/`));
            } else {
                vscode.window.showErrorMessage("Sleep Alarm server is still starting. Please try again in a moment.");
            }
        })
    );
}

function startServer(extensionUri) {
    server = http.createServer((req, res) => {
        // CORS Headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const url = req.url;

        // Serve Tracker HTML to the default browser
        if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
            const htmlPath = path.join(extensionUri.fsPath, 'tracker.html');
            fs.readFile(htmlPath, 'utf8', (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error loading tracker page: ' + err.message);
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            });
        } 
        // Server-Sent Events (SSE) endpoint to push messages from VS Code to Browser
        else if (req.method === 'GET' && url === '/api/events') {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
            
            // Keep connection alive
            res.write(': keepalive\n\n');
            sseResponse = res;
            
            req.on('close', () => {
                if (sseResponse === res) {
                    sseResponse = null;
                }
            });
        } 
        // API Endpoint: Eye closure alarm triggered
        else if (req.method === 'POST' && url === '/api/alarm') {
            triggerVscodePanic();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success' }));
        } 
        // API Endpoint: Eyes opened or alarm stopped
        else if (req.method === 'POST' && url === '/api/stop') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success' }));
        } 
        // Catch-all
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    // Start on a random free port assigned by the OS
    server.listen(0, '127.0.0.1', () => {
        serverPort = server.address().port;
        console.log(`Sleep Alarm server is running on http://127.0.0.1:${serverPort}`);
        
        // Notify sidebar webview if it is already loaded
        if (viewProvider) {
            viewProvider.updatePort(serverPort);
        }
    });
}

function sendToBrowser(data) {
    if (sseResponse) {
        sseResponse.write(`data: ${JSON.stringify(data)}\n\n`);
    }
}

function triggerVscodePanic() {
    // 1. Popup Warning Dialog
    vscode.window.showErrorMessage('🚨 WAKE UP! You are falling asleep! 🚨', 'I am awake!').then(selection => {
        if (selection === 'I am awake!') {
            // Send SSE message back to the browser to quiet the alarm siren
            sendToBrowser({ command: 'stopAlarm' });
        }
    });

    // 2. Open an unsaved Editor window filled with "WAKE UP!" text
    vscode.workspace.openTextDocument({
        content: Array(100).fill("🚨 WAKE UP! 🚨").join("\n"),
        language: "markdown"
    }).then(doc => {
        vscode.window.showTextDocument(doc, { preview: false });
    });
}

class SleepAlarmWebviewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
    }

    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Listen for internal VS Code commands from webview panel buttons
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'openBrowser':
                    vscode.commands.executeCommand('sleep-alarm.openBrowser');
                    break;
            }
        });
    }

    updatePort(port) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'setPort', port: port });
        }
    }

    _getHtmlForWebview(webview) {
        const htmlPath = path.join(this._extensionUri.fsPath, 'extension-panel.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        // Inject current port if server is already running
        html = html.replace('{{PORT}}', serverPort.toString());
        return html;
    }
}

function deactivate() {
    if (server) {
        server.close();
    }
}

module.exports = {
    activate,
    deactivate
};
