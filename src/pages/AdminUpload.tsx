import React, { useState, useRef } from 'react';
import { Button, Typography, Box, List, ListItem, ListItemText, CircularProgress, Snackbar, Alert } from '@mui/material';
import { uploadFile } from '../services/fileService';

const AdminUpload: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' }>({});
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(Array.from(event.target.files));
            setUploadStatus({});
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length > 0) {
            setIsUploading(true);
            const statuses: { [key: string]: 'pending' | 'success' | 'error' } = {};

            const uploadPromises = selectedFiles.map(async (file) => {
                try {
                    statuses[file.name] = 'pending';
                    setUploadStatus({ ...statuses });
                    await uploadFile(file);
                    statuses[file.name] = 'success';
                } catch (error) {
                    console.error('File upload failed:', error);
                    statuses[file.name] = 'error';
                }
                setUploadStatus({ ...statuses });
            });

            await Promise.all(uploadPromises);
            setIsUploading(false);
            const hasErrors = Object.values(statuses).includes('error');
            setNotification({
                message: hasErrors ? 'Some files failed to upload.' : 'All files uploaded successfully!',
                severity: hasErrors ? 'error' : 'success',
            });
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Admin File Upload</Typography>
            <input
                ref={fileInputRef}
                accept="audio/*"
                type="file"
                onChange={handleFileChange}
                style={{ margin: '10px 0' }}
                multiple
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                sx={{ margin: '10px 0' }}
            >
                {isUploading ? 'Uploading...' : 'Upload All Files'}
            </Button>

            <List dense>
                {selectedFiles.map((file) => (
                    <ListItem key={file.name} sx={{ display: 'flex', alignItems: 'center' }}>
                        <ListItemText primary={file.name} />
                        {uploadStatus[file.name] === 'pending' && <CircularProgress size={20} />}
                        {uploadStatus[file.name] === 'success' && (
                            <Typography variant="body2" color="green">Uploaded</Typography>
                        )}
                        {uploadStatus[file.name] === 'error' && (
                            <Typography variant="body2" color="red">Failed</Typography>
                        )}
                    </ListItem>
                ))}
            </List>

            <Snackbar
                open={!!notification}
                autoHideDuration={4000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {notification ? (
                    <Alert severity={notification.severity} onClose={() => setNotification(null)}>
                        {notification.message}
                    </Alert>
                ) : undefined}
            </Snackbar>
        </Box>
    );
};

export default AdminUpload;