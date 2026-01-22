// utils/excel_integration.ts - Excel数据集成工具
import dayjs from 'dayjs';

interface ExcelRecord {
  id: string;
  [key: string]: any; // 动态字段
}

class ExcelIntegration {
  private static instance: ExcelIntegration;
  
  constructor() {}
  
  public static getInstance(): ExcelIntegration {
    if (!ExcelIntegration.instance) {
      ExcelIntegration.instance = new ExcelIntegration();
    }
    return ExcelIntegration.instance;
  }
  
  /**
   * 将数据导出为CSV格式（模拟Excel）
   * @param data 数据数组
   * @param filename 文件名
   */
  exportToCSV(data: ExcelRecord[], filename: string): void {
    if (data.length === 0) {
      console.warn('没有数据可导出');
      return;
    }
    
    // 获取所有可能的字段名
    const headers = Object.keys(data[0]);
    
    // 创建CSV头部
    let csvContent = headers.join(',') + '\n';
    
    // 添加数据行
    data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      });
      csvContent += values.join(',') + '\n';
    });
    
    // 在实际应用中，这里会触发文件下载
    console.log(`CSV内容:\n${csvContent}`);
    console.log(`应下载文件: ${filename}.csv`);
  }
  
  /**
   * 模拟从Excel/CSV导入数据
   * @param fileContent CSV内容
   */
  importFromCSV(fileContent: string): ExcelRecord[] {
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const records: ExcelRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const record: ExcelRecord = {};
      
      headers.forEach((header, index) => {
        // 处理被引号包围的值
        let value = values[index]?.trim() || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1).replace(/""/g, '"');
        }
        
        // 尝试转换数字类型
        if (/^\d+(\.\d+)?$/.test(value)) {
          record[header] = parseFloat(value);
        } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
          record[header] = value.toLowerCase() === 'true';
        } else {
          record[header] = value;
        }
      });
      
      records.push(record);
    }
    
    return records;
  }
  
  /**
   * 更新会员信息表
   * @param memberId 会员ID
   * @param updates 更新的数据
   */
  async updateMemberInfo(memberId: string, updates: Partial<MemberInfo>): Promise<boolean> {
    try {
      // 这里在实际应用中会调用后端API更新Excel数据
      console.log(`更新会员信息: ID=${memberId}`, updates);
      
      // 模拟更新成功
      return true;
    } catch (error) {
      console.error('更新会员信息失败:', error);
      return false;
    }
  }
  
  /**
   * 记录消费信息到Excel
   * @param consumptionData 消费数据
   */
  async logConsumption(consumptionData: ConsumptionRecord): Promise<boolean> {
    try {
      // 这里在实际应用中会追加一行到Excel的消费记录表
      console.log('记录消费信息:', consumptionData);
      
      // 模拟记录成功
      return true;
    } catch (error) {
      console.error('记录消费信息失败:', error);
      return false;
    }
  }
  
  /**
   * 同步积分余额到Excel
   * @param userId 用户ID
   * @param points 积分变动
   * @param reason 变动原因
   */
  async syncPointsBalance(userId: string, points: number, reason: string): Promise<boolean> {
    try {
      // 这里在实际应用中会更新Excel积分表中的相应记录
      console.log(`同步积分变动: 用户=${userId}, 变动=${points}, 原因=${reason}`);
      
      // 模拟同步成功
      return true;
    } catch (error) {
      console.error('同步积分余额失败:', error);
      return false;
    }
  }
  
  /**
   * 批量处理分销佣金计算
   * @param month 月份
   * @param year 年份
   */
  async calculateCommissions(month: number, year: number): Promise<{
    processedCount: number;
    totalCommission: number;
    errors: string[];
  }> {
    try {
      // 这里在实际应用中会根据Excel中的消费记录表计算分销佣金
      console.log(`计算${year}年${month}月的分销佣金`);
      
      // 模拟计算结果
      return {
        processedCount: 15,
        totalCommission: 125.80,
        errors: []
      };
    } catch (error) {
      console.error('计算分销佣金失败:', error);
      return {
        processedCount: 0,
        totalCommission: 0,
        errors: [error.message]
      };
    }
  }
  
  /**
   * 导出推荐关系数据
   * @param startDate 开始日期
   * @param endDate 结束日期
   */
  async exportReferralData(startDate: Date, endDate: Date): Promise<ExcelRecord[]> {
    // 模拟生成推荐关系数据
    const referralData: ExcelRecord[] = [
      {
        id: 'ref_001',
        referrer_id: 'user001',
        referee_id: 'user002',
        referral_code: 'REF20260121A',
        created_at: dayjs(startDate).format('YYYY-MM-DD HH:mm:ss'),
        is_active: true
      },
      {
        id: 'ref_002',
        referrer_id: 'user001',
        referee_id: 'user003',
        referral_code: 'REF20260121B',
        created_at: dayjs(endDate).subtract(2, 'days').format('YYYY-MM-DD HH:mm:ss'),
        is_active: false
      }
    ];
    
    return referralData;
  }
  
  /**
   * 验证Excel模板结构
   * @param sheetName 工作表名称
   * @param requiredColumns 必需列
   */
  validateTemplateStructure(sheetName: string, requiredColumns: string[]): boolean {
    // 这里在实际应用中会检查Excel文件的结构是否符合预期
    console.log(`验证工作表 "${sheetName}" 的结构`, requiredColumns);
    
    // 模拟验证通过
    return true;
  }
}

// 类型定义
interface MemberInfo {
  id: string;
  name: string;
  phone: string;
  registration_date: Date;
  referral_id?: string;
  referral_code: string;
  channel: string;
}

interface ConsumptionRecord {
  order_id: string;
  member_id: string;
  amount: number;
  timestamp: Date;
  referral_points: number;
  notes: string;
}

export default ExcelIntegration;
