# Fee Configuration V2 - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Choose Your Page

You have **3 page options** to use:

1. **`page_v2.tsx`** - Pure V2 system (recommended for new projects)
2. **`page_enhanced.tsx`** - Hybrid with V1/V2 toggle (recommended for migration)
3. **`page.tsx`** - Original V1 system (legacy)

#### To Use V2:

Rename the file you want:

```bash
# Option A: Use pure V2
mv app/dashboard/fees/page.tsx app/dashboard/fees/page_v1_backup.tsx
mv app/dashboard/fees/page_v2.tsx app/dashboard/fees/page.tsx

# Option B: Use hybrid (recommended)
mv app/dashboard/fees/page.tsx app/dashboard/fees/page_v1_backup.tsx
mv app/dashboard/fees/page_enhanced.tsx app/dashboard/fees/page.tsx
```

---

### Step 2: Upload Enrollment Data

1. Go to `/dashboard/upload`
2. Upload your **Experience Data CSV**
3. System extracts enrollment numbers

---

### Step 3: Create Your First Fee

1. Navigate to `/dashboard/fees`
2. Click **"Add Fee"** button
3. Fill out the form:

#### Example: Simple PMPM Fee

```
Name: 2024 Admin Fee
Category: Administrative
Fee Type: PMPM (Per Member Per Month)
Rate Per Member: $500
Effective Start Date: 2024-01-01
```

4. Click **"Create Fee"**
5. ✅ Done! Fees automatically calculated for all months

---

### Step 4: View Calculated Fees

**Left Panel**: See your active fee ("2024 Admin Fee")

**Center Panel**: Monthly grid shows:
- January 2024: 1,220 members × $500 = **$610,000**
- February 2024: 1,195 members × $500 = **$597,500**
- ... and so on

**Right Panel**: Click any month to see detailed breakdown

---

## 📘 Common Scenarios

### Scenario 1: Tiered Pricing (Volume Discounts)

**Business Need**: Charge lower rates for larger groups

**Setup**:
```
Fee Type: PMPM
Enable Tiered Pricing: Yes

Tiers:
- Tier 1: 0-1,000 members = $500/member
- Tier 2: 1,001-1,500 members = $475/member
- Tier 3: 1,501+ members = $450/member
```

**Result**:
- 750 members → Tier 1 → 750 × $500 = $375,000
- 1,200 members → Tier 2 → 1,200 × $475 = $570,000
- 2,000 members → Tier 3 → 2,000 × $450 = $900,000

---

### Scenario 2: Blended Fee (Flat + Percentage)

**Business Need**: $10,000 base admin fee + 2% of claims

**Setup**:
```
Fee Type: Blended Rate

Components:
- Component 1: Fixed = $10,000 (label: "Base Admin Fee")
- Component 2: % of Claims = 2% (label: "Claims Management")
```

**Result**:
- Claims: $500,000
- Fee = $10,000 + ($500,000 × 2%) = $10,000 + $10,000 = **$20,000**

---

### Scenario 3: Performance-Based Fee

**Business Need**: Charge 1.5% of total claims processed

**Setup**:
```
Fee Type: % of Claims
Percentage: 1.5%
Category: Performance
```

**Result**:
- January Claims: $425,000
- Fee = $425,000 × 1.5% = **$6,375**

---

### Scenario 4: Composite Rate (Members vs Dependents)

**Business Need**: Different rates for employees vs dependents

**Setup**:
```
Fee Type: Composite Rate
Member Rate: $450
Dependent Rate: $225
```

**Result**:
- 800 members + 400 dependents
- Fee = (800 × $450) + (400 × $225) = $360,000 + $90,000 = **$450,000**

---

## 🎨 UI Features

### Three-Panel Layout

```
┌─────────────┬──────────────────────┬─────────────┐
│   FEES      │   MONTHLY GRID       │  DETAILS    │
│             │                      │             │
│ [Fee 1]     │  Jan: $610,000 ✓     │ Selected:   │
│ [Fee 2]     │  Feb: $597,500 ✓     │ Jan 2024    │
│ [Fee 3]     │  Mar: $625,000 ✓     │             │
│             │  ...                 │ Total:      │
│ + Add Fee   │  Total: $7.2M        │ $610,000    │
└─────────────┴──────────────────────┴─────────────┘
```

### Color Coding

