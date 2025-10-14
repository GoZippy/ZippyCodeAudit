/**
 * WebSocket Server for Real-Time Updates
 * Provides live progress updates during audits
 */

const WebSocket = require('ws');
const http = require('http');

class WebSocketServer {
  constructor(port = 8081) {
    this.port = port;
    this.wss = null;
    this.clients = new Set();
    this.auditState = {
      active: false,
      progress: 0,
      currentFile: '',
      filesProcessed: 0,
      totalFiles: 0,
      issues found: 0,
      stage: 'idle'
    };
  }

  /**
   * Initialize WebSocket server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // Create HTTP server for WebSocket
        const server = http.createServer();
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws) => {
          console.log('New WebSocket client connected');
          this.clients.add(ws);

          // Send current state on connection
          ws.send(JSON.stringify({
            type: 'state',
            data: this.auditState
          }));

          ws.on('close', () => {
            console.log('WebSocket client disconnected');
            this.clients.delete(ws);
          });

          ws.on('error', (error) => {
            console.error('WebSocket client error:', error);
            this.clients.delete(ws);
          });

          ws.on('message', (message) => {
            try {
              const data = JSON.parse(message);
              this.handleClientMessage(ws, data);
            } catch (error) {
              console.error('Error parsing client message:', error);
            }
          });
        });

        server.listen(this.port, () => {
          console.log(`WebSocket server listening on port ${this.port}`);
          resolve();
        });

        server.on('error', (error) => {
          console.error('WebSocket server error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle messages from clients
   */
  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'subscribe':
        // Client is subscribed by default
        ws.send(JSON.stringify({ type: 'subscribed' }));
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(type, data) {
    const message = JSON.stringify({ type, data });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error sending to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  /**
   * Start audit event
   */
  auditStarted(totalFiles) {
    this.auditState = {
      active: true,
      progress: 0,
      currentFile: '',
      filesProcessed: 0,
      totalFiles,
      issuesFound: 0,
      stage: 'analyzing'
    };

    this.broadcast('audit-started', this.auditState);
  }

  /**
   * File processing progress
   */
  fileProcessed(filename, issuesInFile = 0) {
    this.auditState.filesProcessed++;
    this.auditState.currentFile = filename;
    this.auditState.issuesFound += issuesInFile;
    this.auditState.progress = Math.round(
      (this.auditState.filesProcessed / this.auditState.totalFiles) * 100
    );

    this.broadcast('file-processed', {
      filename,
      issuesInFile,
      progress: this.auditState.progress,
      filesProcessed: this.auditState.filesProcessed,
      totalFiles: this.auditState.totalFiles,
      issuesFound: this.auditState.issuesFound
    });
  }

  /**
   * Stage change event
   */
  stageChanged(stage, message = '') {
    this.auditState.stage = stage;

    this.broadcast('stage-changed', {
      stage,
      message
    });
  }

  /**
   * Issue detected event
   */
  issueDetected(issue) {
    this.auditState.issuesFound++;

    this.broadcast('issue-detected', issue);
  }

  /**
   * Audit completed event
   */
  auditCompleted(results) {
    this.auditState.active = false;
    this.auditState.progress = 100;
    this.auditState.stage = 'completed';

    this.broadcast('audit-completed', results);

    // Reset after 5 seconds
    setTimeout(() => {
      this.auditState = {
        active: false,
        progress: 0,
        currentFile: '',
        filesProcessed: 0,
        totalFiles: 0,
        issuesFound: 0,
        stage: 'idle'
      };
    }, 5000);
  }

  /**
   * Audit error event
   */
  auditError(error) {
    this.auditState.active = false;
    this.auditState.stage = 'error';

    this.broadcast('audit-error', {
      message: error.message,
      stack: error.stack
    });
  }

  /**
   * Get current state
   */
  getState() {
    return this.auditState;
  }

  /**
   * Stop WebSocket server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        // Close all client connections
        this.clients.forEach(client => {
          client.close();
        });
        this.clients.clear();

        // Close server
        this.wss.close(() => {
          console.log('WebSocket server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Create singleton instance
let instance = null;

function getWebSocketServer(port = 8081) {
  if (!instance) {
    instance = new WebSocketServer(port);
  }
  return instance;
}

module.exports = { WebSocketServer, getWebSocketServer };

