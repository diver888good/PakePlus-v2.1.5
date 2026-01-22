// pages/chat/ai_digital_human.tsx - AI数字人心理咨询页面
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, Input, Button, ScrollView } from '@tarojs/components';
import './ai_digital_human.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai'; // user 或 ai数字人爱爱
  timestamp: Date;
}

const AIDigitalHumanChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是AI数字人爱爱，你的专属情感陪护伙伴。有什么心理困扰可以和我聊聊。',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef(null);

  // 模拟AI回复
  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let aiResponse = '';
      
      // 根据用户输入生成不同的回复
      if (userMessage.includes('压力') || userMessage.includes('焦虑')) {
        aiResponse = '听起来你现在有些压力呢。让我们一起分析一下造成压力的原因，然后找到缓解的方法。你可以详细说说是什么让你感到焦虑吗？';
      } else if (userMessage.includes('情绪') || userMessage.includes('心情')) {
        aiResponse = '情绪波动是很正常的生理现象。重要的是学会认识、接纳并管理自己的情绪。你现在的感受是怎样的？';
      } else if (userMessage.includes('学习') || userMessage.includes('工作')) {
        aiResponse = '关于学习或工作的困扰，我们可以从时间管理、目标设定等方面入手。你觉得哪个方面最需要改善？';
      } else if (userMessage.includes('关系') || userMessage.includes('人际')) {
        aiResponse = '人际关系是我们生活中重要的组成部分。良好的人际关系能给我们带来支持和快乐。你在人际关系方面遇到了什么挑战？';
      } else {
        aiResponse = '谢谢你的分享。这是一个很好的开始。你能再详细描述一下具体情况吗？这样我能更好地理解并给你建议。';
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
    }, 1500); // 模拟思考时间
  };

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // 模拟AI回复
    simulateAIResponse(inputValue);
  };

  // 处理键盘事件
  const handleInputConfirm = (e: any) => {
    if (e.detail.value.trim()) {
      setInputValue(e.detail.value);
      handleSend();
    }
  };

  return (
    <View className="ai-chat-page">
      {/* 头部 */}
      <View className="chat-header">
        <Image src="/assets/images/ai_avatar.png" className="ai-avatar" />
        <View className="ai-info">
          <Text className="ai-name">AI数字人爱爱</Text>
          <Text className="ai-status">在线 | 心理科普咨询师</Text>
        </View>
        <Button className="consult-btn" onClick={() => console.log('真人咨询')}>
          转真人咨询
        </Button>
      </View>

      {/* 聊天内容区域 */}
      <ScrollView 
        className="chat-messages" 
        scrollY 
        scrollTop={9999}
        ref={scrollViewRef}
      >
        {messages.map((message) => (
          <View 
            key={message.id} 
            className={`message-item ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
          >
            {message.sender === 'ai' && (
              <Image src="/assets/images/ai_avatar.png" className="message-avatar" />
            )}
            <View className={`message-bubble ${message.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
              <Text>{message.content}</Text>
            </View>
            {message.sender === 'user' && (
              <Image src="/assets/images/user_avatar.png" className="message-avatar" />
            )}
          </View>
        ))}

        {isTyping && (
          <View className="typing-indicator">
            <Text>AI数字人爱爱正在输入...</Text>
          </View>
        )}
      </ScrollView>

      {/* 输入区域 */}
      <View className="chat-input-area">
        <Input
          className="chat-input"
          placeholder="向AI数字人爱爱倾诉您的心理困扰..."
          value={inputValue}
          onInput={(e) => setInputValue(e.target.value)}
          onConfirm={handleInputConfirm}
        />
        <Button 
          className={`send-btn ${inputValue.trim() ? 'active' : ''}`} 
          disabled={!inputValue.trim()}
          onClick={handleSend}
        >
          发送
        </Button>
      </View>

      {/* 底部提示 */}
      <View className="disclaimer">
        <Text className="disclaimer-text">
          免责声明：提供的所有建议均来自平台科普性心理知识库，非专门针对您问题的定制化专业指导意见，
          仅用于教学和学术研究，平台不承担该建议带来的任何法律后果。
        </Text>
      </View>
    </View>
  );
};

export default AIDigitalHumanChat;
