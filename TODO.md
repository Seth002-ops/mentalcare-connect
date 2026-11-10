# Afya Connect 3.0 TODO - Frontend/Backend Integration

## 📝 Original Project Notes (Preserved)

### Completed ✅
- [x] Project analysis (file structure, mocks vs real APIs)
- [x] Edit plan creation and user confirmation
- [x] TODO.md created
- [x] TherapistDashboard.js created & fixed
- [x] Backend server started

### In Progress ⏳
- Backend API testing

### To Do 📋
1. **Frontend API integration** (chat) - login/dashboard/booking/payment done
2. **Frontend deps** (npm i axios)
3. **Test flows** (login/book/chat)
4. **Polish**

**Next: Frontend integration**
2. **Frontend deps & API integration** (axios in components)
3. **Create/enhance Landingpage.js** (already good)
4. **Test full flows**
5. **Polish** (error handling, cleanup)

**Next step: Backend setup**
2. **Backend dependencies & server start** (pip install, uvicorn)
3. **Frontend deps & API integration** (axios in login/clientsdashboard/chat/booking/payment)
4. **Create/enhance Landingpage.js**
5. **Test full flows** (register → book → pay → chat)
6. **Polish** (error handling, WebRTC, cleanup duplicates)

### Done Later 🔮
- Admin dashboard enhancements
- Deployment

---

## 🚀 UPDATED MASTER ROADMAP (Current Project State)

### Phase 1-4: Core Architecture & Features [COMPLETED ✅]
- [x] FastAPI Backend & React Frontend scaffolding
- [x] JWT Authentication & Role-based routing (Client, Therapist, Admin)
- [x] Therapist verification workflow & Admin approval
- [x] M-Pesa payment simulation & Wallet logic
- [x] WebSocket Chat & Jitsi Video integration
- [x] AI Companion (Groq) & SOAP note generation
- [x] Rage Rooms & University Student Pricing logic
- [x] Frontend Production Stability (Lazy loading, Error Boundaries, CORS fixes, App.js routing fix)
- [x] Premium UI/UX (Landing Page, Glassmorphic Dashboards, Trust Badges)

### Phase 5: Security Hub & Redis Infrastructure [COMPLETED ✅]
- [x] Redis connection & `security_service.py` implementation
- [x] IP Quarantine (Blocking/Unblocking) & Rate Limiting middleware
- [x] `SecurityEvent` database model & automated threat logging
- [x] Admin Security Command Center UI (`AdminSecurityHub.js`)
- [x] Security tests & API documentation toggles (`DISABLE_DOCS` env var)
- [x] Fixed CORS headers on early-exit middleware responses (401/403/429)
- [x] Cleaned up backend linting warnings (Ruff configuration)

### Phase 6: Performance & Caching [NEXT UP ⏳]
- [ ] Implement `cache_service.py` on public endpoints (`/universities`, `/rage-rooms`, `/therapists`)
- [ ] Cache Admin Analytics timeseries data (TTL: 30s)
- [ ] Add cache-invalidation hooks when Admins update data

### Phase 7: Containerization & Deployment Prep [PENDING 📋]
- [ ] Write Backend `Dockerfile` (Python slim)
- [ ] Write Frontend `Dockerfile` (Multi-stage Nginx)
- [ ] Create `docker-compose.yml` for local parity
- [ ] Migrate SQLite to PostgreSQL for production concurrency

### Phase 8: QA & End-to-End Polish [PENDING 📋]
- [ ] Full booking-to-payment flow QA
- [ ] Mobile responsiveness check on all dashboards
- [ ] Final Vercel/Render environment variable audit
- [ ] Axios/Fetch standardization across frontend components

---

### Phase 9: Smart Payments — FortPesa + Sponsored Tasting Mode [PLANNED 📋]
*Investor-friendly architecture: global tasting mode toggle + per-user/university free session quotas + real FortPesa payments. Designed so investors/mentors can taste the product before any real money is collected.*

#### 9A: Backend Foundation — Models & Migration
- [ ] Create `PlatformConfig` model (key-value config store):
  - `key="payments_enabled"` → `"true"/"false"` (global tasting mode toggle)
  - `key="default_free_sessions"` → `"3"` (default quota for new clients)
  - `key="student_free_sessions"` → `"5"` (bonus quota for verified students)
- [ ] Add to `User` model:
  - `free_sessions_total` (Integer, default 3)
  - `free_sessions_used` (Integer, default 0)
- [ ] Add to `University` model:
  - `sponsored_sessions_pool` (Integer, default 0) — admin tops this up
  - `sponsored_sessions_used` (Integer, default 0)
- [ ] Add to `SessionBooking` model:
  - `payment_mode` (String) — tracks how each session was funded:
    - `"sponsored"` — global tasting mode (investor demo)
    - `"free_quota"` — user's personal free sessions
    - `"university_pool"` — university-sponsored sessions
    - `"paid"` — real FortPesa M-Pesa payment
- [ ] Add lightweight migrations to `ensure_schema()` in `main.py`
- [ ] Seed `PlatformConfig` with defaults on first startup

#### 9B: Payment Decision Engine (`backend/payment_logic.py`)
- [ ] `get_platform_config(db, key, default)` — fetch config with Redis cache (TTL 30s)
- [ ] `set_platform_config(db, key, value, admin_id)` — update config + invalidate cache
- [ ] `is_payments_enabled(db)` — global toggle check
- [ ] `determine_payment_mode(db, user, booking)` — core decision flow: