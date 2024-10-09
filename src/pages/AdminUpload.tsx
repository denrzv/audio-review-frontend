import React, { useState, useRef } from 'react';
import { Button, Typography } from '@mui/material';
import { uploadFile } from '../services/fileService';

const AdminUpload: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFiles(event.target.files);
        }
    };

    const handleUpload = async () => {
        if (selectedFiles) {
            try {
                const uploadPromises = Array.from(selectedFiles).map((file) => uploadFile(file));
                await Promise.all(uploadPromises);
                alert('All files uploaded successfully!');
            } catch (error) {
                console.error('File upload failed:', error);
                alert('File upload failed');
            }
        }
    };

    return (
        <div>
            <Typography variant="h4">Admin File Upload</Typography>
            <input
                ref={fileInputRef}
                accept="audio/*"
                type="file"
                onChange={handleFileChange}
                style={{ margin: '10px 0' }}
                multiple // Allow multiple or single file selection
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!selectedFiles}
            >
                Upload All Files
            </Button>
        </div>
    );
};

export default AdminUpload;
