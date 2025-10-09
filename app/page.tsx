'use client';

import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Grid
} from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      {/* Hero Section */}
      <Box sx={{ mb: 12, textAlign: 'center', py: 6 }}>
        <Typography variant="h2" component="h1">
          C&E Reporting Platform
        </Typography>
      </Box>

      {/* Feature Cards */}
      <Grid container spacing={4} sx={{ mb: 12 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Upload Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                Upload CSV files with validation
              </Typography>
              <Button
                component={Link}
                href="/dashboard/upload"
                fullWidth
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Configure Fees
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                Set up fee structures
              </Typography>
              <Button
                component={Link}
                href="/dashboard/fees"
                fullWidth
              >
                Set Up Fees
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Summary Table
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                View loss ratios and metrics
              </Typography>
              <Button
                component={Link}
                href="/dashboard/summary"
                fullWidth
              >
                View Summary
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                Interactive charts and reports
              </Typography>
              <Button
                component={Link}
                href="/dashboard/analytics"
                fullWidth
              >
                Explore Analytics
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Features - Simplified */}
      <Box sx={{ mb: 12, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
          Fast & Automated • Secure & Compliant • Accurate & Reliable
        </Typography>
      </Box>

      {/* Getting Started */}
      <Box sx={{ mb: 12, maxWidth: '800px', mx: 'auto' }}>
        <Box component="ol" sx={{ pl: 0, listStylePosition: 'inside', '& li': { mb: 2.5 } }}>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            Upload your CSV files
          </Typography>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            Configure fee structures
          </Typography>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            Review calculated metrics
          </Typography>
          <Typography component="li" variant="body1" sx={{ lineHeight: 1.8 }}>
            Generate reports
          </Typography>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <Box sx={{ textAlign: 'center', position: 'relative' }}>
          <Typography variant="h4" color="text.primary">4</Typography>
          <Typography variant="body2" color="text.secondary">Simple Steps</Typography>
        </Box>
        <Box sx={{ height: '40px', width: '1px', bgcolor: '#e0e0e0', display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="text.primary">80%</Typography>
          <Typography variant="body2" color="text.secondary">Time Saved</Typography>
        </Box>
        <Box sx={{ height: '40px', width: '1px', bgcolor: '#e0e0e0', display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="text.primary">100%</Typography>
          <Typography variant="body2" color="text.secondary">Automated</Typography>
        </Box>
        <Box sx={{ height: '40px', width: '1px', bgcolor: '#e0e0e0', display: { xs: 'none', sm: 'block' } }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="text.primary">Real-time</Typography>
          <Typography variant="body2" color="text.secondary">Analytics</Typography>
        </Box>
      </Box>
    </Container>
  );
}
