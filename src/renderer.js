// Renderer process module for Electron application
// Runs in the web page context and handles UI interactions

// Wait for DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get the document path from main process
    const docPath = await window.api.getDocumentPath();
    
    // Read and convert markdown file to HTML
    const htmlContent = await window.api.readMarkdown(docPath);
    
    // Display the content in the main content area
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = htmlContent;
      
      // Store document content for AI context
      window.documentContent = extractTextFromHTML(htmlContent);
    } else {
      console.error('Content div not found');
    }
    
    // Initialize Digital Human AI module
    initializeDigitalHumanAI();
    
  } catch (error) {
    console.error('Error loading document:', error);
    
    // Display error message in the content area
    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <h4>Error Loading Document</h4>
          <p>Failed to load the document: ${error.message}</p>
          <p>Please check that the document file exists at the expected location.</p>
        </div>
      `;
    }
  }
});

/**
 * Initializes the Digital Human AI functionality
 */
function initializeDigitalHumanAI() {
  // The digital human AI module is loaded via script tag in index.html
  // Here we can perform any additional initialization if needed
  
  // Register event handlers for AI responses
  window.api.onAIResponse((response) => {
    // This will be handled by the digital-human.js module
    console.log('AI Response received:', response);
  });
  
  // Register event handlers for AI status updates
  window.api.onAIStatusUpdate((status) => {
    console.log('AI Status Update:', status);
  });
}

/**
 * Extracts plain text from HTML content for AI context
 * @param {string} html - HTML content to extract text from
 * @returns {string} Plain text extracted from HTML
 */
function extractTextFromHTML(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
}

// Additional helper functions for the renderer process
console.log('Renderer process loaded successfully');

// Handle any errors during rendering
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Error in renderer process:', error);
};
