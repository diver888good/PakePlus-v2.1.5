// Digital Human AI Module for the application
// Provides conversational AI capabilities to interact with users about the documents

const { ipcRenderer } = require('electron');

class DigitalHumanAI {
  constructor() {
    this.isInitialized = false;
    this.conversationHistory = [];
    this.currentModel = null;
    this.apiKey = null;
    
    // Initialize when DOM is ready
    if (typeof window !== 'undefined' && document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      console.log('Initializing Digital Human AI module...');
      
      // Load any saved settings from localStorage
      this.loadSettings();
      
      // Setup event listeners for UI interactions
      this.setupEventListeners();
      
      // Initialize conversation interface
      this.initializeConversationUI();
      
      this.isInitialized = true;
      console.log('Digital Human AI module initialized successfully');
      
      // Display welcome message
      this.displayWelcomeMessage();
    } catch (error) {
      console.error('Error initializing Digital Human AI:', error);
    }
  }

  loadSettings() {
    const savedApiKey = localStorage.getItem('digitalHumanAPIKey');
    if (savedApiKey) {
      this.apiKey = savedApiKey;
    }
  }

  setupEventListeners() {
    // Listen for user messages
    const userInput = document.getElementById('ai-user-input');
    const sendButton = document.getElementById('ai-send-button');
    
    if (userInput && sendButton) {
      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleUserMessage();
        }
      });
      
      sendButton.addEventListener('click', () => {
        this.handleUserMessage();
      });
    }
    
    // Listen for AI responses from main process
    ipcRenderer.on('ai-response', (event, response) => {
      this.displayResponse(response);
    });
    
    // Listen for initialization status
    ipcRenderer.on('ai-init-status', (event, status) => {
      this.updateStatus(status);
    });
  }

  initializeConversationUI() {
    // Create or update the AI chat container in the UI
    let aiContainer = document.getElementById('ai-container');
    if (!aiContainer) {
      // If AI container doesn't exist, create it
      aiContainer = document.createElement('div');
      aiContainer.id = 'ai-container';
      aiContainer.className = 'ai-chat-container';
      
      // Add CSS styles for AI components
      this.addAICSSStyles();
      
      // Create the complete AI interface
      aiContainer.innerHTML = `
        <div class="ai-header">
          <h3>非遗文化数字助手</h3>
          <button id="toggle-ai-panel" class="btn btn-sm">隐藏/显示</button>
        </div>
        <div class="conversation-history" id="ai-conversation-history">
          <!-- Conversation history will be populated here -->
        </div>
        <div class="input-area">
          <textarea 
            id="ai-user-input" 
            placeholder="询问关于凉山非遗手工饼或礼尚往来平台的问题..."
            rows="2"></textarea>
          <button id="ai-send-button" class="btn">发送</button>
        </div>
        <div class="status-bar" id="ai-status-bar">
          准备就绪
        </div>
      `;
      
      // Insert after the main content area
      const mainContent = document.querySelector('.container-fluid') || document.body;
      mainContent.appendChild(aiContainer);
      
      // Add toggle functionality
      const toggleBtn = document.getElementById('toggle-ai-panel');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          aiContainer.classList.toggle('collapsed');
        });
      }
    }
  }

  addAICSSStyles() {
    // Check if styles already added
    if (document.getElementById('ai-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'ai-styles';
    styleElement.textContent = `
      .ai-chat-container {
        position: fixed;
        right: 20px;
        top: 80px;
        width: 400px;
        height: calc(100vh - 100px);
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background: white;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        transition: all 0.3s ease;
      }
      
      .ai-chat-container.collapsed {
        transform: translateX(calc(100% - 40px));
      }
      
      .ai-header {
        padding: 15px;
        background: linear-gradient(to right, #6a11cb, #2575fc);
        color: white;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .ai-header h3 {
        margin: 0;
        font-size: 16px;
      }
      
      .conversation-history {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        background-color: #f9f9f9;
      }
      
      .ai-message {
        margin-bottom: 15px;
        padding: 10px;
        border-radius: 8px;
        max-width: 80%;
      }
      
      .user-message {
        background-color: #dcf8c6;
        margin-left: auto;
        text-align: right;
      }
      
      .bot-message {
        background-color: #ffffff;
        border: 1px solid #eee;
      }
      
      .input-area {
        padding: 15px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
      }
      
      #ai-user-input {
        flex: 1;
        resize: vertical;
        min-height: 60px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .status-bar {
        padding: 5px 15px;
        background-color: #f0f0f0;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #eee;
      }
      
      @media (max-width: 768px) {
        .ai-chat-container {
          width: 100%;
          height: 50vh;
          right: 0;
          bottom: 0;
          top: auto;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .ai-chat-container.collapsed {
          transform: translateY(100%);
        }
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  displayWelcomeMessage() {
    const welcomeMsg = {
      sender: 'bot',
      content: '您好！我是非遗文化数字助手，可以为您解答关于凉山非物质文化遗产手工饼和礼尚往来平台的相关问题。您可以问我任何相关内容。',
      timestamp: new Date()
    };
    
    this.addToConversation(welcomeMsg);
  }

  handleUserMessage() {
    const inputField = document.getElementById('ai-user-input');
    if (!inputField) return;

    const message = inputField.value.trim();
    if (!message) return;

    // Add user message to conversation
    const userMsg = {
      sender: 'user',
      content: message,
      timestamp: new Date()
    };

    this.addToConversation(userMsg);
    inputField.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    // Send message to main process for processing
    ipcRenderer.send('process-ai-request', {
      message: message,
      context: this.getRelevantContext(message)
    });
  }

  addToConversation(messageObj) {
    const historyDiv = document.getElementById('ai-conversation-history');
    if (!historyDiv) return;

    const messageElement = document.createElement('div');
    messageElement.className = `ai-message ${messageObj.sender}-message`;
    messageElement.innerHTML = `
      <div class="message-content">${this.escapeHtml(messageObj.content)}</div>
      <div class="timestamp">${messageObj.timestamp.toLocaleTimeString()}</div>
    `;

    historyDiv.appendChild(messageElement);
    historyDiv.scrollTop = historyDiv.scrollHeight;
  }

  showTypingIndicator() {
    const historyDiv = document.getElementById('ai-conversation-history');
    if (!historyDiv) return;

    const typingElement = document.createElement('div');
    typingElement.id = 'typing-indicator';
    typingElement.className = 'ai-message bot-message';
    typingElement.innerHTML = '<div class="typing-indicator">AI 正在思考...</div>';

    historyDiv.appendChild(typingElement);
    historyDiv.scrollTop = historyDiv.scrollHeight;
  }

  hideTypingIndicator() {
    const typingElement = document.getElementById('typing-indicator');
    if (typingElement) {
      typingElement.remove();
    }
  }

  displayResponse(response) {
    this.hideTypingIndicator();

    const botMsg = {
      sender: 'bot',
      content: response,
      timestamp: new Date()
    };

    this.addToConversation(botMsg);
  }

  getRelevantContext(query) {
    // Extract relevant context from the loaded document
    // This would typically involve semantic search of the document content
    const docContent = window.documentContent || '';
    
    // Simple keyword-based context extraction
    const keywords = query.toLowerCase().split(/\W+/).filter(k => k.length > 2);
    const relevantSentences = [];
    
    const sentences = docContent.split(/[.!?]+/);
    for (const sentence of sentences) {
      for (const keyword of keywords) {
        if (sentence.toLowerCase().includes(keyword)) {
          relevantSentences.push(sentence.trim());
          break;
        }
      }
      if (relevantSentences.length >= 3) break; // Limit context length
    }
    
    return relevantSentences.join('. ') + '.';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  updateStatus(statusText) {
    const statusBar = document.getElementById('ai-status-bar');
    if (statusBar) {
      statusBar.textContent = statusText;
    }
  }

  // Method to process AI responses based on document content
  async generateResponse(query, context) {
    // This method would normally call an LLM API
    // For now, we'll implement rule-based responses based on document content
    
    const lowerQuery = query.toLowerCase();
    
    // Define some basic response patterns related to our documents
    if (lowerQuery.includes('凉山') && lowerQuery.includes('手工饼')) {
      return "凉山非物质文化遗产手工饼是当地重要的传统文化项目，具有独特的制作工艺和深厚的文化底蕴。";
    } else if (lowerQuery.includes('非遗') && lowerQuery.includes('导师')) {
      return "非遗导师培训旨在传承传统手工技艺，培养新一代的手工饼制作专家。";
    } else if (lowerQuery.includes('加盟') && lowerQuery.includes('条件')) {
      return "何香手工饼的加盟条件包括：具备一定的资金实力、对非遗文化有兴趣、愿意遵守品牌标准等。";
    } else if (lowerQuery.includes('礼尚往来') && lowerQuery.includes('平台')) {
      return "礼尚往来平台是一个结合传统文化与现代电商的综合性平台，致力于推广非遗产品和服务。";
    } else if (lowerQuery.includes('薪酬') && lowerQuery.includes('制度')) {
      return "薪酬制度结合了非遗文化的特色，既考虑经济效益也注重文化传承价值。";
    } else if (lowerQuery.includes('营销') && lowerQuery.includes('策略')) {
      return "营销策略结合线上线下渠道，通过文化旅游、电商平台等方式推广产品。";
    } else if (lowerQuery.includes('成本') && lowerQuery.includes('分析')) {
      return "成本分析涵盖了原材料、人工、包装、物流等多个方面，确保合理定价和盈利空间。";
    } else if (lowerQuery.includes('培训') && lowerQuery.includes('体系')) {
      return "培训体系包含理论学习、实操训练、考核认证等多个环节，确保学员掌握完整技能。";
    } else {
      // Generate a more general response based on available context
      if (context && context.length > 10) {
        return `根据您提供的查询，相关的信息可能涉及：“${context.substring(0, 100)}...”。如果您需要更详细的信息，请具体说明您想了解的内容。`;
      } else {
        return `关于"${query}"，我们的文档中有相关信息。请告诉我您希望了解更多哪个方面的内容？我可以为您提供详细的解释。`;
      }
    }
  }
}

// Initialize the Digital Human AI when script loads
window.digitalHumanAI = new DigitalHumanAI();

module.exports = DigitalHumanAI;