// myscript.js - 有效的AudioWorkletModule
console.log('这是浏览器扩展里提供的脚本内容！');
console.log('This script is provided by the browser extension!');

// 创建一个消息通道，用于从AudioWorklet发送消息到主线程
let messagePort = null;

// 定义一个继承自AudioWorkletProcessor的处理器类
class MyScriptProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // 记录处理器已创建的日志
    console.log('MyScriptProcessor 已创建');
    
    // 保存消息端口以便发送消息到主线程
    messagePort = this.port;
    
    // 发送消息到主线程，表明脚本已被拦截
    this.port.postMessage({
      type: 'init',
      message: '脚本已被扩展程序拦截并替换！',
      timestamp: currentFrame
    });
    
    // 设置消息监听器
    this.port.onmessage = this.handleMessage.bind(this);
  }
  
  // 处理从主线程接收的消息
  handleMessage(event) {
    console.log('AudioWorklet收到消息:', event.data);
    // 回复确认消息
    this.port.postMessage({
      type: 'response',
      message: '消息已收到',
      timestamp: currentFrame
    });
  }
  
  // 必需的process方法，处理音频数据
  process(inputs, outputs, parameters) {
    // 简单地将输入复制到输出
    const input = inputs[0];
    const output = outputs[0];
    
    for (let channel = 0; channel < output.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      
      if (inputChannel) {
        for (let i = 0; i < outputChannel.length; ++i) {
          outputChannel[i] = inputChannel[i];
        }
      }
    }
    
    // 返回true以保持处理器活跃
    return true;
  }
}

// 注册处理器
registerProcessor('my-script-processor', MyScriptProcessor);

// 主线程代码 - 这部分在AudioWorklet环境中不会执行，但在普通脚本环境中会执行
// 这样可以保持原有功能，同时使脚本在AudioWorklet中也能正常工作
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded and DOM is ready');
    
    // 添加视觉指示器表明脚本被拦截
    const indicator = document.createElement('div');
    indicator.style.position = 'fixed';
    indicator.style.top = '10px';
    indicator.style.right = '10px';
    indicator.style.padding = '10px';
    indicator.style.background = 'rgba(0, 128, 0, 0.8)';
    indicator.style.color = 'white';
    indicator.style.borderRadius = '5px';
    indicator.style.zIndex = '9999';
    indicator.textContent = '脚本已被扩展程序拦截并替换！';
    document.body.appendChild(indicator);
    
    // 设置全局标志，供测试脚本检测
    window.scriptRedirectorTestPassed = true;
  });
}
