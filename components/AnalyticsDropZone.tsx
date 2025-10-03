'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';

interface AnalyticsDropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

export function AnalyticsDropZone({
  onFilesAccepted,
  maxFiles = 5,
  acceptedFileTypes = {
    'text/csv': ['.csv'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  }
}: AnalyticsDropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles
  } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize: 52428800, // 50MB
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive
            ? 'primary.main'
            : isDragReject
            ? 'error.main'
            : 'grey.300',
          backgroundColor: isDragActive
            ? 'action.hover'
            : isDragReject
            ? 'error.lighter'
            : 'background.paper',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon
          sx={{
            fontSize: 64,
            color: isDragActive
              ? 'primary.main'
              : isDragReject
              ? 'error.main'
              : 'text.secondary',
            mb: 2,
          }}
        />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Drop files here...'
            : isDragReject
            ? 'Invalid file type'
            : 'Drag & drop analytics data files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse files
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
          Accepts: CSV, XLS, XLSX • Max {maxFiles} files • 50MB per file
        </Typography>
      </Paper>

      {acceptedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files:
          </Typography>
          {acceptedFiles.map((file, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                backgroundColor: 'action.hover',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <DescriptionIcon color="primary" />
              <Typography variant="body2">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
