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
        backgroundColor: '#fafafa',
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Claims and expenses reporting
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <MuiLink
                component={Link}
                href="/"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Home
              </MuiLink>
              <MuiLink
                component={Link}
                href="/dashboard/upload"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Upload Data
              </MuiLink>
              <MuiLink
                component={Link}
                href="/dashboard/analytics"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Analytics
              </MuiLink>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <MuiLink
                component={Link}
                href="/legal/privacy"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Privacy
              </MuiLink>
              <MuiLink
                component={Link}
                href="/legal/terms"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Terms
              </MuiLink>
              <MuiLink
                component={Link}
                href="/contact"
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Contact
              </MuiLink>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2, borderColor: '#e0e0e0' }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} C&E Reporting Platform
        </Typography>
      </Container>
    </Box>
  );
}
