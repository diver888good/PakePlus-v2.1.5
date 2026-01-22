// services/api_service.ts - API服务
import PointsService from './points_service';
import ReferralService from './referral_service';
import QRCodeService from './qrcode_service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private static instance: ApiService;
  private pointsService: PointsService;
  private referralService: ReferralService;
  private qrcodeService: QRCodeService;

  constructor() {
    this.pointsService = PointsService.getInstance();
    this.referralService = ReferralService.getInstance();
    this.qrcodeService = QRCodeService.getInstance();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * 用户注册接口
   */
  async registerUser(userData: {
    name: string;
    phone: string;
    referralCode?: string;
  }): Promise<ApiResponse<{userId: string; token: string}>> {
    try {
      // 检查推荐码是否存在
      let referrerId: string | null = null;
      if (userData.referralCode) {
        referrerId = await this.referralService.findReferrerByCode(userData.referralCode);
        if (!referrerId) {
          return { success: false, error: '推荐码无效' };
        }
      }

      // 创建用户（模拟）
      const userId = `user_${Date.now()}`;
      
      // 如果有推荐码，建立推荐关系
      if (referrerId) {
        await this.referralService.createReferralRelationship(referrerId, userId, userData.referralCode!);
      }

      // 返回用户信息
      return {
        success: true,
        data: {
          userId,
          token: `token_${Date.now()}`
        },
        message: '注册成功'
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        success: false,
        error: '注册失败'
      };
    }
  }

  /**
   * 用户登录接口
   */
  async loginUser(credentials: {
    phone: string;
    password?: string;
  }): Promise<ApiResponse<{userId: string; token: string; userInfo: any}>> {
    try {
      // 模拟用户验证
      const isValid = credentials.phone.length === 11; // 简单验证
      
      if (!isValid) {
        return { success: false, error: '手机号格式错误' };
      }

      // 获取用户积分信息
      const pointsInfo = await this.pointsService.getUserPointsInfo(`user_${credentials.phone}`);

      return {
        success: true,
        data: {
          userId: `user_${credentials.phone}`,
          token: `token_${Date.now()}`,
          userInfo: {
            id: `user_${credentials.phone}`,
            phone: credentials.phone,
            nickname: `用户_${credentials.phone.slice(-4)}`,
            level: '普通会员',
            availablePoints: pointsInfo.available,
            totalConsumption: 0
          }
        },
        message: '登录成功'
      };
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: '登录失败'
      };
    }
  }

  /**
   * 处理消费并增加积分
   */
  async processPurchase(orderData: {
    userId: string;
    orderId: string;
    amount: number;
    isReferralOrder?: boolean;
    referrerId?: string;
  }): Promise<ApiResponse<any>> {
    try {
      // 添加消费积分
      await this.pointsService.addConsumePoints(
        orderData.userId, 
        orderData.orderId, 
        orderData.amount
      );

      // 如果是推荐订单，给推荐人添加奖励积分
      if (orderData.isReferralOrder && orderData.referrerId) {
        await this.pointsService.addReferralReward(
          orderData.referrerId,
          orderData.userId,
          orderData.orderId,
          orderData.amount * 0.08 // 8%的推荐奖励
        );
      }

      return {
        success: true,
        message: '消费记录和积分已更新'
      };
    } catch (error) {
      console.error('处理消费失败:', error);
      return {
        success: false,
        error: '处理消费失败'
      };
    }
  }

  /**
   * 获取用户积分信息
   */
  async getUserPoints(userId: string): Promise<ApiResponse<any>> {
    try {
      const pointsInfo = await this.pointsService.getUserPointsInfo(userId);

      // 获取即将过期的积分提醒
      const expiringPoints = await this.pointsService.getExpiringPointsReminder(userId);

      return {
        success: true,
        data: {
          ...pointsInfo,
          expiringPoints
        }
      };
    } catch (error) {
      console.error('获取积分信息失败:', error);
      return {
        success: false,
        error: '获取积分信息失败'
      };
    }
  }

  /**
   * 使用积分兑换商品
   */
  async exchangePoints(exchangeData: {
    userId: string;
    itemId: string;
    pointsRequired: number;
  }): Promise<ApiResponse<any>> {
    try {
      const result = await this.pointsService.consumePoints(
        exchangeData.userId,
        exchangeData.itemId,
        exchangeData.pointsRequired
      );

      if (result) {
        return {
          success: true,
          message: '积分兑换成功'
        };
      } else {
        return {
          success: false,
          error: '积分兑换失败'
        };
      }
    } catch (error) {
      console.error('积分兑换失败:', error);
      return {
        success: false,
        error: error.message || '积分兑换失败'
      };
    }
  }

  /**
   * 获取用户推荐统计
   */
  async getUserReferralStats(userId: string): Promise<ApiResponse<any>> {
    try {
      const stats = await this.referralService.getUserReferralStats(userId);

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('获取推荐统计失败:', error);
      return {
        success: false,
        error: '获取推荐统计失败'
      };
    }
  }

  /**
   * 生成推广二维码
   */
  async generateReferralQRCode(userId: string): Promise<ApiResponse<{qrCodeUrl: string; referralCode: string}>> {
    try {
      // 在实际应用中，这里会生成唯一的推荐码
      const referralCode = `REF${Date.now().toString().substr(5)}`;
      
      // 生成二维码
      const qrResult = await this.qrcodeService.generateReferralQRCode(userId, referralCode);
      
      if (!qrResult.success) {
        return {
          success: false,
          error: '生成二维码失败'
        };
      }

      return {
        success: true,
        data: {
          qrCodeUrl: qrResult.data!,
          referralCode
        }
      };
    } catch (error) {
      console.error('生成推广二维码失败:', error);
      return {
        success: false,
        error: '生成推广二维码失败'
      };
    }
  }

  /**
   * 获取推荐链接列表
   */
  async getReferralLinks(userId: string): Promise<ApiResponse<any[]>> {
    try {
      const links = await this.referralService.getUserReferralLinks(userId);

      return {
        success: true,
        data: links
      };
    } catch (error) {
      console.error('获取推荐链接失败:', error);
      return {
        success: false,
        error: '获取推荐链接失败'
      };
    }
  }

  /**
   * 扫码注册处理
   */
  async handleScanRegistration(scannedContent: string): Promise<ApiResponse<any>> {
    try {
      const result = await this.qrcodeService.handleUserRegistration(scannedContent);

      if (result.success) {
        return {
          success: true,
          data: {
            newUserId: result.newUserId,
            referrerId: result.referrerId
          },
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.message
        };
      }
    } catch (error) {
      console.error('处理扫码注册失败:', error);
      return {
        success: false,
        error: '处理扫码注册失败'
      };
    }
  }

  /**
   * 获取商城商品列表
   */
  async getProductList(params?: {
    category?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<any[]>> {
    try {
      // 模拟商品数据
      const products = [
        {
          id: 'course_1',
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
          id: 'product_1',
          title: '正念冥想入门套装',
          desc: '冥想垫+引导音频+说明书，助您开始正念之旅',
          price: 89,
          type: 'physical',
          category: '实物',
          image: '/assets/images/product-meditation.jpg',
          sales: 543,
          rating: 4.6
        }
      ];

      return {
        success: true,
        data: products
      };
    } catch (error) {
      console.error('获取商品列表失败:', error);
      return {
        success: false,
        error: '获取商品列表失败'
      };
    }
  }

  /**
   * 获取视频模板列表
   */
  async getVideoTemplates(): Promise<ApiResponse<any[]>> {
    try {
      // 模拟视频模板数据
      const templates = [
        {
          id: 'temp_1',
          title: '心理健康小贴士',
          category: '心理科普',
          thumbnail: '/assets/images/thumb_mental_health.jpg',
          duration: '0:30',
          views: 12500
        },
        {
          id: 'temp_2',
          title: '情绪管理技巧',
          category: '情绪调节',
          thumbnail: '/assets/images/thumb_emotion.jpg',
          duration: '1:15',
          views: 8900
        }
      ];

      return {
        success: true,
        data: templates
      };
    } catch (error) {
      console.error('获取视频模板失败:', error);
      return {
        success: false,
        error: '获取视频模板失败'
      };
    }
  }
}

export default ApiService;
