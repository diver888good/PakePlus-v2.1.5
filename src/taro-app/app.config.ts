// app.config.ts - 应用配置文件
export default {
  // 页面路径列表
  pages: [
    'pages/index/index',
    'pages/chat/ai_digital_human',
    'pages/chat/human_consultant',
    'pages/mall/shop',
    'pages/user/member_center',
    'pages/video/training_course',
    'pages/referral/promotion',
    'pages/points/integral_mall',
    'pages/access/desktop_access'
  ],
  
  // 全局窗口配置
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ff6b6b', // 温暖的粉色系主题
    navigationBarTitleText: '心伴数字人',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5'
  },
  
  // 底部导航栏配置
  tabBar: {
    color: '#999999',
    selectedColor: '#ff6b6b',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
        text: '首页'
      },
      {
        pagePath: 'pages/chat/ai_digital_human',
        iconPath: 'assets/icons/chat.png',
        selectedIconPath: 'assets/icons/chat-active.png',
        text: 'AI咨询'
      },
      {
        pagePath: 'pages/mall/shop',
        iconPath: 'assets/icons/mall.png',
        selectedIconPath: 'assets/icons/mall-active.png',
        text: '商城'
      },
      {
        pagePath: 'pages/user/member_center',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png',
        text: '我的'
      }
    ]
  },
  
  // 网络超时配置
  networkTimeout: {
    request: 10000,
    connectSocket: 10000,
    uploadFile: 10000,
    downloadFile: 10000
  },
  
  // 调试模式
  debug: true
};
