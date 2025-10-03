'use client';

import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          C&E Reporting Platform
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Professional claims and expenses reporting with automated calculations and interactive analytics
        </Typography>
        <Chip label="✓ HIPAA Compliant" color="success" sx={{ mr: 1, mb: 2 }} />
        <Chip label="✓ Real-time Analytics" color="primary" sx={{ mr: 1, mb: 2 }} />
        <Chip label="✓ Automated Workflows" color="secondary" sx={{ mb: 2 }} />
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Upload Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                Upload experience data and high-cost claimant CSV files with automatic validation and error detection
              </Typography>
              <Button
                component={Link}
                href="/dashboard/upload"
                variant="contained"
                fullWidth
                sx={{ mt: 'auto' }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Configure Fees
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                Set up fee structures with automatic calculations and enrollment data integration
              </Typography>
              <Button
                component={Link}
                href="/dashboard/fees"
                variant="contained"
                fullWidth
                sx={{ mt: 'auto' }}
              >
                Set Up Fees
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Summary Table
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                View calculated loss ratios, PMPM metrics, and performance indicators with color-coded alerts
              </Typography>
              <Button
                component={Link}
                href="/dashboard/summary"
                variant="contained"
                fullWidth
                sx={{ mt: 'auto' }}
              >
                View Summary
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                Interactive charts, KPIs, and detailed analytics with export capabilities and drill-down features
              </Typography>
              <Button
                component={Link}
                href="/dashboard/analytics"
                variant="contained"
                fullWidth
                sx={{ mt: 'auto' }}
              >
                Explore Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Features */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Fast & Automated
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automated calculations and workflows reduce manual work by 80%, providing instant insights from your data.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Secure & Compliant
            </Typography>
            <Typography variant="body2" color="text.secondary">
              HIPAA-conscious design with encryption, audit logging, and secure data handling to protect sensitive information.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Accurate & Reliable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Industry-standard calculations for loss ratios, PMPM, and financial metrics with built-in validation.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Getting Started */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Follow these simple steps to create your comprehensive C&E report:
        </Typography>
        <Box component="ol" sx={{ pl: 3, '& li': { mb: 2 } }}>
          <Typography component="li" variant="body1">
            <strong>Upload Data:</strong> Start by uploading your experience data and high-cost claimant CSV files. The system automatically validates headers and data formats.
          </Typography>
          <Typography component="li" variant="body1">
            <strong>Configure Fees:</strong> Set up your fee structures with PMPM, PEPM, or flat rates. The platform automatically calculates totals based on enrollment data.
          </Typography>
          <Typography component="li" variant="body1">
            <strong>Review Summary:</strong> Examine calculated loss ratios and monthly summaries with color-coded performance indicators highlighting areas that need attention.
          </Typography>
          <Typography component="li" variant="body1">
            <strong>Analyze Results:</strong> Use the interactive dashboard to explore trends, identify high-cost members, and generate exportable PDF reports for stakeholders.
          </Typography>
        </Box>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 2, color: 'white' }}>
            <Typography variant="h4">4</Typography>
            <Typography variant="body2">Simple Steps</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'secondary.light', borderRadius: 2, color: 'white' }}>
            <Typography variant="h4">80%</Typography>
            <Typography variant="body2">Time Saved</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
            <Typography variant="h4">100%</Typography>
            <Typography variant="body2">Automated</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'white' }}>
            <Typography variant="h4">Real-time</Typography>
            <Typography variant="body2">Analytics</Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
