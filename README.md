# 🚍 INTELLIGENT PUBLIC TRANSPORT OPTIMIZATION SYSTEM (TRANSIT.AI)

A full-stack, production-grade **MERN Architecture** for intelligent public transport optimization, graph-based routing, real-time fleet telemetry, and AI/ML passenger demand forecasting.

Designed to fulfill all **Levels 0 through 13** of the Public Transport Optimization Roadmap with **Zero-Database external dependencies** (works 100% out-of-the-box in memory with persistent file storage, plus optional MongoDB support).

---

## 🌟 Key Capabilities & Level Implementations

| Level | Title | Core Features Built | Key APIs |
|---|---|---|---|
| **LEVEL 0** | **Setup & Foundation** | Modular MERN architecture, `.env` config, CORS, error middleware, dual in-memory/file database store | `GET /health`, `GET /api/v1/health` |
| **LEVEL 1** | **Core Architecture** | Global error handling, HTTP latency logger, standardized JSON envelope, health & metric diagnostics | `GET /api/v1/health/detailed`, `GET /api/v1/metrics` |
| **LEVEL 2** | **Transport Network** | 16 Connected Bus & Metro Stations with real GPS coordinates, 6 interconnected trunk/feeder routes | `GET /api/v1/stops`, `GET /api/v1/routes` |
| **LEVEL 3** | **Route & Stop Management** | CRUD operations, stop sequencing, sequence connectivity validation, admin protected routes | `POST /api/v1/stops`, `PATCH /api/v1/routes/:id` |
| **LEVEL 4** | **Transport Graph Engine** | Graph Builder, Adjacency List representation, edge weights (time & distance), BFS connectivity & isolated stop detector | `GET /api/v1/network/graph`, `GET /api/v1/network/connectivity` |
| **LEVEL 5** | **Shortest Path & Route Optimization** | **Dijkstra’s Algorithm**, transfer penalties, turn-by-turn passenger stages, alternative ranked routes, carbon footprint metrics | `POST /api/v1/optimize/route`, `POST /api/v1/optimize/alternatives` |
| **LEVEL 6** | **Passenger Demand Analysis** | 24-Hour Diurnal volume curves, Morning/Evening peak identification, stop footfall rankings, weekday vs weekend comparison | `GET /api/v1/analytics/demand`, `GET /api/v1/analytics/peak-hours`, `GET /api/v1/analytics/stops` |
| **LEVEL 7** | **Bus Scheduling & Frequency** | Demand-responsive headway calculator, passenger waiting time estimator ($E[W] = \text{Headway}/2$), current vs optimized schedule comparison | `POST /api/v1/optimize/schedule`, `GET /api/v1/schedules`, `GET /api/v1/analytics/waiting-time` |
| **LEVEL 8** | **AI/ML Demand Prediction** | Non-linear Gaussian peak regression engine, weather dampening/amplification, 24h forecast with 95% confidence intervals, $R^2 = 0.948$ | `POST /api/v1/ai/predict-demand`, `GET /api/v1/ai/model-metrics` |
| **LEVEL 9** | **Multi-Objective Optimization** | Multi-attribute scoring ($w_{\text{time}} + w_{\text{wait}} + w_{\text{transfers}} + w_{\text{cost}}$), Pareto-optimal trade-offs report, fleet efficiency gain index | `POST /api/v1/optimize/network`, `GET /api/v1/optimize/report` |
| **LEVEL 10** | **Live Transport Tracking** | Live GPS bus position simulation along route waypoints, dynamic ETA estimation, station arrival board countdown | `GET /api/v1/buses/locations`, `GET /api/v1/stops/:id/arrivals` |
| **LEVEL 11** | **Authentication & RBAC** | JWT authentication, bcrypt password hashing, roles (`passenger` and `admin`), 1-click Demo accounts | `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me` |
| **LEVEL 12** | **Admin Dashboard APIs** | Fleet status metrics (in-transit vs delayed), punctuality %, network efficiency score, CO2 savings calculator | `GET /api/v1/dashboard/summary`, `GET /api/v1/dashboard/routes`, `GET /api/v1/dashboard/performance` |
| **LEVEL 13** | **Interactive React Frontend** | Futuristic UI (Tailwind CSS, SVG/Canvas network radar, Recharts analytics, 1-click Demo credentials) | Port `3000` Interactive Web App |

