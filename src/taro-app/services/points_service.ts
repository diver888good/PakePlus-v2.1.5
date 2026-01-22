// services/points_service.ts - 积分服务
import dayjs from 'dayjs';

interface PointsRecord {
  id: string;
  userId: string;
  action: 'consume' | 'refund' | 'referral_reward' | 'activity_bonus'; // 消费、退款、推荐奖励、活动奖励
  pointsChange: number; // 积分变化量，正数为增加，负数为减少
  balanceAfter: number; // 变化后的余额
  relatedOrderId?: string; // 关联订单ID（如果是消费或退款）
  referralUserId?: string; // 推荐人ID（如果是推荐奖励）
  createdAt: Date;
  expiresAt: Date; // 过期时间
}

interface UserPointsInfo {
  totalEarned: number; // 总获得积分
  totalUsed: number;   // 总使用积分
  available: number;   // 当前可用积分
  expired: number;     // 已过期积分
  records: PointsRecord[];
}

class PointsService {
  private static instance: PointsService;
  private pointsRecords: PointsRecord[] = [];
  
  constructor() {
    // 初始化一些示例数据
    this.initializeSampleData();
  }
  
  public static getInstance(): PointsService {
    if (!PointsService.instance) {
      PointsService.instance = new PointsService();
    }
    return PointsService.instance;
  }
  
  /**
   * 初始化示例数据
   */
  private initializeSampleData(): void {
    const now = new Date();
    
    // 示例积分记录
    this.pointsRecords = [
      {
        id: '1',
        userId: 'user001',
        action: 'consume',
        pointsChange: 9.9,
        balanceAfter: 9.9,
        createdAt: dayjs(now).subtract(5, 'days').toDate(),
        expiresAt: dayjs(now).add(365, 'days').toDate()
      },
      {
        id: '2',
        userId: 'user001',
        action: 'referral_reward',
        pointsChange: 12.5,
        balanceAfter: 22.4,
        referralUserId: 'user002',
        relatedOrderId: 'order001',
        createdAt: dayjs(now).subtract(3, 'days').toDate(),
        expiresAt: dayjs(now).add(365, 'days').toDate()
      },
      {
        id: '3',
        userId: 'user001',
        action: 'consume',
        pointsChange: -9.9,
        balanceAfter: 12.5,
        relatedOrderId: 'exchange001',
        createdAt: dayjs(now).subtract(1, 'day').toDate(),
        expiresAt: dayjs(now).add(365, 'days').toDate()
      }
    ];
  }
  
  /**
   * 获取用户积分信息
   * @param userId 用户ID
   */
  async getUserPointsInfo(userId: string): Promise<UserPointsInfo> {
    const userRecords = this.pointsRecords.filter(record => record.userId === userId);
    
    let totalEarned = 0;
    let totalUsed = 0;
    let expired = 0;
    let currentBalance = 0;
    
    const now = new Date();
    
    for (const record of userRecords) {
      if (record.expiresAt < now) {
        expired += Math.abs(record.pointsChange);
      } else {
        if (record.pointsChange > 0) {
          totalEarned += record.pointsChange;
        } else {
          totalUsed += Math.abs(record.pointsChange);
        }
        
        // 计算当前可用积分（排除已过期的）
        if (record.expiresAt >= now) {
          currentBalance = record.balanceAfter;
        }
      }
    }
    
    return {
      totalEarned,
      totalUsed,
      available: currentBalance,
      expired,
      records: userRecords.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    };
  }
  
  /**
   * 添加消费积分
   * @param userId 用户ID
   * @param orderId 订单ID
   * @param amount 消费金额（等于赠送积分数）
   */
  async addConsumePoints(userId: string, orderId: string, amount: number): Promise<void> {
    const userInfo = await this.getUserPointsInfo(userId);
    const newBalance = userInfo.available + amount;
    
    const newRecord: PointsRecord = {
      id: `point_${Date.now()}`,
      userId,
      action: 'consume',
      pointsChange: amount,
      balanceAfter: newBalance,
      relatedOrderId: orderId,
      createdAt: new Date(),
      expiresAt: dayjs(new Date()).add(365, 'day').toDate() // 默认一年有效期
    };
    
    this.pointsRecords.push(newRecord);
  }
  
  /**
   * 添加推荐奖励积分
   * @param referrerId 推荐人ID
   * @param refereeId 被推荐人ID
   * @param orderId 被推荐人产生的订单ID
   * @param rewardAmount 奖励积分数
   */
  async addReferralReward(
    referrerId: string, 
    refereeId: string, 
    orderId: string, 
    rewardAmount: number
  ): Promise<void> {
    const userInfo = await this.getUserPointsInfo(referrerId);
    const newBalance = userInfo.available + rewardAmount;
    
    const newRecord: PointsRecord = {
      id: `referral_${Date.now()}`,
      userId: referrerId,
      action: 'referral_reward',
      pointsChange: rewardAmount,
      balanceAfter: newBalance,
      referralUserId: refereeId,
      relatedOrderId: orderId,
      createdAt: new Date(),
      expiresAt: dayjs(new Date()).add(365, 'day').toDate() // 默认一年有效期
    };
    
    this.pointsRecords.push(newRecord);
  }
  
  /**
   * 使用积分兑换商品
   * @param userId 用户ID
   * @param itemId 商品ID
   * @param pointsRequired 所需积分数
   */
  async consumePoints(userId: string, itemId: string, pointsRequired: number): Promise<boolean> {
    const userInfo = await this.getUserPointsInfo(userId);
    
    if (userInfo.available < pointsRequired) {
      throw new Error(`积分不足，当前可用积分: ${userInfo.available}, 需要积分: ${pointsRequired}`);
    }
    
    const newBalance = userInfo.available - pointsRequired;
    
    const newRecord: PointsRecord = {
      id: `consume_${Date.now()}`,
      userId,
      action: 'consume',
      pointsChange: -pointsRequired,
      balanceAfter: newBalance,
      relatedOrderId: `exchange_${itemId}_${Date.now()}`,
      createdAt: new Date(),
      expiresAt: dayjs(new Date()).add(365, 'day').toDate()
    };
    
    this.pointsRecords.push(newRecord);
    return true;
  }
  
  /**
   * 获取即将过期的积分提醒
   * @param userId 用户ID
   * @param daysInAdvance 提前几天提醒，默认30天
   */
  async getExpiringPointsReminder(userId: string, daysInAdvance: number = 30): Promise<{
    expiringPoints: number;
    daysLeft: number;
    expirationDate: Date;
  }[]> {
    const now = new Date();
    const futureDate = dayjs(now).add(daysInAdvance, 'day').toDate();
    
    const userRecords = this.pointsRecords.filter(record => 
      record.userId === userId && 
      record.pointsChange > 0 && // 只考虑获得的积分
      record.expiresAt > now && // 尚未过期
      record.expiresAt <= futureDate // 在指定天数内将过期
    );
    
    const expiringPointsList = userRecords.map(record => ({
      expiringPoints: record.pointsChange,
      daysLeft: Math.ceil((record.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      expirationDate: record.expiresAt
    }));
    
    return expiringPointsList;
  }
  
  /**
   * 批量处理积分过期
   */
  async processExpiredPoints(): Promise<number> {
    const now = new Date();
    let expiredCount = 0;
    
    for (const record of this.pointsRecords) {
      if (record.expiresAt < now && record.pointsChange > 0) {
        // 标记为已过期（实际上是从可用积分中扣除）
        expiredCount++;
      }
    }
    
    return expiredCount;
  }
}

export default PointsService;
