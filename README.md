# Intelligent Network Monitoring and Management System (INMMS)

**INMMS** is an enterprise-grade Network Operations Center (NOC) monitoring, fault detection, and telemetry management system designed as a final-year college project. It provides real-time hybrid monitoring (combining local host hardware telemetry with realistic simulated enterprise network infrastructure), multi-factor automated health scoring (0–100), rule-based fault detection, alert lifecycle management with intelligent recommendations, interactive React Flow network topology maps, historical analytics, executive SLA reports, and a 1-click live demo scenario fault-injection engine.

---

## 🌟 Key Features & Novelty

1. **Hybrid Telemetry Monitoring Engine**:
   - **Local Host Hardware Mode**: Collects actual CPU load, RAM consumption, loopback network latency, and throughput using Java System and OSHI APIs.
   - **Simulated Network Infrastructure Mode**: Simulates realistic enterprise network devices (Gateway, Core Switch, DB Server, App Server, Firewall, Access Point) with organic metric fluctuations.
2. **Deterministic Health Score Engine (0–100)**:
   - Calculates device and network health via weighted normalized metrics:
     - **Availability**: 40% (UP=100, DOWN=0)
     - **Latency**: 20% (0ms=100, >=300ms=0)
     - **Packet Loss**: 20% (0%=100, 100%=0)
     - **CPU Utilization**: 10% (0%=100, 100%=0)
     - **Memory Utilization**: 10% (0%=100, 100%=0)
3. **Intelligent Fault Detection & Recommendations**:
   - Evaluates thresholds for CPU/RAM (>80%/95%), Latency (>100ms/200ms), Packet Loss (>5%/10%), and reachability.
   - Generates intelligent human-readable messages (e.g., *"High CPU utilization detected on Application-Server. CPU reached 94%"*).
   - Provides root-cause NOC troubleshooting recommendations for every alert.
   - **Alert Deduplication & Auto-Resolution**: Prevents repeat duplicate alerts; automatically escalates or resolves active alerts when metrics recover.
4. **Interactive React Flow Network Topology**:
   - Renders a live network topology map directly backed by database node and link records (`topology_connections`).
   - Node status borders dynamically glow based on health (Emerald=UP, Amber=WARNING, Crimson=CRITICAL, Gray=DOWN).
   - Allows administrators to add or delete network links interactively.
5. **Historical Analytics & Executive SLA Reporting**:
   - Interactive Recharts graphs with time window filtering (1h, 6h, 24h, 7d).
   - Computes SLA Uptime %, average latency, and high-risk problematic device rankings.
   - Includes 1-click **CSV Report Export**.
6. **1-Click Live Demo Scenario Engine**:
   - Instantly switch simulation scenarios during final presentations (`NORMAL`, `HIGH_CPU`, `HIGH_MEMORY`, `HIGH_LATENCY`, `PACKET_LOSS`, `DEVICE_DOWN`, `TRAFFIC_SPIKE`, `DEGRADED`).
   - Immediately triggers real-time health drops, alert generation, topology color changes, and dashboard updates.

---

## 🛠️ Technology Stack

- **Backend**: Java 21, Spring Boot 3.2.3, Spring Web, Spring Data JPA, Hibernate, OSHI 6.6.1, Maven
- **Frontend**: React 18, Vite 5, JavaScript, React Router 6, Axios, Recharts, React Flow (`@xyflow/react`), Lucide Icons, Custom NOC Dark Theme CSS
- **Database**: H2 Database (File-backed MySQL Mode; seamlessly supports MySQL 8.0 `inmms_db`)
- **Optional ML**: Python 3.10, FastAPI, scikit-learn (`IsolationForest` anomaly detector)

---

## 📁 Project Architecture & Structure

```
inmms/
├── backend/                  # Spring Boot 3 Java Backend
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/inmms/
│           │   ├── config/          # DataInitializer, WebConfig (CORS)
│           │   ├── controller/      # Auth, Device, Alert, Topology, Dashboard, Report, Demo Controllers
│           │   ├── dto/             # DTO Response Objects
│           │   ├── entity/          # JPA Entities (User, Device, Metric, Alert, TopologyConnection)
│           │   ├── exception/       # Global Exception Handler
│           │   ├── monitoring/      # HybridMonitoring, HealthCalculator, AnomalyDetection
│           │   ├── repository/     # Spring Data JPA Repositories
│           │   └── service/        # DemoScenarioService
│           └── resources/
│               └── application.properties
│
├── frontend/                 # React + Vite NOC Dashboard Frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/      # Sidebar, Navbar, StatusBadge, HealthGauge, MetricCard
│       ├── pages/           # Login, Dashboard, Devices, DeviceDetail, Alerts, Topology, Analytics, Reports, Settings
│       ├── services/        # Axios API Service Layer (api.js)
│       ├── styles/          # index.css (Dark NOC Theme)
│       └── App.jsx
│
└── ml_service/               # Optional Python ML Anomaly Detection Service
    ├── app.py               # FastAPI IsolationForest endpoint
    └── requirements.txt
```

