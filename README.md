# Pet Finder Platform

A full-stack web application for posting and finding lost or found pets, built with **Node.js**, **Express**, **PostgreSQL**, **Vite**, **React**, and **Leaflet Maps**.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)

## Features

### Core Features

- **Search & Filter** - Find pets by type (lost/found), species, location radius
- **Interactive Map** - View all posts on Leaflet map with custom markers
- **Post Management** - Create, update, and delete pet posts with images
- **Notifications** - Real-time notification system for users
- **User Profiles** - Manage personal information and view post history
- **Authentication** - Secure JWT-based authentication
- **Admin Panel** - Content and user management for administrators
- **Responsive Design** - Mobile-friendly interface

### User Capabilities by Role

#### Guest (Unauthenticated)

- View all posts on map and list
- Search and filter posts
- View individual post details

#### User (Authenticated)

- All guest capabilities
- Create lost/found pet posts
- Upload multiple images per post
- Manage own posts (edit, delete, update status)
- Receive notifications
- Update profile information

#### Admin

- All user capabilities
- View all users
- Delete any user or post
- Change user roles
- Access admin dashboard

## Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Express Validator** - Input validation

### Frontend

- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Leaflet** - Map integration
- **React Toastify** - Notifications

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nvhmadridista/PetFinder
cd PetFinder
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on this configuration:

```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petfinder
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Database Setup

### 1. Create Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE petfinder;
\q
```

### 2. Run Migrations

```bash
cd backend
npm run migrate
```

This will create all necessary tables:

- `users`
- `posts`
- `pets`
- `images`
- `notifications`

## Running the Application

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

App will open on `http://localhost:5173`

### Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

## API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Post Endpoints

#### Get All Posts (with filters)

```http
GET /api/posts?type=LOST&status=active&species=Dog&latitude=40.7128&longitude=-74.0060&radius=10
```

#### Get Single Post

```http
GET /api/posts/:id
```

#### Create Post

```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "LOST",
  "title": "Lost Golden Retriever",
  "description": "Last seen in Central Park",
  "latitude": 40.7829,
  "longitude": -73.9654,
  "address": "Central Park, NY",
  "pet": {
    "species": "Dog",
    "breed": "Golden Retriever",
    "color": "Golden",
    "gender": "male",
    "characteristics": "Wearing blue collar"
  },
  "images": ["/uploads/image1.jpg"]
}
```

#### Update Post

```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "resolved",
  "description": "Updated description"
}
```

#### Delete Post

```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

#### Get User's Posts

```http
GET /api/posts/user/my-posts
Authorization: Bearer <token>
```

### Image Endpoints

#### Upload Image

```http
POST /api/images/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Delete Image

```http
DELETE /api/images/:id
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Users (Admin only)

```http
GET /api/users
Authorization: Bearer <admin-token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "9876543210"
}
```

#### Delete User (Admin only)

```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

### Notification Endpoints

#### Get User Notifications

```http
GET /api/notifications?unread_only=true
Authorization: Bearer <token>
```

#### Mark as Read

```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read

```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

#### Delete Notification

```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

## User Roles

### Creating an Admin User

To create an admin user, you can:

1. **Via Database:**

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

2. **Via Registration:**
   Modify the registration payload to include `"role": "admin"` (only for initial setup)

## Features in Detail

### Map Integration

- Uses Leaflet.js for interactive maps
- Custom markers for LOST (red) and FOUND (green) posts
- Click markers to view post details
- Radius-based filtering

### Image Upload

- Multiple image upload support
- File size limit: 5MB per image
- Supported formats: JPG, JPEG, PNG, GIF
- Images stored in `/backend/uploads/`

### Geolocation

- Browser geolocation API integration
- Auto-detect user location
- Manual coordinate input option
- Address field for human-readable location

### Notifications

- User-specific notification system
- Mark as read/unread functionality
- Delete notifications
- Filter by read status

### Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- Role-based access control
- Input validation and sanitization

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Issues

Ensure backend `.env` has correct settings and frontend is using correct API URL.

### Image Upload Issues

- Check `uploads/` directory exists
- Verify file permissions
- Check file size limits in `.env`

## Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create petfinder-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)

```bash
# Build the app
npm run build

# Deploy build folder to Netlify or Vercel
```
