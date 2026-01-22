# db_operate.py 数据库操作模块
import sqlite3
import datetime
from config import CONFIG_DB

class DBOperate:
    def __init__(self, db_path):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        # 初始化连接
        self._connect()
        # 建表（聊天记录表+用户行为表）
        self._create_tables()

    def _connect(self):
        """建立数据库连接"""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.cursor = self.conn.cursor()
        except Exception as e:
            print(f"数据库连接失败：{e}")

    def _create_tables(self):
        """创建表：ai_chat_record（聊天记录）、user_behavior（用户行为）"""
        # 1. 聊天记录表：按生活/工作分类，关联到具体子分类
        create_chat_sql = f"""
        CREATE TABLE IF NOT EXISTS {CONFIG_DB['聊天记录表']} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            user_msg TEXT NOT NULL,
            ai_msg TEXT NOT NULL,
            big_cate TEXT NOT NULL,  # 生活/工作/通用
            small_cate TEXT NOT NULL, # 具体子分类（如1.1 居住环境管理）
            recommend_service TEXT, # 推荐的平台服务
            create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0
        )
        """
        # 2. 用户行为表：记录用户操作，用于分析情况变化
        create_behavior_sql = f"""
        CREATE TABLE IF NOT EXISTS {CONFIG_DB['用户行为表']} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            behavior_type TEXT NOT NULL, # 点击服务/查看分类/使用功能
            behavior_content TEXT NOT NULL, # 具体内容
            create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
        self.cursor.execute(create_chat_sql)
        self.cursor.execute(create_behavior_sql)
        self.conn.commit()

    def add_chat_record(self, username, user_msg, ai_msg, big_cate, small_cate, recommend_service):
        """添加聊天记录"""
        try:
            sql = f"""
            INSERT INTO {CONFIG_DB['聊天记录表']} 
            (username, user_msg, ai_msg, big_cate, small_cate, recommend_service)
            VALUES (?, ?, ?, ?, ?, ?)
            """
            self.cursor.execute(sql, (username, user_msg, ai_msg, big_cate, small_cate, recommend_service))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"添加聊天记录失败：{e}")
            return False

    def get_chat_record_by_cate(self, username, big_cate=None, small_cate=None):
        """按分类查询聊天记录：可查大类（生活/工作）或具体子类"""
        try:
            sql = f"SELECT * FROM {CONFIG_DB['聊天记录表']} WHERE username=?"
            params = [username]
            if big_cate:
                sql += " AND big_cate=?"
                params.append(big_cate)
            if small_cate:
                sql += " AND small_cate=?"
                params.append(small_cate)
            sql += " ORDER BY create_time DESC"
            self.cursor.execute(sql, params)
            return self.cursor.fetchall()
        except Exception as e:
            print(f"查询聊天记录失败：{e}")
            return []

    def add_behavior_record(self, username, behavior_type, behavior_content):
        """添加用户行为记录"""
        try:
            sql = f"""
            INSERT INTO {CONFIG_DB['用户行为表']} 
            (username, behavior_type, behavior_content)
            VALUES (?, ?, ?)
            """
            self.cursor.execute(sql, (username, behavior_type, behavior_content))
            self.conn.commit()
            return True
        except Exception as e:
            print(f"添加行为记录失败：{e}")
            return False

    def get_user_behavior(self, username, days=7):
        """查询用户近N天行为记录，用于分析情况变化"""
        try:
            start_time = datetime.datetime.now() - datetime.timedelta(days=days)
            sql = f"""
            SELECT * FROM {CONFIG_DB['用户行为表']} 
            WHERE username=? AND create_time >= ?
            ORDER BY create_time DESC
            """
            self.cursor.execute(sql, (username, start_time.strftime("%Y-%m-%d %H:%M:%S")))
            return self.cursor.fetchall()
        except Exception as e:
            print(f"查询用户行为失败：{e}")
            return []

    def close(self):
        """关闭数据库连接"""
        if self.conn:
            self.conn.close()

# 单例模式：全局唯一数据库连接
db = DBOperate(CONFIG_DB["数据库路径"])