// services/qrcode_service.ts - 二维码服务
import QRCodeGenerator from '../utils/qrcode_generator';

interface QRCodeRequest {
  text: string;           // 要编码的文本内容
  size?: number;          // 二维码大小，默认200
  margin?: number;        // 边距，默认1
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'; // 容错级别
  logo?: string;          // 中间logo图片URL
  background?: string;    // 背景颜色
  foreground?: string;    // 前景色
}

interface QRCodeResponse {
  success: boolean;
  data?: string;         // 二维码数据（可能是base64或URL）
  message?: string;      // 错误信息
}

class QRCodeService {
  private static instance: QRCodeService;
  
  constructor() {}
  
  public static getInstance(): QRCodeService {
    if (!QRCodeService.instance) {
      QRCodeService.instance = new QRCodeService();
    }
    return QRCodeService.instance;
  }
  
  /**
   * 生成普通二维码
   * @param request 二维码请求参数
   */
  async generateQRCode(request: QRCodeRequest): Promise<QRCodeResponse> {
    try {
      // 这里在实际应用中会调用真实的二维码生成API
      // 目前返回模拟数据
      
      const {
        text,
        size = 200,
        margin = 1,
        errorCorrection = 'M',
        logo,
        background = '#FFFFFF',
        foreground = '#000000'
      } = request;
      
      // 模拟生成二维码数据
      const qrcodeData = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAABjJJREFUeJzt3W+IVXUYx/H3Z5lTc8qFhYgiyA9RkIugL6KILrooqKsuuiioiwiiiy76IboIIrsIKLpoEdFFEEVBEF0EUVQQQUVEUUFEUEEQEfVDURTFfLvobDM7szOzzjmP53keuDxznnOec+/znvuc55znnPtERGBmZitpVe8AzMysegeRmVkFB5GZWQUHkZlZBQeRmVmFeQ+iJPmtJMck+bIkuyTZs8/5SyT5vyTbJ/lhkldK8nCSaybMZzMHHUSrgeeBjcDmwNbAkyX5NLAvcCtwCHBsyfwTwPHALsBOwMPAjhNmsykDD6Ik+wBHAXdFxEMRsTYiNgDXAVuVzDsJeCAibouIJyPiReBY4MiIGImIx4GNwKYlz2aTBhlEOwBHAneV2Lsk2QDYHni+pG0DTCtpuwLPlozbAW8Da0raPsCDEXFHSdsIXFTybDbpZYMIeBPYuUTWAbsBTwObATOAzcryFsBbwPYlbTvglZK2LfBsSdoWeLkkbQM8XJK2AZ4oSdsAT5SkLYGHStIswENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb4ZwENlvhnAQ2W+GcBDZb......`; // 实际应用中会是真实的二维码数据
      
      return {
        success: true,
        data: qrcodeData
      };
    } catch (error) {
      console.error('生成二维码失败:', error);
      return {
        success: false,
        message: '生成二维码失败'
      };
    }
  }
  
  /**
   * 生成带参数的推广二维码（用于转介绍）
   * @param userId 用户ID
   * @param referralCode 推荐码
   */
  async generateReferralQRCode(userId: string, referralCode?: string): Promise<QRCodeResponse> {
    try {
      // 构造推广链接
      let url = `https://yourapp.com/register?uid=${encodeURIComponent(userId)}`;
      if (referralCode) {
        url += `&ref=${encodeURIComponent(referralCode)}`;
      }
      
      // 使用工具类生成二维码
      const qrcodeData = QRCodeGenerator.generateReferralQRCode({
        userId,
        referralCode,
        redirectUrl: url,
        size: 200,
        margin: 1
      });
      
      return {
        success: true,
        data: qrcodeData as string
      };
    } catch (error) {
      console.error('生成推荐二维码失败:', error);
      return {
        success: false,
        message: '生成推荐二维码失败'
      };
    }
  }
  
  /**
   * 解析二维码内容
   * @param imageData 二维码图片数据
   */
  async parseQRCode(imageData: string): Promise<{success: boolean; content?: string; message?: string}> {
    try {
      // 这里在实际应用中会使用二维码解析库来解析图片
      // 目前返回模拟结果
      
      // 模拟解析结果
      const parsedContent = "https://yourapp.com/register?uid=user001&ref=REF20260121";
      
      return {
        success: true,
        content: parsedContent
      };
    } catch (error) {
      console.error('解析二维码失败:', error);
      return {
        success: false,
        message: '解析二维码失败'
      };
    }
  }
  
  /**
   * 处理用户扫码注册
   * @param scannedContent 扫描到的内容
   */
  async handleUserRegistration(scannedContent: string): Promise<{
    success: boolean;
    newUserId?: string;
    referrerId?: string;
    message?: string;
  }> {
    try {
      // 解析扫描内容
      const parsedResult = QRCodeGenerator.parseQRContent(scannedContent);
      
      // 如果有推荐码，记录推荐关系
      if (parsedResult.referralCode) {
        // 在实际应用中，这里会调用ReferralService创建推荐关系
        console.log(`检测到推荐码: ${parsedResult.referralCode}`);
        
        // 创建新用户并建立推荐关系
        const newUserUuid = `user_${Date.now()}`; // 模拟用户ID
        
        // 返回成功结果
        return {
          success: true,
          newUserId: newUserUuid,
          referrerId: parsedResult.referralCode.replace('REF', 'user'), // 简化的推导逻辑
          message: '用户注册成功，并建立了推荐关系'
        };
      } else {
        // 普通注册流程
        const newUserUuid = `user_${Date.now()}`;
        
        return {
          success: true,
          newUserId: newUserUuid,
          message: '用户注册成功'
        };
      }
    } catch (error) {
      console.error('处理用户注册失败:', error);
      return {
        success: false,
        message: '处理用户注册失败'
      };
    }
  }
  
  /**
   * 生成桌面快捷方式二维码（针对电脑端应用）
   * @param appUrl 应用URL或协议
   */
  async generateDesktopShortcutQR(appUrl: string): Promise<QRCodeResponse> {
    try {
      // 对于电脑端应用，可以生成一个特殊的URI协议链接
      // 如 craft://open?ref=xxx 或直接是一个远程访问链接
      const shortcutUrl = appUrl.startsWith('http') ? appUrl : `craft://${appUrl}`;
      
      const qrcodeData = await this.generateQRCode({
        text: shortcutUrl,
        size: 300,
        margin: 2
      });
      
      return qrcodeData;
    } catch (error) {
      console.error('生成桌面快捷方式二维码失败:', error);
      return {
        success: false,
        message: '生成桌面快捷方式二维码失败'
      };
    }
  }
}

export default QRCodeService;
