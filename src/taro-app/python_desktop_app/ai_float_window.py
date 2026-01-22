# ai_float_window.py 全局浮动AI客服窗口（PyQt6）
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QTextEdit, QLineEdit,
    QPushButton, QLabel, QSizePolicy, QMessageBox
)
from PyQt6.QtCore import Qt, QPoint, pyqtSignal
from PyQt6.QtGui import QFont, QCursor
from config import CONFIG_AICHAT
from ai_chat_core import AIChatCore

class AIFloatWindow(QWidget):
    # 定义信号：推荐服务点击→跳转到主应用对应模块
    service_click = pyqtSignal(str)
    def __init__(self, username, parent=None):
        super().__init__(parent)
        self.username = username
        self.ai_chat_core = AIChatCore(username)  # 初始化AI客服核心
        self.drag_pos = QPoint()  # 拖动位置
        self.init_ui()  # 初始化界面
        self.show_daily_tip()  # 启动时显示每日智能提示

    def init_ui(self):
        """初始化浮动窗口界面"""
        # 窗口配置：大小、置顶、无边框（美观）、可拖动
        self.setFixedSize(*CONFIG_AICHAT["窗口大小"])
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint)
        self.setStyleSheet("""
            QWidget {background-color: #f8f9fa; border-radius: 10px; border: 2px solid #409eff;}
            QPushButton {background-color: #409eff; color: white; border: none; border-radius: 5px; padding: 5px;}
            QPushButton:hover {background-color: #66b1ff;}
            QTextEdit {border: 1px solid #e6e6e6; border-radius: 5px; padding: 5px;}
            QLineEdit {border: 1px solid #e6e6e6; border-radius: 5px; padding: 5px;}
            QLabel {color: #333; font-weight: bold;}
        """)
        self.setCursor(QCursor(Qt.CursorShape.ArrowCursor))

        # 主布局：垂直布局
        main_layout = QVBoxLayout(self)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(10, 10, 10, 10)

        # 1. 标题栏：AI客服+关闭按钮
        title_layout = QHBoxLayout()
        title_label = QLabel(f"专属AI客服 - {self.username}")
        title_label.setFont(QFont("微软雅黑", 12, QFont.Weight.Bold))
        close_btn = QPushButton("×")
        close_btn.setFixedSize(25, 25)
        close_btn.clicked.connect(self.hide)  # 关闭→隐藏，不销毁
        title_layout.addWidget(title_label)
        title_layout.addStretch()
        title_layout.addWidget(close_btn)
        main_layout.addLayout(title_layout)

        # 2. 聊天记录展示区
        self.chat_edit = QTextEdit()
        self.chat_edit.setReadOnly(True)
        self.chat_edit.setPlaceholderText("AI客服：您好，我是你的专属AI客服，文字/语音/视频都可以和我互动～")
        main_layout.addWidget(self.chat_edit, stretch=5)

        # 3. 功能按钮区：语音/视频/清空
        func_layout = QHBoxLayout()
        self.voice_btn = QPushButton("语音说话")
        self.video_btn = QPushButton("视频互动")
        self.clear_btn = QPushButton("清空记录")
        self.voice_btn.clicked.connect(self.on_voice_click)
        self.video_btn.clicked.connect(self.on_video_click)
        self.clear_btn.clicked.connect(self.on_clear_click)
        func_layout.addWidget(self.voice_btn)
        func_layout.addWidget(self.video_btn)
        func_layout.addWidget(self.clear_btn)
        main_layout.addLayout(func_layout)

        # 4. 文字输入区：输入框+发送按钮
        input_layout = QHBoxLayout()
        self.input_edit = QLineEdit()
        self.input_edit.setPlaceholderText("请输入文字，按回车或点击发送～")
        self.input_edit.returnPressed.connect(self.on_send_click)  # 回车发送
        self.send_btn = QPushButton("发送")
        self.send_btn.clicked.connect(self.on_send_click)
        input_layout.addWidget(self.input_edit, stretch=4)
        input_layout.addWidget(self.send_btn, stretch=1)
        main_layout.addLayout(input_layout)

        # 5. 推荐服务展示区
        self.recommend_label = QLabel("【平台服务推荐】：暂无")
        self.recommend_btn = QPushButton("点击使用")
        self.recommend_btn.setHidden(True)  # 初始隐藏，有推荐时显示
        self.recommend_btn.clicked.connect(self.on_recommend_click)
        recommend_layout = QHBoxLayout()
        recommend_layout.addWidget(self.recommend_label)
        recommend_layout.addWidget(self.recommend_btn)
        main_layout.addLayout(recommend_layout)

    # ---------------------- 窗口拖动 ----------------------
    def mousePressEvent(self, event):
        """鼠标按下：记录拖动位置"""
        if event.button() == Qt.MouseButton.LeftButton and CONFIG_AICHAT["是否可拖动"]:
            self.drag_pos = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        """鼠标移动：拖动窗口"""
        if event.buttons() == Qt.MouseButton.LeftButton and CONFIG_AICHAT["是否可拖动"]:
            self.move(event.globalPosition().toPoint() - self.drag_pos)
            event.accept()

    # ---------------------- 功能按钮点击事件 ----------------------
    def on_send_click(self):
        """文字发送"""
        user_msg = self.input_edit.text().strip()
        if not user_msg:
            QMessageBox.warning(self, "提示", "请输入文字后再发送～")
            return
        # 清空输入框
        self.input_edit.clear()
        # 显示用户消息
        self.chat_edit.append(f"你：{user_msg}")
        # AI回复+分类+推荐
        ai_msg, recommend_service = self.ai_chat_core.text_chat(user_msg)
        # 显示AI回复
        self.chat_edit.append(f"AI客服：{ai_msg}")
        # 更新推荐服务
        if recommend_service and recommend_service != "无":
            self.recommend_label.setText(f"【平台服务推荐】：{recommend_service}")
            self.recommend_btn.setHidden(False)
            self.current_recommend = recommend_service
        else:
            self.recommend_label.setText("【平台服务推荐】：暂无")
            self.recommend_btn.setHidden(True)

    def on_voice_click(self):
        """语音说话"""
        self.chat_edit.append("AI客服：正在倾听你的语音，请说话...")
        # 语音识别→转文字
        user_msg = self.ai_chat_core.asr_listen()
        if "失败" in user_msg or "异常" in user_msg:
            self.chat_edit.append(f"AI客服：{user_msg}")
            return
        # 显示用户语音转文字的消息
        self.chat_edit.append(f"你（语音）：{user_msg}")
        # AI回复+分类+推荐
        ai_msg, recommend_service = self.ai_chat_core.text_chat(user_msg)
        self.chat_edit.append(f"AI客服：{ai_msg}")
        # 更新推荐服务
        if recommend_service and recommend_service != "无":
            self.recommend_label.setText(f"【平台服务推荐】：{recommend_service}")
            self.recommend_btn.setHidden(False)
            self.current_recommend = recommend_service
        else:
            self.recommend_label.setText("【平台服务推荐】：暂无")
            self.recommend_btn.setHidden(True)

    def on_video_click(self):
        """视频互动"""
        video_msg = self.ai_chat_core.video_chat()
        self.chat_edit.append(f"AI客服：{video_msg}")

    def on_clear_click(self):
        """清空聊天记录"""
        self.chat_edit.clear()
        self.recommend_label.setText("【平台服务推荐】：暂无")
        self.recommend_btn.setHidden(True)

    def on_recommend_click(self):
        """推荐服务点击：发送信号到主应用，跳转到对应模块"""
        self.service_click.emit(self.current_recommend)
        QMessageBox.information(self, "提示", f"即将为你跳转到【{self.current_recommend}】模块～")

    # ---------------------- 每日智能提示 ----------------------
    def show_daily_tip(self):
        """显示每日智能提示"""
        daily_tip = self.ai_chat_core.daily_tip()
        self.chat_edit.append(f"AI客服：{daily_tip}")

    # ---------------------- 销毁资源 ----------------------
    def closeEvent(self, event):
        """关闭窗口：销毁AI客服核心资源"""
        self.ai_chat_core.close()
        event.accept()