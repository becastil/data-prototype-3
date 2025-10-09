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
        <Typography variant="body2" color="text.secondary" align="center">
          © {currentYear} C&E Reporting Platform
        </Typography>
      </Container>
    </Box>
  );
}
