// pages/mall/shop.tsx - 商城页面
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import './shop.css';

interface Product {
  id: string;
  title: string;
  desc: string;
  price: number;
  originalPrice?: number;
  pointsRequired?: number;
  type: 'course' | 'physical' | 'service'; // 课程、实物、服务
  category: string;
  image: string;
  sales: number;
  rating: number;
}

const ShopPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [availablePoints, setAvailablePoints] = useState<number>(0);

  // 模拟商品数据
  useEffect(() => {
    setAvailablePoints(150); // 用户当前可用积分
    
    // 商品数据
    setProducts([
      {
        id: '1',
        title: '学习能力训练课程',
        desc: '基于AI自主学习逻辑研发，提升语言表达、记忆、专注力等综合能力',
        price: 199,
        originalPrice: 299,
        pointsRequired: 19900,
        type: 'course',
        category: '课程',
        image: '/assets/images/course-learning.jpg',
        sales: 1234,
        rating: 4.8
      },
      {
        id: '2',
        title: '心理调节能力训练',
        desc: '情绪管理、压力应对、人际关系处理专项训练课程',
        price: 299,
        originalPrice: 399,
        pointsRequired: 29900,
        type: 'course',
        category: '课程',
        image: '/assets/images/course-emotion.jpg',
        sales: 876,
        rating: 4.7
      },
      {
        id: '3',
        title: '正念冥想入门套装',
        desc: '冥想垫+引导音频+说明书，助您开始正念之旅',
        price: 89,
        type: 'physical',
        category: '实物',
        image: '/assets/images/product-meditation.jpg',
        sales: 543,
        rating: 4.6
      },
      {
        id: '4',
        title: '心理健康自测量表',
        desc: '专业心理测评工具，了解自己的心理健康状况',
        price: 29,
        type: 'service',
        category: '服务',
        image: '/assets/images/service-assessment.jpg',
        sales: 2109,
        rating: 4.5
      },
      {
        id: '5',
        title: '自制力训练课程',
        desc: '针对拖延症、专注力差、目标感缺失的定制化训练',
        price: 169,
        originalPrice: 249,
        pointsRequired: 16900,
        type: 'course',
        category: '课程',
        image: '/assets/images/course-selfcontrol.jpg',
        sales: 654,
        rating: 4.9
      }
    ]);

    // 分类数据
    setCategories(['全部', '课程', '实物', '服务']);
  }, []);

  // 根据分类筛选商品
  const filteredProducts = selectedCategory === '全部' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // 购买商品
  const buyProduct = (product: Product) => {
    console.log(`购买商品: ${product.title}, 价格: ¥${product.price}`);
    // 这里应该调用微信支付接口
  };

  // 使用积分兑换
  const exchangeWithPoints = (product: Product) => {
    if (!product.pointsRequired) {
      console.log('该商品不支持积分兑换');
      return;
    }
    
    if (availablePoints < product.pointsRequired) {
      console.log('积分不足');
      return;
    }
    
    console.log(`使用 ${product.pointsRequired} 积分兑换 ${product.title}`);
    // 这里应该是积分扣除和商品发放逻辑
  };

  return (
    <ScrollView className="shop-page">
      {/* 头部搜索栏 */}
      <View className="search-bar">
        <View className="search-input-container">
          <Image src="/assets/icons/search.png" className="search-icon" />
          <Input 
            placeholder="搜索课程、商品或服务..." 
            className="search-input"
          />
        </View>
        <Button className="scan-btn">扫码</Button>
      </View>

      {/* 积分信息 */}
      <View className="points-banner">
        <Text className="points-text">当前积分: <Text className="points-number">{availablePoints}</Text></Text>
        <Button className="exchange-btn" onClick={() => console.log('积分兑换')}>
          积分兑换专区
        </Button>
      </View>

      {/* 分类导航 */}
      <ScrollView className="category-nav" scrollX>
        <View className="category-list">
          {categories.map(category => (
            <Button
              key={category}
              className={`category-item ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </View>
      </ScrollView>

      {/* 商品列表 */}
      <View className="product-grid">
        {filteredProducts.map(product => (
          <View key={product.id} className="product-card">
            <Image src={product.image} className="product-image" />
            
            <View className="product-info">
              <Text className="product-title">{product.title}</Text>
              <Text className="product-desc">{product.desc}</Text>
              
              <View className="product-meta">
                <Text className="sales">已售 {product.sales}</Text>
                <View className="rating">
                  {[...Array(5)].map((_, i) => (
                    <Text 
                      key={i} 
                      className={`star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                    >
                      ★
                    </Text>
                  ))}
                  <Text className="rating-score">{product.rating}</Text>
                </View>
              </View>
              
              <View className="price-section">
                <Text className="current-price">¥{product.price}</Text>
                {product.originalPrice && (
                  <Text className="original-price">¥{product.originalPrice}</Text>
                )}
                
                {product.pointsRequired && (
                  <Text className="points-required">{product.pointsRequired}积分</Text>
                )}
              </View>
              
              <View className="action-buttons">
                <Button 
                  className="buy-btn" 
                  onClick={() => buyProduct(product)}
                >
                  立即购买
                </Button>
                
                {product.pointsRequired && (
                  <Button 
                    className="points-exchange-btn" 
                    onClick={() => exchangeWithPoints(product)}
                  >
                    积分兑换
                  </Button>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 底部推荐 */}
      <View className="recommendations">
        <Text className="section-title">为你推荐</Text>
        <View className="recommended-products">
          {products.slice(0, 2).map(product => (
            <View key={`rec-${product.id}`} className="recommended-product">
              <Image src={product.image} className="rec-image" />
              <View className="rec-info">
                <Text className="rec-title">{product.title}</Text>
                <Text className="rec-price">¥{product.price}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ShopPage;
