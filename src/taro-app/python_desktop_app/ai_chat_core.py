# ai_chat_core.py AI客服核心逻辑（多模态+智能推荐+分类）
import re
import datetime
from aip import AipSpeech, AipNlp
import pyaudio
import wave
from config import CONFIG_BAIDU_AI, CONFIG_AICHAT, AI_RECOMMEND_RULES
from db_operate import db

# 初始化百度AI：语音识别(ASR)/语音合成(TTS)/自然语言处理(NLP)
client_asr = AipSpeech(CONFIG_BAIDU_AI["APP_ID"], CONFIG_BAIDU_AI["API_KEY"], CONFIG_BAIDU_AI["SECRET_KEY"])
client_tts = AipSpeech(CONFIG_BAIDU_AI["APP_ID"], CONFIG_BAIDU_AI["API_KEY"], CONFIG_BAIDU_AI["SECRET_KEY"])
client_nlp = AipNlp(CONFIG_BAIDU_AI["APP_ID"], CONFIG_BAIDU_AI["API_KEY"], CONFIG_BAIDU_AI["SECRET_KEY"])

# 语音录制参数（Pyaudio）
AUDIO_PARAMS = {
    "format": pyaudio.paInt16,
    "channels": 1,
    "rate": 16000,
    "chunk": 1024,
    "record_seconds": 10,  # 单次语音录制最长10秒
    "wave_output_filename": "./temp_audio.wav"
}

