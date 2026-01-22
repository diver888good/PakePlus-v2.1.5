// pages/user/member_center.tsx - 会员中心页面
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import './member_center.css';

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  price: number;
  pointsGiven: number;
  icon: string;
}

const MemberCenter = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [referralCode, setReferralCode] = useState<string>('');
  const [services, setServices] = useState<ServiceItem[]>([]);

  // 模拟用户数据
  useEffect(() => {
    setUserInfo({
      nickname: '心伴用户',
      avatar: '/assets/images/default-avatar.png',
      level: '普通会员',
      joinDate: '2024-01-15',
      totalConsumption: 9.9,
      referralCount: 3
    });

    setAvailablePoints(150);
    setReferralCode('REF20260121');

    // 服务项目列表
    setServices([
      {
        id: '1',
        title: '单次科普心理咨询服务',
        desc: 'AI数字人爱爱提供10分钟专业咨询',
        price: 9.9,
        pointsGiven: 9.9,
        icon: '/assets/icons/consultation.png'
      },
      {
        id: '2',
        title: '包月科普心理咨询服务',
        desc: '享受无限次咨询服务+档案留存',
        price: 1999,
        pointsGiven: 1999,
        icon: '/assets/icons/monthly-pass.png'
      },
      {
        id: '3',
        title: '包年科普心理咨询服务',
        desc: '享受无限次服务+VIP权益+个性化建议',
        price: 19999,
        pointsGiven: 19999,
        icon: '/assets/icons/yearly-pass.png'
      }
    ]);
  }, []);

  // 复制推荐码
  const copyReferralCode = () => {
    console.log(`复制推荐码: ${referralCode}`);
    // 这里应该调用微信的复制到剪贴板API
  };

  // 生成推广二维码
  const generateQRCode = () => {
    console.log('生成推广二维码');
    // 这里应该是调用草料二维码API生成专属推广码
  };

  return (
    <ScrollView className="member-center-page">
      {/* 用户信息卡片 */}
      <View className="user-card">
        <View className="user-header">
          <Image src={userInfo?.avatar} className="user-avatar" />
          <View className="user-basic-info">
            <Text className="username">{userInfo?.nickname}</Text>
            <Text className="user-level">{userInfo?.level}</Text>
          </View>
        </View>
        
        <View className="user-stats">
          <View className="stat-item">
            <Text className="stat-value">{userInfo?.totalConsumption || 0}</Text>
            <Text className="stat-label">累计消费(元)</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{availablePoints}</Text>
            <Text className="stat-label">可用积分</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{userInfo?.referralCount || 0}</Text>
            <Text className="stat-label">推荐人数</Text>
          </View>
        </View>
      </View>

      {/* 积分管理 */}
      <View className="points-section">
        <View className="section-header">
          <Text className="section-title">我的积分</Text>
          <Text className="view-all">查看详情 ></Text>
        </View>
        
        <View className="points-summary">
          <View className="current-points">
            <Text className="points-number">{availablePoints}</Text>
            <Text className="points-unit">积分</Text>
          </View>
          <View className="points-actions">
            <Button className="points-btn primary" onClick={() => console.log('积分兑换')}>
              积分兑换
            </Button>
            <Button className="points-btn secondary" onClick={() => console.log('积分查询')}>
              积分明细
            </Button>
          </View>
        </View>
      </View>

      {/* 推荐有奖 */}
      <View className="referral-section">
        <View className="section-header">
          <Text className="section-title">推荐有奖</Text>
          <Text className="view-all">了解更多 ></Text>
        </View>
        
        <View className="referral-content">
          <Text className="referral-desc">
            分享您的专属推广码给好友，好友通过该码注册并消费，
            您将获得其终身消费金额一定比例的积分奖励！
          </Text>
          
          <View className="referral-code-box">
            <Text className="referral-code-label">您的专属推广码:</Text>
            <View className="referral-code-display">
              <Text className="code-text">{referralCode}</Text>
              <Button className="copy-btn" onClick={copyReferralCode}>复制</Button>
            </View>
          </View>
          
          <Button className="generate-qrcode-btn" onClick={generateQRCode}>
            生成推广二维码
          </Button>
          
          <View className="reward-rules">
            <Text className="rule-title">奖励规则:</Text>
            <Text className="rule-detail">• 被推荐人终身消费金额的8%将以积分形式奖励给您</Text>
            <Text className="rule-detail">• 积分有效期为12个月，到期未使用将自动清零</Text>
            <Text className="rule-detail">• 积分可用于兑换商品或抵扣现金</Text>
          </View>
        </View>
      </View>

      {/* 可购服务 */}
      <View className="services-section">
        <View className="section-header">
          <Text className="section-title">可购服务</Text>
          <Text className="view-all">查看更多 ></Text>
        </View>
        
        <View className="services-list">
          {services.map(service => (
            <View key={service.id} className="service-item">
              <Image src={service.icon} className="service-icon" />
              <View className="service-details">
                <Text className="service-title">{service.title}</Text>
                <Text className="service-desc">{service.desc}</Text>
              </View>
              <View className="service-price">
                <Text className="price">¥{service.price}</Text>
                <Text className="points-reward">赠送{service.pointsGiven}积分</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 常用功能 */}
      <View className="features-section">
        <View className="section-header">
          <Text className="section-title">常用功能</Text>
        </View>
        
        <View className="features-grid">
          <View className="feature-item" onClick={() => console.log('学习能力训练')}>
            <Image src="/assets/icons/training.png" className="feature-icon" />
            <Text>学习能力训练</Text>
          </View>
          <View className="feature-item" onClick={() => console.log('心理咨询记录')}>
            <Image src="/assets/icons/history.png" className="feature-icon" />
            <Text>咨询记录</Text>
          </View>
          <View className="feature-item" onClick={() => console.log('商城订单')}>
            <Image src="/assets/icons/orders.png" className="feature-icon" />
            <Text>我的订单</Text>
          </View>
          <View className="feature-item" onClick={() => console.log('设置')}>
            <Image src="/assets/icons/settings.png" className="feature-icon" />
            <Text>设置</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MemberCenter;
