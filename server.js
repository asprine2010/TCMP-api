// 绝对极简，只有一行核心逻辑
const express = require('express');
const app = express();

// 测试接口（GET请求，路径/api/test）
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '服务正常启动2',
    time: new Date().toLocaleString()
  });
});

// 根路径提示
app.get('/', (req, res) => {
  res.send('访问 /api/test 查看测试结果');
});

// 启动服务（必须用process.env.PORT，Vercel会自动分配）
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});