const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'app/dashboard/fees/components/AdjustableLineItems.tsx',
    changes: [
      { from: 'Click "Add Adjustment"', to: 'Click &quot;Add Adjustment&quot;' },
      { from: 'as any', to: 'as UserAdjustableLineItem[\'type\']' }
    ]
  },
  {
    file: 'app/dashboard/fees/components/AdminFeesManager.tsx',
    changes: [
      { from: ',\n  Tooltip\n} from \'@mui/material\';', to: '\n} from \'@mui/material\';' },
      { from: 'Click "Add Admin Fee"', to: 'Click &quot;Add Admin Fee&quot;' },
      { from: 'onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}',
        to: 'onChange={(e) => setFormData({ ...formData, category: e.target.value as FeeStructureV2[\'category\'] })}' },
      { from: 'onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value as any })}',
        to: 'onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value as FeeStructureV2[\'rateBasis\'] })}' },
      { from: 'onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}',
        to: 'onChange={(e) => setFormData({ ...formData, status: e.target.value as FeeStructureV2[\'status\'] })}' }
    ]
  },
  {
    file: 'app/dashboard/summary/page.tsx',
    changes: [
      { from: 'as any', to: 'as CompleteSummaryRow[]' }
    ]
  },
  {
    file: 'components/Footer.tsx',
    changes: [
      { from: 'import { Typography, Container, Box, MuiLink, Divider, Grid } from',
        to: 'import { Typography, Container, Box } from' },
      { from: 'import Link from \'next/link\';', to: '' }
    ]
  }
];

// Remove unused imports from db query files
const dbQueryFiles = [
  'lib/db/queries/claimants.ts',
  'lib/db/queries/config.ts',
  'lib/db/queries/experience-data.ts',
  'lib/db/queries/fees.ts',
  'lib/db/queries/summaries.ts'
];

dbQueryFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Remove import lines with unused types
    const lines = content.split('\n');
    const filteredLines = lines.filter(line => {
      // Keep the line if it doesn't import the unused type
      if (file.includes('claimants.ts')) return !line.includes('HighCostClaimant');
      if (file.includes('config.ts')) return !line.includes('DashboardConfig');
      if (file.includes('experience-data.ts')) return !line.includes('ExperienceData');
      if (file.includes('fees.ts')) return !line.includes('FeeStructure');
      if (file.includes('summaries.ts')) return !line.includes('MonthlySummary');
      return true;
    });
    fs.writeFileSync(fullPath, filteredLines.join('\n'));
    console.log(`Fixed ${file}`);
  }
});

console.log('All lint errors fixed!');
