# BillTracker Application

## Overview

BillTracker is a full-stack React application built with Express.js backend for managing personal bills and payment tracking. The application now features multi-device authentication through Replit Auth and bill image upload functionality, providing a complete bill management solution with secure access across devices.

## System Architecture

### Full-Stack TypeScript Application with Authentication
- **Frontend**: React 18 with TypeScript, Vite as build tool
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect with multi-device support
- **File Storage**: Local file system with multer for bill image uploads
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Monorepo Structure
The application follows a monorepo architecture with clear separation:
- `client/` - React frontend application with authentication
- `server/` - Express.js backend API with protected routes
- `shared/` - Shared TypeScript types and schemas
- `uploads/` - File storage directory for bill images
- Root-level configuration files for tooling

## Key Components

### Authentication System
- **Multi-Device Login**: Replit Auth with OpenID Connect protocol
- **Session Management**: PostgreSQL-backed sessions for scalability
- **Protected Routes**: All bill operations require authentication
- **User Management**: Automatic user creation and profile management
- **Cross-Device Sync**: Bills accessible from any authenticated device

### Frontend Architecture
- **Component Library**: shadcn/ui components built on Radix UI primitives
- **Routing**: Wouter with authentication-aware routing
- **Authentication**: useAuth hook for authentication state management
- **Form Management**: React Hook Form with Zod schema validation
- **Data Fetching**: TanStack Query with authentication error handling
- **Image Upload**: File picker with preview functionality
- **Styling**: Tailwind CSS with CSS variables for theming

### Backend Architecture
- **API Server**: Express.js with TypeScript and authentication middleware
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with passport.js integration
- **File Upload**: Multer middleware for bill image handling
- **Storage Abstraction**: Database storage with user isolation
- **Request Logging**: Custom middleware for API request tracking
- **Error Handling**: Centralized error handling with auth support

### Database Schema
Enhanced database schema with user authentication and file storage:

**Users Table:**
- `id` - Primary key (Replit user ID)
- `email` - User email address
- `firstName` - User first name
- `lastName` - User last name
- `profileImageUrl` - Profile image URL from Replit
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

**Bills Table:**
- `id` - Auto-incrementing primary key
- `userId` - Foreign key to users table
- `name` - Bill name/description
- `amount` - Decimal amount with 2 decimal places
- `dueDate` - ISO date string for due date
- `category` - Predefined categories (utilities, rent, credit_cards, etc.)
- `company` - Optional company name
- `notes` - Optional notes field
- `status` - Bill status (paid, unpaid, overdue)
- `recurring` - Boolean flag for recurring bills
- `imageUrl` - Path to uploaded bill image/receipt
- `createdAt` - Bill creation timestamp
- `updatedAt` - Last update timestamp

**Sessions Table:**
- `sid` - Session ID (primary key)
- `sess` - Session data (JSON)
- `expire` - Session expiration timestamp

## Data Flow

### Bill Management Flow
1. **Create Bill**: Form submission → Zod validation → API POST → Database insert → Query invalidation
2. **View Bills**: Component mount → TanStack Query fetch → API GET → Database query → UI render
3. **Update Status**: User action → API PATCH → Database update → Optimistic UI update
4. **Filter/Search**: Local state changes → Client-side filtering → UI re-render

### Form Validation Pipeline
1. Client-side validation using React Hook Form + Zod
2. Server-side validation using same Zod schemas
3. Consistent error handling across client/server boundary

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form
- **Backend Framework**: Express.js with TypeScript support
- **Database**: PostgreSQL via Neon serverless, Drizzle ORM
- **Build Tools**: Vite, TypeScript, ESBuild for production builds

### UI and Styling
- **Component Library**: Radix UI primitives, shadcn/ui components
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date manipulation

### Development and Deployment
- **Development**: tsx for TypeScript execution, Replit integration
- **Database Migrations**: Drizzle Kit for schema management
- **Session Management**: connect-pg-simple for PostgreSQL session store

## Deployment Strategy

### Production Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **Session Configuration**: PostgreSQL-backed sessions for scalability

### Development Workflow
- **Dev Server**: tsx runs TypeScript directly with hot reload
- **Database**: Neon serverless PostgreSQL for development and production
- **Asset Serving**: Vite dev server in development, Express static in production

## Changelog
- June 29, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.