class AIChatCore:
    def __init__(self, username):
        self.username = username  # 关联当前登录用户
        self.pyaudio = pyaudio.PyAudio()  # 初始化音频设备

    # ---------------------- 文字互动核心 ----------------------
    def text_chat(self, user_msg):
        """文字聊天：用户输入文字→AI回复+分类+推荐服务"""
        # 1. 关键词匹配：分类+推荐服务
        big_cate, small_cate, recommend_service, recommend_words = self._match_keyword(user_msg)
        # 2. 生成AI基础回复（可替换为大模型API，此处基于规则生成）
        ai_base_msg = self._generate_ai_msg(user_msg, recommend_words)
        # 3. 拼接推荐服务（若有）
        ai_msg = f"{ai_base_msg}\n【平台服务推荐】：{recommend_service if recommend_service else '暂无适配服务，可在平台自行浏览～'}"
        # 4. 保存聊天记录到数据库
        db.add_chat_record(self.username, user_msg, ai_msg, big_cate, small_cate, recommend_service)
        # 5. 语音合成：AI回复转语音（自动播放）
        self.tts_speak(ai_msg)
        return ai_msg, recommend_service

    # ---------------------- 语音互动核心 ----------------------
    def asr_listen(self):
        """语音识别：录制用户语音→转文字"""
        try:
            # 1. 录制语音
            self._record_audio()
            # 2. 读取音频文件
            audio_data = self._read_audio_file(AUDIO_PARAMS["wave_output_filename"])
            # 3. 百度ASR识别
            result = client_asr.asr(audio_data, "wav", 16000, {
                "dev_pid": 1536,  # 1536=普通话（纯中文）
            })
            # 4. 解析结果
            if result["err_no"] == 0:
                user_msg = result["result"][0]
                return user_msg
            else:
                return f"语音识别失败：{result['err_msg']}"
        except Exception as e:
            return f"语音录制/识别异常：{str(e)}"

    def tts_speak(self, text):
        """语音合成：AI文字回复→转语音播放"""
        try:
            # 1. 百度TTS合成语音
            result = client_tts.synthesis(text, "zh", 1, {
                "spd": CONFIG_AICHAT["语音合成语速"],
                "vol": 5,
                "per": 4,  # 4=情感女生音，3=情感男生音
            })
            # 2. 播放语音
            if not isinstance(result, dict):
                self._play_audio(result)
        except Exception as e:
            print(f"语音合成/播放失败：{e}")

    # ---------------------- 视频互动核心（预留） ----------------------
    def video_chat(self):
        """视频互动：预留接口，可对接OpenCV/摄像头模块"""
        return "视频互动功能正在开发中，即将上线～"

    # ---------------------- 智能分类与推荐 ----------------------
    def _match_keyword(self, user_msg):
        """关键词匹配：从用户消息中提取关键词，匹配分类和推荐服务"""
        user_msg = user_msg.lower().strip()
        for keyword, (big_cate, small_cate, recommend_service, recommend_words) in AI_RECOMMEND_RULES.items():
            if re.search(keyword, user_msg):
                return big_cate, small_cate, recommend_service, recommend_words
        # 无匹配关键词→默认通用
        return "通用", "通用", "无", "我已收到你的问题，会尽力为你解答～"

    # ---------------------- AI回复生成（规则版，可替换大模型） ----------------------
    def _generate_ai_msg(self, user_msg, recommend_words):
        """生成AI基础回复，可替换为讯飞/文心一言/通义千问API实现智能对话"""
        base_answers = {
            "你好": f"你好{self.username}，我是你的专属AI客服，有任何问题都可以问我～",
            "谢谢": "不客气，能为你服务是我的荣幸～",
            "再见": "再见～有需要随时喊我，我一直都在～",
        }
        # 精准匹配基础问题
        for k, v in base_answers.items():
            if k in user_msg:
                return v
        # 无精准匹配→返回推荐话术+通用回复
        return f"{recommend_words}\n如果你有更具体的需求，可以详细说说，我会为你精准解答～"

    # ---------------------- 每日智能提示 ----------------------
    def daily_tip(self):
        """每日提示：基于用户近7天聊天/行为记录，生成建设性解决方案"""
        try:
            # 1. 获取用户近7天聊天记录（按生活/工作分类）
            life_records = db.get_chat_record_by_cate(self.username, big_cate="生活")
            work_records = db.get_chat_record_by_cate(self.username, big_cate="工作")
            # 2. 获取用户近7天行为记录
            behaviors = db.get_user_behavior(self.username, days=7)
            # 3. 生成生活类提示
            life_tip = self._generate_life_tip(life_records)
            # 4. 生成工作类提示
            work_tip = self._generate_work_tip(work_records)
            # 5. 拼接最终提示
            tip = f"【{self.username}的每日智能提示】\n【生活方面】：{life_tip if life_tip else '近期生活状态良好，继续保持～'}\n【工作方面】：{work_tip if work_tip else '近期工作顺利，暂无需要优化的点～'}\n\n平台会根据你的情况持续为你匹配专属服务，有需要随时告诉我～"
            return tip
        except Exception as e:
            return f"每日提示生成失败：{str(e)}，可直接向我咨询你的需求～"

    def _generate_life_tip(self, life_records):
        """生成生活类智能提示"""
        if not life_records:
            return None
        # 提取生活类高频问题
        key_problems = [record[2] for record in life_records[:5]]  # 取最近5条
        # 按问题类型生成提示
        if any("情绪" in p or "压力" in p or "孤独" in p for p in key_problems):
            return "近期你存在情绪调节相关的需求，建议每天花10分钟做深呼吸/冥想，平台情感陪护服务可随时为你提供一对一疏导，帮你保持好心情～"
        if any("清洁" in p or "收纳" in p or "家电" in p for p in key_problems):
            return "近期你关注家居环境管理，建议定期做家居清洁和家电检查，平台联盟商家有各类清洁/收纳/维修服务，可一键预约/选购，节省时间～"
        if any("食材" in p or "搭配" in p or "饮食" in p for p in key_problems):
            return "近期你关注饮食健康，建议食材新鲜采购、荤素搭配，平台联盟商家有新鲜食材配送，私人订制可提供专属膳食方案，让饮食更健康～"
        return "近期你关注生活各类细节，平台生活分类下有各类服务和工具，可按需使用，让生活更便捷～"

    def _generate_work_tip(self, work_records):
        """生成工作类智能提示"""
        if not work_records:
            return None
        key_problems = [record[2] for record in work_records[:5]]
        if any("公文" in p or "会议" in p or "办公" in p for p in key_problems):
            return "近期你关注行政办公效率，平台职业助手可辅助公文撰写、会议统筹，帮你提升办公效率，减少工作压力～"
        if any("客户" in p or "业务" in p for p in key_problems):
            return "近期你关注业务开展，平台职业助手有客户维护和业务拓展方案，可参考使用，提升业务成果～"
        if any("找工作" in p or "招聘" in p for p in key_problems):
            return "近期你关注求职/招聘，平台求职招聘板块有海量岗位和人才资源，可精准匹配，帮你快速达成目标～"
        return "近期你关注工作各类需求，平台工作分类下有各类职业助手和服务，可按需使用，让工作更顺利～"

    # ---------------------- 音频辅助函数（录制/播放/读取） ----------------------
    def _record_audio(self):
        """录制用户语音"""
        stream = self.pyaudio.open(**AUDIO_PARAMS)
        frames = []
        for _ in range(0, int(AUDIO_PARAMS["rate"] / AUDIO_PARAMS["chunk"] * AUDIO_PARAMS["record_seconds"])):
            data = stream.read(AUDIO_PARAMS["chunk"])
            frames.append(data)
        stream.stop_stream()
        stream.close()
        # 保存为wav文件
        wf = wave.open(AUDIO_PARAMS["wave_output_filename"], 'wb')
        wf.setnchannels(AUDIO_PARAMS["channels"])
        wf.setsampwidth(self.pyaudio.get_format_from_width(AUDIO_PARAMS["format"]))
        wf.setframerate(AUDIO_PARAMS["rate"])
        wf.writeframes(b''.join(frames))
        wf.close()

    def _read_audio_file(self, filename):
        """读取音频文件"""
        with open(filename, 'rb') as f:
            return f.read()

    def _play_audio(self, audio_data):
        """播放语音合成后的音频"""
        # 保存临时音频
        with open("./temp_tts.wav", 'wb') as f:
            f.write(audio_data)
        # 播放
        wf = wave.open("./temp_tts.wav", 'rb')
        stream = self.pyaudio.open(
            format=self.pyaudio.get_format_from_width(wf.getsampwidth()),
            channels=wf.getnchannels(),
            rate=wf.getframerate(),
            output=True
        )
        data = wf.readframes(AUDIO_PARAMS["chunk"])
        while data:
            stream.write(data)
            data = wf.readframes(AUDIO_PARAMS["chunk"])
        stream.stop_stream()
        stream.close()

    # ---------------------- 销毁资源 ----------------------
    def close(self):
        """关闭音频设备"""
        self.pyaudio.terminate()