- 🟢 **Green**: Successfully calculated
- 🟡 **Yellow**: Warnings (e.g., using estimates)
- 🔴 **Red**: Errors (missing data, validation failed)

### Actions

| Icon | Action | Description |
|------|--------|-------------|
| ✏️ | Edit | Modify fee configuration |
| 📋 | Duplicate | Create copy for templating |
| 🗑️ | Delete | Remove fee structure |

---

## 🔧 Troubleshooting

### Issue: "No calculated fees"

**Cause**: Either no enrollment data OR no fee structures

**Fix**:
1. Verify enrollment data uploaded (`/dashboard/upload`)
2. Verify at least one fee created (`Add Fee` button)
3. Check fee effective dates match uploaded months

---

### Issue: "Calculation error"

**Cause**: Missing required data for fee type

**Examples**:
- **% of Premium** fee but no premium data
- **Per Transaction** fee but no transaction count
- **PEPM** fee but enrollment uses total members (not employees)

**Fix**:
- Use compatible fee types with available data
- Or upload additional CSV columns

---

### Issue: Fees not updating after CSV upload

**Cause**: Auto-recalculation disabled or cache issue

**Fix**:
1. Look for blue banner "Recalculation Available"
2. Click **"Recalculate Now"** button
3. Or toggle V1/V2 to force refresh

---

## 📊 Understanding Calculations

### How Fees are Calculated

```
For each month in uploaded data:
  For each active fee structure:
    1. Check if fee effective during this month
    2. Get enrollment for this month
    3. Apply calculation based on fee type:
       - PMPM: Enrollment × Rate
       - Flat: Fixed amount
       - %: Base amount × Percentage
       - Tiered: Find tier, apply tier rate
       - Blended: Sum all components
    4. Store result with breakdown
  Sum all fees for month
Display in grid
```

### Viewing Breakdowns

**Hover over** amount → Tooltip shows:
- Base calculation
- Applied tier (if tiered)
- Adjustments (seasonal, escalation)
- Final amount

**Click month row** → Right panel shows:
- All fees applied to that month
- Individual fee amounts
- Sum total

---

## 🎯 Best Practices

### 1. **Name Fees Clearly**
- ✅ Good: "2024 Admin Fee - PMPM $500"
- ❌ Bad: "Fee 1"

### 2. **Set Effective Dates**
- Use start date when fee becomes active
- Use end date when fee expires
- Leave end date blank for ongoing

### 3. **Use Categories**
- **Administrative**: Base management fees
- **Performance**: Variable fees based on metrics
- **Add-On**: Optional services
- **Credit**: Discounts or offsets (negative)
- **Adjustment**: One-time corrections

### 4. **Test with Small Data First**
- Upload 1-2 months of data
- Create 1 fee
- Verify calculation
- Then scale up

### 5. **Save Regularly**
- Click **"Save Configuration"** after changes
- Data persists in browser localStorage
- Export important configs to Excel (future feature)

---

## 🚦 Next Steps

### After Basic Setup:

1. **Explore All 9 Fee Types**
   - Try each type to understand differences
   - Combine multiple fees per month

2. **Use Tiered Pricing**
   - Set up volume discounts
   - Test tier transitions

3. **Duplicate for Efficiency**
   - Create template fee
   - Duplicate and modify for variants

4. **Check Summaries**
   - View total annual fees
   - Compare to budget
   - Navigate to `/dashboard/summary` for reports

---

## 📚 Additional Resources

- **Full Documentation**: `FEE-CONFIGURATION-IMPLEMENTATION.md`
- **V2 Architecture**: `FEE-CONFIGURATION-V2.md`
- **Type Definitions**: `types/fees.ts`
- **Calculator Logic**: `lib/calculations/fee-calculator.ts`

---

## 💬 Support

### Having Issues?

1. Check browser console for errors
2. Verify enrollment data uploaded correctly
3. Ensure fee effective dates align with data months
4. Try refreshing page (data persists in localStorage)

### Need Features?

Phase 2 & 3 coming soon:
- Fee templates
- Excel import/export
- Seasonal modifiers
- Escalation schedules
- What-if scenarios

---

## ✅ Quick Checklist

Before going live:

- [ ] Enrollment data uploaded
- [ ] At least one fee configured
- [ ] Effective dates set correctly
- [ ] Fees calculating correctly in grid
- [ ] Breakdowns make sense
- [ ] Configuration saved

---

**You're all set! Start creating fees and let the system handle the calculations.** 🎉
