// services/referral_service.ts - 转介绍服务
import dayjs from 'dayjs';

interface ReferralRelationship {
  id: string;
  referrerId: string;      // 推荐人ID
  refereeId: string;       // 被推荐人ID
  referralCode: string;    // 推荐码
  createdAt: Date;         // 建立关系时间
  isActive: boolean;       // 是否激活（被推荐人完成首次消费）
}

interface ReferralCommission {
  id: string;
  referrerId: string;      // 推荐人ID
  refereeId: string;       // 被推荐人ID
  orderId: string;         // 订单ID
  orderAmount: number;     // 订单金额
  commissionRate: number;  // 佣金比例
  commissionAmount: number;// 佣金金额
  status: 'pending' | 'paid' | 'cancelled'; // 状态：待结算、已支付、已取消
  settledAt?: Date;        // 结算时间
  createdAt: Date;         // 创建时间
}

class ReferralService {
  private static instance: ReferralService;
  private relationships: ReferralRelationship[] = [];
  private commissions: ReferralCommission[] = [];
  
  constructor() {
    // 初始化一些示例数据
    this.initializeSampleData();
  }
  
  public static getInstance(): ReferralService {
    if (!ReferralService.instance) {
      ReferralService.instance = new ReferralService();
    }
    return ReferralService.instance;
  }
  
  /**
   * 初始化示例数据
   */
  private initializeSampleData(): void {
    const now = new Date();
    
    // 示例推荐关系
    this.relationships = [
      {
        id: 'rel_001',
        referrerId: 'user001',
        refereeId: 'user002',
        referralCode: 'REF20260121A',
        createdAt: dayjs(now).subtract(10, 'days').toDate(),
        isActive: true
      },
      {
        id: 'rel_002',
        referrerId: 'user001',
        refereeId: 'user003',
        referralCode: 'REF20260121B',
        createdAt: dayjs(now).subtract(5, 'days').toDate(),
        isActive: false
      }
    ];
    
    // 示例佣金记录
    this.commissions = [
      {
        id: 'comm_001',
        referrerId: 'user001',
        refereeId: 'user002',
        orderId: 'order001',
        orderAmount: 9.9,
        commissionRate: 0.08, // 8%
        commissionAmount: 0.79,
        status: 'paid',
        settledAt: dayjs(now).subtract(3, 'days').toDate(),
        createdAt: dayjs(now).subtract(4, 'days').toDate()
      }
    ];
  }
  
  /**
   * 创建推荐关系
   * @param referrerId 推荐人ID
   * @param refereeId 被推荐人ID
   * @param referralCode 推荐码
   */
  async createReferralRelationship(
    referrerId: string, 
    refereeId: string, 
    referralCode: string
  ): Promise<boolean> {
    // 检查是否已经存在推荐关系
    const existingRel = this.relationships.find(rel => rel.refereeId === refereeId);
    if (existingRel) {
      console.warn(`用户 ${refereeId} 已经有推荐人`);
      return false;
    }
    
    // 创建新的推荐关系
    const newRelationship: ReferralRelationship = {
      id: `rel_${Date.now()}`,
      referrerId,
      refereeId,
      referralCode,
      createdAt: new Date(),
      isActive: false // 初始状态为未激活，直到被推荐人完成首次消费
    };
    
    this.relationships.push(newRelationship);
    return true;
  }
  
  /**
   * 激活推荐关系（当被推荐人完成首次消费时）
   * @param refereeId 被推荐人ID
   */
  async activateReferralRelationship(refereeId: string): Promise<boolean> {
    const relationship = this.relationships.find(rel => rel.refereeId === refereeId);
    if (!relationship) {
      console.error(`找不到用户 ${refereeId} 的推荐关系`);
      return false;
    }
    
    if (relationship.isActive) {
      console.log(`用户 ${refereeId} 的推荐关系已经是激活状态`);
      return true;
    }
    
    relationship.isActive = true;
    return true;
  }
  
  /**
   * 根据推荐码查找推荐人
   * @param referralCode 推荐码
   */
  async findReferrerByCode(referralCode: string): Promise<string | null> {
    const relationship = this.relationships.find(rel => 
      rel.referralCode === referralCode && !this.isExpired(rel.createdAt)
    );
    
    return relationship ? relationship.referrerId : null;
  }
  
