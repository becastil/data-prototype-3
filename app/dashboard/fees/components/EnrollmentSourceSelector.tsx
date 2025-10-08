'use client';

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { ExperienceData } from '@/types/healthcare';

export type EnrollmentSource =
  | 'enrollment'           // Total enrollment from experience data
  | 'eligible_employees'   // Eligible employees count
  | 'active_members'       // Active members
  | 'covered_lives'        // Total covered lives
  | 'custom';              // Custom field from CSV

interface EnrollmentSourceSelectorProps {
  selectedSource: EnrollmentSource;
  onSourceChange: (source: EnrollmentSource) => void;
  experienceData?: ExperienceData[];
  currentMonth?: string;
  disabled?: boolean;
}

const sourceOptions: { value: EnrollmentSource; label: string; description: string }[] = [
  {
    value: 'enrollment',
    label: 'Total Enrollment',
    description: 'Use total enrollment from experience data'
  },
  {
    value: 'eligible_employees',
    label: 'Eligible Employees',
    description: 'Use employee count (not including dependents)'
  },
  {
    value: 'active_members',
    label: 'Active Members',
    description: 'Use active member count'
  },
  {
    value: 'covered_lives',
    label: 'Covered Lives',
    description: 'Use total covered lives (members + dependents)'
  },
  {
    value: 'custom',
    label: 'Custom Field',
    description: 'Select a custom field from uploaded CSV'
  }
];

export default function EnrollmentSourceSelector({
  selectedSource,
  onSourceChange,
  experienceData = [],
  currentMonth,
  disabled = false
}: EnrollmentSourceSelectorProps) {
  // Get current month's enrollment value
  const getCurrentEnrollmentValue = (): number | null => {
    if (!experienceData || experienceData.length === 0 || !currentMonth) {
      return null;
    }

    const monthData = experienceData.find(data => data.month === currentMonth);
    if (!monthData) {
      return null;
    }

    // For now, we only have 'enrollment' in our data structure
    // In a real implementation, you'd map different sources to different fields
    switch (selectedSource) {
      case 'enrollment':
        return monthData.enrollment;
      case 'eligible_employees':
        // Would come from a different field in the CSV
        return Math.floor(monthData.enrollment * 0.6); // Placeholder: 60% of enrollment
      case 'active_members':
        return monthData.enrollment; // Placeholder
      case 'covered_lives':
        return Math.floor(monthData.enrollment * 1.5); // Placeholder: 150% of enrollment
      case 'custom':
        return monthData.enrollment; // Placeholder
      default:
        return null;
    }
  };

  const enrollmentValue = getCurrentEnrollmentValue();
  const hasData = experienceData && experienceData.length > 0;

  return (
    <Box>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel>Enrollment Data Source</InputLabel>
        <Select
          value={selectedSource}
          onChange={(e) => onSourceChange(e.target.value as EnrollmentSource)}
          label="Enrollment Data Source"
          renderValue={(value) => {
            const option = sourceOptions.find(opt => opt.value === value);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{option?.label}</Typography>
                {enrollmentValue !== null && (
                  <Chip
                    label={enrollmentValue.toLocaleString()}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            );
          }}
        >
          {sourceOptions.map(option => (
            <MenuItem key={option.value} value={option.value}>
              <Box sx={{ py: 0.5 }}>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Current Value Display */}
      {hasData && enrollmentValue !== null && currentMonth && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {currentMonth}: <strong>{enrollmentValue.toLocaleString()}</strong> {selectedSource.replace('_', ' ')}
          </Typography>
        </Box>
      )}

      {/* Warning if no data */}
      {!hasData && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
          <Typography variant="caption">
            No enrollment data available. Please upload experience data first.
          </Typography>
        </Alert>
      )}

      {/* Missing data for current month */}
      {hasData && currentMonth && enrollmentValue === null && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
          <Typography variant="caption">
            No enrollment data found for {currentMonth}. Fee calculation may use estimates.
          </Typography>
        </Alert>
      )}

      {/* Info tooltip */}
      <Box sx={{ mt: 1 }}>
        <Tooltip
          title={
            <Box>
              <Typography variant="caption" gutterBottom>
                <strong>Enrollment Data Sources:</strong>
              </Typography>
              <Typography variant="caption" component="div">
                • <strong>Total Enrollment:</strong> All covered members
              </Typography>
              <Typography variant="caption" component="div">
                • <strong>Eligible Employees:</strong> Employee subscribers only
              </Typography>
              <Typography variant="caption" component="div">
                • <strong>Active Members:</strong> Currently active coverage
              </Typography>
              <Typography variant="caption" component="div">
                • <strong>Covered Lives:</strong> Members + dependents
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                The selected source will be used for PMPM and PEPM calculations.
              </Typography>
            </Box>
          }
          arrow
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
            <InfoIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              About enrollment sources
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  );
}
