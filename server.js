const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 允许跨域
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 测试接口（核心：确保这个接口能被访问到）
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: '服务器正常运行',
    timestamp: new Date().toISOString()
  });
});

// 根路径提示
app.get('/', (req, res) => {
  res.send('图片识别API服务运行中，访问 /api/test 测试');
});

// 启动服务
app.listen(port, () => {
  console.log(`服务运行在端口 ${port}`);
});