  /**
   * 处理被推荐人的消费并计算推荐奖励
   * @param refereeId 被推荐人ID
   * @param orderId 订单ID
   * @param orderAmount 订单金额
   * @param commissionRate 佣金比例，默认8%
   */
  async processReferralCommission(
    refereeId: string, 
    orderId: string, 
    orderAmount: number,
    commissionRate: number = 0.08
  ): Promise<boolean> {
    // 查找推荐关系
    const relationship = this.relationships.find(rel => rel.refereeId === refereeId);
    if (!relationship || !relationship.isActive) {
      console.log(`用户 ${refereeId} 没有有效的推荐关系或尚未激活`);
      return false;
    }
    
    // 计算佣金
    const commissionAmount = orderAmount * commissionRate;
    
    // 创建佣金记录
    const newCommission: ReferralCommission = {
      id: `comm_${Date.now()}`,
      referrerId: relationship.referrerId,
      refereeId,
      orderId,
      orderAmount,
      commissionRate,
      commissionAmount,
      status: 'pending', // 待结算状态
      createdAt: new Date()
    };
    
    this.commissions.push(newCommission);
    
    // 这里可以触发积分奖励或其他通知
    console.log(`为推荐人 ${relationship.referrerId} 添加了 ${commissionAmount} 元的推荐奖励`);
    
    return true;
  }
  
  /**
   * 获取用户的推荐统计信息
   * @param userId 用户ID
   */
  async getUserReferralStats(userId: string): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    relationships: ReferralRelationship[];
  }> {
    // 获取该用户作为推荐人的所有关系
    const userRelationships = this.relationships.filter(rel => rel.referrerId === userId);
    
    // 统计各种指标
    let totalReferrals = userRelationships.length;
    let activeReferrals = userRelationships.filter(rel => rel.isActive).length;
    
    // 获取该用户的佣金记录
    const userCommissions = this.commissions.filter(comm => comm.referrerId === userId);
    
    let totalCommissions = 0;
    let pendingCommissions = 0;
    let paidCommissions = 0;
    
    for (const comm of userCommissions) {
      totalCommissions += comm.commissionAmount;
      
      switch (comm.status) {
        case 'pending':
          pendingCommissions += comm.commissionAmount;
          break;
        case 'paid':
          paidCommissions += comm.commissionAmount;
          break;
      }
    }
    
    return {
      totalReferrals,
      activeReferrals,
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      relationships: userRelationships
    };
  }
  
  /**
   * 获取用户的所有推荐链接和二维码
   * @param userId 用户ID
   */
  async getUserReferralLinks(userId: string): Promise<{
    referralCode: string;
    referralUrl: string;
    qrCodeUrl: string;
  }[]> {
    const userRelationships = this.relationships.filter(rel => rel.referrerId === userId);
    
    return userRelationships.map(rel => ({
      referralCode: rel.referralCode,
      referralUrl: `https://yourapp.com/register?ref=${rel.referralCode}`,
      qrCodeUrl: `/api/qrcode?text=https://yourapp.com/register?ref=${rel.referralCode}`
    }));
  }
  
  /**
   * 检查关系是否过期（例如，如果超过一年没有活动）
   * @param createdAt 关系创建时间
   */
  private isExpired(createdAt: Date): boolean {
    const now = new Date();
    const diffInDays = dayjs(now).diff(dayjs(createdAt), 'day');
    return diffInDays > 365; // 假设一年后过期
  }
  
  /**
   * 批量结算佣金
   * @param month 结算月份
   * @param year 结算年份
   */
  async batchSettleCommissions(month: number, year: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    // 找到指定月份内符合条件的待结算佣金
    const pendingCommissions = this.commissions.filter(comm => 
      comm.status === 'pending' &&
      comm.createdAt >= startOfMonth &&
      comm.createdAt <= endOfMonth
    );
    
    let settledCount = 0;
    
    for (const commission of pendingCommissions) {
      // 实际业务中这里会调用支付接口进行结算
      commission.status = 'paid';
      commission.settledAt = new Date();
      settledCount++;
    }
    
    return settledCount;
  }
}

export default ReferralService;
