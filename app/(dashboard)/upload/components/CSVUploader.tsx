'use client';

import { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Alert, 
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  CloudUpload, 
  InsertDriveFile,
  CheckCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface DropZoneProps {
  isDragOver: boolean;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DropZone = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isDragOver',
})<DropZoneProps>(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease-in-out',
  backgroundColor: isDragOver ? theme.palette.action.hover : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

interface CSVUploaderProps {
  onUpload: (files: FileList) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function CSVUploader({ 
  onUpload, 
  maxFiles = 5, 
  acceptedTypes = ['.csv'] 
}: CSVUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFiles = (files: FileList): string | null => {
    if (files.length > maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    const invalidFiles = Array.from(files).filter((file) => {
      const fileName = file.name.toLowerCase();
      return !acceptedTypes.some((type) => fileName.endsWith(type.toLowerCase()));
    });

    if (invalidFiles.length > 0) {
      return `Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only CSV files are allowed.`;
    }

    // Check file sizes (max 50MB per file)
    const oversizedFiles = Array.from(files).filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      return `Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum size is 50MB per file.`;
    }

    return null;
  };

  const handleFileUpload = async (files: FileList) => {
    const validationError = validateFiles(files);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadedFiles(Array.from(files));
      await onUpload(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DropZone
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drop CSV files here or click to browse
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Upload experience data and high-cost claimant files (max {maxFiles} files, 50MB each)
        </Typography>
        
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUpload />}
          disabled={uploading}
        >
          Choose Files
          <VisuallyHiddenInput
            id="file-input"
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
          />
        </Button>
      </DropZone>

      {uploading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Processing files...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedFiles.length > 0 && !uploading && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files
          </Typography>
          <Paper sx={{ p: 2 }}>
            <List dense>
              {uploadedFiles.map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <InsertDriveFile color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${formatFileSize(file.size)} • Last modified: ${new Date(file.lastModified).toLocaleDateString()}`}
                  />
                  <CheckCircle color="success" />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Alert severity="info">
          <Typography variant="subtitle2" gutterBottom>
            File Requirements:
          </Typography>
          <Typography variant="body2" component="div">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>CSV format only</li>
              <li>Maximum file size: 50MB</li>
              <li>Maximum {maxFiles} files total</li>
              <li>Headers must match template format exactly</li>
              <li>All numeric fields must contain valid numbers</li>
              <li>Date fields must be in YYYY-MM format</li>
            </ul>
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
}
