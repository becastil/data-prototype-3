'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import Link from 'next/link';
import { useHealthcare, useExperienceData, useFeeStructuresV2 } from '@/lib/store/HealthcareContext';
import { FeeStructureV2 } from '@/types/fees';
import { ClientOnly } from '@/components/ClientOnly';
import FeeModal from './components/FeeModal';
import FeesGridV2 from './components/FeesGridV2';
import EnrollmentSourceSelector, { EnrollmentSource } from './components/EnrollmentSourceSelector';

export default function FeesPageV2() {
  const { actions } = useHealthcare();
  const experienceData = useExperienceData();
  const feeStructuresV2 = useFeeStructuresV2();

  // Modal state
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Partial<FeeStructureV2> | undefined>();

  // Settings
  const [enrollmentSource, setEnrollmentSource] = useState<EnrollmentSource>('enrollment');
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);

  // Add new fee
  const handleAddFee = () => {
    setEditingFee(undefined);
    setFeeModalOpen(true);
  };

  // Edit existing fee
  const handleEditFee = (fee: FeeStructureV2) => {
    setEditingFee(fee);
    setFeeModalOpen(true);
  };

  // Save fee (add or update)
  const handleSaveFee = (fee: Partial<FeeStructureV2>) => {
    if (fee.id && feeStructuresV2.some(f => f.id === fee.id)) {
      // Update existing
      actions.updateFeeStructureV2(fee as FeeStructureV2);
    } else {
      // Add new
      const newFee: FeeStructureV2 = {
        ...fee,
        id: fee.id || `fee-${Date.now()}`,
        name: fee.name || 'New Fee',
        category: fee.category || 'administrative',
        rateBasis: fee.rateBasis || 'pmpm',
        tieringEnabled: fee.tieringEnabled || false,
        effectiveStartDate: fee.effectiveStartDate || new Date().toISOString().split('T')[0],
        status: fee.status || 'active',
        version: fee.version || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as FeeStructureV2;

      actions.addFeeStructureV2(newFee);
    }

    setFeeModalOpen(false);
    setEditingFee(undefined);
  };

  // Delete fee
  const handleDeleteFee = (feeId: string) => {
    if (confirm('Are you sure you want to delete this fee?')) {
      actions.deleteFeeStructureV2(feeId);
    }
  };

  // Duplicate fee
  const handleDuplicateFee = (fee: FeeStructureV2) => {
    const duplicatedFee: FeeStructureV2 = {
      ...fee,
      id: `fee-${Date.now()}`,
      name: `${fee.name} (Copy)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    actions.addFeeStructureV2(duplicatedFee);
  };

  // Save all to context (triggers recalculation)
  const handleSaveAll = () => {
    actions.saveToStorage();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <ClientOnly>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Fee Configuration (V2)
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Intelligent fee management with automatic calculations
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={`${feeStructuresV2.length} Active Fees`}
                color="primary"
                variant="outlined"
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddFee}
              >
                Add Fee
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveAll}
              >
                Save Configuration
              </Button>
            </Box>
          </Box>
        </Box>

        {saved && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Fee configuration saved successfully!
          </Alert>
        )}

        {experienceData.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No enrollment data found. Please{' '}
            <Link href="/dashboard/upload" style={{ textDecoration: 'underline' }}>
              upload your experience data
            </Link>{' '}
            first to enable automatic fee calculations.
          </Alert>
        )}

        {/* Tabs for different views */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="Fee Grid" />
            <Tab label="Settings" />
            <Tab label="Templates" disabled />
          </Tabs>
        </Paper>

        {/* Tab Panel 0: Fee Grid */}
        {activeTab === 0 && (
          <FeesGridV2
            feeStructures={feeStructuresV2}
            experienceData={experienceData}
            onAddFee={handleAddFee}
            onEditFee={handleEditFee}
            onDeleteFee={handleDeleteFee}
            onDuplicateFee={handleDuplicateFee}
          />
        )}

        {/* Tab Panel 1: Settings */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fee Calculation Settings
            </Typography>

            <Box sx={{ mt: 3 }}>
              <EnrollmentSourceSelector
                selectedSource={enrollmentSource}
                onSourceChange={setEnrollmentSource}
                experienceData={experienceData}
                currentMonth={experienceData[0]?.month}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Supported Fee Types:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <li><strong>PMPM:</strong> Per Member Per Month - Amount × Enrollment</li>
                <li><strong>PEPM:</strong> Per Employee Per Month - Amount × Employees</li>
                <li><strong>Flat:</strong> Fixed amount regardless of enrollment</li>
                <li><strong>% of Premium:</strong> Percentage of total premiums</li>
                <li><strong>% of Claims:</strong> Percentage of total claims</li>
                <li><strong>Per Transaction:</strong> Amount × Transaction count</li>
                <li><strong>Blended:</strong> Combination of multiple fee components</li>
                <li><strong>Composite:</strong> Different rates for members vs dependents</li>
                <li><strong>Manual:</strong> Manually entered amounts</li>
              </Box>
            </Alert>

            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Advanced Features Available:
              </Typography>
              <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                <li>✓ Tiered pricing based on enrollment</li>
                <li>✓ Seasonal modifiers (coming soon)</li>
                <li>✓ Automatic escalation (coming soon)</li>
                <li>✓ Rate caps and floors (coming soon)</li>
                <li>✓ Multi-fee stacking</li>
                <li>✓ Real-time calculation preview</li>
              </Box>
            </Alert>
          </Paper>
        )}

        {/* Fee Modal */}
        <FeeModal
          open={feeModalOpen}
          onClose={() => {
            setFeeModalOpen(false);
            setEditingFee(undefined);
          }}
          onSave={handleSaveFee}
          existingFee={editingFee}
          enrollmentData={experienceData.map(e => ({ month: e.month, enrollment: e.enrollment }))}
        />

        {/* Navigation */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            component={Link}
            href="/dashboard/upload"
            variant="outlined"
          >
            Previous: Upload Data
          </Button>
          <Button
            component={Link}
            href="/dashboard/summary"
            variant="contained"
          >
            Next: View Summary
          </Button>
        </Box>

        {/* Info Footer */}
        <Paper sx={{ mt: 3, p: 2, backgroundColor: 'action.hover' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              <strong>Tip:</strong> Fees are automatically calculated based on your uploaded enrollment data.
              Click any month in the grid to see detailed breakdowns. Use the &quot;Add Fee&quot; button to configure
              additional fee structures with different rate types and tiering options.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ClientOnly>
  );
}
