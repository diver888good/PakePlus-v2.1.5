
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "wang.imchao.plugin.alipay.alipay",
          "file": "plugins/wang.imchao.plugin.alipay/www/alipay.js",
          "pluginId": "wang.imchao.plugin.alipay",
        "clobbers": [
          "alipay"
        ]
        },
      {
          "id": "cordova-plugin-wechat.Wechat",
          "file": "plugins/cordova-plugin-wechat/www/wechat.js",
          "pluginId": "cordova-plugin-wechat",
        "clobbers": [
          "Wechat"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "wang.imchao.plugin.alipay": "0.9.0",
      "cordova-plugin-wechat": "3.0.0"
    };
    // BOTTOM OF METADATA
    });
    