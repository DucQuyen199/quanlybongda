# Football Management System

A comprehensive system for managing football tournaments, teams, players, and matches.

## Setup and Running

### Prerequisites
- Node.js (v14+)
- MS SQL Server
- npm

### Database Setup
1. Run the database initialization script:
```bash
npm run db:init
```

This will check and create any missing tables in the database.

### Running the Application

#### Start the Admin Backend and Frontend
```bash
# Start the admin backend server
npm run start:admin-backend

# In a new terminal, start the admin frontend
npm run start:admin-frontend
```

#### Using the Start Script
Alternatively, you can run both frontend and backend using the start script:
```bash
npm start
```

### Default Admin Login
- Username: admin
- Password: admin123

## Features

### Admin Application
- User Authentication
- Tournament Management
  - Create, edit, and delete tournaments
  - View tournament details
  - Add/remove teams from tournaments
- Team Management
  - Create, edit, and delete teams
  - View team details
- Match Management
  - Schedule matches between teams
  - Record match results

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile

### Tournaments
- `GET /api/giaidau` - Get all tournaments
- `GET /api/giaidau/:id` - Get tournament by ID
- `POST /api/giaidau` - Create a new tournament
- `PUT /api/giaidau/:id` - Update tournament
- `DELETE /api/giaidau/:id` - Delete tournament
- `GET /api/giaidau/admin/paginated` - Get paginated tournaments with filtering
- `GET /api/giaidau/admin/detail/:id` - Get tournament details with teams and matches
- `POST /api/giaidau/team` - Add team to tournament
- `DELETE /api/giaidau/:id/team/:teamId` - Remove team from tournament

### Teams
- `GET /api/doibong` - Get all teams (with pagination and search)
- `GET /api/doibong/:id` - Get team by ID
- `POST /api/doibong` - Create a new team
- `PUT /api/doibong/:id` - Update team
- `DELETE /api/doibong/:id` - Delete team
