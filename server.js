const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
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
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// 测试接口
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API运行正常' });
});

// 微信配置接口（简化版）
app.get('/api/wx/config', (req, res) => {
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

// 识别图片接口（核心修改：用axios调用TCMPRecognition API）
app.post('/api/recognize', async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.json({ success: false, error: '缺少文件名' });
    }
    
    const imagePath = `./uploads/${filename}`;
    
    // 构造表单数据，模拟前端上传图片到TCMPRecognition
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));  // 读取本地图片
    
    // 调用TCMPRecognition的Gradio API（关键：直接调用其公开接口）
    const response = await axios.post(
      'https://winycg-tcmprecognition.hf.space/run/predict',  // TCMP的公开API端点
      {
        data: [
          {
            path: imagePath,
            url: null,  // 本地文件上传时url为null
            is_stream: false
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 解析API返回结果
    const result = response.data.data[0];
    
    // 删除临时文件
    fs.unlinkSync(imagePath);
    
    // 返回处理后的结果
    res.json({
      success: true,
      result: {
        label: result.label,
        items: result.confidences || []
      }
    });
  } catch (error) {
    console.error('识别错误:', error.message);
    res.json({
      success: false,
      error: error.message || '识别失败'
    });
  }
});

// 启动服务
app.listen(port, () => {
  console.log(`服务运行在端口 ${port}`);
});
    