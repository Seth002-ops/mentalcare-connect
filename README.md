# Mecac - Mental Care Connect

A secure, end-to-end encrypted healthcare platform connecting clients with licensed therapists. Built with **React** (frontend) and **FastAPI** (backend).

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **Python** (v3.13+) - [Download](https://www.python.org/)
- **npm** (comes with Node.js)
- **pip** (Python package manager)

### Verify CLI Tools

Before proceeding, verify all tools are in your PATH:

#### Windows PowerShell
```powershell
node --version
npm --version
python --version
pip --version
```

#### macOS / Linux
```bash
node --version
npm --version
python3 --version
pip3 --version
```

All commands should return version numbers. If any command is not found, see **Setting PATH** below.

---

## 🛠️ Setting PATH

### Windows

#### Node.js & npm
1. Open **Control Panel** → **System and Security** → **System** → **Advanced system settings**
2. Click **Environment Variables**
3. Under **User variables**, click **New** → Add:
   - **Variable name**: `PATH`
   - **Variable value**: `C:\Program Files\nodejs` (adjust path if different)
4. Click **OK** → **OK**
5. **Restart VS Code** or PowerShell for changes to take effect

#### Python & pip
1. During Python installation, **check "Add Python to PATH"**
2. If already installed:
   - Open Python installer → **Modify** → **Next** → **Check "Add Python to PATH"** → **Install**
3. Verify:
   ```powershell
   python --version
   pip --version
   ```
4. **Restart VS Code** or PowerShell

### macOS

```bash
# Homebrew (recommended)
brew install node
brew install python3

# Verify
node --version
npm --version
python3 --version
pip3 --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip

# Verify
node --version
npm --version
python3 --version
pip3 --version
```

---

## 📦 Installation

### 1. Frontend Setup

```bash
cd frontend
npm install
```

**Verify frontend build:**
```bash
npm run build
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

**Verify backend dependencies:**
```bash
pip list | grep -E "fastapi|sqlalchemy|uvicorn"
```

---

## ▶️ Running the Application

### Terminal 1: Start Backend (FastAPI)

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Terminal 2: Start Frontend (React Dev Server)

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the app in the browser at http://localhost:3000
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **WebSocket**: ws://localhost:8000/ws/{roomId}

---

## ✅ Verification Steps

### 1. Backend Health Check

```bash
curl http://localhost:8000/
# or in PowerShell:
Invoke-RestMethod -Uri http://localhost:8000/
```

**Expected response:**
```json
{
  "message": "Afya Care Connect API 🚀",
  "status": "healthy",
  "features": [
    "✅ End-to-end encrypted chat",
    "✅ JWT authentication",
    "✅ SQLite + SQLAlchemy",
    "✅ WebSocket real-time chat",
    "✅ M-PESA payment simulation"
  ]
}
```

### 2. Frontend Health Check

Open browser and navigate to `http://localhost:3000`. You should see:
- Mecac logo with "Mental Care Connect" tagline
- Hero section with "Bridging You and Your Therapist, Safely"
- CTA buttons (both link to `/booking`)
- Feature cards with solid green/blue colors (no gradients)

### 3. Test Sign-Up Flow

1. Navigate to http://localhost:3000/signup
2. Fill form with:
   - Email: `test@example.com`
   - Password: `TestPass123!`
   - User Type: Client
3. Click "Create Account"
4. Verify redirect to dashboard

### 4. Test Sign-In Flow

1. Navigate to http://localhost:3000/login
2. Enter credentials from step 3
3. Click "Sign In"
4. Verify redirect to dashboard

### 5. Test Booking Flow

1. Logged in or on landing page, click "Get Started" or "Find a Therapist"
2. Navigate to http://localhost:3000/booking
3. Select a therapist
4. Pick a date and time
5. Verify "Proceed to Payment" button is enabled and shows price

---

## 📋 Async Handling Guidelines

### JavaScript (Frontend)

**Use `Promise.all()` when:**
- All requests must succeed before continuing
- Results are needed in order
- Example: Fetch user profile + preferences + settings

```javascript
// ✅ Correct: Load independent data in parallel
const [profile, preferences, settings] = await Promise.all([
  fetch('/api/profile').then(r => r.json()),
  fetch('/api/preferences').then(r => r.json()),
  fetch('/api/settings').then(r => r.json())
]);
```

**Use `Promise.any()` when:**
- Only the first successful result is needed
- Failures can be ignored until one succeeds
- Example: Query multiple mirror servers, use the fastest

```javascript
// ✅ Correct: Use first successful response
const result = await Promise.any([
  fetch('https://mirror1.example.com/data'),
  fetch('https://mirror2.example.com/data'),
  fetch('https://mirror3.example.com/data')
]);
```

**Avoid sequential awaits:**
```javascript
// ❌ Wrong: Sequential awaits waste time
const data = await response.json();
const error = await response.json(); // This is also wrong: can't read body twice

// ✅ Correct: Read body once
const text = await response.text();
const data = text ? JSON.parse(text) : null;
```

### Python (Backend)

**Use `asyncio.gather()` when:**
- All tasks must complete before continuing
- Example: Broadcast message to all WebSocket clients

```python
# ✅ Correct: Send to all clients concurrently
await asyncio.gather(
    *(connection.send_text(message) for connection in active_connections)
)
```

**Use `asyncio.wait(return_when=asyncio.FIRST_COMPLETED)` when:**
- Only the first successful result is needed
- Example: Query multiple databases, use first response

```python
# ✅ Correct: Get first successful query
done, pending = await asyncio.wait(
    [fetch_from_db1(), fetch_from_db2(), fetch_from_db3()],
    return_when=asyncio.FIRST_COMPLETED
)
for task in pending:
    task.cancel()
result = done.pop().result()
```

---

## 🎨 UI Effects & Animations for Mental Health

To enhance the user experience and emphasize mental health themes, consider adding:

### 1. **Calming Transitions**
- Fade-in animations on page load
- Smooth scroll behavior
- Gentle hover effects on cards

```css
/* Example: Fade-in animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  animation: fadeInUp 0.8s ease-out;
}
```

### 2. **Breathing Animation** (Stress Relief)
```css
@keyframes breathing {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.breathing-element {
  animation: breathing 4s ease-in-out infinite;
}
```

### 3. **Recommended Asset Sources**

**Free Mental Health Images:**
- [Unsplash](https://unsplash.com) - Search: "mental health", "therapy", "meditation"
- [Pexels](https://www.pexels.com) - Search: "wellness", "peace", "mindfulness"
- [Pixabay](https://pixabay.com) - Search: "mental wellbeing", "support"

**Recommended Visual Themes:**
- 🧘 Meditation/yoga poses (calm, peaceful)
- 💚 Green/blue nature scenes (soothing colors)
- 👥 Diverse faces (inclusivity, connection)
- 🌿 Plants/nature (growth, renewal)

**Avoid:**
- ❌ Hospitals, medical settings (sterile)
- ❌ Distressed faces (triggering)
- ❌ Bright, jarring colors (overstimulating)

### 4. **Implementation Example**

**Add hero background image:**
```jsx
<section style={{
  backgroundImage: 'url(/images/meditation.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'brightness(0.4)', // Darken for text readability
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  {/* Your content */}
</section>
```

### 5. **Mental Health Color Palette**

- **Primary Calm Green**: `#4CAF50` (growth, healing)
- **Secondary Trust Blue**: `#2196F3` (stability, safety)
- **Light Support**: `#81C784` (gentle, nurturing)
- **Dark Emphasis**: `#2E7D32` (grounding, security)

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
#   m e n t a l c a r e - c o n n e c t 
 
 