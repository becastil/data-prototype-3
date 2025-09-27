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
  Link as MuiLink,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack,
  GetApp,
  ExpandMore,
  ErrorOutline,
  CheckCircle
} from '@mui/icons-material';
import Link from 'next/link';
import { CSVUploader } from './components/CSVUploader';
import { useHealthcare } from '@/lib/store/HealthcareContext';

interface UploadResult {
  fileName: string;
  fileType?: string;
  success: boolean;
  data?: any[];
  errors?: Array<{
    row: number;
    column: string;
    message: string;
    value: any;
  }>;
  totalRows?: number;
  validRows?: number;
  message?: string;
  error?: string;
}

const steps = ['Upload Files', 'Validate Data', 'Review & Confirm'];

export default function UploadPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { actions } = useHealthcare();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFileUpload = async (files: FileList) => {
    setIsProcessing(true);
    actions.setLoading(true);
    actions.setError(null);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResults(result.data);
        
        // Process successful uploads and update context
        for (const uploadResult of result.data) {
          if (uploadResult.success && uploadResult.data) {
            if (uploadResult.fileType === 'experience') {
              actions.setExperienceData(uploadResult.data);
            } else if (uploadResult.fileType === 'high-cost-claimant') {
              actions.setHighCostClaimants(uploadResult.data);
            }
          }
        }
        
        handleNext();
      } else {
        actions.setError(result.error || 'Upload failed');
        setUploadResults(result.data || []);
      }
    } catch (error) {
      console.error('Upload error:', error);
      actions.setError('Network error during upload');
    } finally {
      setIsProcessing(false);
      actions.setLoading(false);
    }
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
                  href="/api/upload?template=experience" 
                  download="experience-data-template.csv"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <GetApp fontSize="small" />
                  Experience Data Template
                </MuiLink>
                <MuiLink 
                  href="/api/upload?template=high-cost-claimant" 
                  download="high-cost-claimants-template.csv"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <GetApp fontSize="small" />
                  High-Cost Claimants Template
                </MuiLink>
              </Box>
            </Alert>

            <CSVUploader onUpload={handleFileUpload} disabled={isProcessing} />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 2: Validation Results
            </Typography>
            
            {uploadResults.map((result, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Alert 
                  severity={result.success ? 'success' : 'error'}
                  icon={result.success ? <CheckCircle /> : <ErrorOutline />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {result.fileName} {result.fileType && `(${result.fileType.replace('-', ' ')})`}
                  </Typography>
                  <Typography variant="body2">
                    {result.message || result.error}
                  </Typography>
                  {result.success && result.validRows && result.totalRows && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Processed: {result.validRows} of {result.totalRows} rows
                    </Typography>
                  )}
                </Alert>

                {result.errors && result.errors.length > 0 && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="body2" color="error">
                        {result.errors.length} validation errors found
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Row</TableCell>
                              <TableCell>Column</TableCell>
                              <TableCell>Error</TableCell>
                              <TableCell>Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {result.errors.slice(0, 10).map((error, errorIndex) => (
                              <TableRow key={errorIndex}>
                                <TableCell>{error.row}</TableCell>
                                <TableCell>{error.column}</TableCell>
                                <TableCell>{error.message}</TableCell>
                                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {typeof error.value === 'string' ? error.value : JSON.stringify(error.value)}
                                </TableCell>
                              </TableRow>
                            ))}
                            {result.errors.length > 10 && (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  <Typography variant="body2" color="text.secondary">
                                    ... and {result.errors.length - 10} more errors
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            ))}
            
            <Box sx={{ display: 'flex', pt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button 
                variant="contained" 
                onClick={handleNext}
                disabled={uploadResults.every(result => !result.success)}
              >
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
