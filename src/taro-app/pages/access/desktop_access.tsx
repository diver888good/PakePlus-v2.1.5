// pages/access/desktop_access.tsx - 桌面应用访问页面
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Navigator } from '@tarojs/components';
import './desktop_access.css';

const DesktopAccessPage = () => {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [showQRCode, setShowQRCode] = useState(false);
  const [remoteAppUrl, setRemoteAppUrl] = useState<string>('');

  // 模拟向日葵远程连接状态
  useEffect(() => {
    if (connectionStatus === 'connecting') {
      const timer = setTimeout(() => {
        setConnectionStatus('connected');
      }, 3000); // 模拟连接过程

      return () => clearTimeout(timer);
    }
  }, [connectionStatus]);

  // 模拟生成桌面应用访问二维码
  const generateDesktopQRCode = () => {
    // 在实际应用中，这里会调用后端API生成包含远程访问信息的二维码
    setRemoteAppUrl('https://your-remote-app.com/access?token=abc123xyz');
    setShowQRCode(true);
  };

  // 连接到远程桌面应用
  const connectToDesktopApp = () => {
    setConnectionStatus('connecting');
    
    // 模拟连接到远程桌面应用的过程
    console.log('正在连接到远程桌面应用...');
  };

  // 断开连接
  const disconnectFromDesktopApp = () => {
    setConnectionStatus('disconnected');
    console.log('已断开远程连接');
  };

  return (
    <View className="desktop-access-page">
      <View className="header">
        <Text className="page-title">电脑端应用访问</Text>
        <Text className="page-subtitle">通过手机扫码快速访问电脑端应用</Text>
      </View>

      <View className="status-section">
        <View className={`status-indicator ${connectionStatus}`}>
          <Text className="status-text">
            {connectionStatus === 'disconnected' && '未连接'}
            {connectionStatus === 'connecting' && '连接中...'}
            {connectionStatus === 'connected' && '已连接'}
          </Text>
          <View className={`status-dot ${connectionStatus}`}></View>
        </View>
        
        {connectionStatus === 'connected' && (
          <Text className="connection-info">安全连接已建立，您可以正常使用电脑端应用</Text>
        )}
      </View>

      <View className="instructions">
        <Text className="instruction-title">使用说明：</Text>
        <Text className="instruction-step">1. 点击下方按钮生成专属访问码</Text>
        <Text className="instruction-step">2. 使用手机扫描二维码或点击链接</Text>
        <Text className="instruction-step">3. 通过向日葵等远程工具连接到电脑</Text>
        <Text className="instruction-step">4. 自动唤起电脑端的应用程序</Text>
      </View>

      <View className="action-buttons">
        {!showQRCode ? (
          <Button 
            className="generate-btn" 
            onClick={generateDesktopQRCode}
          >
            生成访问码
          </Button>
        ) : (
          <>
            <View className="qrcode-container">
              <Image 
                src={`/api/qrcode?text=${encodeURIComponent(remoteAppUrl)}`} 
                className="access-qrcode" 
                alt="桌面应用访问二维码"
              />
              <Text className="qrcode-desc">扫描此二维码访问电脑端应用</Text>
            </View>
            
            <View className="link-container">
              <Text className="access-link">{remoteAppUrl}</Text>
              <Button 
                className="copy-link-btn" 
                onClick={() => console.log('复制链接')}
              >
                复制链接
              </Button>
            </View>
          </>
        )}

        {connectionStatus !== 'connected' ? (
          <Button 
            className="connect-btn" 
            disabled={connectionStatus === 'connecting'}
            onClick={connectToDesktopApp}
          >
            {connectionStatus === 'connecting' ? '连接中...' : '立即连接'}
          </Button>
        ) : (
          <Button 
            className="disconnect-btn" 
            onClick={disconnectFromDesktopApp}
          >
            断开连接
          </Button>
        )}
      </View>

      <View className="features">
        <Text className="feature-title">功能特点：</Text>
        <View className="feature-item">
          <Text className="feature-icon">✓</Text>
          <Text className="feature-desc">无需下载安装，扫码即用</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">✓</Text>
          <Text className="feature-desc">支持多种远程连接方式</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">✓</Text>
          <Text className="feature-desc">自动唤起电脑端指定应用</Text>
        </View>
        <View className="feature-item">
          <Text className="feature-icon">✓</Text>
          <Text className="feature-desc">安全加密传输，保护隐私</Text>
        </View>
      </View>

      <View className="troubleshooting">
        <Text className="trouble-title">常见问题：</Text>
        <Text className="trouble-item">• 扫码后无法连接？请确认电脑端向日葵软件已开启并在线</Text>
        <Text className="trouble-item">• 应用未自动唤起？请检查电脑端URI协议注册是否正确</Text>
        <Text className="trouble-item">• 连接不稳定？请确保网络环境良好</Text>
      </View>

      <Navigator url="/pages/index/index" className="back-home">
        ← 返回首页
      </Navigator>
    </View>
  );
};

export default DesktopAccessPage;
