# 🗄️ File Storage System

A scalable full-stack file storage system using:
- 🔧 Express.js (Node.js)
- 🌐 React (Vite)
- 🗂️ MinIO (S3-compatible object storage)
- 🧠 MongoDB (stores metadata)
- 🐳 Docker + Docker Compose
- ⚖️ NGINX load balancer

## 🚀 Features

- Upload files (100MB max)
- Store file metadata in MongoDB
- Distribute backend with NGINX load balancing
- Store files securely on MinIO
- Pagination + delete functionality

## 📦 Getting Started
```bash
git clone https://github.com/mant0597/file-storage-system.git
cd file-storage-system
docker-compose up --build
```
Visit:

Frontend: http://localhost:3000

MinIO Console: http://localhost:9001 (user: minioadmin, pass: minioadmin)

📁 File Structure
/frontend: React app

/backend: Express API

/nginx/nginx.conf: NGINX load balancer config

docker-compose.yml: Brings up entire stack

Made with ❤️ by Manthan Maidawat
