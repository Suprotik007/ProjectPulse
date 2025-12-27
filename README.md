# 🚀 Project Pulse

**Project Pulse** is a comprehensive project health monitoring system that enables real-time tracking of project status through employee check-ins, client feedback, and risk management. The system automatically calculates project health scores based on multiple data points to provide early warnings and actionable insights.

---

## ✨ Features

### Core Functionality
- **Role-Based Access Control**: Three distinct user roles (Admin, Employee, Client)
- **Automated Health Scoring**: Real-time project health calculation based on multiple metrics
- **Weekly Check-ins**: Employees submit progress updates with confidence levels
- **Client Feedback**: Clients rate satisfaction and communication quality
- **Risk Management**: Track and manage project risks with severity levels
- **Dashboard Analytics**: Role-specific dashboards with key metrics
- **Activity Timeline**: Comprehensive project activity history

### Advanced Features
- **Duplicate Prevention**: One check-in/feedback per user per project per week
- **Smart Notifications**: Health score updates trigger on new data
- **Color-Coded Status**: Visual indicators (Green/Yellow/Red) for quick assessment
- **Progress Tracking**: Compare actual vs expected completion percentages

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16+** (App Router)
- **React 18+**
- **TypeScript**
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (serverless functions)
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Architecture
- **Full-Stack Framework**: Next.js App Router handles both frontend and backend
- **Database**: MongoDB for flexible document storage
- **Authentication**: JWT-based token authentication
- **State Management**: React hooks and context

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Suprotik007/ProjectPulse.git
cd project-pulse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/project-pulse
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/project-pulse

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# App URL (for API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Security Note**: Never commit `.env.local` to version control. Use strong, unique values for production.

### 4. Seed the Database

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 2 Admin users
- 5 Employee users
- 3 Client users
- 4 Sample projects with assignments
- Historical check-ins, feedback, and risks

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Re-seeding Database

To reset and re-seed the database:

```bash
npm run seed
```

---

## 🔐 Default Login Credentials

After running the seed script, use these credentials:

### Admin Account
```
Email: admin@projectpulse.com
Password: admin123
```

### Employee Accounts
```
Email: employee@projectpulse.com
Password: emp123

Email: mike@projectpulse.com
Password: emp123
```

### Client Accounts
```
Email: client@projectpulse.com
Password: client123

Email: bob@projectpulse.com
Password: client123

Email: alice@projectpulse.com
Password: client123
```

**Important**: Change all default passwords in production!

---

## 🎯 Health Score Algorithm

The health score is calculated automatically when:
- An employee submits a check-in
- A client submits feedback
- A risk is created or updated

### Calculation Formula (0-100 scale)

#### 1. Client Satisfaction Score (30% weight)
- Average satisfaction rating from last 4 weeks of feedback
- Scale: 1-5 stars → normalized to 0-30 points
- Default: 18 points (neutral) if no feedback exists

#### 2. Employee Confidence Score (25% weight)
- Average confidence level from last 4 weeks of check-ins
- Scale: 1-5 → normalized to 0-25 points
- Default: 15 points (neutral) if no check-ins exist

#### 3. Progress Alignment Score (25% weight)
- Compares actual completion % vs expected completion %
- Expected = (days passed / total days) × 100
- Actual = average completion % from recent check-ins
- Alignment = min(100, (actual / expected) × 100)
- Normalized to 0-25 points

#### 4. Risk Assessment Score (20% weight)
- Base score: 20 points
- Penalties for open risks:
  - High severity: -10 points each
  - Medium severity: -5 points each
  - Low severity: -2 points each
- Final: max(0, 20 - total_penalty)

#### 5. Flagged Issues Penalty
- Each flagged issue in client feedback: -3 points

### Final Score Calculation

```
Final Health Score = 
  Satisfaction Score (0-30) + 
  Confidence Score (0-25) + 
  Progress Score (0-25) + 
  Risk Score (0-20) - 
  Flagged Issues Penalty
  
Bounded: max(0, min(100, Final Health Score))
```

### Status Determination

- **🟢 On Track**: Score ≥ 80
- **🟡 At Risk**: Score 60-79
- **🔴 Critical**: Score < 60

### Example Calculation

**Project with:**
- Avg satisfaction: 4.5/5 → 27 points
- Avg confidence: 4/5 → 20 points
- 75% actual vs 70% expected → 25 points (ahead of schedule)
- 1 medium risk → 15 points (20 - 5)
- 0 flagged issues → 0 penalty

**Total: 87 points → Status: On Track 🟢**

---

## 📁 Folder Structure

