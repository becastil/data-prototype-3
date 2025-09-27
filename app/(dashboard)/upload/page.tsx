'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Alert,
  Link as MuiLink
} from '@mui/material';
import {
  ArrowBack,
  GetApp
} from '@mui/icons-material';
import Link from 'next/link';
import { CSVUploader } from './components/CSVUploader';

interface ValidationResult {
  fileName: string;
  status: 'success' | 'error';
  records?: number;
}

const steps = ['Upload Files', 'Validate Data', 'Review & Confirm'];

export default function UploadPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileUpload = async (files: FileList) => {
    // TODO: Implement actual file processing
    console.log('Files uploaded:', files);
    
    // Simulate validation results
    setTimeout(() => {
      setValidationResults([
        { fileName: 'experience-data.csv', status: 'success', records: 12 },
        { fileName: 'high-cost-claimants.csv', status: 'success', records: 20 }
      ]);
      handleNext();
    }, 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Link href="/" passHref>
          <Button startIcon={<ArrowBack />} sx={{ mb: 2 }}>
            Back to Home
          </Button>
        </Link>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Healthcare Data
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload your experience data and high-cost claimants CSV files
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 1: Upload CSV Files
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Download Templates:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <MuiLink 
                  href="/templates/experience-data-template.csv" 
                  download
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <GetApp fontSize="small" />
                  Experience Data Template
                </MuiLink>
                <MuiLink 
                  href="/templates/high-cost-claimants-template.csv" 
                  download
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <GetApp fontSize="small" />
                  High-Cost Claimants Template
                </MuiLink>
              </Box>
            </Alert>

            <CSVUploader onUpload={handleFileUpload} />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 2: Validation Results
            </Typography>
            {validationResults.map((result, index) => (
              <Alert 
                key={index}
                severity={result.status === 'success' ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  {result.fileName}
                </Typography>
                <Typography variant="body2">
                  {result.status === 'success' 
                    ? `Successfully processed ${result.records} records` 
                    : 'Validation failed'
                  }
                </Typography>
              </Alert>
            ))}
            
            <Box sx={{ display: 'flex', pt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 3: Review & Confirm
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              All files have been successfully uploaded and validated.
            </Alert>
            
            <Typography variant="body1" paragraph>
              Your data has been processed and is ready for analysis. You can now proceed to configure fees or view the summary table.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Link href="/dashboard/fees" passHref>
                <Button variant="contained">
                  Configure Fees
                </Button>
              </Link>
              <Link href="/dashboard/summary" passHref>
                <Button variant="outlined">
                  View Summary
                </Button>
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
