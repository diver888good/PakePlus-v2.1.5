// Main process module for Electron application
// Handles window creation and IPC communication between main and renderer processes

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const markdownit = require('markdown-it');

// Create a new instance of markdown-it with advanced features enabled
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
});

// Global reference to the mainWindow object
let mainWindow;

/**
 * Creates the main browser window for the application
 */
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: Add an icon for your app
    webPreferences: {
      nodeIntegration: false, // Important: Disable node integration for security
      contextIsolation: true, // Important: Enable context isolation for security
      preload: path.join(__dirname, 'preload.js') // Preload script for secure IPC
    }
  });

  // Load the index.html file from the public directory
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  // Open the DevTools only in development mode
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

/**
 * Reads a markdown file and converts it to HTML
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<string>} Promise that resolves to the converted HTML content
 */
async function readAndConvertMarkdown(filePath) {
  try {
    // Read the markdown file
    const markdownContent = await fs.readFile(filePath, 'utf-8');
    
    // Convert markdown to HTML using markdown-it
    const htmlContent = md.render(markdownContent);
    
    return htmlContent;
  } catch (error) {
    console.error(`Error reading or converting markdown file: ${error.message}`);
    throw error;
  }
}

/**
 * Processes AI requests by analyzing the query against document content
 * @param {Object} request - Request object containing message and context
 * @returns {Promise<string>} Promise that resolves to AI-generated response
 */
async function processAIRequest(request) {
  try {
    const { message, context } = request;
    
    // In a real implementation, this would connect to an LLM API
    // For now, we'll implement basic pattern matching based on known topics
    
    const lowerMessage = message.toLowerCase();
    
    // Define responses based on keywords in the user's query
    if (lowerMessage.includes('凉山') && lowerMessage.includes('手工饼')) {
      return "凉山非物质文化遗产手工饼是当地重要的传统文化项目，具有独特的制作工艺和深厚的文化底蕴。它不仅是美食，更是文化传承的重要载体。";
    } else if (lowerMessage.includes('非遗') && lowerMessage.includes('导师')) {
      return "非遗导师培训旨在传承传统手工技艺，培养新一代的手工饼制作专家。培训内容包括理论知识、实操技能和文化内涵等方面。";
    } else if (lowerMessage.includes('加盟') && lowerMessage.includes('条件')) {
      return "何香手工饼的加盟条件包括：具备一定的资金实力、对非遗文化有兴趣、愿意遵守品牌标准、有良好的商业信誉等。详情请咨询官方客服。";
    } else if (lowerMessage.includes('礼尚往来') && lowerMessage.includes('平台')) {
      return "礼尚往来平台是一个结合传统文化与现代电商的综合性平台，致力于推广非遗产品和服务，连接传统手工艺者与消费者。";
    } else if (lowerMessage.includes('薪酬') && lowerMessage.includes('制度')) {
      return "薪酬制度结合了非遗文化的特色，既考虑经济效益也注重文化传承价值，建立了公平合理的激励机制。";
    } else if (lowerMessage.includes('营销') && lowerMessage.includes('策略')) {
      return "营销策略结合线上线下渠道，通过文化旅游、电商平台、直播带货等方式全方位推广产品，扩大市场影响力。";
    } else if (lowerMessage.includes('成本') && lowerMessage.includes('分析')) {
      return "成本分析涵盖了原材料、人工、包装、物流等多个方面，确保合理定价和盈利空间，同时保持产品质量。";
    } else if (lowerMessage.includes('培训') && lowerMessage.includes('体系')) {
      return "培训体系包含理论学习、实操训练、考核认证等多个环节，确保学员全面掌握从制作到销售的完整技能。";
    } else if (lowerMessage.includes('制作') && lowerMessage.includes('工艺')) {
      return "凉山非遗手工饼的制作工艺遵循古法，精选优质原料，经过揉面、制馅、成型、烘烤等多道工序精心制作而成。";
    } else if (lowerMessage.includes('历史') || lowerMessage.includes('起源')) {
      return "凉山手工饼有着悠久的历史，承载着深厚的民族文化，是彝族人民智慧的结晶，体现了当地丰富的饮食文化传统。";
    } else if (lowerMessage.includes('包装') || lowerMessage.includes('保质期')) {
      return "采用真空包装技术延长保质期，同时保留产品的风味和品质，确保运输过程中不变质。";
    } else if (lowerMessage.includes('线上') && lowerMessage.includes('销售')) {
      return "线上销售渠道包括官方网站、电商平台、社交媒体等多种形式，方便全国消费者购买正宗的凉山非遗手工饼。";
    } else if (lowerMessage.includes('线下') && lowerMessage.includes('体验')) {
      return "线下设有DIY体验工坊，让顾客亲身参与制作过程，深入了解非遗文化，享受动手的乐趣。";
    } else if (lowerMessage.includes('创新') || lowerMessage.includes('发展')) {
      return "在保持传统工艺的基础上，不断进行产品创新和营销模式创新，适应现代市场需求，推动非遗文化的活态传承。";
    } else {
      // If no specific topic matched, provide a general response based on context
      if (context && context.length > 10) {
        return `根据您提到的内容，相关的资料信息可能是："${context.substring(0, 150)}..."。如果这不是您想要的信息，请具体说明您想了解的内容，我会尽力为您提供帮助。`;
      } else {
        return `关于"${message}"，我们的文档中有相关信息。请告诉我您希望了解更多哪个方面的内容？我可以为您提供详细的解释。`;
      }
    }
  } catch (error) {
    console.error('Error processing AI request:', error);
    return '抱歉，我在处理您的请求时遇到了问题。请您稍后再试或提出其他问题。';
  }
}

// This method will be called when Electron has finished initialization
// and is ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Additional setup for macOS compatibility
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle custom IPC events
ipcMain.handle('read-markdown', async (event, filePath) => {
  return await readAndConvertMarkdown(filePath);
});

// Handle AI request events
ipcMain.on('process-ai-request', async (event, request) => {
  // Update status to indicate processing
  event.reply('ai-init-status', '正在处理您的请求...');
  
  try {
    const response = await processAIRequest(request);
    event.reply('ai-response', response);
  } catch (error) {
    console.error('Error in AI processing:', error);
    event.reply('ai-response', '抱歉，处理您的请求时出现了错误。请稍后重试。');
  } finally {
    event.reply('ai-init-status', '准备就绪');
  }
});

// Export functions for potential use in other modules
module.exports = {
  createWindow,
  readAndConvertMarkdown
};
