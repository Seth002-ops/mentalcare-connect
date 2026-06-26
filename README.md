# Afya Care Connect 3.0 - Production Setup Guide

## Overview

Afya Care Connect 3.0 is a comprehensive mental health platform with:
- **Frontend**: React application for clients and therapists
- **Backend**: FastAPI REST API
- **Admin Dashboard**: Flask-based admin panel with database management
- **Real-time Chat**: WebSocket-enabled messaging
- **Database**: SQLite (upgradeable to PostgreSQL for production)

## Project Structure

```
afya connect 3.0/
├── frontend/                 # React application
├── backend/                  # FastAPI server
├── admin/                    # Flask admin dashboard
├── afya_care.db             # SQLite database (auto-created)
└── .venv/                   # Virtual environment
```

## Prerequisites

- Python 3.8+ (recommend 3.10+)
- Node.js 16+ and npm
- Git (optional)

## Installation & Setup

### 1. Create Virtual Environment

```bash
cd "afya connect 3.0"
python -m venv .venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
.\.venv\Scripts\activate
```

**Mac/Linux:**
```bash
source .venv/bin/activate
```

### 3. Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Install Admin Dashboard Dependencies

```bash
pip install -r admin/requirements.txt
```

### 5. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Option 1: Individual Terminals (Recommended for Development)

**Terminal 1 - Backend API (Port 8000):**
```bash
cd backend
python main.py
```

**Terminal 2 - Admin Dashboard (Port 5000):**
```bash
cd admin
python app.py
```

**Terminal 3 - Frontend (Port 3000):**
```bash
cd frontend
npm start
```

### Option 2: Single Command (Windows)

Create a batch file `start-all.bat`:
```batch
@echo off
start "Afya Backend" cmd /k "cd backend && python main.py"
start "Afya Admin" cmd /k "cd admin && python app.py"
start "Afya Frontend" cmd /k "cd frontend && npm start"
```

Then run: `start-all.bat`

## Access Points

| Component | URL | Credentials |
|-----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Sign up or login |
| **Backend API** | http://localhost:8000 | N/A |
| **Admin Dashboard** | http://localhost:5000 | admin / admin123 |
| **API Docs** | http://localhost:8000/docs | N/A |

## Admin Dashboard Features

### Database Management
- View all users (clients & therapists)
- View chat messages
- View session bookings
- Delete users (with confirmation)
- Pagination support

### Accessibility Features
- ♿ **High Contrast Mode** - Better visibility for users with visual impairments
- 📝 **Large Text Mode** - Increased font sizes for readability
- ⌨️ **Keyboard Navigation** - Full keyboard support
- 🎙️ **Screen Reader Support** - ARIA labels and semantic HTML

### Access the Dashboard
1. Navigate to `http://localhost:5000`
2. Login with credentials: `admin` / `admin123`
3. View database statistics and manage users

## Frontend Features

### User Types
- **Clients**: Book therapy sessions, chat with therapists, make payments
- **Therapists**: Offer services, chat with clients, manage sessions

### Strong Password Requirements
When creating an account, passwords must include:
- ✓ At least 8 characters
- ✓ One uppercase letter (A-Z)
- ✓ One lowercase letter (a-z)
- ✓ One number (0-9)
- ✓ One special character (!@#$%^&*)

Real-time validation shows which requirements are met.

## API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login user

### Messages
- `GET /messages/{room_id}` - Get chat messages
- `POST /messages` - Send message

### Bookings
- `POST /bookings` - Create booking
- `GET /bookings/{booking_id}` - Get booking details

### Admin Endpoints
- `GET /admin/api/users` - Get all users
- `GET /admin/api/users/clients` - Get clients
- `GET /admin/api/users/therapists` - Get therapists
- `DELETE /admin/api/users/{user_id}` - Delete user

## Production Configuration

### Environment Variables

Create `.env` files in respective directories:

**backend/.env:**
```
SECRET_KEY=your-secure-secret-key
DATABASE_URL=sqlite:///afya_care.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here
```

**admin/.env:**
```
FLASK_ENV=production
SECRET_KEY=your-secure-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here
```

### Database
- Default: SQLite (development)
- For Production: Migrate to PostgreSQL

### CORS Settings
- Frontend: `http://localhost:3000` (update for production domain)
- Located in `backend/main.py`

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Database Issues
```bash
# Reset database
rm afya_care.db  # Unix
del afya_care.db # Windows
```

### Module Not Found
```bash
# Reinstall dependencies
pip install --upgrade -r backend/requirements.txt
```

## Security Best Practices

1. **Change Default Credentials**: Update admin username/password
2. **Use HTTPS**: In production, deploy with SSL certificates
3. **Database**: Backup regularly and use strong credentials
4. **Secrets**: Store sensitive data in environment variables
5. **API Keys**: Generate and rotate JWT secrets periodically

## Deployment

### For Production Deployment:

1. **Use a Production WSGI Server**
   - Backend: `gunicorn` instead of Uvicorn
   - Admin: `gunicorn` instead of Flask dev server

2. **Database**: Migrate to PostgreSQL

3. **Reverse Proxy**: Use Nginx/Apache

4. **SSL/TLS**: Use Let's Encrypt certificates

5. **Environment**: Set `FLASK_ENV=production` and `ENVIRONMENT=production`

## Support & Maintenance

- Check logs for errors
- Monitor database size
- Review API usage patterns
- Keep dependencies updated
- Regular backups

## Features Overview

### For Clients
- ✅ Browse therapists
- ✅ Real-time chat
- ✅ Book sessions
- ✅ Make payments
- ✅ View session history

### For Therapists
- ✅ Create profile
- ✅ Accept clients
- ✅ Real-time chat
- ✅ Manage sessions
- ✅ View earnings

### For Administrators
- ✅ Manage users
- ✅ View all messages
- ✅ Monitor bookings
- ✅ System statistics
- ✅ Accessibility options

---

**Last Updated**: May 2026
**Version**: 3.0.0
