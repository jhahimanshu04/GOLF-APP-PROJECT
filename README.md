# GolfDraw — Monorepo Structure

## 📁 Project Structure

```
golfapp/
├── client/     → User Frontend  (React + Vite)
├── admin/      → Admin Panel    (React + Vite)
└── server/     → Backend API    (Node.js + Express)
```

---

## 🚀 Local Development

### 1. Start Backend
```bash
cd server
npm install
npm run dev   # runs on http://localhost:5000
```

### 2. Start Frontend (User)
```bash
cd client
npm install
npm run dev   # runs on http://localhost:3000
```

### 3. Start Admin Panel
```bash
cd admin
npm install
npm run dev   # runs on http://localhost:3001
```

---

## 🌐 Render Deployment

Deploy **3 separate services** on Render:

### Service 1 — Backend (Web Service)
| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment Vars | DB_URI, JWT_SECRET, STRIPE_KEY etc. |

### Service 2 — Client Frontend (Static Site)
| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| VITE_API_URL | `https://your-backend.onrender.com` |
| VITE_ADMIN_URL | `https://your-admin.onrender.com` |

### Service 3 — Admin Panel (Static Site)
| Setting | Value |
|---|---|
| Root Directory | `admin` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| VITE_API_URL | `https://your-backend.onrender.com` |

---

## 🔐 Admin Access
- Admin panel only accessible to users with `role: 'admin'`
- Non-admin users are redirected to `/login`
- Admin login URL: `https://your-admin.onrender.com`
