'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import InfoIcon from '@mui/icons-material/Info';
import Link from 'next/link';
import { useHealthcare, useExperienceData, useFeeStructures, useFeeStructuresV2 } from '@/lib/store/HealthcareContext';
import { FeeStructureV2 } from '@/types/fees';
import { ClientOnly } from '@/components/ClientOnly';
import FeeModal from './components/FeeModal';
import FeesGridV2 from './components/FeesGridV2';

export default function FeesPage() {
  const { state, actions } = useHealthcare();
  const experienceData = useExperienceData();
  const legacyFees = useFeeStructures();
  const feeStructuresV2 = useFeeStructuresV2();

  // UI State - Default to V2 if there are V2 fees or no legacy fees
  const [useV2System, setUseV2System] = useState(feeStructuresV2.length > 0 || legacyFees.length === 0);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Partial<FeeStructureV2> | undefined>();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Add new fee (V2)
  const handleAddFee = () => {
    setEditingFee(undefined);
    setFeeModalOpen(true);
  };

  // Edit fee (V2)
  const handleEditFee = (fee: FeeStructureV2) => {
    setEditingFee(fee);
    setFeeModalOpen(true);
  };

  // Save fee (V2)
  const handleSaveFee = (fee: Partial<FeeStructureV2>) => {
    if (fee.id && feeStructuresV2.some(f => f.id === fee.id)) {
      actions.updateFeeStructureV2(fee as FeeStructureV2);
    } else {
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

  // Delete fee (V2)
  const handleDeleteFee = (feeId: string) => {
    if (confirm('Are you sure you want to delete this fee?')) {
      actions.deleteFeeStructureV2(feeId);
    }
  };

  // Duplicate fee (V2)
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

  // Save all
  const handleSaveAll = async () => {
    actions.setLoading(true);

    try {
      actions.saveToStorage();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      actions.setError('Failed to save configuration');
    } finally {
      actions.setLoading(false);
    }
  };

  // Migrate from V1 to V2
  const handleMigrateToV2 = () => {
    if (!confirm('This will migrate your existing fees to the new V2 system. Continue?')) {
      return;
    }

    // TODO: Implement migration logic
    alert('Migration feature coming soon!');
  };

  return (
    <ClientOnly>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Home
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Fee Configuration
                {useV2System && (
                  <Chip
                    label="V2"
                    color="primary"
                    size="small"
                    sx={{ ml: 2, verticalAlign: 'middle' }}
                  />
                )}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {useV2System
                  ? 'Advanced fee management with intelligent calculations'
                  : 'Configure monthly fee structures with automatic calculations'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Version Toggle */}
              <ToggleButtonGroup
                value={useV2System ? 'v2' : 'v1'}
                exclusive
                onChange={(_, value) => {
                  if (value !== null) {
                    setUseV2System(value === 'v2');
                  }
                }}
                size="small"
              >
                <ToggleButton value="v1">
                  V1 Legacy
                </ToggleButton>
                <ToggleButton value="v2">
                  V2 Advanced
                </ToggleButton>
              </ToggleButtonGroup>

              {useV2System && (
                <>
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
                </>
              )}

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveAll}
                disabled={state.loading}
              >
                Save Configuration
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Alerts */}
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

        {/* V2 System Promo */}
        {!useV2System && legacyFees.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }} icon={<UpgradeIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Upgrade to V2 Fee System
                </Typography>
                <Typography variant="body2">
                  Get access to 9 fee types, tiered pricing, blended rates, and automatic calculations.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<UpgradeIcon />}
                onClick={handleMigrateToV2}
                sx={{ ml: 2 }}
              >
                Migrate Now
              </Button>
            </Box>
          </Alert>
        )}

        {/* Main Content */}
        {useV2System ? (
          <Box>
            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab label="Fee Grid" />
                <Tab label="Settings" />
                <Tab label="Templates" disabled />
              </Tabs>
            </Paper>

            {/* Tab 0: Fee Grid */}
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

            {/* Tab 1: Settings */}
            {activeTab === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Fee Calculation Settings
                </Typography>

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
                    Advanced Features:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                    <li>✓ Tiered pricing based on enrollment ranges</li>
                    <li>✓ Multi-fee stacking per month</li>
                    <li>✓ Real-time calculation preview</li>
                    <li>✓ Automatic recalculation on data changes</li>
                    <li>✓ Detailed fee breakdowns with tooltips</li>
                    <li>✓ Fee duplication and templating</li>
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
          </Box>
        ) : (
          // V1 Legacy System
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Legacy Fee Management (V1)
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You are using the legacy fee system. Switch to V2 for advanced features.
            </Typography>
            {/* Include legacy FeesGrid here */}
            <Alert severity="warning">
              Legacy V1 system - Limited functionality. Please upgrade to V2 for full features.
            </Alert>
          </Paper>
        )}

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
              <strong>Tip:</strong>{' '}
              {useV2System
                ? 'Fees are automatically calculated based on uploaded enrollment data. Click any month to see detailed breakdowns.'
                : 'Upgrade to V2 for automatic calculations, tiered pricing, and 9 different fee types.'}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ClientOnly>
  );
}
