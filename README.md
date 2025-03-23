# Shortscut - Content Agency Portal

Shortscut is a web application for managing clients and contracts for a content agency specializing in organic social media content creation.

## Overview

This application helps content agencies manage their clients, contracts, and projects in one centralized platform. It provides features for client management, contract tracking, and project workflow organization.

## Features

- **Client Management**: Store and manage client information, contacts, and activity history
- **Contract Handling**: Create, track, and manage client contracts
- **Dashboard**: View key business metrics and recent activity
- **User Authentication**: Secure login and role-based access control

## Tech Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **API Routes**: Next.js API Routes
- **Authentication**: JWT with secure token handling
- **Form Validation**: React Hook Form with Zod

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tanner-le/shortscut.git
   cd shortscut
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Project Structure

```
shortscut/
├── public/             # Static files
├── src/                # Source code
│   ├── app/            # Next.js app router
│   │   ├── api/        # API routes
│   │   ├── auth/       # Authentication pages
│   │   ├── clients/    # Client management pages
│   │   ├── contracts/  # Contract management pages
│   │   └── dashboard/  # Dashboard page
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and libraries
│   ├── store/          # Redux store configuration
│   └── types/          # TypeScript type definitions
├── .env.local          # Environment variables (create this)
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies
└── tailwind.config.js  # Tailwind CSS configuration
```

## Development Roadmap

### Phase 1: MVP Core Functionality
- User authentication system
- Basic client management
- Simple contract tracking
- Dashboard with key metrics

### Phase 2: Enhanced Functionality
- Advanced project management
- Content management features
- Enhanced communication tools
- Detailed reporting

### Phase 3: Optimization and Integration
- Analytics dashboard
- Third-party integrations
- Workflow automation features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Acknowledgments

- Built with Next.js
- Styled with Tailwind CSS
- State managed with Redux Toolkit

## Database Setup with Supabase

This project uses PostgreSQL with Prisma ORM for data management, hosted on Supabase. Follow these steps to set up your database:

1. **Create a Supabase Account and Project**
   - Go to [Supabase](https://supabase.com/) and sign up for an account
   - Create a new project with a PostgreSQL database
   - Set a secure database password and note it down

2. **Get Your Database Connection String**
   - In your Supabase dashboard, go to Project Settings > Database
   - Find and copy the connection string (URI format)
   - It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijkl.supabase.co:5432/postgres`
   - Replace `[YOUR-PASSWORD]` with the database password you set

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_PROJECT_HOST.supabase.co:5432/postgres"
   JWT_SECRET="your-generated-jwt-secret"
   ```
   - Generate a secure JWT secret using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. **Apply Database Migrations**
   - Run `npx prisma migrate dev --name init` to create the database tables
   - This will create all necessary tables based on the schema defined in `prisma/schema.prisma`

5. **Seed the Database**
   - Run `npm run db:seed` to populate the database with initial data
   - The seed script creates test users, clients, and contracts

6. **Explore Your Database (Optional)**
   - Use Prisma Studio to view and edit your data: `npx prisma studio`
   - Or access your data directly through the Supabase dashboard

## Database Schema

The database schema includes the following models:

- **Users**: Application users with authentication
- **Clients**: Client organizations
- **Contracts**: Agreements between clients and your business
- **Projects**: Individual projects within contracts

You can view the schema in the Prisma Studio by running `npx prisma studio`.
