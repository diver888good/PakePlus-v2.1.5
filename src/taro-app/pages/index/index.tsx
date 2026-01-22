// pages/index/index.tsx - 首页
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Swiper, SwiperItem } from '@tarojs/components';
import './index.css';

const HomePage = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hotTopics, setHotTopics] = useState<string[]>([]);
  
  // 模拟热门话题数据
  useEffect(() => {
    setHotTopics([
      "情绪管理",
      "压力释放",
      "人际交往",
      "自我成长",
      "亲子关系"
    ]);
  }, []);

  // 获取用户信息
  const getUserInfo = async () => {
    // 模拟获取用户信息
    setUserInfo({
      nickname: '心伴用户',
      avatar: '/assets/images/default-avatar.png',
      integral: 150,
      level: '普通会员'
    });
  };

  // 页面加载时获取用户信息
  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    <View className="home-page">
      {/* 头部 */}
      <View className="header">
        <View className="user-info">
          <Image src={userInfo?.avatar || '/assets/images/default-avatar.png'} className="avatar" />
          <View className="user-details">
            <Text className="nickname">{userInfo?.nickname || '欢迎来到心伴'}</Text>
            <Text className="integral">积分: {userInfo?.integral || 0} | 等级: {userInfo?.level || '游客'}</Text>
          </View>
        </View>
        <Button className="login-btn" onClick={() => console.log('Login clicked')}>
          {userInfo ? '个人中心' : '登录'}
        </Button>
      </View>

      {/* 轮播图 */}
      <Swiper className="banner-swiper" indicatorDots circular autoplay interval={3000}>
        <SwiperItem>
          <Image src="/assets/images/banner1.jpg" className="banner-image" />
        </SwiperItem>
        <SwiperItem>
          <Image src="/assets/images/banner2.jpg" className="banner-image" />
        </SwiperItem>
        <SwiperItem>
          <Image src="/assets/images/banner3.jpg" className="banner-image" />
        </SwiperItem>
      </Swiper>

      {/* 快捷功能区 */}
      <View className="quick-actions">
        <View className="action-item" onClick={() => console.log('AI咨询')}>
          <Image src="/assets/icons/ai-chat.png" className="action-icon" />
          <Text>AI数字人咨询</Text>
        </View>
        <View className="action-item" onClick={() => console.log('真人咨询')}>
          <Image src="/assets/icons/human-consultant.png" className="action-icon" />
        </View>
        <View className="action-item" onClick={() => console.log('课程学习')}>
          <Image src="/assets/icons/course.png" className="action-icon" />
        </View>
        <View className="action-item" onClick={() => console.log('商城')}>
          <Image src="/assets/icons/shopping-cart.png" className="action-icon" />
        </View>
      </View>

      {/* 热门话题 */}
      <View className="hot-topics-section">
        <Text className="section-title">热门话题</Text>
        <View className="topics-container">
          {hotTopics.map((topic, index) => (
            <View key={index} className="topic-tag">
              {topic}
            </View>
          ))}
        </View>
      </View>

      {/* 推荐内容 */}
      <View className="recommendations">
        <Text className="section-title">为您推荐</Text>
        <View className="recommend-item">
          <Image src="/assets/images/recommend1.jpg" className="recommend-image" />
          <View className="recommend-content">
            <Text className="title">情绪管理小技巧</Text>
            <Text className="desc">学会这5个方法，轻松掌控情绪</Text>
          </View>
        </View>
        <View className="recommend-item">
          <Image src="/assets/images/recommend2.jpg" className="recommend-image" />
          <View className="recommend-content">
            <Text className="title">压力释放指南</Text>
            <Text className="desc">如何有效缓解工作生活压力</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomePage;
