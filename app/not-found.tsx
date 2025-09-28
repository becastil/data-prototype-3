'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Box sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" sx={{ mb: 2, color: '#666' }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
          The page you are looking for does not exist.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => router.push('/')}
          sx={{ 
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
}
