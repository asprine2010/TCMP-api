const express = require('express');

const multer = require('multer');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// 1. 跨域配置
app.use ((req, res, next) => {
res.setHeader ('Access-Control-Allow-Origin', '*');
res.setHeader ('Access-Control-Allow-Methods', 'GET, POST');
res.setHeader ('Access-Control-Allow-Headers', 'Content-Type');
next ();
});

// 2. 图片存储配置（临时存储）
const storage = multer.diskStorage ({
destination: (req, file, cb) => {
// 确保 uploads 目录存在（Vercel 临时目录可写）
const uploadDir = './uploads';
if (!fs.existsSync (uploadDir)) {
fs.mkdirSync (uploadDir);
}
cb (null, uploadDir);
},
filename: (req, file, cb) => {
// 文件名：时间戳 + 原文件名（避免重复）
cb (null, Date.now () + '-' + file.originalname);
}
});
const upload = multer ({ storage: storage });

// 3. 测试接口（保留）
app.get ('*', (req, res) => {
if (req.path === '/api/test') {
return res.json ({
success: true,
message: ' 服务正常，支持图片上传 ',
timestamp: new Date ().toISOString ()
});
}
res.send ('TCMP 图片识别 API | 测试接口：/api/test | 上传接口：/api/upload');
});

// 4. 图片上传接口（核心新增）
app.post ('/api/upload', upload.single ('image'), (req, res) => {
try {
if (!req.file) {
return res.json ({ success: false, error: ' 未上传图片 ' });
}
// 返回文件名（后续识别需要）
res.json ({
success: true,
filename: req.file.filename,
size: req.file.size + ' bytes'
});
} catch (error) {
res.json ({ success: false, error: error.message });
}
});

// 启动服务
app.listen (port, () => {
console.log (服务运行在端口 ${port});
});
</doubaocanvas-part>