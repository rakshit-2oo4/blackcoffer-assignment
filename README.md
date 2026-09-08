# ⚡ InsightPulse — Data Visualization Dashboard

A state-of-the-art, full-stack **MERN + D3.js** Data Visualization Dashboard for analyzing strategic insights, metrics, and trends from complex data.

---

## 🌟 Key Features

- 📊 **Rich D3.js Visualizations**:
  - **Timeline Trends (Line Chart)**: Tracks average Intensity, Likelihood, and Relevance across End Years with smooth curve animations and interactive legends.
  - **Sector & Country Volume (Bar Charts)**: Visualizes record counts by Sector and top Countries by Avg Intensity with slanted labels and truncation to prevent overlap.
  - **PEST Distribution (Donut Chart)**: Interactive ring chart highlighting Political, Economic, Social, Technological, and Environmental shares with popout hover effects and central counter.
  - **Topic Cluster Analysis (Bubble Chart)**: Dynamic topic bubble packed layout with proportional sizing and radius-based text rendering.
  - **Geographic Share (Treemap)**: Region distribution treemap with rounded cell containers and bounding box overflow checks.
  - **Region × Sector Matrix (Heatmap)**: Intensity heatmap matrix built with a blue sequential color scale.
  - **Sector Profile (Radar Chart)**: Multi-axis radar polygon profiling sector intensity scores.
- 🎯 **Advanced Filter Engine & Presets**:
  - Multi-select filter panel for **End Year, Topics, Sectors, Regions, PEST, Sources, SWOT, and Countries**.
  - 1-Click **Quick Presets** (*Energy Sector*, *Future 2025+*, *Top Markets*).
  - Global live search input filtering titles, insights, topics, and countries in real-time.
- 🌙 **Light ☀️ / Dark 🌙 Theme Switcher**:
  - Toggle between a bright executive light mode (ambient mesh gradients) and a sleek dark theme.
- 📑 **Multi-Tab Dashboard Views**:
  - **Overview**: Top KPI cards, trend lines, sector volume, PEST donut, topic clusters, region treemap, and radar profile.
  - **Analytics**: Region × Sector heatmap matrix and market share breakdown.
  - **Data Table**: Paginated record table with SWOT badges, metric scores, and direct source links.
- ⚡ **Dual-Mode Resilient Database Layer**:
  - Connects to **MongoDB Atlas**.
  - Built-in **In-Memory Data Engine Fallback**: If network DNS SRV or database connection issues occur, the backend automatically serves all records, search queries, and aggregations directly from `jsondata.json` with **100% uptime and 0 crashes**.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Data Visualization**: D3.js v7
- **Styling**: Modern Vanilla CSS (Design Tokens, Glassmorphism, Theme Variables)
- **Icons**: Custom SVG Icon Component Library (`Icons.jsx`)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose (with automated JSON data engine fallback)
- **Data Seeding**: Automated Mongoose seed utility (`seedData.js`)

---

## 📂 Project Architecture

```
Assignment/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback setup
│   ├── controllers/
│   │   └── dataController.js     # API handlers (Records, Filters, Aggregations)
│   ├── models/
│   │   └── DataRecord.js         # Mongoose Schema & Indexes
│   ├── routes/
│   │   └── dataRoutes.js         # Express Router endpoints
│   ├── utils/
│   │   └── seedData.js           # Database Seeder script
│   ├── jsondata.json             # Assignment Dataset
│   ├── server.js                 # Express App entry point
│   ├── .env                      # Environment Variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── charts/               # D3.js Visualization Components
│   │   │   ├── BarChartD3.jsx
│   │   │   ├── BubbleChartD3.jsx
│   │   │   ├── DonutChartD3.jsx
│   │   │   ├── HeatmapD3.jsx
│   │   │   ├── LineChartD3.jsx
│   │   │   ├── RadarChartD3.jsx
│   │   │   └── TreemapD3.jsx
│   │   ├── components/           # UI Layout Components
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── Icons.jsx         # SVG Icon Component Library
│   │   │   ├── Loader.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── Topbar.jsx
│   │   ├── context/
│   │   │   └── FilterContext.jsx # Global Filter State Context
│   │   ├── hooks/
│   │   │   └── useDashboardData.js
│   │   ├── pages/
│   │   │   └── Dashboard.jsx     # Main Dashboard Page (Overview/Analytics/Table)
│   │   ├── utils/
│   │   │   └── helpers.js        # Formatting, Palette, & Truncation utilities
│   │   ├── App.jsx
│   │   ├── index.css             # Light/Dark Theme CSS
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js            # Vite config with API proxy
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ installed on your system.
- **npm** or **yarn**.

---

### 1. Clone & Install Dependencies

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/assignment?retryWrites=true&w=majority
```

*(Note: If no MongoDB connection is available, the backend automatically uses its built-in in-memory dataset engine so all APIs work seamlessly without error).*

---

### 3. Seed Database (Optional)

To seed the MongoDB database with data from `jsondata.json`:

```bash
cd backend
npm run seed
```

---

### 4. Run Development Servers

#### Start Backend Server
```bash
cd backend
npm run dev
```
*The Express backend will run at `http://localhost:5000`.*

#### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
*The Vite frontend will run at `http://localhost:5173` (or `http://localhost:5174`).*

---

## 🔌 API Endpoints Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck route returning status OK |
| `GET` | `/api/data/records` | Retrieves filtered data records (supports query parameters & pagination limit) |
| `GET` | `/api/data/filters` | Returns distinct filter options (Years, Topics, Sectors, Regions, PEST, Sources, SWOT, Countries) |
| `GET` | `/api/data/aggregations` | Returns aggregated metrics (`byYear`, `bySector`, `byRegion`, `byTopic`, `byPestle`, `byCountry`) |

### Example Query Filtering:
```http
GET /api/data/records?sector=Energy&end_year=2025&q=oil
```

---

## 🎨 UI Customization & Themes

- **Theme Toggle**: Switch between **Light** and **Dark** mode directly in the top header navigation bar.
- **Responsive Layout**: Designed for desktop, tablet, and mobile screens with adaptive chart margins and dynamic SVG sizing.
