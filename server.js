const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Client, handle_file } = require('gradio_client');
const app = express();
const port = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

// 存储配置（临时存储上传的图片）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// 确保uploads目录存在
const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API运行正常' });
});

// 微信配置接口（实际使用时需要完善签名逻辑）
app.get('/api/wx/config', (req, res) => {
  // 这里简化处理，实际需要从微信服务器获取签名
  res.json({
    success: true,
    appId: 'wx_test_appid',
    timestamp: Date.now(),
    nonceStr: 'test_nonce',
    signature: 'test_signature'
  });
});

// 上传图片接口
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, error: '未上传图片' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename
  });
});

// 识别图片接口
app.post('/api/recognize', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.json({ success: false, error: '缺少文件名' });
    }
    
    const imagePath = `./uploads/${filename}`;
    
    // 调用TCMPRecognition API
    const client = new Client("winycg/TCMPRecognition");
    const result = await client.predict(
      handle_file(imagePath),
      api_name="/predict"
    );
    
    // 删除临时文件
    fs.unlinkSync(imagePath);
    
    res.json({
      success: true,
      result: {
        label: result.label,
        items: result.confidences || []
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// 启动服务
app.listen(port, () => {
  console.log(`服务运行在端口 ${port}`);
});
