# 会员体系（优化：分级权限+专属方法+升级/降级机制+联盟商家入场退场）
import datetime
import qrcode
from PyQt6.QtWidgets import QMessageBox
from config import CONFIG_REMOTE
from db_operate import db


class MemberSystem:
    def __init__(self, username, member_type="消费者"):
        self.username = username
        # 会员类型：默认消费者，可选【消费者、消费商、联盟商家】
        self.member_type = member_type
        self.points = 0
        self.coupons = []
        self.vouchers = []
        # 会员有效期（默认1年，升级/续费后刷新）
        self.valid_until = datetime.datetime.now() + datetime.timedelta(days=365)
        # 消费商专属：推广数据
        self.promote_data = {
            "promote_qrcode": "",  # 个人推广二维码
            "promote_count": 0,    # 推广成功人数
            "commission": 0.0,     # 推广佣金
            "monthly_promote": [0,0,0],  # 近3个月推广人数（用于业绩校验）
            "monthly_commission": [0.0,0.0,0.0]  # 近3个月佣金（用于业绩校验）
        }
        # 联盟商家专属：店铺信息
        self.shop_info = {
            "shop_name": "",       # 店铺名称
            "shop_id": "",         # 店铺ID
            "goods_list": [],      # 上架商品列表
            "service_list": [],    # 上架服务列表
            "order_count": 0,      # 订单数量
            "monthly_orders": [0,0,0],  # 近3个月订单数（用于运营校验）
            "fund_account": 0.0,   # 商家专属资金账户余额
            "deposit": 0.0,        # 保证金（100元）
            "qualification": {},   # 商家资质信息（营业执照、法人身份证等）
            "operation_status": "normal"  # 运营状态：normal（正常）、warning（预警）、frozen（冻结）
        }
        # 违规记录（用于降级、被动退场校验）
        self.violation_records = []
        # 入场退场相关记录
        self.entry_exit_records = []
        # 初始化积分（不同会员初始积分不同）
        self.init_points()

    def init_points(self):
        """初始化不同会员的初始积分"""
        if self.member_type == "消费者":
            self.points = 100  # 基础初始积分
        elif self.member_type == "消费商":
            self.points = 200  # 消费商初始积分更高
        elif self.member_type == "联盟商家":
            self.points = 300  # 商家初始积分最高，用于前期运营

    def add_points(self, amount):
        """增加积分（不同会员额外奖励不同）"""
        extra_points = 0
        if self.member_type == "消费商":
            extra_points = int(amount * 0.2)  # 消费商积分额外+20%
        elif self.member_type == "联盟商家":
            extra_points = int(amount * 0.1)  # 商家积分额外+10%
        self.points += (amount + extra_points)
        db.add_behavior_record(self.username, "积分增加", f"新增积分{amount}，额外奖励{extra_points}，当前积分{self.points}")
        print(f"{self.username}（{self.member_type}）新增积分：{amount+extra_points}，当前积分：{self.points}")

    def create_coupon(self, value, valid_days=7):
        """创建消费券（联盟商家可创建店铺专属消费券）"""
        from datetime import datetime, timedelta
        coupon = {
            "id": f"coupon_{int(datetime.datetime.now().timestamp())}",
            "value": value,
            "create_time": datetime.now(),
            "expire_time": datetime.now() + timedelta(days=valid_days),
            "used": False,
            "shop_id": self.shop_info["shop_id"] if self.member_type == "联盟商家" else ""  # 商家专属券关联店铺
        }
        self.coupons.append(coupon)
        record_content = f"领取{value}元消费券，有效期{valid_days}天"
        if self.member_type == "联盟商家":
            record_content += f"（店铺专属：{self.shop_info['shop_name']}）"
        db.add_behavior_record(self.username, "领取消费券", record_content)
        return coupon

    def create_voucher(self, value, valid_days=15):
        """创建代金券（消费商可获得推广专属代金券）"""
        from datetime import datetime, timedelta
        voucher = {
            "id": f"voucher_{int(datetime.datetime.now().timestamp())}",
            "value": value,
            "create_time": datetime.now(),
            "expire_time": datetime.now() + timedelta(days=valid_days),
            "used": False,
            "withdrawn": False,
            "is_promote": True if self.member_type == "消费商" else False  # 消费商专属推广代金券
        }
        self.vouchers.append(voucher)
        record_content = f"领取{value}元代金券，有效期{valid_days}天"
        if self.member_type == "消费商":
            record_content += "（推广专属，可用于抵扣推广服务费）"
        db.add_behavior_record(self.username, "领取代金券", record_content)
        return voucher

    # ---------------------- 消费商专属方法 ----------------------
    def generate_promote_qrcode(self):
        """生成个人推广二维码（消费商专属）"""
        if self.member_type != "消费商":
            return "仅消费商可生成推广二维码，请升级会员类型！"
        # 生成推广二维码（关联用户名，用于统计推广数据）
        promote_url = f"https://{CONFIG_REMOTE['花生壳_DOMAIN']}/promote?username={self.username}"
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=8, border=4)
        qr.add_data(promote_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#ff7d00", back_color="white")  # 消费商专属橙色二维码
        qrcode_path = f"./promote_qrcode_{self.username}.png"
        img.save(qrcode_path)
        self.promote_data["promote_qrcode"] = qrcode_path
        db.add_behavior_record(self.username, "生成推广二维码", f"消费商{self.username}生成个人推广二维码")
        return qrcode_path

    def add_promote_count(self, amount=1):
        """增加推广成功人数（消费商专属），同步更新月度数据"""
        if self.member_type != "消费商":
            return "仅消费商可累计推广人数！"
        self.promote_data["promote_count"] += amount
        # 更新近3个月推广数据（移除最早一个月，新增当前月）
        current_month = datetime.datetime.now().month - 1
        self.promote_data["monthly_promote"].pop(0)
        self.promote_data["monthly_promote"].append(amount)
        # 推广成功奖励佣金（每推广1人奖励5元）
        commission_reward = amount * 5
        self.promote_data["commission"] += commission_reward
        # 更新近3个月佣金数据
        self.promote_data["monthly_commission"].pop(0)
        self.promote_data["monthly_commission"].append(commission_reward)
        self.add_points(10 * amount)  # 推广1人额外奖励10积分
        db.add_behavior_record(self.username, "推广成功", f"推广成功{amount}人，新增佣金{commission_reward}元，累计推广{self.promote_data['promote_count']}人")
        # 校验是否满足免费升级条件
        self.check_promoter_upgrade_qualification()
        return self.promote_data

    # ---------------------- 联盟商家专属方法 ----------------------
    def check_merchant_qualification(self, qualification):
        """联盟商家入场资质校验（入场必备）"""
        """
        :param qualification: 资质字典，包含business_license（营业执照）、id_card（法人身份证）、industry_license（行业许可证）
        :return: 校验结果（成功/失败原因）
        """
        if not all([qualification.get("business_license"), qualification.get("id_card")]):
            return "资质校验失败：营业执照、法人身份证为必备材料，缺一不可！"
        # 模拟资质真实性校验（对接第三方资质校验接口预留）
        import re
        if not re.match(r"^[0-9a-zA-Z]{15,20}$", qualification["business_license"]):
            return "资质校验失败：营业执照编号格式不正确，请提交真实有效的营业执照！"
        if not re.match(r"^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$", qualification["id_card"]):
            return "资质校验失败：法人身份证号码格式不正确，请提交真实有效的身份证！"
        # 行业许可证校验（非所有行业必备，可选）
        if qualification.get("industry_license") and not re.match(r"^[0-9a-zA-Z]{10,15}$", qualification["industry_license"]):
            return "资质校验失败：行业许可证编号格式不正确，请提交真实有效的行业许可证！"
        # 校验通过，保存资质信息
        self.shop_info["qualification"] = qualification
        db.add_behavior_record(self.username, "联盟商家资质校验", f"商家{self.username}资质校验通过，可完成入场流程")
        return "资质校验成功，可继续办理联盟商家入场手续！"

    def pay_merchant_deposit(self, amount=100):
        """缴纳联盟商家保证金（入场必备）"""
        if self.member_type != "联盟商家" and self.member_type != "消费者" and self.member_type != "消费商":
            return "仅平台会员可缴纳联盟商家保证金，請先注册会员！"
        if amount != 100:
            return "保证金缴纳失败：联盟商家保证金标准为100元，不可多缴或少缴！"
        # 对接支付接口（预留），模拟支付成功
        self.shop_info["deposit"] = amount
        db.add_behavior_record(self.username, "缴纳保证金", f"商家{self.username}缴纳联盟商家保证金100元")
        return "保证金缴纳成功，已到账！"

    def create_shop(self, shop_name, shop_type):
        """创建店铺（联盟商家专属）"""
        if self.member_type != "联盟商家":
            return "仅联盟商家可创建店铺，请升级会员类型并完成入场流程！"
        if not self.shop_info["qualification"]:
            return "店铺创建失败：请先完成资质校验，再创建店铺！"
        if not self.shop_info["deposit"]:
            return "店铺创建失败：请先缴纳保证金，再创建店铺！"
        self.shop_info["shop_name"] = shop_name
        self.shop_info["shop_id"] = f"shop_{int(datetime.datetime.now().timestamp())}"
        self.shop_info["operation_status"] = "normal"
        db.add_behavior_record(self.username, "创建店铺", f"联盟商家{self.username}创建店铺：{shop_name}（ID：{self.shop_info['shop_id']}）")
        # 记录入场完成
        self.entry_exit_records.append({
            "type": "entry",
            "way": "upgrade" if self.member_type == "联盟商家" else "direct",
            "time": datetime.datetime.now(),
            "status": "success"
        })
        return self.shop_info

    def add_goods(self, goods_name, price, goods_desc):
        """上架商品（联盟商家专属）"""
        if self.member_type != "联盟商家":
            return "仅联盟商家可上架商品！"
        if not self.shop_info["shop_id"]:
            return "请先创建店铺，再上架商品！"
        if self.shop_info["operation_status"] == "frozen":
            return "店铺运营状态异常（已冻结），无法上架商品，请联系平台解封！"
        goods = {
            "goods_id": f"goods_{int(datetime.datetime.now().timestamp())}",
            "goods_name": goods_name,
            "price": price,
            "goods_desc": goods_desc,
            "shop_id": self.shop_info["shop_id"],
            "shop_name": self.shop_info["shop_name"],
            "create_time": datetime.datetime.now(),
            "sales_count": 0
        }
        self.shop_info["goods_list"].append(goods)
        db.add_behavior_record(self.username, "上架商品", f"店铺{self.shop_info['shop_name']}上架商品：{goods_name}（{price}元）")
        return goods

    def add_service(self, service_name, price, service_desc):
        """上架服务（联盟商家专属）"""
        if self.member_type != "联盟商家":
            return "仅联盟商家可上架服务！"
        if not self.shop_info["shop_id"]:
            return "请先创建店铺，再上架服务！"
        if self.shop_info["operation_status"] == "frozen":
            return "店铺运营状态异常（已冻结），无法上架服务，请联系平台解封！"
        service = {
            "service_id": f"service_{int(datetime.datetime.now().timestamp())}",
            "service_name": service_name,
            "price": price,
            "service_desc": service_desc,
            "shop_id": self.shop_info["shop_id"],
            "shop_name": self.shop_info["shop_name"],
            "create_time": datetime.datetime.now(),
            "order_count": 0
        }
        self.shop_info["service_list"].append(service)
        db.add_behavior_record(self.username, "上架服务", f"店铺{self.shop_info['shop_name']}上架服务：{service_name}（{price}元）")
        return service

    def add_order_count(self, amount=1):
        """增加订单数量（联盟商家专属），同步更新月度数据"""
        if self.member_type != "联盟商家":
            return "仅联盟商家可累计订单数量！"
        self.shop_info["order_count"] += amount
        # 更新近3个月订单数据
        self.shop_info["monthly_orders"].pop(0)
        self.shop_info["monthly_orders"].append(amount)
        # 校验运营达标情况，避免降级/被动退场
        self.check_merchant_operation_qualification()
        return self.shop_info["order_count"]

    def active_exit_merchant(self, reason="自愿申请"):
        """联盟商家主动退场（核心方法）"""
        if self.member_type != "联盟商家":
            return "仅联盟商家可申请主动退场！"
        # 校验退场条件：无未处理违规、无未结算订单
        if self.has_violation_unresolved():
            return "退场失败：存在未处理的违规记录，请先完成整改！"
        if self.shop_info["order_count"] > sum(self.shop_info["monthly_orders"]):
            return "退场失败：存在未结算的交易订单，请处理完毕后再申请！"
        
        # 1. 权限回收、店铺处理
        self.shop_info["operation_status"] = "frozen"
        self.shop_info["goods_list"] = []  # 下架所有商品
        self.shop_info["service_list"] = []  # 下架所有服务
        
        # 2. 资金结算：退还保证金（无违规）、结算账户余额
        penalty = 0
        for violation in self.violation_records:
            if violation["resolved"] is False:
                penalty += 50  # 未处理违规，每项扣除50元罚款（示例）
        refund_deposit = self.shop_info["deposit"] - penalty
        final_fund = self.shop_info["fund_account"] + refund_deposit
        
        # 3. 更新会员类型、记录退场信息
        self.member_type = "消费者"
        self.init_points()
        self.entry_exit_records.append({
            "type": "exit",
            "way": "active",
            "reason": reason,
            "time": datetime.datetime.now(),
            "fund_settlement": final_fund,
            "status": "success"
        })
        
        # 4. 记录行为、发送通知
        db.add_behavior_record(self.username, "联盟商家主动退场", f"商家{self.username}自愿申请退场，原因：{reason}，资金结算：{final_fund}元")
        QMessageBox.information(None, "退场成功", f"恭喜你已完成联盟商家主动退场！\n资金结算：{final_fund}元（3个工作日内到账）\n店铺信息保留6个月，6个月内可重新申请入驻。")
        return f"主动退场成功，资金结算{final_fund}元，会员类型已降为消费者。"

    def passive_exit_merchant(self, reason):
        """联盟商家被动退场（核心方法，强制清退）"""
        if self.member_type != "联盟商家":
            return "仅联盟商家可触发被动退场！"
        
        # 1. 权限回收、店铺冻结
        self.shop_info["operation_status"] = "frozen"
        self.shop_info["goods_list"] = []
        self.shop_info["service_list"] = []
        
        # 2. 资金结算：扣除罚款、结算余额（严重违规没收保证金）
        penalty = 100 if "严重违规" in reason else 0
        for violation in self.violation_records:
            if violation["resolved"] is False:
                penalty += 50
        refund_deposit = self.shop_info["deposit"] - penalty if penalty <= self.shop_info["deposit"] else 0
        final_fund = self.shop_info["fund_account"] + refund_deposit
        
        # 3. 更新会员类型、记录退场信息
        self.member_type = "消费者"
        self.init_points()
        self.entry_exit_records.append({
            "type": "exit",
            "way": "passive",
            "reason": reason,
            "time": datetime.datetime.now(),
            "fund_settlement": final_fund,
            "status": "success",
            "forbidden_period": 12  # 禁止入驻期限（月），严重违规设为999（永久）
        })
        
        # 4. 记录行为、发送通知
        forbidden_msg = "1年内禁止重新申请入驻" if "严重违规" not in reason else "永久禁止重新申请入驻"
        db.add_behavior_record(self.username, "联盟商家被动退场", f"商家{self.username}因{reason}被强制清退，资金结算：{final_fund}元")
        QMessageBox.warning(None, "被动退场通知", f"你的联盟商家资格已被强制清退！\n原因：{reason}\n{forbidden_msg}\n资金结算：{final_fund}元（3个工作日内到账）")
        return f"被动退场成功，原因：{reason}，{forbidden_msg}，资金结算{final_fund}元。"

    # ---------------------- 升级机制核心方法 ----------------------
    def check_promoter_upgrade_qualification(self):
        """校验消费商免费升级联盟商家的资格（连续3个月业绩达标）"""
        if self.member_type != "消费商":
            return False
        # 连续3个月推广人数≥5人，且佣金≥100元
        total_promote = sum(self.promote_data["monthly_promote"])
        total_commission = sum(self.promote_data["monthly_commission"])
        if total_promote >= 50 and total_commission >= 1000:
            # 发送升级提醒（通过系统弹窗+消息通知）
            QMessageBox.information(None, "升级提醒", f"恭喜你！连续3个月推广业绩达标，可免费升级为联盟商家，点击【确认】立即升级～\n升级后需完成资质校验、缴纳100元保证金，即可解锁商家全部权限。")
            return True
        return False

    def upgrade_member(self, target_type, pay_amount=0, qualification=None):
        """会员升级核心方法（新增联盟商家入场资质校验、保证金缴纳）
        :param target_type: 目标会员类型（消费商/联盟商家）
        :param pay_amount: 支付金额（0表示免费升级）
        :param qualification: 联盟商家入场资质（仅升级联盟商家需提供）
        :return: 升级结果提示
        """
        current_type = self.member_type
        # 校验目标类型合法性
        if target_type not in ["消费商", "联盟商家"] or current_type == target_type:
            return f"升级失败：目标会员类型不合法或已为该等级"
        # 校验当前会员资格（无违规、在有效期内）
        if self.has_violation_unresolved():
            return f"升级失败：存在未处理的违规记录，请先完成整改"
        if datetime.datetime.now() > self.valid_until:
            return f"升级失败：当前会员已过期，请先续费"
        
        # 按当前类型判断升级条件是否满足，新增联盟商家入场相关校验
        if current_type == "消费者":
            if target_type == "消费商":
                # 两种升级方式：付费99元 或 积分5000
                if pay_amount == 99 or self.points >= 5000:
                    # 扣除费用/积分
                    if pay_amount == 99:
                        # 对接支付接口（预留）
                        pass
                    else:
                        self.points -= 5000
                else:
                    return f"升级失败：消费商升级需支付99元或累计5000积分"
            elif target_type == "联盟商家":
                # 升级方式：付费199元 + 资质校验 + 缴纳100元保证金
                if pay_amount != 199:
                    return f"升级失败：联盟商家升级需支付199元会员费"
                # 资质校验（联盟商家入场必备）
                if not qualification:
                    return f"升级失败：联盟商家升级需提交完整资质材料（营业执照、法人身份证等）"
                qual_result = self.check_merchant_qualification(qualification)
                if "失败" in qual_result:
                    return qual_result
                # 缴纳保证金
                deposit_result = self.pay_merchant_deposit(100)
                if "失败" in deposit_result:
                    return deposit_result
                # 对接支付接口（预留，支付会员费）
        elif current_type == "消费商":
            if target_type == "联盟商家":
                # 两种升级方式：补差价100元 或 免费升级（业绩达标） + 资质校验 + 缴纳100元保证金
                if not (pay_amount == 100 or self.check_promoter_upgrade_qualification()):
                    return f"升级失败：联盟商家升级需补100元差价，或连续3个月推广满50人且佣金满1000元"
                # 资质校验（联盟商家入场必备）
                if not qualification:
                    return f"升级失败：联盟商家升级需提交完整资质材料（营业执照、法人身份证等）"
                qual_result = self.check_merchant_qualification(qualification)
                if "失败" in qual_result:
                    return qual_result
                # 缴纳保证金
                deposit_result = self.pay_merchant_deposit(100)
                if "失败" in deposit_result:
                    return deposit_result
                # 补差价支付（预留接口）
                if pay_amount == 100:
                    pass
        
        # 升级执行：更新会员类型、有效期、初始积分
        self.member_type = target_type
        self.valid_until = datetime.datetime.now() + datetime.timedelta(days=365)
        self.init_points()
        # 记录升级行为（联盟商家标记入场方式）
        entry_way = "免费升级" if (current_type == "消费商" and self.check_promoter_upgrade_qualification()) else "付费升级"
        db.add_behavior_record(self.username, "会员升级", f"从{current_type}升级为{target_type}，支付金额：{pay_amount}元，入场方式：{entry_way}")
        # 发送升级成功通知（新增入场指引）
        QMessageBox.information(None, "升级成功", f"恭喜你成功升级为{target_type}！\n所有专属权限已解锁，请在3个工作日内完成店铺创建及商品/服务上架，逾期将冻结商家权限。")
        return f"升级成功：已从{current_type}升级为{target_type}，请完成店铺创建流程。"

    # ---------------------- 降级机制核心方法 ----------------------
    def add_violation(self, violation_type, desc):
        """添加违规记录，触发违规降级校验，联动被动退场"""
        violation = {
            "violation_type": violation_type,  # 违规类型（虚假推广/卖假货等）
            "desc": desc,                      # 违规描述
            "time": datetime.datetime.now(),   # 违规时间
            "resolved": False                  # 是否已整改
        }
        self.violation_records.append(violation)
        db.add_behavior_record(self.username, "会员违规", f"违规类型：{violation_type}，描述：{desc}")
        # 触发违规降级、被动退场校验
        self.check_violation_downgrade()
        self.check_merchant_passive_exit()
        return violation

    def has_violation_unresolved(self):
        """判断是否存在未处理的违规记录"""
        for violation in self.violation_records:
            if not violation["resolved"]:
                return True
        return False

    def check_violation_downgrade(self):
        """违规降级校验：单次违规降一级，累计2次违规永久限制入驻，联动被动退场"""
        unresolved_count = sum(1 for v in self.violation_records if not v["resolved"])
        if unresolved_count == 1:
            # 单次违规：降一级
            current_type = self.member_type
            if current_type == "联盟商家":
                # self.downgrade_member("消费商", "违规降级：存在1次未处理违规")
                self.member_type = "消费商"
                self.shop_info["operation_status"] = "frozen"
                QMessageBox.warning(None, "降级提醒", f"警告！由于违规操作，您的会员等级已从联盟商家降为消费商，店铺功能已冻结。")
            elif current_type == "消费商":
                # self.downgrade_member("消费者", "违规降级：存在1次未处理违规")
                self.member_type = "消费者"
                QMessageBox.warning(None, "降级提醒", f"警告！由于违规操作，您的会员等级已从消费商降为消费者。")
        elif unresolved_count >= 2:
            # 累计2次违规：永久限制入驻，降为消费者，冻结所有权益，触发联盟商家被动退场
            if self.member_type == "联盟商家":
                self.passive_exit_merchant("累计2次未处理违规，强制清退")
            else:
                self.member_type = "消费者"
                QMessageBox.warning(None, "降级提醒", f"严重警告！由于累计2次违规，您已被降为消费者，且永久限制升级为联盟商家。")
            # 冻结佣金、店铺资金（预留接口）
            self.promote_data["commission"] = 0.0
            self.shop_info["goods_list"] = []
            self.shop_info["service_list"] = []

    def check_promoter_downgrade_qualification(self):
        """消费商业绩不达标校验：连续3个月推广人数≤5且佣金≤100"""
        if self.member_type != "消费商":
            return False
        total_promote = sum(self.promote_data["monthly_promote"])
        total_commission = sum(self.promote_data["monthly_commission"])
        if total_promote <= 5 and total_commission <= 100:
            # 发送降级提醒（提前7天）
            QMessageBox.warning(None, "降级提醒", f"警告！近3个月推广业绩不达标，7天后将自动降为消费者，请尽快提升推广量～")
            return True
        return False

    def check_merchant_operation_qualification(self):
        """联盟商家运营不达标校验：连续3个月无订单，联动被动退场"""
        if self.member_type != "联盟商家":
            return False
        total_orders = sum(self.shop_info["monthly_orders"])
        if total_orders == 0:
            # 发送降级提醒（提前7天）
            QMessageBox.warning(None, "降级提醒", f"警告！近3个月无订单成交，7天后将自动降为消费商，若未整改将触发被动退场，请尽快优化店铺运营～")
            # 触发被动退场校验
            self.check_merchant_passive_exit()
            return True
        return False

    def check_merchant_passive_exit(self):
        """联盟商家被动退场校验（运营、违规等条件）"""
        if self.member_type != "联盟商家":
            return False
        # 运营不达标触发
        if sum(self.shop_info["monthly_orders"]) == 0 and self.shop_info["operation_status"] == "normal":
            self.passive_exit_merchant("连续3个月无订单成交，运营不达标，强制清退")
            return True
        # 资质过期触发（模拟资质有效期1年）
        if self.shop_info["qualification"]:
            qual_time = datetime.datetime.now() - datetime.timedelta(days=365)
            if "create_time" in self.shop_info["qualification"] and self.shop_info["qualification"]["create_time"] < qual_time:
                self.passive_exit_merchant("资质过期未及时更新，强制清退")
                return True
        # 会员过期触发
        if datetime.datetime.now() > self.valid_until:
            self.passive_exit_merchant("会员到期未续费，强制清退")
            return True
        return False

    def check_validity_downgrade(self):
        """会员有效期校验：到期未续费降级，联动联盟商家被动退场"""
        if datetime.datetime.now() > self.valid_until:
            # 发送提醒
            QMessageBox.warning(None, "会员到期提醒", f"您的会员已到期，将在7天内自动降级为消费者，如需续费请联系客服。")
            # 7天后自动降级
            if self.member_type == "联盟商家":
                self.passive_exit_merchant("会员到期未续费，强制清退")
            elif self.member_type == "消费商":
                self.member_type = "消费者"
                self.init_points()
                QMessageBox.information(None, "降级通知", f"您的会员已到期，已自动降为消费者。")


# 测试代码
if __name__ == "__main__":
    # 创建一个测试用户
    user = MemberSystem("test_user", "消费者")
    
    print(f"初始会员类型: {user.member_type}")
    print(f"初始积分: {user.points}")
    
    # 测试升级到消费商
    result = user.upgrade_member("消费商", pay_amount=99)
    print(f"升级结果: {result}")
    print(f"升级后会员类型: {user.member_type}")
    
    # 测试积分增加
    user.add_points(100)
    print(f"增加积分后: {user.points}")
    
    # 测试生成推广二维码
    qrcode_path = user.generate_promote_qrcode()
    print(f"推广二维码路径: {qrcode_path}")
    
    # 测试添加推广成功
    user.add_promote_count(5)
    print(f"推广成功人数: {user.promote_data['promote_count']}, 佣金: {user.promote_data['commission']}")
    
    # 测试升级到联盟商家
    qualification = {
        "business_license": "123456789012345678",
        "id_card": "110101199003077890",
        "industry_license": "A123456789"
    }
    merchant_result = user.pay_merchant_deposit(100)
    print(f"缴纳保证金结果: {merchant_result}")
    
    shop_result = user.create_shop("测试店铺", "零售")
    print(f"创建店铺结果: {shop_result}")
    
    # 测试上架商品
    goods_result = user.add_goods("测试商品", 99.9, "这是一个测试商品")
    print(f"上架商品结果: {goods_result}")
    
    # 测试上架服务
    service_result = user.add_service("测试服务", 199.0, "这是一个测试服务")
    print(f"上架服务结果: {service_result}")
    
    # 测试添加订单
    order_count = user.add_order_count(3)
    print(f"订单总数: {order_count}")
    
    # 测试创建消费券和代金券
    coupon = user.create_coupon(50, 14)
    print(f"创建消费券: {coupon}")
    
    voucher = user.create_voucher(100, 30)
    print(f"创建代金券: {voucher}")
    
    # 测试违规处理
    violation = user.add_violation("虚假推广", "发布了虚假的商品信息")
    print(f"添加违规记录: {violation}")
    
    # 测试手动检查有效期降级
    user.check_validity_downgrade()
