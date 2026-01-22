# main_app.py 主应用入口（整合所有模块）
import sys
import os
import subprocess
import qrcode
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QCheckBox, QLineEdit, QDialog,
    QTabWidget, QTreeWidget, QTreeWidgetItem, QScrollArea, QMessageBox, QTextEdit
)
from PyQt6.QtCore import Qt, QThread, pyqtSignal
from PyQt6.QtGui import QPixmap, QFont

# 导入自定义模块
from config import CONFIG_REMOTE, CONFIG_QR, CONFIG_DB
from db_operate import db
from ai_float_window import AIFloatWindow
from member_system import MemberSystem

# AI客服模拟线程（登录窗口用，主窗口用全局浮动客服）
class AIChatLoginThread(QThread):
    msg_signal = pyqtSignal(str)
    def __init__(self, username):
        super().__init__()
        self.username = username
        self.running = True
    def run(self):
        welcome_msgs = [
            f"您好{self.username}，欢迎登录您的专属私密空间！",
            "我们会严格按照国家法律法规保护您的信息安全，您的所有操作和信息仅由AI客服管理，无人工查看权限。",
            "平台工作人员仅能访问合规处理后的公共信息，不会泄露您的隐私，请放心使用！",
            "登录后将为你打开全局AI客服，有任何问题随时互动～"
        ]
        for msg in welcome_msgs:
            if not self.running: break
            self.msg_signal.emit(msg)
            QThread.msleep(2000)
    def stop(self):
        self.running = False

# 登录窗口
class LoginWindow(QDialog):
    login_success = pyqtSignal(str)
    def __init__(self):
        super().__init__()
        self.setWindowTitle("用户登录 - 私人空间平台")
        self.setFixedSize(500, 400)
        self.init_ui()
        self.ai_thread = None
    def init_ui(self):
        layout = QVBoxLayout()
        # 用户名（扫码注册后自动填充）
        self.username_input = QLineEdit()
        self.username_input.setPlaceholderText("请输入用户名（扫码注册后自动填充）")
        self.username_input.setText("测试用户001")
        layout.addWidget(QLabel("用户名：", font=QFont("微软雅黑", 10)))
        layout.addWidget(self.username_input)
        # 服务协议
        self.proto_check = QCheckBox("我已阅读并同意《平台用户服务电子协议》")
        layout.addWidget(self.proto_check)
        # 登录按钮
        login_btn = QPushButton("登录")
        login_btn.clicked.connect(self.check_login)
        layout.addWidget(login_btn)
        # 登录页AI客服
        self.ai_chat_box = QTextEdit()
        self.ai_chat_box.setReadOnly(True)
        self.ai_chat_box.setPlaceholderText("AI客服正在为您服务...")
        layout.addWidget(QLabel("AI客服：", font=QFont("微软雅黑", 10)))
        layout.addWidget(self.ai_chat_box)
        self.setLayout(layout)
    def check_login(self):
        username = self.username_input.text().strip()
        if not username:
            QMessageBox.warning(self, "提示", "请输入用户名！")
            return
        if not self.proto_check.isChecked():
            QMessageBox.warning(self, "提示", "请同意服务协议！")
            return
        # 启动登录页AI客服
        self.ai_thread = AIChatLoginThread(username)
        self.ai_thread.msg_signal.connect(self.update_ai_chat)
        self.ai_thread.start()
        # 记录用户登录行为
        db.add_behavior_record(username, "登录", "用户成功登录私人空间")
        # 登录成功
        QMessageBox.information(self, "提示", "登录成功！全局AI客服即将为你打开～")
        self.login_success.emit(username)
        self.close()
    def update_ai_chat(self, msg):
        self.ai_chat_box.append(f"AI客服：{msg}")
    def closeEvent(self, event):
        if self.ai_thread: self.ai_thread.stop()
        event.accept()

# 在主应用窗口中不再需要定义MemberSystem类，因为它已经在member_system.py中定义并导入

