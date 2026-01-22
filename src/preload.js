// Preload script for Electron application
// This script runs in the renderer process before the web page loads
// It has access to Node.js APIs but shares the same context as the web page

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the IPC (Inter-Process Communication) without exposing the entire
// electron API to the client-side code (security best practice)
contextBridge.exposeInMainWorld('api', {
  /**
   * Reads a markdown file and converts it to HTML
   * @param {string} filePath - Path to the markdown file to read
   * @returns {Promise<string>} Promise that resolves to the converted HTML content
   */
  readMarkdown: (filePath) => ipcRenderer.invoke('read-markdown', filePath),
  
  /**
   * Sends an AI request to the main process
   * @param {Object} request - Request object containing message and context
   */
  sendAIRequest: (request) => {
    ipcRenderer.send('process-ai-request', request);
  },
  
  /**
   * Registers a callback to handle AI responses from the main process
   * @param {Function} callback - Function to call when AI response is received
   */
  onAIResponse: (callback) => {
    ipcRenderer.on('ai-response', (event, response) => callback(response));
  },
  
  /**
   * Registers a callback to handle AI initialization status updates
   * @param {Function} callback - Function to call when status updates
   */
  onAIStatusUpdate: (callback) => {
    ipcRenderer.on('ai-init-status', (event, status) => callback(status));
  },
  
  /**
   * Gets the path to the document directory
   * @returns {Promise<string>} Promise that resolves to the document path
   */
  getDocumentPath: () => ipcRenderer.invoke('get-document-path')
});
