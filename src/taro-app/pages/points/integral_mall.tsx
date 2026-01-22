// pages/points/integral_mall.tsx - 积分商城页面
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import './integral_mall.css';

interface IntegralItem {
  id: string;
  title: string;
  desc: string;
  pointsRequired: number;
  type: 'product' | 'service' | 'cash'; // 商品、服务、现金抵扣
  image: string;
  stock: number; // 库存
  validityDays: number; // 有效期天数
}

const IntegralMall = () => {
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [expiringPoints, setExpiringPoints] = useState<{amount: number, daysLeft: number} | null>(null);
  const [integralItems, setIntegralItems] = useState<IntegralItem[]>([]);
  const [activeTab, setActiveTab] = useState<'mall' | 'history'>('mall');

  // 模拟数据
  useEffect(() => {
    // 用户当前可用积分
    setAvailablePoints(150);
    
    // 即将过期的积分（例如：30天内到期）
    setExpiringPoints({ amount: 50, daysLeft: 25 });
    
    // 积分兑换商品列表
    setIntegralItems([
      {
        id: '1',
        title: 'AI数字人咨询服务',
        desc: '使用9.9积分预约元宇宙虚拟咨询室的公益心理咨询师',
        pointsRequired: 9.9,
        type: 'service',
        image: '/assets/images/service-counseling.jpg',
        stock: 999,
        validityDays: 30
      },
      {
        id: '2',
        title: '学习能力训练课程',
        desc: '完整版学习能力训练课程，价值199元',
        pointsRequired: 19900,
        type: 'product',
        image: '/assets/images/course-learning.jpg',
        stock: 50,
        validityDays: 365
      },
      {
        id: '3',
        title: '心理调节技巧电子书',
        desc: '专业心理调节方法汇编电子书',
        pointsRequired: 500,
        type: 'product',
        image: '/assets/images/ebook-psychology.jpg',
        stock: 200,
        validityDays: 180
      },
      {
        id: '4',
        title: '10元现金抵扣券',
        desc: '可在商城消费时抵扣10元现金',
        pointsRequired: 1000,
        type: 'cash',
        image: '/assets/images/voucher-10yuan.jpg',
        stock: 100,
        validityDays: 90
      },
      {
        id: '5',
        title: '正念冥想音频包',
        desc: '包含10个不同时长的冥想引导音频',
        pointsRequired: 800,
        type: 'product',
        image: '/assets/images/audio-meditation.jpg',
        stock: 150,
        validityDays: 365
      }
    ]);
  }, []);

  // 兑换积分商品
  const exchangeItem = (item: IntegralItem) => {
    if (availablePoints < item.pointsRequired) {
      console.log('积分不足');
      return;
    }

    console.log(`确认兑换: ${item.title}, 需要积分: ${item.pointsRequired}`);
    // 这里应该是实际的兑换逻辑和积分扣除
  };

  return (
    <View className="integral-mall-page">
      {/* 头部积分信息 */}
      <View className="points-header">
        <View className="points-summary">
          <Text className="points-label">当前可用积分</Text>
          <Text className="points-value">{availablePoints}</Text>
          <Text className="points-unit">分</Text>
        </View>
        
        {expiringPoints && expiringPoints.amount > 0 && (
          <View className="expiring-alert">
            <Text className="alert-text">
              ⚠️ 您有{expiringPoints.amount}积分将在{expiringPoints.daysLeft}天后过期，请及时使用！
            </Text>
            <Button 
              className="use-now-btn" 
              onClick={() => console.log('去使用')}
            >
              立即使用
            </Button>
          </View>
        )}
      </View>

      {/* 标签页切换 */}
      <View className="tab-container">
        <View 
          className={`tab-item ${activeTab === 'mall' ? 'active' : ''}`}
          onClick={() => setActiveTab('mall')}
        >
          <Text>积分商城</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Text>积分记录</Text>
        </View>
      </View>

      {activeTab === 'mall' ? (
        <ScrollView className="mall-content">
          {/* 推荐兑换 */}
          <View className="recommended-section">
            <Text className="section-title">推荐兑换</Text>
            <ScrollView horizontal className="recommended-scroll">
              {integralItems.slice(0, 3).map(item => (
                <View key={`rec-${item.id}`} className="recommended-item">
                  <Image src={item.image} className="recommended-image" />
                  <View className="recommended-info">
                    <Text className="recommended-title">{item.title}</Text>
                    <Text className="recommended-points">{item.pointsRequired}积分</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 所有可兑换商品 */}
          <View className="items-section">
            <Text className="section-title">全部兑换</Text>
            
            <View className="items-grid">
              {integralItems.map(item => (
                <View key={item.id} className="item-card">
                  <Image src={item.image} className="item-image" />
                  
                  <View className="item-info">
                    <Text className="item-title">{item.title}</Text>
                    <Text className="item-desc">{item.desc}</Text>
                    
                    <View className="item-meta">
                      <Text className="points-needed">{item.pointsRequired}积分</Text>
                      <Text className="stock">库存: {item.stock}</Text>
                    </View>
                    
                    <View className="validity">
                      <Text>有效期: {item.validityDays}天</Text>
                    </View>
                    
                    <Button 
                      className={`exchange-btn ${
                        availablePoints >= item.pointsRequired ? 'active' : 'disabled'
                      }`}
                      disabled={availablePoints < item.pointsRequired}
                      onClick={() => exchangeItem(item)}
                    >
                      {availablePoints >= item.pointsRequired ? '立即兑换' : '积分不足'}
                    </Button>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* 积分规则说明 */}
          <View className="rules-section">
            <Text className="section-title">积分规则</Text>
            <View className="rules-content">
              <Text className="rule-item">• 积分可通过消费、分享、活动等方式获取</Text>
              <Text className="rule-item">• 积分可用于兑换商品、服务或抵扣现金</Text>
              <Text className="rule-item">• 积分具有有效期，过期未使用的积分将自动清零</Text>
              <Text className="rule-item">• 转介绍用户可获得被介绍人终身消费金额一定比例的积分奖励</Text>
              <Text className="rule-item">• 积分不可提现，仅限在平台内使用</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView className="history-content">
          <Text className="section-title">积分记录</Text>
          
          <View className="record-filters">
            <Button className="filter-btn active">全部</Button>
            <Button className="filter-btn">收入</Button>
            <Button className="filter-btn">支出</Button>
          </View>
          
          <View className="records-list">
            {/* 模拟积分记录 */}
            <View className="record-item income">
              <View className="record-left">
                <Text className="record-type">购买服务</Text>
                <Text className="record-desc">单次科普心理咨询服务</Text>
                <Text className="record-time">2024-01-20 15:30</Text>
              </View>
              <View className="record-right">
                <Text className="record-change">+9.9</Text>
              </View>
            </View>
            
            <View className="record-item income">
              <View className="record-left">
                <Text className="record-type">好友消费奖励</Text>
                <Text className="record-desc">好友张三消费获得奖励</Text>
                <Text className="record-time">2024-01-19 10:15</Text>
              </View>
              <View className="record-right">
                <Text className="record-change">+12.5</Text>
              </View>
            </View>
            
            <View className="record-item outcome">
              <View className="record-left">
                <Text className="record-type">积分兑换</Text>
                <Text className="record-desc">兑换AI咨询服务</Text>
                <Text className="record-time">2024-01-18 14:20</Text>
              </View>
              <View className="record-right">
                <Text className="record-change">-9.9</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* 底部导航提示 */}
      <View className="bottom-tip">
        <Text>温馨提示：积分有效期为12个月，建议您及时使用以免过期失效</Text>
      </View>
    </View>
  );
};

export default IntegralMall;