# 主应用窗口（生活+平台服务+工作）
class MainAppWindow(QMainWindow):
    def __init__(self, username):
        super().__init__()
        self.username = username
        self.setWindowTitle(f"私人空间 - {username} | 生活+工作+平台服务一体化平台")
        self.setMinimumSize(1400, 900)
        # 初始化会员体系
        self.member = MemberSystem(username)
        self.member.add_points(100)
        self.member.create_coupon(20)
        # 初始化全局浮动AI客服窗口
        self.ai_float_window = AIFloatWindow(username)
        self.ai_float_window.service_click.connect(self.on_service_jump)  # 绑定推荐服务跳转
        self.ai_float_window.show()  # 显示浮动客服
        # 初始化主界面
        self.init_ui()
        # 生成远程访问二维码
        self.init_qrcode()
    def init_ui(self):
        main_widget = QWidget()
        main_layout = QHBoxLayout(main_widget)
        # 1. 左侧：生活分类（带聊天记录归档）
        life_widget = self.create_life_widget()
        main_layout.addWidget(life_widget, stretch=1)
        # 2. 中间：平台服务
        service_widget = self.create_service_widget()
        main_layout.addWidget(service_widget, stretch=1)
        # 3. 右侧：工作分类（带聊天记录归档）
        work_widget = self.create_work_widget()
        main_layout.addWidget(work_widget, stretch=1)
        self.setCentralWidget(main_widget)
    # 生成生活分类（含AI聊天记录归档）
    def create_life_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.addWidget(QLabel("生活分类（含AI聊天记录）", alignment=Qt.AlignmentFlag.AlignCenter, font=QFont("微软雅黑", 14, QFont.Weight.Bold)))
        # 生活分类树
        self.life_tree = QTreeWidget()
        self.life_tree.setHeaderLabel("生活分类目录 | 点击节点查看AI聊天记录")
        self.life_tree.itemClicked.connect(self.on_life_tree_click)
        # 加载生活分类（完整目录）
        self.load_life_categories()
        # 滚动区
        scroll = QScrollArea()
        scroll.setWidget(self.life_tree)
        scroll.setWidgetResizable(True)
        layout.addWidget(scroll)
        # 聊天记录展示区
        self.life_chat_edit = QTextEdit()
        self.life_chat_edit.setReadOnly(True)
        self.life_chat_edit.setPlaceholderText("点击左侧生活分类节点，查看该分类下的AI聊天记录和建议～")
        layout.addWidget(QLabel("本分类AI聊天记录：", font=QFont("微软雅黑", 10, QFont.Weight.Bold)))
        layout.addWidget(self.life_chat_edit, stretch=1)
        return widget
    # 加载完整生活分类目录
    def load_life_categories(self):
        # 1. 日常起居类
        daily_life = QTreeWidgetItem(self.life_tree, ["1. 日常起居类"])
        QTreeWidgetItem(daily_life, ["1.1 居住环境管理"])
        QTreeWidgetItem(daily_life, ["1.1.1 家居清洁（客厅、卧室、厨卫等）"])
        QTreeWidgetItem(daily_life, ["1.1.2 物品收纳（衣物、杂物、家居用品）"])
        QTreeWidgetItem(daily_life, ["1.1.3 家电维护与简单故障处理"])
        QTreeWidgetItem(daily_life, ["1.1.4 家居装饰、绿植养护"])
        QTreeWidgetItem(daily_life, ["1.2 个人作息与护理"])
        QTreeWidgetItem(daily_life, ["1.2.1 作息规律（早睡早起、作息调整）"])
        # 2. 饮食健康类
        food_health = QTreeWidgetItem(self.life_tree, ["2. 饮食健康类"])
        QTreeWidgetItem(food_health, ["2.1 食材采购与储备"])
        QTreeWidgetItem(food_health, ["2.2 膳食制作与搭配"])
        QTreeWidgetItem(food_health, ["2.3 健康管理与防护"])
        # 3-10 其他分类
        life_categories = [
            "3. 财务规划类", "4. 社交往来类", "5. 自我提升类",
            "6. 事务办理类", "7. 自定义补充类", "8. 心理健康类",
            "9. 健康生活展示类", "10. 生活管家类"
        ]
        for cate in life_categories:
            QTreeWidgetItem(self.life_tree, [cate])
        # 展开所有节点
        self.life_tree.expandAll()
    # 生活分类节点点击：查看对应聊天记录
    def on_life_tree_click(self, item, column):
        small_cate = item.text(column)
        # 查询该子类下的聊天记录
        records = db.get_chat_record_by_cate(self.username, big_cate="生活", small_cate=small_cate)
        # 展示记录
        self.life_chat_edit.clear()
        if not records:
            self.life_chat_edit.append(f"该分类【{small_cate}】暂无聊天记录，可向AI客服咨询相关问题～")
            return
        self.life_chat_edit.append(f"【生活-{small_cate}】AI聊天记录（按时间倒序）：\n")
        for record in records:
            create_time = record[7]
            user_msg = record[2]
            ai_msg = record[3]
            self.life_chat_edit.append(f"【{create_time}】\n你：{user_msg}\nAI客服：{ai_msg}\n---")
    # 生成平台服务模块
    def create_service_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.addWidget(QLabel("平台服务", alignment=Qt.AlignmentFlag.AlignCenter, font=QFont("微软雅黑", 14, QFont.Weight.Bold)))
        # 平台服务按钮
        self.service_btns = {}
        services = [
            "自由联盟商家", "私人订制", "情感陪护", "闲鱼翻身",
            "求职招聘", "探亲访友", "休闲娱乐", "兼职赚外快",
            "公益慈善", "任务活动"
        ]
        for service in services:
            btn = QPushButton(service)
            btn.setFixedHeight(40)
            btn.clicked.connect(lambda checked, s=service: self.on_service_click(s))
            self.service_btns[service] = btn
            layout.addWidget(btn)
        # 远程访问二维码
        self.qrcode_label = QLabel("扫码远程访问本平台")
        self.qrcode_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(QLabel("远程访问二维码：", font=QFont("微软雅黑", 10, QFont.Weight.Bold)))
        layout.addWidget(self.qrcode_label)
        # 会员信息展示
        self.member_label = QLabel(f"当前会员：{self.username} | 会员类型：{self.member.member_type} | 剩余积分：{self.member.points}")
        self.member_label.setStyleSheet("color: #409eff; font-weight: bold;")
        layout.addWidget(self.member_label)
        return widget
    # 生成工作分类（含AI聊天记录归档）
    def create_work_widget(self):
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.addWidget(QLabel("工作分类（含AI聊天记录）", alignment=Qt.AlignmentFlag.AlignCenter, font=QFont("微软雅黑", 14, QFont.Weight.Bold)))
        # 工作分类树
        self.work_tree = QTreeWidget()
        self.work_tree.setHeaderLabel("工作分类目录 | 点击节点查看AI聊天记录")
        self.work_tree.itemClicked.connect(self.on_work_tree_click)
        # 加载工作分类（完整目录）
        self.load_work_categories()
        # 滚动区
        scroll = QScrollArea()
        scroll.setWidget(self.work_tree)
        scroll.setWidgetResizable(True)
        layout.addWidget(scroll)
        # 聊天记录展示区
        self.work_chat_edit = QTextEdit()
        self.work_chat_edit.setReadOnly(True)
        self.work_chat_edit.setPlaceholderText("点击左侧工作分类节点，查看该分类下的AI聊天记录和建议～")
        layout.addWidget(QLabel("本分类AI聊天记录：", font=QFont("微软雅黑", 10, QFont.Weight.Bold)))
        layout.addWidget(self.work_chat_edit, stretch=1)
        return widget
    # 加载完整工作分类目录
    def load_work_categories(self):
        # 1. 行政办公类
        admin = QTreeWidgetItem(self.work_tree, ["1. 行政办公类"])
        QTreeWidgetItem(admin, ["1.1 日常事务管理"])
        QTreeWidgetItem(admin, ["1.2 文件资料管理"])
        QTreeWidgetItem(admin, ["1.3 会议活动统筹"])
        # 2. 业务开展类
        business = QTreeWidgetItem(self.work_tree, ["2. 业务开展类"])
        QTreeWidgetItem(business, ["2.1 客户对接维护"])
        QTreeWidgetItem(business, ["2.2 业务执行推进"])
        # 3-10 其他分类
        work_categories = [
            "3. 管理统筹类", "4. 资源支持类", "5. 专项工作类",
            "6. 自定义补充类", "7. 职业规划类", "8. 人生规划类",
            "9. 职业成就评价类", "10. 职业助手类"
        ]
        for cate in work_categories:
            QTreeWidgetItem(self.work_tree, [cate])
        self.work_tree.expandAll()
    # 工作分类节点点击：查看对应聊天记录
    def on_work_tree_click(self, item, column):
        small_cate = item.text(column)
        records = db.get_chat_record_by_cate(self.username, big_cate="工作", small_cate=small_cate)
        self.work_chat_edit.clear()
        if not records:
            self.work_chat_edit.append(f"该分类【{small_cate}】暂无聊天记录，可向AI客服咨询相关问题～")
            return
        self.work_chat_edit.append(f"【工作-{small_cate}】AI聊天记录（按时间倒序）：\n")
        for record in records:
            create_time = record[7]
            user_msg = record[2]
            ai_msg = record[3]
            self.work_chat_edit.append(f"【{create_time}】\n你：{user_msg}\nAI客服：{ai_msg}\n---")
    # 平台服务按钮点击
    def on_service_click(self, service):
        db.add_behavior_record(self.username, "点击平台服务", f"点击{service}服务")
        QMessageBox.information(self, "平台服务", f"【{service}】服务已启动～\n该服务支持第三方插件扩展，可按需接入更多功能～")
    # AI客服推荐服务跳转
    def on_service_jump(self, service):
        if service in self.service_btns:
            self.service_btns[service].click()  # 模拟点击平台服务按钮
        else:
            QMessageBox.information(self, "服务跳转", f"【{service}】服务正在开发中，敬请期待～")
    # 生成远程访问二维码（花生壳+向日葵）
    def init_qrcode(self):
        try:
            # 封装向日葵远程访问链接
            sunlogin_url = f"sunlogin://{CONFIG_REMOTE['花生壳_DOMAIN']}:{CONFIG_REMOTE['向日葵_PORT']}"
            # 生成二维码（草料API/本地qrcode）
            qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=8, border=4)
            qr.add_data(sunlogin_url)
            qr.make(fit=True)
            img = qr.make_image(fill_color="#409eff", back_color="white")
            img.save(CONFIG_QR["二维码保存路径"])
            # 展示二维码
            pixmap = QPixmap(CONFIG_QR["二维码保存路径"])
            self.qrcode_label.setPixmap(pixmap.scaled(250, 250, Qt.AspectRatioMode.KeepAspectRatio))
        except Exception as e:
            self.qrcode_label.setText(f"二维码生成失败：{str(e)}")
    # 关闭主窗口时销毁资源
    def closeEvent(self, event):
        # 隐藏浮动AI客服窗口
        self.ai_float_window.hide()
        self.ai_float_window.close()
        # 关闭数据库连接
        db.close()
        QMessageBox.information(self, "提示", "感谢使用私人空间平台，我们下次见～")
        event.accept()

# 主程序入口
if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle("Fusion")  # 美化界面
    # 登录窗口
    login_window = LoginWindow()
    if login_window.exec():
        username = login_window.username_input.text().strip()
        # 主应用窗口
        main_window = MainAppWindow(username)
        main_window.show()
        sys.exit(app.exec())