```
project-pulse/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   └── login/
│   ├── admin/                    # Admin dashboard & features
│   │   ├── projects/
│   │   └── page.tsx
│   ├── employee/                 # Employee dashboard & features
│   │   ├── projects/
│   │   └── page.tsx
│   ├── client/                   # Client dashboard & features
│   │   ├── projects/
│   │   └── page.tsx
│   └── api/                      # API Routes (Backend)
│       ├── auth/
│       ├── Projects/             # Project CRUD
│       ├── checkins/             # Check-in endpoints
│       ├── feedback/             # Feedback endpoints
│       ├── risks/                # Risk management
│       ├── employee/
│       └── client/
├── components/                   # Reusable React components
│   ├── HealthScoreBadge.tsx
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── lib/                          # Utility libraries
│   ├── db/
│   │   └── mongoose.ts          # Database connection
│   ├── models/                   # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── CheckIn.ts
│   │   ├── Feedback.ts
│   │   └── Risk.ts
│   └── utils/
│       ├── auth.ts              # Authentication helpers
│       └── healthScore.ts       # Health calculation logic
├── scripts/
│   └── seed.js                  # Database seeding script
├── .env.local                    # Environment variables (create this)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎭 Key Features by Role

### 👨‍💼 Admin Features

- **Dashboard Overview**
  - Total projects count
  - Projects grouped by health status
  - Quick stats (On Track, At Risk, Critical)
  
- **Project Management**
  - Create, edit, delete projects
  - Assign clients and employees
  - Set project timelines
  - View comprehensive project details
  
- **Monitoring**
  - View all check-ins across projects
  - View all client feedback
  - Track all reported risks
  - Monitor project health trends

### 👨‍💻 Employee Features

- **My Projects Dashboard**
  - View assigned projects
  - See project health scores
  - Track pending check-ins
  
- **Weekly Check-ins**
  - Submit progress summaries
  - Report blockers/challenges
  - Rate confidence level (1-5)
  - Update completion percentage
  - One check-in per project per week
  
- **Risk Management**
  - Report new risks
  - Update risk status
  - Add mitigation plans
  - Categorize by severity (Low/Medium/High)

### 👤 Client Features

- **Project Portfolio**
  - View all client projects
  - Monitor health scores
  - Track project timelines
  
- **Weekly Feedback**
  - Rate satisfaction (1-5 stars)
  - Rate communication quality (1-5 stars)
  - Provide comments
  - Flag critical issues
  - One feedback per project per week
  
- **Project Insights**
  - View feedback history
  - See project activity timeline

---

## 🔌 API Routes

### Authentication
- `POST /api/auth/login` - User login (returns JWT token)

### Projects
- `GET /api/Projects` - List all projects (Admin)
- `POST /api/Projects` - Create project (Admin)
- `GET /api/Projects/[id]` - Get single project
- `PUT /api/Projects/[id]` - Update project (Admin)
- `DELETE /api/Projects/[id]` - Delete project (Admin)
- `POST /api/Projects/[id]/calculate-health` - Recalculate health score

### Check-ins
- `POST /api/checkins` - Submit check-in (Employee)
- `GET /api/Projects/[id]/check-ins` - List project check-ins

### Feedback
- `POST /api/feedback` - Submit feedback (Client)
- `GET /api/Projects/[id]/feedback` - List project feedback

### Risks
- `POST /api/risks` - Create risk (Employee)
- `GET /api/risks?projectId=[id]` - List project risks
- `PUT /api/risks/[id]` - Update risk
- `DELETE /api/risks/[id]` - Delete risk

### Dashboard APIs
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/employee/dashboard` - Employee dashboard data
- `GET /api/client/dashboard` - Client dashboard data

---


### Seed Script Fails

**Problem**: Seed script errors or duplicate data

**Solutions**:
```bash
# Drop the database and re-seed
mongo project-pulse --eval "db.dropDatabase()"
npm run seed
```

### Health Score Not Updating

**Problem**: Health scores remain at 0 or don't change

**Solutions**:
1. Check console logs for calculation errors
2. Ensure check-ins/feedback are being created
3. Manually trigger calculation:
```javascript
// In browser console
fetch('/api/Projects/[projectId]/calculate-health', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

---

## 📝 Development Workflow

### Adding a New Feature

1. Create necessary API routes in `/app/api/`
2. Update relevant models in `/lib/models/`
3. Build UI components in role-specific folders
4. Test with different user roles
5. Update health score calculation if needed

### Testing Different Roles

1. Login as Admin → Test project management
2. Login as Employee → Test check-ins and risks
3. Login as Client → Test feedback submission
4. Verify health scores update correctly

---
