# Clinic Monorepo

A full-stack dental clinic management system built with React, Express, MongoDB, and Nx monorepo architecture.

## 🎯 Project Status

✅ **Fully converted to TypeScript** - All code is now written in TypeScript with strict type checking  
✅ **Nx Monorepo** - Using Nx for workspace management and build orchestration  
✅ **Single Repository** - All applications consolidated into one unified repository  
✅ **Production Ready** - Fully configured and ready for development and deployment

## Project Structure

```
clinic/
├── apps/
│   ├── clinic-frontend/     # React + Vite frontend application
│   └── clinic-backend/      # Express + MongoDB backend API
├── libs/
│   └── shared/              # Shared TypeScript types and utilities
├── nx.json                  # Nx workspace configuration
├── package.json             # Root package.json with all dependencies
├── tsconfig.base.json       # Base TypeScript configuration
└── README.md                # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (running locally on `mongodb://localhost:27017` or configure connection string)
- **Nx CLI** (optional, but recommended: `npm install -g nx`)

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

   ```bash
   cd clinic
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables** (optional):
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/clinic-store
   JWT_SECRET=your-secret-key-here
   PORT=3000
   VITE_API_BASE_URL=http://localhost:3000
   ```

## Development

### Running the Applications

#### Start Backend Server

```bash
npm run dev:backend
# or
nx serve clinic-backend
```

The backend will run on `http://localhost:3000`

#### Start Frontend Application

```bash
npm run dev:frontend
# or
nx serve clinic-frontend
```

The frontend will run on `http://localhost:4200`

#### Run Both Simultaneously

Open two terminal windows and run each command separately, or use a process manager like `concurrently`.

### Building for Production

#### Build All Applications

```bash
npm run build
# or
nx run-many --target=build --all
```

#### Build Individual Applications

```bash
npm run build:frontend
npm run build:backend
# or
nx build clinic-frontend
nx build clinic-backend
```

## Available Nx Commands

### Development

- `nx serve clinic-backend` - Start backend development server (port 3000)
- `nx serve clinic-frontend` - Start frontend development server (port 4200)
- `nx serve <app-name>` - Start development server for any app

### Building

- `nx build clinic-backend` - Build backend for production
- `nx build clinic-frontend` - Build frontend for production
- `nx build <app-name>` - Build any application for production
- `nx run-many --target=build --all` - Build all applications

### Code Quality

- `nx lint clinic-backend` - Lint backend code
- `nx lint clinic-frontend` - Lint frontend code
- `nx lint <app-name>` - Lint any application
- `nx run-many --target=lint --all` - Lint all projects

### Testing

- `nx test <app-name>` - Run tests for an application
- `nx run-many --target=test --all` - Run tests for all projects

### Utilities

- `nx graph` - Visualize project dependencies
- `nx reset` - Clear Nx cache
- `nx run-many --target=<target> --all` - Run any target for all projects

## Project Architecture

### Frontend (`apps/clinic-frontend`)

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Styling**: CSS modules

**Key Features**:

- User authentication (login/signup)
- Product catalog with filtering
- Shopping cart functionality
- Admin dashboard
- Contact form
- Team page

### Backend (`apps/clinic-backend`)

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

**API Endpoints**:

- `GET /health` - Health check (requires authentication)
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `GET /auth/validate` - Validate JWT token
- `GET /products` - Get all products
- `POST /products` - Create product (admin only)
- `PUT /products/:id` - Update product (admin only)
- `DELETE /products/:id` - Delete product (admin only)
- `GET /categories` - Get all categories
- `POST /categories` - Create category (admin only)
- `PUT /categories/:id` - Update category (admin only)
- `GET /cart` - Get user's cart (requires authentication)
- `POST /cart` - Add item to cart (requires authentication)
- `PUT /cart` - Update cart (requires authentication)
- `DELETE /cart/:productId` - Remove item from cart (requires authentication)
- `GET /services` - Get all services
- `POST /services` - Create service (admin only)
- `GET /doctors` - Get all doctors
- `GET /appointments/available-slots` - Get available appointment slots
- `POST /appointments` - Create appointment (requires authentication)

### Shared Library (`libs/shared`)

Contains shared TypeScript interfaces and types used across both frontend and backend:

- `User` - User interface
- `Product` - Product interface
- `Service` - Service interface
- `Category` - Category interface
- `Cart` - Shopping cart interface
- `Appointment` - Appointment interface
- And more...

## TypeScript Configuration

The project is **fully converted to TypeScript** and uses **strict TypeScript mode** with the following key settings:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `strictBindCallApply: true`
- `strictPropertyInitialization: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

### Module System

- **Backend**: Uses ES Modules (ESM) with `.js` extensions in imports (TypeScript requirement for ESM)
- **Frontend**: Uses ES Modules with React JSX support
- **Shared Library**: Common types exported for use across applications

## Database Setup

1. **Install MongoDB** (if not already installed)
2. **Start MongoDB service**:

   ```bash
   # On Windows
   net start MongoDB

   # On macOS/Linux
   sudo systemctl start mongod
   # or
   mongod
   ```

3. **Create database**: The application will automatically create the `clinic-store` database on first connection.

## Environment Variables

### Backend

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/clinic-store`)
- `JWT_SECRET` - Secret key for JWT tokens (default: `secret`)
- `PORT` - Server port (default: `3000`)

### Frontend

- `VITE_API_BASE_URL` - Backend API URL (default: `http://localhost:3000`)

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env` or `dbConnection.ts`
- Verify MongoDB is accessible on the configured port

### Port Already in Use

- Change the port in `vite.config.ts` (frontend) or `main.ts` (backend)
- Or stop the process using the port

### TypeScript Errors

- Run `npm install` to ensure all type definitions are installed
- Check `tsconfig.json` files for correct configuration
- Ensure all imports use correct file extensions (`.ts`, `.tsx`)

### Build Errors

- Clear Nx cache: `nx reset`
- Delete `node_modules` and reinstall:

  ```bash
  # Windows PowerShell
  Remove-Item -Recurse -Force node_modules; npm install

  # macOS/Linux
  rm -rf node_modules && npm install
  ```

- Check for TypeScript errors: `nx run-many --target=lint --all`
- Verify TypeScript configuration: Check `tsconfig.base.json` and app-specific `tsconfig.json` files

### Module Import Errors

- Ensure imports use `.js` extension for backend files (required for ES modules)
- Frontend imports should use relative paths without extensions
- Shared library imports use `@clinic/shared` alias

## Development Workflow

1. **Start MongoDB** (if not running as a service)
2. **Start Backend**: `npm run dev:backend`
3. **Start Frontend**: `npm run dev:frontend` (in a new terminal)
4. **Make changes** to code
5. **Test changes** in the browser
6. **Build for production** when ready: `npm run build`

## Code Style

- Use TypeScript for all new files
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add type annotations for all functions and variables
- Use ESLint for code quality

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure all TypeScript types are correct
4. Test your changes
5. Submit a pull request

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
