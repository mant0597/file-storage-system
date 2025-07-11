const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || 'mongodb://mongo:27017/fileDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

const fileSchema = new mongoose.Schema({
  originalName: String,
  fileName: String,
  url: String,
  size: Number,
  mimeType: String,
  uploadedAt: { type: Date, default: Date.now }
});
const File = mongoose.model('File', fileSchema);

// S3 config for MinIO
const s3 = new AWS.S3({
  endpoint: `http://${process.env.MINIO_ENDPOINT || 'minio'}:${process.env.MINIO_PORT || '9000'}`,
  accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  region: 'us-east-1',
  s3ForcePathStyle: true, 
});

const createBucket = async () => {
  const bucketName = 'file-uploads';
  try {
    await s3.headBucket({ Bucket: bucketName }).promise();
    console.log(`Bucket ${bucketName} already exists`);
  } catch (err) {
    if (err.statusCode === 404) {
      try {
        await s3.createBucket({ Bucket: bucketName }).promise();
        console.log(`Bucket ${bucketName} created successfully`);
      } catch (createErr) {
        console.error('Error creating bucket:', createErr);
      }
    } else {
      console.error('Error checking bucket:', err);
    }
  }
};

// Multer-S3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'file-uploads',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const filename = uuidv4() + '-' + file.originalname;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = new File({
      originalName: req.file.originalname,
      fileName: req.file.key,
      url: req.file.location,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
    
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await File.find()
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await File.countDocuments();
    
    res.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

app.delete('/api/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await s3.deleteObject({
      Bucket: 'file-uploads',
      Key: file.fileName
    }).promise();

    await File.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createBucket();
  
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
};

startServer().catch(console.error);