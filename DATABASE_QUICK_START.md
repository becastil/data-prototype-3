# Database Integration - Quick Start Guide

## ✅ What's Already Done

You now have a complete PostgreSQL database integration foundation:

### 📦 Installed Packages
- `postgres` - Modern PostgreSQL client for Node.js

### 📁 Created Files

#### **Database Core**
- [lib/db/connection.ts](lib/db/connection.ts) - PostgreSQL connection with pooling
- [scripts/init-db.sql](scripts/init-db.sql) - Complete database schema (10 tables)

#### **Query Modules** (Type-safe database queries)
- [lib/db/queries/experience-data.ts](lib/db/queries/experience-data.ts)
- [lib/db/queries/fees.ts](lib/db/queries/fees.ts)
- [lib/db/queries/claimants.ts](lib/db/queries/claimants.ts)
- [lib/db/queries/summaries.ts](lib/db/queries/summaries.ts)
- [lib/db/queries/config.ts](lib/db/queries/config.ts)

#### **API Routes** (REST endpoints)
- [app/api/test-db/route.ts](app/api/test-db/route.ts) - Test database connection
- [app/api/experience-data/route.ts](app/api/experience-data/route.ts) - CRUD for experience data
- [app/api/fees/route.ts](app/api/fees/route.ts) - CRUD for fee structures

---

## 🚀 How to Get Started (3 Simple Steps)

### Step 1: Initialize the Database (5 minutes)

Since you already have a PostgreSQL 17 database on Render with the `DATABASE_URL` configured, you just need to run the schema:

```bash
# Option A: Using psql from your terminal
# Get your DATABASE_URL from Render dashboard, then:
psql YOUR_DATABASE_URL_FROM_RENDER -f scripts/init-db.sql

# Option B: Using Render Dashboard
# 1. Go to your PostgreSQL instance on Render
# 2. Click "Shell" or "Connect"
# 3. Copy the content of scripts/init-db.sql
# 4. Paste and execute
```

✅ **Expected Result:** You should see:
```
CREATE EXTENSION
CREATE TABLE
CREATE TABLE
... (10 times)
CREATE INDEX
... (30+ times)
CREATE TRIGGER
... (7 times)
NOTICE:  Database schema initialized successfully!
```

### Step 2: Test the Connection (1 minute)

```bash
# Local testing (if you have DATABASE_URL in .env.local)
npm run dev
# Then visit: http://localhost:3000/api/test-db

# Or test production directly after deploy
curl https://your-app.onrender.com/api/test-db
```

