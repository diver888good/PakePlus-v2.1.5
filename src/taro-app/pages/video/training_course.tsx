// pages/video/training_course.tsx - 培训课程和视频制作页面
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, Video } from '@tarojs/components';
import './training_course.css';

interface VideoTemplate {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  duration: string;
  views: number;
  createdAt: Date;
}

interface GeneratedVideo {
  id: string;
  title: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number; // 处理进度
  url?: string;      // 视频URL
  createdAt: Date;
}

const TrainingCoursePage = () => {
  const [videoTemplates, setVideoTemplates] = useState<VideoTemplate[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [activeTab, setActiveTab] = useState<'templates' | 'my_videos'>('templates');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // 模拟数据初始化
  useEffect(() => {
    // 视频模板数据
    setVideoTemplates([
      {
        id: 'temp_1',
        title: '心理健康小贴士',
        category: '心理科普',
        thumbnail: '/assets/images/thumb_mental_health.jpg',
        duration: '0:30',
        views: 12500,
        createdAt: new Date()
      },
      {
        id: 'temp_2',
        title: '情绪管理技巧',
        category: '情绪调节',
        thumbnail: '/assets/images/thumb_emotion.jpg',
        duration: '1:15',
        views: 8900,
        createdAt: new Date()
      },
      {
        id: 'temp_3',
        title: '学习能力提升',
        category: '学习训练',
        thumbnail: '/assets/images/thumb_learning.jpg',
        duration: '2:00',
        views: 15600,
        createdAt: new Date()
      },
      {
        id: 'temp_4',
        title: '压力释放方法',
        category: '压力管理',
        thumbnail: '/assets/images/thumb_stress.jpg',
        duration: '1:30',
        views: 11200,
        createdAt: new Date()
      }
    ]);

    // 已生成视频数据
    setGeneratedVideos([
      {
        id: 'gen_1',
        title: '如何应对工作压力？',
        status: 'completed',
        url: '/assets/videos/work_pressure.mp4',
        createdAt: new Date(Date.now() - 86400000), // 一天前
      },
      {
        id: 'gen_2',
        title: '改善睡眠质量的小技巧',
        status: 'processing',
        progress: 75,
        createdAt: new Date()
      }
    ]);
  }, []);

  // 获取特定分类的模板
  const filteredTemplates = selectedCategory === '全部'
    ? videoTemplates
    : videoTemplates.filter(template => template.category === selectedCategory);

  // 获取所有分类
  const categories = ['全部', ...new Set(videoTemplates.map(t => t.category))];

  // 生成新视频
  const generateNewVideo = (templateId: string) => {
    setIsGenerating(true);
    
    // 模拟视频生成过程
    setTimeout(() => {
      const template = videoTemplates.find(t => t.id === templateId);
      
      if (template) {
        const newVideo: GeneratedVideo = {
          id: `gen_${Date.now()}`,
          title: `自定义-${template.title}-${new Date().toISOString().slice(0, 10)}`,
          status: 'processing',
          progress: 0,
          createdAt: new Date()
        };
        
        setGeneratedVideos(prev => [newVideo, ...prev]);
        
        // 模拟处理进度
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setGeneratedVideos(prev => prev.map(v => 
            v.id === newVideo.id ? {...v, progress} : v
          ));
          
          if (progress >= 100) {
            clearInterval(interval);
            setGeneratedVideos(prev => prev.map(v => 
              v.id === newVideo.id 
                ? {...v, status: 'completed', url: `/assets/videos/generated_${newVideo.id}.mp4`} 
                : v
            ));
            setIsGenerating(false);
          }
        }, 500);
      } else {
        setIsGenerating(false);
      }
    }, 1000);
  };

  // 分享视频
  const shareVideo = (videoId: string) => {
    console.log(`分享视频: ${videoId}`);
    // 这里应该是调用微信分享API
  };

  // 下载视频
  const downloadVideo = (videoId: string) => {
    console.log(`下载视频: ${videoId}`);
    // 这里应该是触发视频下载
  };

  return (
    <ScrollView className="training-course-page">
      {/* 页面标题 */}
      <View className="page-header">
        <Text className="page-title">视频制作中心</Text>
        <Text className="page-subtitle">根据热点话题快速生成宣传视频</Text>
      </View>

      {/* 标签页切换 */}
      <View className="tab-container">
        <View 
          className={`tab-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Text>模板选择</Text>
        </View>
        <View 
          className={`tab-item ${activeTab === 'my_videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_videos')}
        >
          <Text>我的视频</Text>
        </View>
      </View>

      {activeTab === 'templates' ? (
        <>
          {/* 分类筛选 */}
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

          {/* 热点话题提示 */}
          <View className="hot-topics">
            <Text className="section-title">今日热点话题</Text>
            <View className="topics-container">
              <Text className="topic-tag">新年新气象</Text>
              <Text className="topic-tag">职场焦虑</Text>
              <Text className="topic-tag">亲子关系</Text>
              <Text className="topic-tag">健康生活</Text>
              <Text className="topic-tag">情绪管理</Text>
            </View>
          </View>

          {/* 视频模板列表 */}
          <View className="templates-section">
            <Text className="section-title">推荐模板</Text>
            
            <View className="templates-grid">
              {filteredTemplates.map(template => (
                <View key={template.id} className="template-card">
                  <Image 
                    src={template.thumbnail} 
                    className="template-thumbnail"
                  />
                  
                  <View className="template-info">
                    <Text className="template-title">{template.title}</Text>
                    <Text className="template-category">{template.category}</Text>
                    <Text className="template-meta">
                      {template.duration} • {template.views.toLocaleString()}次播放
                    </Text>
                  </View>
                  
                  <Button 
                    className="generate-btn" 
                    onClick={() => generateNewVideo(template.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '生成中...' : '一键生成'}
                  </Button>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View className="my-videos-section">
          <Text className="section-title">我的生成视频</Text>
          
          {generatedVideos.length === 0 ? (
            <View className="empty-state">
              <Text>暂无生成的视频，快去模板中心创建一个吧！</Text>
            </View>
          ) : (
            <View className="videos-list">
              {generatedVideos.map(video => (
                <View key={video.id} className="video-item">
                  <View className="video-preview">
                    {video.status === 'processing' ? (
                      <View className="processing-placeholder">
                        <Text className="processing-text">视频生成中...</Text>
                        <View className="progress-bar">
                          <View 
                            className="progress-fill" 
                            style={{ width: `${video.progress}%` }}
                          ></View>
                        </View>
                        <Text className="progress-text">{video.progress}%</Text>
                      </View>
                    ) : video.url ? (
                      <Video
                        src={video.url}
                        controls={true}
                        showFullscreenBtn={true}
                        showPlayBtn={true}
                        className="video-player"
                      />
                    ) : (
                      <View className="no-video-placeholder">
                        <Text>视频生成失败，请重试</Text>
                      </View>
                    )}
                  </View>
                  
                  <View className="video-details">
                    <Text className="video-title">{video.title}</Text>
                    <Text className="video-status">
                      {video.status === 'completed' && '已完成'}
                      {video.status === 'processing' && `处理中 (${video.progress}%)`}
                      {video.status === 'failed' && '生成失败'}
                    </Text>
                    
                    <View className="video-actions">
                      {video.status === 'completed' && video.url && (
                        <>
                          <Button 
                            className="action-btn share-btn" 
                            onClick={() => shareVideo(video.id)}
                          >
                            分享
                          </Button>
                          <Button 
                            className="action-btn download-btn" 
                            onClick={() => downloadVideo(video.id)}
                          >
                            下载
                          </Button>
                        </>
                      )}
                      
                      {(video.status === 'failed' || !video.url) && (
                        <Button 
                          className="action-btn regenerate-btn" 
                          onClick={() => generateNewVideo('temp_1')} // 使用默认模板重新生成
                        >
                          重新生成
                        </Button>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 底部说明 */}
      <View className="bottom-note">
        <Text className="note-title">使用说明：</Text>
        <Text className="note-content">• 选择适合的视频模板，一键生成个性化宣传视频</Text>
        <Text className="note-content">• 支持根据热点话题自动匹配内容元素</Text>
        <Text className="note-content">• 生成的视频可直接分享到社交媒体平台</Text>
        <Text className="note-content">• 所有视频均包含品牌标识，助力推广引流</Text>
      </View>
    </ScrollView>
  );
};

export default TrainingCoursePage;
