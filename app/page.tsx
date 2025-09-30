'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Card, 
  CardContent, 
  Button,
  Grid,
  Paper
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Healthcare Analytics Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            C&E Reporting Platform
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Professional claims and expenses reporting with automated calculations and interactive analytics
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Upload Data
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload experience data and high-cost claimant CSV files with automatic validation
                </Typography>
                <Link href="/dashboard/upload" passHref legacyBehavior>
                  <Button
                    component="a"
                    variant="contained"
                    fullWidth
                  >
                    Start Upload
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Configure Fees
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Set up fee structures with automatic calculations and enrollment data
                </Typography>
                <Link href="/dashboard/fees" passHref legacyBehavior>
                  <Button
                    component="a"
                    variant="contained"
                    fullWidth
                  >
                    Configure Fees
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Summary Table
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  View calculated loss ratios, PMPM metrics, and performance indicators
                </Typography>
                <Link href="/dashboard/summary" passHref legacyBehavior>
                  <Button
                    component="a"
                    variant="contained"
                    fullWidth
                  >
                    View Summary
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Interactive charts, KPIs, and detailed analytics with export capabilities
                </Typography>
                <Link href="/dashboard/analytics" passHref legacyBehavior>
                  <Button
                    component="a"
                    variant="contained"
                    fullWidth
                  >
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Getting Started
            </Typography>
            <Typography variant="body1" paragraph>
              Follow these steps to create your C&E report:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <Typography component="li" paragraph>
                <strong>Upload Data:</strong> Start by uploading your experience data and high-cost claimant CSV files
              </Typography>
              <Typography component="li" paragraph>
                <strong>Configure Fees:</strong> Set up your fee structures with appropriate rates and enrollment data
              </Typography>
              <Typography component="li" paragraph>
                <strong>Review Summary:</strong> Examine the calculated loss ratios and monthly summaries
              </Typography>
              <Typography component="li" paragraph>
                <strong>Analyze Results:</strong> Use the interactive dashboard to explore trends and generate reports
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
}
