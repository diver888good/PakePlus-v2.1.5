// utils/qrcode_generator.ts - 草料二维码生成工具
import CryptoJS from 'crypto-js';

interface QRCodeConfig {
  userId: string;
  referralCode?: string;
  redirectUrl: string;
  logo?: string;
  size?: number;
  margin?: number;
}

class QRCodeGenerator {
  private baseUrl: string = 'https://qr.cli.im/';
  
  /**
   * 生成专属推广二维码
   * @param config 配置参数
   */
  static generateReferralQRCode(config: QRCodeConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // 构造带参URL，包含用户ID和推荐码
        let url = `${config.redirectUrl}?uid=${encodeURIComponent(config.userId)}`;
        if (config.referralCode) {
          url += `&ref=${encodeURIComponent(config.referralCode)}`;
        }
        
        // 这里模拟调用草料二维码API
        // 实际应用中需要替换为真实的API调用
        const qrcodeData = this.createMockQRCode(url);
        
        resolve(qrcodeData);
      } catch (error) {
        console.error('生成二维码失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 创建模拟二维码数据
   * @param url 目标URL
   */
  private static createMockQRCode(url: string): string {
    // 在实际应用中，这里会调用草料二维码的API
    // 返回二维码图片的base64编码或URL
    return `mock_qr_code_data_for_${url}`;
  }

  /**
   * 解析二维码内容
   * @param qrContent 二维码解析后的内容
   */
  static parseQRContent(qrContent: string): {userId: string, referralCode?: string} {
    try {
      // 检查是否是带有参数的URL
      if (qrContent.startsWith('http')) {
        const url = new URL(qrContent);
        const params = new URLSearchParams(url.search);
        return {
          userId: params.get('uid') || '',
          referralCode: params.get('ref') || undefined
        };
      }
      
      // 如果是纯字符串，则认为是推荐码
      return {
        userId: '',
        referralCode: qrContent
      };
    } catch (error) {
      console.error('解析二维码内容失败:', error);
      return { userId: '', referralCode: undefined };
    }
  }

  /**
   * 生成安全的推荐链接
   * @param targetUserId 被推荐用户的ID
   * @param referrerId 推荐人ID
   * @param timestamp 时间戳
   * @param signature 签名
   */
  static generateSecureReferralLink(
    targetUserId: string, 
    referrerId: string, 
    timestamp: number,
    secretKey: string
  ): string {
    // 创建签名
    const dataToSign = `${targetUserId}${referrerId}${timestamp}`;
    const signature = CryptoJS.HmacSHA256(dataToSign, secretKey).toString();
    
    // 构造安全的推荐链接
    const link = `https://yourapp.com/register?target_uid=${targetUserId}&ref=${referrerId}&ts=${timestamp}&sig=${signature}`;
    
    return link;
  }

  /**
   * 验证推荐链接的安全性
   * @param link 推荐链接
   * @param secretKey 密钥
   */
  static verifyReferralLink(link: string, secretKey: string): boolean {
    try {
      const url = new URL(link);
      const params = new URLSearchParams(url.search);
      
      const targetUid = params.get('target_uid');
      const ref = params.get('ref');
      const ts = params.get('ts');
      const sig = params.get('sig');
      
      if (!targetUid || !ref || !ts || !sig) {
        return false;
      }
      
      // 验证时间戳（防止重放攻击）
      const now = Date.now();
      const linkTime = parseInt(ts);
      if (now - linkTime > 24 * 60 * 60 * 1000) { // 24小时内有效
        return false;
      }
      
      // 验证签名
      const expectedData = `${targetUid}${ref}${ts}`;
      const expectedSig = CryptoJS.HmacSHA256(expectedData, secretKey).toString();
      
      return expectedSig === sig;
    } catch (error) {
      console.error('验证推荐链接失败:', error);
      return false;
    }
  }
}

export default QRCodeGenerator;
