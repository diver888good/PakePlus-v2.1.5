<template>
  <div id="app">
    <h1>{{ msg }}</h1>
    <p>Welcome to your Capacitor + Vue app with Payment Integration!</p>
    
    <div class="payment-section">
      <button @click="handleAlipayPayment" class="payment-btn alipay-btn">支付宝支付</button>
      <button @click="handleWechatPayment" class="payment-btn wechat-btn">微信支付</button>
      <button @click="handleCamera" class="payment-btn camera-btn">拍照</button>
      <button @click="handleGallery" class="payment-btn gallery-btn">选择相册</button>
    </div>
    
    <div v-if="paymentResult" class="result">
      <h3>支付结果:</h3>
      <pre>{{ paymentResult }}</pre>
    </div>
  </div>
</template>

<script>
import { Camera, CameraSource } from "@capacitor/camera";
import { registerPlugin } from "@capacitor/core";

// 动态注册 Cordova 插件
const Alipay = registerPlugin("Alipay");
const Wechat = registerPlugin("Wechat");

export default {
  name: "App",
  data() {
    return {
      msg: "Hello from Capacitor + Vue!",
      paymentResult: null
    };
  },
  methods: {
    async handleAlipayPayment() {
      try {
        // 示例支付宝支付参数 - 实际使用时需要从服务器获取
        const orderInfo = "你的订单字符串"; // 这里应该是由服务端生成的真实订单信息
        
        this.paymentResult = "正在调起支付宝...";
        
        // 注意：实际开发中，orderInfo 应该由后端服务器返回
        // 这只是一个演示结构
        if (Alipay && Alipay.alipay) {
          const result = await Alipay.alipay(orderInfo);
          this.paymentResult = result;
        } else {
          throw new Error("Alipay plugin not available");
        }
      } catch (error) {
        console.error("支付宝支付失败:", error);
        this.paymentResult = "支付宝支付失败: " + error.message;
      }
    },
    
    async handleWechatPayment() {
      try {
        // 示例微信支付参数 - 实际使用时需要从服务器获取
        const params = {
          partnerid: "你的商户号", // 微信支付分配的商户号
          prepayid: "预支付交易会话标识", // 微信返回的预支付交易会话标识
          noncestr: "随机字符串", // 随机字符串
          timestamp: Date.now().toString(), // 时间戳
          sign: "签名", // 签名
        };
        
        this.paymentResult = "正在调起微信支付...";
        
        // 注意：实际开发中，参数应该由后端服务器生成
        if (Wechat && Wechat.sendPaymentRequest) {
          const result = await Wechat.sendPaymentRequest(params);
          this.paymentResult = result;
        } else {
          throw new Error("Wechat plugin not available");
        }
      } catch (error) {
        console.error("微信支付失败:", error);
        this.paymentResult = "微信支付失败: " + error.message;
      }
    },
    
    async handleCamera() {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: "uri"
        });
        
        this.paymentResult = `拍摄成功: ${image.webPath}`;
      } catch (error) {
        console.error("拍照失败:", error);
        this.paymentResult = "拍照失败: " + error.message;
      }
    },
    
    async handleGallery() {
      try {
        // 使用相机插件从相册选择
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: "uri",
          source: CameraSource.Photos  // 仅从相册选择
        });
        
        this.paymentResult = `选择图片成功: ${image.webPath}`;
      } catch (error) {
        console.error("选择图片失败:", error);
        this.paymentResult = "选择图片失败: " + error.message;
      }
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  padding: 20px;
}

.payment-section {
  margin: 30px 0;
}

.payment-btn {
  display: block;
  width: 80%;
  max-width: 300px;
  margin: 10px auto;
  padding: 15px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.alipay-btn {
  background-color: #00a0e8;
  color: white;
}

.wechat-btn {
  background-color: #07c160;
  color: white;
}

.camera-btn {
  background-color: #6c757d;
  color: white;
}

.gallery-btn {
  background-color: #28a745;
  color: white;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
  word-break: break-all;
}
</style>
