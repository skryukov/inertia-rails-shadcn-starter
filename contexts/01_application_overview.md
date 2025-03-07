# Application Overview

This is a modern full-stack starter application that uses Rails on the backend and React on the frontend, connected via Inertia.js. It's inspired by the Laravel React Starter Kit but implemented for Rails.

## Core Technologies

- **Backend**: Ruby on Rails 8.0.1 with Ruby 3.4.1
- **Frontend**: React 19 with TypeScript
- **Build System**: Vite for frontend assets
- **Communication Layer**: Inertia.js (allows server-side routing with client-side rendering)
- **UI Components**: shadcn/ui (React components with Tailwind CSS styling)
- **Database**: SQLite (configured for easy swap to PostgreSQL/MySQL)
- **Deployment**: Docker and Kamal
- **Authentication**: Custom built-in user authentication system

## Project Structure

The application follows a standard Rails project structure with frontend code organized in a specific way:

```
├── app/
│   ├── controllers/     # Rails controllers
│   ├── models/          # ActiveRecord models
│   ├── frontend/        # React frontend code
│   │   ├── components/  # Reusable React components
│   │   ├── entrypoints/ # Entry points for Vite
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components used by Inertia.js
│   │   └── types/       # TypeScript type definitions
│   └── views/           # Minimal Rails views (mostly layout)
├── bin/                 # Scripts (setup, dev, etc.)
├── config/              # Rails configuration
├── db/                  # Database migrations and schema
├── spec/                # RSpec tests
└── public/              # Static assets
```

## Key Entry Points

- **Frontend**: `app/frontend/entrypoints/inertia.ts` - Main entry point for the Inertia.js application
- **Backend**: `app/controllers/application_controller.rb` - Base controller with authentication
- **HTML Layout**: `app/views/layouts/application.html.erb` - Main HTML template that loads the frontend
- **Routes**: `config/routes.rb` - Application routes

## Authentication System

The built-in authentication system includes:

- User registration and login
- Email verification
- Password reset workflows
- Session management (with multiple device support)
- Account settings (profile, email, password)

## Optional Features

- **Server-Side Rendering**: The application includes optional SSR support
- **Dark Mode**: Built-in light/dark mode implementation
- **Multi-device Session Management**: Users can view and manage active sessions

## Getting Started

The application includes a setup script:

```bash
bin/setup
```

This will install dependencies, set up the database, and start the development server.

## Development Workflow

Start the development server:

```bash
bin/dev
```

This runs:
- Rails server on port 3000
- Vite dev server for fast frontend builds

## For More Information

See the other context files in this directory for more detailed information on specific aspects of the application.