---

## 🚀 How to Run the System

### 1. Prerequisites
- **Java 21** or later (`java -version`)
- **Maven 3.9+** (`mvn -v`)
- **Node.js 18+ & npm** (`node -v`, `npm -v`)
- (Optional) **Python 3.10+** for ML service

### 2. Running the Backend
```bash
cd backend
mvn spring-boot:run
```
*The Spring Boot backend will start on **`http://localhost:8080`**. On first startup, it automatically creates the database schema and seeds 7 default devices, topology links, and 24 hours of background metrics.*

### 3. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The Vite React dashboard will be accessible at **`http://localhost:5173`**.*

### 4. (Optional) Running the Python ML Service
```bash
cd ml_service
pip install -r requirements.txt
python app.py
```
*The ML IsolationForest service will listen on **`http://localhost:5000`**.*

---

## 🔑 Default Credentials

- **URL**: `http://localhost:5173/login`
- **Username**: `admin`
- **Password**: `admin123`

---

## 🎬 Final Demonstration Workflow

1. **Sign In**: Log in using `admin / admin123`.
2. **Dashboard Overview**: Inspect the 8 NOC summary stat cards, Overall Health Score Gauge (100%), 6 live Recharts telemetry graphs, and active device health matrix.
3. **Device Management**: Navigate to `/devices`. Add a new device (e.g. `Router-Branch01`), edit its details, or toggle continuous monitoring.
4. **Device Deep Dive**: Click any device to view live telemetry dials, historical CPU/RAM/Latency charts, and Intelligent Recommendation boxes.
5. **Topology Map**: Open `/topology`. Observe interactive device nodes glowing emerald green, animated connection links, and add or delete links.
6. **Fault Injection (HIGH_CPU)**:
   - In the top bar navbar, change **DEMO SCENARIO** to `⚡ HIGH CPU (95%)`.
   - Observe CPU spike to ~95%, Network Health drop, device status change to `CRITICAL`/`WARNING`, and a new fault alert generated!
7. **Alert Management**: Open `/alerts`. Read the generated alert and recommended troubleshooting steps. Click **Acknowledge**, enter a operator note, and mark as **Resolved**.
8. **Fault Injection (DEVICE DOWN)**:
   - Change scenario to `🚫 DEVICE DOWN`. Observe device become unreachable (DOWN), health score drop, and topology node change state.
   - Reset scenario to `🟢 NORMAL NETWORK` to observe automatic recovery.
9. **Analytics**: Open `/analytics` to filter multi-metric telemetry graphs across 1h, 6h, 24h, and 7d windows.
10. **Reports & CSV Export**: Open `/reports` to view SLA uptime %, problematic device rankings, and click **Export CSV** to download `inmms_network_report.csv`.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Administrator authentication |
| `GET` | `/api/devices` | List all monitored devices |
| `POST` | `/api/devices` | Create new network device |
| `GET` | `/api/devices/{id}` | Get single device details |
| `PUT` | `/api/devices/{id}` | Update device configuration |
| `DELETE` | `/api/devices/{id}` | Delete device |
| `GET` | `/api/devices/{id}/metrics` | Get device historical metrics |
| `GET` | `/api/devices/{id}/alerts` | Get device alert history |
| `GET` | `/api/alerts` | List all system fault alerts |
| `PUT` | `/api/alerts/{id}/acknowledge` | Acknowledge active alert |
| `PUT` | `/api/alerts/{id}/resolve` | Resolve active alert |
| `GET` | `/api/dashboard/summary` | Get NOC dashboard summary statistics |
| `GET` | `/api/topology` | Get network topology nodes and links |
| `POST` | `/api/topology/connections` | Create topology link connection |
| `DELETE` | `/api/topology/connections/{id}`| Delete topology link connection |
| `GET` | `/api/reports` | Get executive SLA report data |
| `GET` | `/api/reports/export-csv` | Download network telemetry CSV report |
| `GET` | `/api/demo/scenario` | Get current active demo scenario |
| `POST` | `/api/demo/scenario` | Inject live demo fault scenario |
| `GET` | `/api/settings` | Get system monitoring configuration |
| `PUT` | `/api/settings` | Update telemetry interval / ML toggle |
# Intelligent-Network-Monitoring-and-Management-System
