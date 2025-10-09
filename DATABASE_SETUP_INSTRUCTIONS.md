# Database Setup Instructions

## ✅ Completed Tasks

1. **Installed postgres package** - PostgreSQL client library
2. **Created database connection** - [lib/db/connection.ts](lib/db/connection.ts)
3. **Created database schema** - [scripts/init-db.sql](scripts/init-db.sql)
4. **Created test API route** - [app/api/test-db/route.ts](app/api/test-db/route.ts)
5. **Created query modules:**
   - [lib/db/queries/experience-data.ts](lib/db/queries/experience-data.ts)
   - [lib/db/queries/fees.ts](lib/db/queries/fees.ts)
   - [lib/db/queries/claimants.ts](lib/db/queries/claimants.ts)
   - [lib/db/queries/summaries.ts](lib/db/queries/summaries.ts)
   - [lib/db/queries/config.ts](lib/db/queries/config.ts)
6. **Created API routes:**
   - [app/api/experience-data/route.ts](app/api/experience-data/route.ts)
   - [app/api/fees/route.ts](app/api/fees/route.ts)

---

## 🚀 Next Steps to Complete Integration

### Step 1: Run Database Initialization Script

You need to execute the SQL schema on your Render PostgreSQL database.

**Option A: Using Render Dashboard**
1. Go to your Render dashboard
2. Navigate to your PostgreSQL instance
3. Click on "Connect" → "Connect via psql"
4. Copy the connection command (it will look like: `psql postgresql://user:password@...`)
5. Open terminal and run:
   ```bash
   psql postgresql://your-connection-string-from-render
   ```
6. Once connected, run:
   ```sql
   \i scripts/init-db.sql
   ```

**Option B: Using File Upload**
1. Copy the entire content of `scripts/init-db.sql`
2. In Render dashboard, go to your PostgreSQL instance
3. Use the "Shell" or "SQL Editor" feature
4. Paste and execute the SQL

**Option C: Using Command Line (Windows)**
```bash
# On Windows with PostgreSQL installed
psql $env:DATABASE_URL -f scripts/init-db.sql
```

### Step 2: Update render.yaml with DATABASE_URL

The `DATABASE_URL` should already be available since you set it up on Render, but you should document it in your render.yaml for clarity:

```yaml
services:
  - type: web
    name: healthcare-dashboard
    env: node
    plan: starter
    region: oregon
    buildCommand: npm ci --legacy-peer-deps && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_VERSION
        value: 18.18.0
      - key: NEXT_TELEMETRY_DISABLED
        value: 1
      - key: DATABASE_URL
        fromDatabase:
          name: your-postgres-database-name
          property: connectionString
    healthCheckPath: /
    autoDeploy: true
    branch: master
```

### Step 3: Test Database Connection

After deploying, test your database connection:

**Local Testing:**
```bash
# Add .env.local file with your DATABASE_URL from Render
echo "DATABASE_URL=postgresql://user:password@..." > .env.local

# Start dev server
npm run dev

# Visit http://localhost:3000/api/test-db
```

**Production Testing:**
```bash
# After deploying to Render
curl https://your-app.onrender.com/api/test-db
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "connected": true,
    "timestamp": "2025-01-09T...",
    "database": {
      "version": "PostgreSQL 17",
      "tables": ["users", "experience_data", "high_cost_claimants", ...],
      "tableCount": 10
    },
    "records": {
      "experienceData": 0,
      "highCostClaimants": 0,
      "feeStructures": 0,
      "monthlySummaries": 0
    }
  }
}
```

---

## 📝 Remaining API Routes to Create

I've created the core API routes. Here are the remaining ones you can create following the same patterns:

### 1. High-Cost Claimants API
**File:** `app/api/high-cost-claimants/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  insertHighCostClaimant,
  insertManyHighCostClaimants,
  getHighCostClaimants,
  getTopHighCostClaimants,
  getDiagnosisBreakdown,
  deleteHighCostClaimant,
  deleteAllHighCostClaimants
} from '@/lib/db/queries/claimants';

// Follow the pattern from experience-data route
// GET, POST, PUT, DELETE methods
```

### 2. Monthly Summaries API
**File:** `app/api/summaries/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  insertMonthlySummary,
  insertManyMonthlySummaries,
  getMonthlySummaries,
  getSummaryStats,
  updateRolling12LossRatio,
  deleteMonthlySummary,
  deleteAllMonthlySummaries,
  upsertMonthlySummary
} from '@/lib/db/queries/summaries';

// Implement GET, POST, PUT, DELETE
```

### 3. Dashboard Config API
**File:** `app/api/config/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api';
import {
  getActiveDashboardConfig,
  getDashboardConfigs,
  insertDashboardConfig,
  updateDashboardConfig,
  setActiveDashboardConfig,
  getOrCreateDefaultConfig
} from '@/lib/db/queries/config';

// Implement GET, POST, PUT
```

### 4. Stats API
**File:** `app/api/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    // Get record counts for all tables
    const experienceCount = await sql`SELECT COUNT(*) as count FROM experience_data ${userId ? sql`WHERE user_id = ${userId}` : sql``}`;
    const claimantsCount = await sql`SELECT COUNT(*) as count FROM high_cost_claimants ${userId ? sql`WHERE user_id = ${userId}` : sql``}`;
    const feesCount = await sql`SELECT COUNT(*) as count FROM fee_structures ${userId ? sql`WHERE user_id = ${userId}` : sql``}`;
    const summariesCount = await sql`SELECT COUNT(*) as count FROM monthly_summaries ${userId ? sql`WHERE user_id = ${userId}` : sql``}`;

    return NextResponse.json({
      success: true,
      data: {
        experienceData: Number(experienceCount[0]?.count || 0),
        highCostClaimants: Number(claimantsCount[0]?.count || 0),
        feeStructures: Number(feesCount[0]?.count || 0),
        monthlySummaries: Number(summariesCount[0]?.count || 0)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats'
    }, { status: 500 });
  }
}
```

