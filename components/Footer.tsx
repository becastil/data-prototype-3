'use client';

import { Box, Container, Typography, Link as MuiLink, Divider, Grid } from '@mui/material';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              C&E Reporting Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Professional claims and expenses reporting with automated calculations and interactive analytics.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={Link}
                href="/"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                Home
              </MuiLink>
              <MuiLink
                component={Link}
                href="/dashboard/upload"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                Upload Data
              </MuiLink>
              <MuiLink
                component={Link}
                href="/dashboard/analytics"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none' }}
              >
                Analytics
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink href="#" variant="body2" color="text.secondary">
                Privacy Policy
              </MuiLink>
              <MuiLink href="#" variant="body2" color="text.secondary">
                Terms of Service
              </MuiLink>
              <MuiLink href="#" variant="body2" color="text.secondary">
                Contact Support
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} C&E Reporting Platform. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
