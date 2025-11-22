# Getting Started Guide

This guide will help you set up and run the BusinessApp platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with `npm install -g pnpm`
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Optional
- **Docker** & **Docker Compose** - For containerized development
- **Redis** - For caching and background jobs (can skip for initial setup)

## Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd chat-app
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all packages in the monorepo.

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure the following:

   ```env
   # MongoDB Connection
   DATABASE_URL="mongodb://localhost:27017/businessapp"
   # Or for MongoDB Atlas:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/businessapp"

   # JWT Configuration
   JWT_SECRET="your-super-secret-key-change-this"
   JWT_EXPIRES_IN="7d"

   # API Configuration
   API_PORT=3001
   API_URL="http://localhost:3001"

   # Frontend Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

## Step 4: Set Up the Database

1. Make sure MongoDB is running:
   ```bash
   # If using local MongoDB
   mongod
   ```

2. Generate Prisma client:
   ```bash
   cd apps/api
   pnpm prisma:generate
   ```

3. (Optional) Push the schema to your database:
   ```bash
   pnpm prisma:push
   ```

## Step 5: Start Development Servers

### Option A: Start All Services

```bash
pnpm dev
```

This starts:
- API server on http://localhost:3001
- Web app on http://localhost:3000
- Mobile app with Expo

### Option B: Start Services Individually

**Backend API:**
```bash
pnpm dev:api
```
Access at: http://localhost:3001/api/v1

**Web Application:**
```bash
pnpm dev:web
```
Access at: http://localhost:3000

**Mobile Application:**
```bash
pnpm dev:mobile
```
Scan QR code with Expo Go app

## Step 6: Test the Application

1. **Open the web app** at http://localhost:3000
2. **Click "Get Started"** to create an account
3. **Fill in the registration form:**
   - First Name: John
   - Last Name: Doe
   - Company Name: Acme Inc
   - Email: john@acme.com
   - Password: password123

4. **You'll be redirected to the dashboard** after successful registration

## Using Docker (Alternative)

If you prefer using Docker:

```bash
docker-compose up
```

This starts all services including MongoDB and Redis.

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:** 
- Ensure MongoDB is running
- Check your `DATABASE_URL` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Issue: Port Already in Use

**Solution:**
```bash
# Find and kill the process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3001 | xargs kill -9
```

### Issue: Prisma Client Not Generated

**Solution:**
```bash
cd apps/api
pnpm prisma:generate
```

### Issue: Module Not Found

**Solution:**
```bash
# Clean install
pnpm clean
pnpm install
```

## Next Steps

1. **Explore the API** - Visit http://localhost:3001/api/v1
2. **Read the API Documentation** - See [API.md](./API.md)
3. **Learn about deployment** - See [DEPLOYMENT.md](./DEPLOYMENT.md)
4. **Understand the architecture** - See [ARCHITECTURE.md](./ARCHITECTURE.md)

## Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes

3. Run linting and tests:
   ```bash
   pnpm lint
   pnpm test
   ```

4. Build to ensure everything works:
   ```bash
   pnpm build
   ```

5. Commit and push:
   ```bash
   git add .
   git commit -m "Add my feature"
   git push origin feature/my-feature
   ```

### Useful Commands

```bash
# Type checking
pnpm type-check

# Format code
pnpm format

# Clean build artifacts
pnpm clean

# View Prisma Studio (database GUI)
cd apps/api
pnpm prisma:studio
```

## Getting Help

- Check the [README.md](../README.md) for general information
- Review the [API Documentation](./API.md)
- Open an issue on GitHub
- Contact the team

---

**Happy coding! 🚀**
