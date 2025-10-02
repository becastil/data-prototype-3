'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Default loading fallback with spinner
const DefaultLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh'
    }}
  >
    <CircularProgress />
  </Box>
);

export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback !== undefined ? fallback : <DefaultLoadingFallback />}</>;
  }

  return <>{children}</>;
}