### 5. Migration API (localStorage to Database)
**File:** `app/api/migrate-from-localstorage/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { insertManyExperienceData } from '@/lib/db/queries/experience-data';
import { insertManyHighCostClaimants } from '@/lib/db/queries/claimants';
import { insertManyFeeStructures } from '@/lib/db/queries/fees';
import { insertManyMonthlySummaries } from '@/lib/db/queries/summaries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experienceData, highCostClaimants, feeStructures, monthlySummaries } = body;

    let inserted = {
      experienceData: 0,
      highCostClaimants: 0,
      feeStructures: 0,
      monthlySummaries: 0
    };

    // Insert experience data
    if (experienceData && experienceData.length > 0) {
      const result = await insertManyExperienceData(experienceData);
      inserted.experienceData = result.length;
    }

    // Insert high-cost claimants
    if (highCostClaimants && highCostClaimants.length > 0) {
      const result = await insertManyHighCostClaimants(highCostClaimants);
      inserted.highCostClaimants = result.length;
    }

    // Insert fee structures
    if (feeStructures && feeStructures.length > 0) {
      const result = await insertManyFeeStructures(feeStructures);
      inserted.feeStructures = result.length;
    }

    // Insert monthly summaries
    if (monthlySummaries && monthlySummaries.length > 0) {
      const result = await insertManyMonthlySummaries(monthlySummaries);
      inserted.monthlySummaries = result.length;
    }

    return NextResponse.json({
      success: true,
      data: inserted,
      message: 'Data migrated successfully from localStorage to database'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 });
  }
}
```

---

## 🔄 Update HealthcareContext to Use Database

After creating all API routes, update `lib/store/HealthcareContext.tsx` to use the database instead of localStorage:

```typescript
// In HealthcareContext.tsx

// Replace localStorage.setItem with API calls
const setExperienceData = async (data: ExperienceData[]) => {
  try {
    const response = await fetch('/api/experience-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk', records: data })
    });

    if (response.ok) {
      dispatch({ type: 'SET_EXPERIENCE_DATA', payload: data });
    }
  } catch (error) {
    console.error('Failed to save experience data:', error);
    dispatch({ type: 'SET_ERROR', payload: 'Failed to save data' });
  }
};

// Load data from database instead of localStorage
useEffect(() => {
  async function loadData() {
    try {
      const [expRes, claimantsRes, feesRes, summariesRes] = await Promise.all([
        fetch('/api/experience-data'),
        fetch('/api/high-cost-claimants'),
        fetch('/api/fees'),
        fetch('/api/summaries')
      ]);

      const [expData, claimantsData, feesData, summariesData] = await Promise.all([
        expRes.json(),
        claimantsRes.json(),
        feesRes.json(),
        summariesRes.json()
      ]);

      if (expData.success) {
        dispatch({ type: 'SET_EXPERIENCE_DATA', payload: expData.data });
      }
      // ... repeat for other data types
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  loadData();
}, []);
```

---

## 📊 Testing Checklist

- [ ] Database connection successful (`/api/test-db`)
- [ ] All tables created (10 tables)
- [ ] Can insert experience data (`POST /api/experience-data`)
- [ ] Can retrieve experience data (`GET /api/experience-data`)
- [ ] Can insert fee structures (`POST /api/fees`)
- [ ] Can retrieve fee structures (`GET /api/fees`)
- [ ] Can insert high-cost claimants
- [ ] Can insert monthly summaries
- [ ] Can get dashboard stats (`GET /api/stats`)
- [ ] Migration from localStorage works
- [ ] Data persists after browser refresh
- [ ] Upload page saves to database
- [ ] Summary page reads from database

---

## 🔐 Security Considerations

1. **Add authentication** - Currently no user authentication
2. **Rate limiting** - Add rate limiting to API routes
3. **Input validation** - Add Zod schemas for validation
4. **SQL injection** - Using parameterized queries (safe)
5. **Environment variables** - Never commit DATABASE_URL to git

---

## 📚 Useful Commands

```bash
# Test database connection locally
curl http://localhost:3000/api/test-db

# Test experience data API
curl http://localhost:3000/api/experience-data

# Insert test data
curl -X POST http://localhost:3000/api/experience-data \
  -H "Content-Type: application/json" \
  -d '{"data": {"month": "2024-01", "enrollment": 100, ...}}'

# Get stats
curl http://localhost:3000/api/stats

# Migrate from localStorage
curl -X POST http://localhost:3000/api/migrate-from-localstorage \
  -H "Content-Type: application/json" \
  -d '{"experienceData": [...], "feeStructures": [...]}'
```

---

## 🎯 Summary

**What's Done:**
- ✅ Database connection setup
- ✅ Complete schema with 10 tables
- ✅ Query modules for all entities
- ✅ Experience data API routes
- ✅ Fee structures API routes
- ✅ Test API route

**What's Left:**
1. Create remaining API routes (claimants, summaries, config, stats, migrate)
2. Run database initialization script on Render
3. Update HealthcareContext to use APIs instead of localStorage
4. Test all functionality end-to-end
5. Deploy to Render

**Estimated Time to Complete:** 1-2 hours

You now have a solid foundation for PostgreSQL integration! 🚀