---

## ⚡ Quick Start (Zero Setup Required!)

### 1. Start Both Backend & Frontend Simultaneously:
```bash
cd /Users/yashsaini/.gemini/antigravity/scratch/intelligent-transport-system
npm run dev
```

### Or Start Individually:

#### Backend (Port 5001):
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5001` with API routes under `http://localhost:5001/api/v1`*

#### Frontend (Port 3000):
```bash
cd frontend
npm run dev
```
*Open `http://localhost:3000` in your browser!*

---

## 🔑 Demo Login Accounts

Zero database configuration is required. The system is pre-seeded with ready-to-use accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@transit.ai` | `Admin@123` | Full access: Add/edit stops & routes, fleet incident control, system diagnostics |
| **Passenger** | `passenger@transit.ai` | `Pass@123` | Route planner, live tracking, station arrival boards, demand forecasts |
| **New User** | *Any email* | *Any password* | Instant registration works directly via the "Register" tab |

*(You can also click the instant **"Admin Demo"** or **"Passenger Demo"** buttons in the Sign In modal!)*

---

## 🏗️ Project Structure

```
intelligent-transport-system/
├── backend/
│   ├── data/
│   │   └── store.json               # Auto-persisting local database
│   ├── src/
│   │   ├── config/                  # App constants & env config
│   │   ├── database/
│   │   │   ├── db.js                # High-speed in-memory DB + file persistence
│   │   │   └── seedData.js          # Pre-seeded stops, routes, buses, schedules & demand
│   │   ├── middleware/              # Auth (JWT), Logger, ErrorHandler
│   │   ├── services/
│   │   │   ├── graphService.js      # Level 4: Graph builder & connectivity
│   │   │   ├── optimizationService.js# Level 5: Dijkstra shortest path & alternatives
│   │   │   ├── demandAnalysisService.js# Level 6: Diurnal rush-hour detection
│   │   │   ├── schedulingService.js # Level 7: Headway & frequency optimization
│   │   │   ├── mlDemandService.js   # Level 8: AI/ML regression & forecasting
│   │   │   ├── multiObjectiveService.js# Level 9: Multi-objective Pareto scoring
│   │   │   └── trackingService.js   # Level 10: Real-time GPS movement simulation
│   │   ├── controllers/             # All REST controllers (Levels 0-12)
│   │   ├── routes/                  # Express master API router
│   │   └── server.js                # Express & Socket.io bootstrap
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global header & system status
│   │   │   ├── AuthModal.jsx        # Login/Register + 1-Click Demo accounts
│   │   │   ├── InteractiveMap.jsx   # Spatial SVG radar with live bus animation
│   │   │   ├── RoutePlannerTab.jsx  # Dijkstra journey planner & turn-by-turn directions
│   │   │   ├── LiveTrackingTab.jsx  # Real-time vehicle radar & station arrival display
│   │   │   ├── DemandAnalyticsTab.jsx# Recharts 24h demand curves & frequency optimizer
│   │   │   ├── AiForecasterTab.jsx  # AI Gaussian peak forecast & scenario tuning
│   │   │   ├── NetworkGraphTab.jsx  # Graph topology explorer & adjacency inspector
│   │   │   └── AdminPanelTab.jsx    # Operations dashboard & stop provisioning
│   │   ├── services/
│   │   │   └── api.js               # Centralized API client
│   │   ├── App.jsx                  # Main application container
│   │   └── main.jsx                 # Vite React entry point
│   └── package.json
└── package.json                     # Root orchestrator
```
