# Pulse - Production-Ready Multi-Tenant Platform

A modern, scalable, production-ready business application with web and mobile support. Built with NestJS, Next.js, React Native (Expo), and MongoDB.

## 🚀 Features

- **Multi-Tenant Architecture** - Secure tenant isolation with MongoDB
- **Modern Tech Stack** - NestJS, Next.js 14, React Native (Expo)
- **Authentication** - JWT-based auth with refresh tokens
- **Type-Safe** - Full TypeScript support across all packages
- **Monorepo** - Turborepo for efficient builds and caching
- **Production Ready** - Docker, CI/CD, and comprehensive testing
- **Mobile & Web** - Unified codebase with shared types and logic

## 📁 Project Structure

```
business-app/
├── apps/
│   ├── api/              # NestJS backend API
│   ├── web/              # Next.js web application
│   └── mobile/           # Expo React Native mobile app
├── packages/
│   ├── types/            # Shared TypeScript types
│   └── config/           # Shared configurations
├── docker/               # Docker configurations
├── docs/                 # Documentation
└── .github/              # CI/CD workflows
```

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **MongoDB** - NoSQL database
- **Redis** - Caching and queues
- **BullMQ** - Background job processing

### Web Frontend
- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS
- **ShadCN UI** - High-quality UI components
- **Zustand** - State management

### Mobile
- **Expo** - React Native framework
- **Expo Router** - File-based routing
- **Nativewind** - TailwindCSS for React Native

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- MongoDB (or MongoDB Atlas account)
- Redis (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate Prisma client**
   ```bash
   cd apps/api
   pnpm prisma:generate
   ```

5. **Start development servers**
   ```bash
   # Start all services
   pnpm dev

   # Or start individually
   pnpm dev:api    # API on http://localhost:3001
   pnpm dev:web    # Web on http://localhost:3000
   pnpm dev:mobile # Mobile with Expo
   ```

## 🐳 Docker Development

Run the entire stack with Docker Compose:

```bash
docker-compose up
```

This starts:
- MongoDB on port 27017
- Redis on port 6379
- API on port 3001
- Web on port 3000

## 📱 Mobile Development

### iOS
```bash
cd apps/mobile
pnpm ios
```

### Android
```bash
cd apps/mobile
pnpm android
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=api
```

## 🏗️ Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter=web
```

## 📚 Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md)
- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

**Critical variables:**
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT token signing
- `NEXT_PUBLIC_API_URL` - API URL for frontend

## 🚀 Deployment

### API Deployment

1. Build Docker image:
   ```bash
   docker build -f docker/api.Dockerfile -t business-app-api .
   ```

2. Deploy to your platform (AWS ECS, GCP Cloud Run, etc.)

### Web Deployment

Deploy to Vercel (recommended):
```bash
cd apps/web
vercel
```

Or build Docker image:
```bash
docker build -f docker/web.Dockerfile -t business-app-web .
```

### Mobile Deployment

Build with EAS:
```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern best practices
- Inspired by production-grade applications
- Community-driven development

## 📞 Support

For support, email support@businessapp.com or join our Slack channel.

---

**Built with ❤️ for modern businesses**