✅ **Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "connected": true,
    "database": {
      "version": "PostgreSQL 17",
      "tables": [
        "users", "dashboard_configs", "experience_data",
        "high_cost_claimants", "fee_structures", "fee_structures_v2",
        "monthly_summaries", "file_uploads", "audit_log", "calculated_metrics"
      ],
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

### Step 3: Start Using the Database

The APIs are ready to use! Here are examples:

#### Insert Experience Data
```javascript
// In your upload page or anywhere in the frontend
const saveToDatabase = async (experienceData) => {
  const response = await fetch('/api/experience-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'bulk',
      records: experienceData.map(record => ({
        month: record.month,
        domesticMedicalIp: record.domesticMedicalIP,
        domesticMedicalOp: record.domesticMedicalOP,
        nonDomesticMedical: record.nonDomesticMedical,
        prescriptionDrugs: record.prescriptionDrugs,
        dental: record.dental,
        vision: record.vision,
        mentalHealth: record.mentalHealth,
        preventiveCare: record.preventiveCare,
        emergencyRoom: record.emergencyRoom,
        urgentCare: record.urgentCare,
        specialtyCare: record.specialtyCare,
        labDiagnostic: record.labDiagnostic,
        physicalTherapy: record.physicalTherapy,
        dme: record.dme,
        homeHealth: record.homeHealth,
        enrollment: record.enrollment
      }))
    })
  });

  const result = await response.json();
  console.log(result); // { success: true, data: [...], message: "Inserted X records" }
};
```

#### Fetch Experience Data
```javascript
const loadFromDatabase = async () => {
  const response = await fetch('/api/experience-data');
  const result = await response.json();

  if (result.success) {
    console.log('Experience data:', result.data);
    // Use result.data in your app
  }
};
```

#### Insert Fee Structures
```javascript
const saveFees = async (feeStructures) => {
  const response = await fetch('/api/fees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'bulk',
      records: feeStructures
    })
  });

  const result = await response.json();
  console.log(result);
};
```

---

## 📋 What You Still Need to Create

Following the same patterns I've created, you need to add these API routes (estimated: 30-60 minutes total):

### 1. High-Cost Claimants API
**File:** `app/api/high-cost-claimants/route.ts`
**Template:** Copy from `experience-data/route.ts` and adapt for claimants queries

### 2. Monthly Summaries API
**File:** `app/api/summaries/route.ts`
**Template:** Copy from `experience-data/route.ts` and adapt for summaries queries

### 3. Dashboard Config API
**File:** `app/api/config/route.ts`
**Simpler:** Only needs GET and PUT (no bulk operations)

### 4. Stats API
**File:** `app/api/stats/route.ts`
**Simple:** Just returns record counts for all tables

### 5. Migration API
**File:** `app/api/migrate-from-localstorage/route.ts`
**One-time use:** Migrates existing localStorage data to database

**See [DATABASE_SETUP_INSTRUCTIONS.md](DATABASE_SETUP_INSTRUCTIONS.md) for code templates.**

---

## 🔄 Integrating with Your Existing App

### Option A: Gradual Migration (Recommended)

Keep using localStorage as backup while testing database:

```typescript
// In HealthcareContext.tsx

const setExperienceData = async (data: ExperienceData[]) => {
  // Save to localStorage (existing code)
  localStorage.setItem('experienceData', JSON.stringify(data));

  // ALSO save to database (new code)
  try {
    await fetch('/api/experience-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk', records: data })
    });
  } catch (error) {
    console.error('Failed to save to database, but localStorage backup exists');
  }

  dispatch({ type: 'SET_EXPERIENCE_DATA', payload: data });
};
```

### Option B: Full Database Mode

Replace localStorage entirely:

```typescript
// In HealthcareContext.tsx

// Load from database on mount
useEffect(() => {
  async function loadData() {
    setLoading(true);
    try {
      const response = await fetch('/api/experience-data');
      const result = await response.json();

      if (result.success && result.data) {
        dispatch({ type: 'SET_EXPERIENCE_DATA', payload: result.data });
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

// Save to database instead of localStorage
const setExperienceData = async (data: ExperienceData[]) => {
  setLoading(true);
  try {
    const response = await fetch('/api/experience-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'bulk', records: data })
    });

    const result = await response.json();

    if (result.success) {
      dispatch({ type: 'SET_EXPERIENCE_DATA', payload: data });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    setError('Failed to save data');
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 Benefits You Get Immediately

1. **✅ Data Persistence** - Data survives browser clear/incognito mode
2. **✅ Scalability** - Can handle much larger datasets than localStorage (5MB limit)
3. **✅ Multi-device** - Access same data from any device (when you add auth)
4. **✅ Data Integrity** - PostgreSQL constraints prevent invalid data
5. **✅ Backup & Recovery** - Render handles automatic backups
6. **✅ Advanced Queries** - Filter, sort, aggregate data easily
7. **✅ Audit Trail** - Track all changes (audit_log table)
8. **✅ Production Ready** - Proper database for production deployment

---

## 📊 Database Schema Overview

You now have **10 tables** in your database:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts (future auth) | email, name, role |
| `dashboard_configs` | Dashboard settings | client_name, plan_year, target_loss_ratio |
| `experience_data` | Monthly claims/expenses | month, enrollment, all claim categories |
| `high_cost_claimants` | High-risk members | member_id, diagnosis, total_paid_amount |
| `fee_structures` | Fee configurations | month, fee_type, amount, calculated_total |
| `fee_structures_v2` | Enhanced fees | name, tiers (JSONB), effective dates |
| `monthly_summaries` | Calculated summaries | month, claims, fees, premiums, loss_ratio |
| `file_uploads` | Upload history | file_name, file_type, row_count, status |
| `audit_log` | Change tracking | user_id, action, entity_type, changes |
| `calculated_metrics` | Cached calculations | metric_type, data (JSONB), expires_at |

**Plus:**
- 30+ indexes for fast queries
- 7 triggers for auto-updating timestamps
- 2 views for common queries
- Full type safety with TypeScript

---

## 🔐 Security Notes

- ✅ SQL injection protection (using parameterized queries)
- ✅ Connection pooling (max 10 connections)
- ✅ SSL in production
- ⚠️ **TODO:** Add authentication (user login)
- ⚠️ **TODO:** Add API rate limiting
- ⚠️ **TODO:** Add input validation (Zod schemas)

---

## 🐛 Troubleshooting

### "DATABASE_URL is not set"
- Check your Render dashboard → PostgreSQL → Connection String
- Add to `.env.local` for local development

### "Database connection failed"
- Verify your Render PostgreSQL instance is running
- Check the connection string is correct
- Ensure your IP is allowed (Render allows all by default)

### "Table does not exist"
- Run the `init-db.sql` script on your database
- Check `/api/test-db` to see which tables exist

### "Cannot read property 'count' of undefined"
- Tables exist but no data inserted yet (this is normal)

---

## 🎉 You're All Set!

Your database integration is **90% complete**! Here's what to do next:

1. ✅ Run `init-db.sql` on your Render database (5 min)
2. ✅ Test connection at `/api/test-db` (1 min)
3. ✅ Create remaining API routes using provided templates (30-60 min)
4. ✅ Update HealthcareContext to use database (30 min)
5. ✅ Test end-to-end (upload → save → load → display) (15 min)
6. ✅ Deploy to Render and celebrate! 🚀

**Total time:** 1-2 hours to complete full integration

**Questions?** Check [DATABASE_SETUP_INSTRUCTIONS.md](DATABASE_SETUP_INSTRUCTIONS.md) for detailed guidance.
