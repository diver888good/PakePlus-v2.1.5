// pages/referral/promotion.tsx - 推广中心页面
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, ShareSheet } from '@tarojs/components';
import './promotion.css';

const PromotionCenter = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showShareSheet, setShowShareSheet] = useState<boolean>(false);
  const [shareOptions, setShareOptions] = useState<any[]>([]);

  // 模拟用户数据和推荐统计
  useEffect(() => {
    setUserInfo({
      nickname: '心伴用户',
      avatar: '/assets/images/default-avatar.png',
      level: '普通会员'
    });

    setReferralStats({
      totalReferrals: 3,
      activeReferrals: 2,
      totalCommissions: 15.68,
      pendingCommissions: 5.20,
      paidCommissions: 10.48
    });

    setReferralCode('REF20260121A');
    setQrCodeUrl('/assets/images/referral_qrcode.png'); // 实际项目中应为API返回的URL

    setShareOptions([
      { name: '微信好友', icon: '/assets/icons/wechat-friend.png' },
      { name: '朋友圈', icon: '/assets/icons/moment.png' },
      { name: '复制链接', icon: '/assets/icons/link.png' },
      { name: '保存图片', icon: '/assets/icons/image.png' }
    ]);
  }, []);

  // 复制推荐码
  const copyReferralCode = () => {
    console.log(`复制推荐码: ${referralCode}`);
    // 在实际项目中，这里会调用微信的复制到剪贴板API
  };

  // 分享推广
  const handleShare = () => {
    setShowShareSheet(true);
  };

  // 选择分享方式
  const selectShareOption = (option: any) => {
    console.log(`选择分享方式: ${option.name}`);
    setShowShareSheet(false);
    
    // 根据不同的分享方式进行相应操作
    switch(option.name) {
      case '微信好友':
        // 调用微信好友分享
        break;
      case '朋友圈':
        // 调用朋友圈分享
        break;
      case '复制链接':
        // 复制推广链接
        break;
      case '保存图片':
        // 保存二维码图片
        break;
    }
  };

  // 下载桌面快捷方式
  const downloadDesktopShortcut = () => {
    console.log('下载桌面快捷方式');
    // 这里可以生成一个包含远程访问信息的二维码或链接
  };

  return (
    <ScrollView className="promotion-center-page">
      {/* 页面标题 */}
      <View className="page-header">
        <Text className="page-title">推广中心</Text>
        <Text className="page-subtitle">分享给朋友，获得终身消费奖励</Text>
      </View>

      {/* 用户信息卡片 */}
      <View className="user-card">
        <Image src={userInfo?.avatar} className="user-avatar" />
        <View className="user-info">
          <Text className="username">{userInfo?.nickname}</Text>
          <Text className="user-level">{userInfo?.level}</Text>
        </View>
        <Button className="copy-code-btn" onClick={copyReferralCode}>
          复制推荐码
        </Button>
      </View>

      {/* 推荐统计数据 */}
      <View className="stats-section">
        <View className="stat-item">
          <Text className="stat-number">{referralStats?.totalReferrals || 0}</Text>
          <Text className="stat-label">总推荐人数</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-number">{referralStats?.activeReferrals || 0}</Text>
          <Text className="stat-label">激活人数</Text>
        </View>
        <View className="stat-item">
          <Text className="stat-number">¥{(referralStats?.totalCommissions || 0).toFixed(2)}</Text>
          <Text className="stat-label">累计奖励</Text>
        </View>
      </View>

      {/* 推广二维码区域 */}
      <View className="qrcode-section">
        <Text className="section-title">我的专属推广码</Text>
        <Text className="qrcode-desc">让朋友们扫描此二维码注册，即可建立推荐关系</Text>
        
        <View className="qrcode-container">
          <Image 
            src={qrCodeUrl} 
            className="referral-qrcode" 
            alt="推广二维码"
          />
          <Text className="referral-code-text">{referralCode}</Text>
        </View>
        
        <Button className="download-shortcut-btn" onClick={downloadDesktopShortcut}>
          下载电脑端快捷方式
        </Button>
      </View>

      {/* 推广规则说明 */}
      <View className="rules-section">
        <Text className="section-title">推广规则</Text>
        <View className="rule-item">
          <Text className="rule-dot">•</Text>
          <Text className="rule-content">好友通过您的专属二维码注册后，即建立推荐关系</Text>
        </View>
        <View className="rule-item">
          <Text className="rule-dot">•</Text>
          <Text className="rule-content">好友在平台的所有消费，您都可获得8%的积分奖励</Text>
        </View>
        <View className="rule-item">
          <Text className="rule-dot">•</Text>
          <Text className="rule-content">积分奖励是终身有效的，只要好友继续消费</Text>
        </View>
        <View className="rule-item">
          <Text className="rule-dot">•</Text>
          <Text className="rule-content">积分有效期为12个月，过期未使用将自动清零</Text>
        </View>
        <View className="rule-item">
          <Text className="rule-dot">•</Text>
          <Text className="rule-content">积分可用于兑换商品、课程或抵扣现金</Text>
        </View>
      </View>

      {/* 推广收益明细 */}
      <View className="earnings-section">
        <View className="section-header">
          <Text className="section-title">推广收益明细</Text>
          <Text className="view-all">查看全部 ></Text>
        </View>
        
        <View className="earning-items">
          <View className="earning-item">
            <View className="item-left">
              <Text className="item-title">好友张三消费奖励</Text>
              <Text className="item-time">2024-01-20 15:30</Text>
            </View>
            <View className="item-right">
              <Text className="item-amount">+¥7.92</Text>
            </View>
          </View>
          
          <View className="earning-item">
            <View className="item-left">
              <Text className="item-title">好友李四消费奖励</Text>
              <Text className="item-time">2024-01-19 10:15</Text>
            </View>
            <View className="item-right">
              <Text className="item-amount">+¥5.25</Text>
            </View>
          </View>
          
          <View className="earning-item">
            <View className="item-left">
              <Text className="item-title">好友王五消费奖励</Text>
              <Text className="item-time">2024-01-18 14:20</Text>
            </View>
            <View className="item-right">
              <Text className="item-amount">+¥2.51</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 行动按钮 */}
      <View className="action-buttons">
        <Button className="share-btn primary" onClick={handleShare}>
          立即分享推广
        </Button>
        <Button className="learn-more-btn secondary" onClick={() => console.log('了解更多')}>
          了解推广玩法
        </Button>
      </View>

      {/* 分享面板 */}
      {showShareSheet && (
        <View className="share-sheet-overlay" onClick={() => setShowShareSheet(false)}>
          <View className="share-sheet" onClick={(e) => e.stopPropagation()}>
            <View className="sheet-header">
              <Text>分享到</Text>
              <Button className="close-btn" onClick={() => setShowShareSheet(false)}>×</Button>
            </View>
            
            <View className="share-options">
              {shareOptions.map((option, index) => (
                <View 
                  key={index} 
                  className="share-option" 
                  onClick={() => selectShareOption(option)}
                >
                  <Image src={option.icon} className="option-icon" />
                  <Text>{option.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 底部提示 */}
      <View className="bottom-tip">
        <Text>温馨提示：推广奖励将持续终生，邀请越多，收益越大！</Text>
      </View>
    </ScrollView>
  );
};

export default PromotionCenter;
