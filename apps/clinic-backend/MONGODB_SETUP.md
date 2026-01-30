# MongoDB Setup and Troubleshooting Guide

## Quick Setup

### 1. Install MongoDB
- **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

### 2. Start MongoDB Service

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB

# Or run manually
mongod --dbpath "C:\data\db"
```

**macOS/Linux:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or run manually
mongod --dbpath /data/db
```

### 3. Verify MongoDB is Running

```bash
# Check MongoDB version
mongod --version

# Connect to MongoDB shell
mongosh

# Or older versions
mongo
```

### 4. Configure Connection String

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/clinic-store
JWT_SECRET=your-secret-key-here
PORT=3000
```

Or use MongoDB Atlas (cloud):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-store
```

## Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solutions:**
1. **Check if MongoDB is running:**
   ```bash
   # Windows
   Get-Service MongoDB
   
   # macOS/Linux
   sudo systemctl status mongod
   ```

2. **Check MongoDB port (default: 27017):**
   ```bash
   # Windows
   netstat -an | findstr 27017
   
   # macOS/Linux
   lsof -i :27017
   ```

3. **Verify connection string:**
   - Default: `mongodb://localhost:27017/clinic-store`
   - Make sure no firewall is blocking port 27017

4. **Check MongoDB logs:**
   - Windows: `C:\Program Files\MongoDB\Server\<version>\log\mongod.log`
   - macOS/Linux: `/var/log/mongodb/mongod.log`

### Problem: "Authentication failed"

**Solutions:**
1. If using MongoDB Atlas, check username/password
2. If using local MongoDB without auth, remove credentials from connection string
3. Check MongoDB user permissions

### Problem: "Database connection timeout"

**Solutions:**
1. Increase connection timeout in connection string:
   ```
   mongodb://localhost:27017/clinic-store?connectTimeoutMS=30000
   ```

2. Check network connectivity
3. Verify MongoDB is accessible from your application

## Health Check Endpoints

After starting the server, check database connection:

1. **Public health check** (no auth required):
   ```
   GET http://localhost:3000/health
   ```
   Response includes database connection status.

2. **Authenticated health check**:
   ```
   GET http://localhost:3000/health/auth
   Authorization: Bearer <your-token>
   ```

## Common Connection Strings

### Local MongoDB (default):
```
mongodb://localhost:27017/clinic-store
```

### Local MongoDB with authentication:
```
mongodb://username:password@localhost:27017/clinic-store?authSource=admin
```

### MongoDB Atlas (cloud):
```
mongodb+srv://username:password@cluster.mongodb.net/clinic-store?retryWrites=true&w=majority
```

### MongoDB with connection options:
```
mongodb://localhost:27017/clinic-store?retryWrites=true&w=majority&connectTimeoutMS=30000
```

## Testing Connection

Use MongoDB Compass (GUI) or mongosh (CLI) to test connection:

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/clinic-store"

# List databases
show dbs

# Use clinic-store database
use clinic-store

# List collections
show collections
```

## Server Logs

The server now logs MongoDB connection events:
- ✅ **Green**: MongoDB connected successfully
- ❌ **Red**: MongoDB connection error
- ⚠️ **Yellow**: MongoDB disconnected

Check your terminal/console for these messages when starting the server.
