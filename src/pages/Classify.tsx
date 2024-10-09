import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchRandomFile, classifyFile } from '../services/fileService';
import { Button, Container, Typography, Box, Divider, Snackbar, Alert } from '@mui/material';
import { AxiosError } from 'axios';

interface AudioFile {
    id: number;
    filePath: string;
    filename: string;
    initialCategory: string;
    uploadedAt: string;
    uploadedBy: string;
    currentCategory: string;
}

const ClassifyPage: React.FC = () => {
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
    const [previousAudioFile, setPreviousAudioFile] = useState<AudioFile | null>(null); // Store last classified file
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const loadRandomFile = async () => {
        try {
            const file = await fetchRandomFile();
            setAudioFile(file);
            setError(null);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to load file:', axiosError.message);
            if (axiosError.response?.status === 400) {
                setError('No unclassified files are left to listen to.');
            } else {
                setError('An error occurred while loading the file. Please try again later.');
            }
        }
    };

    const handleClassification = useCallback(async (category: string) => {
        if (audioFile) {
            try {
                await classifyFile(audioFile.id, category);
                setNotification("Successfully classified!");

                // Store the current file as the previous file before loading a new one
                setPreviousAudioFile(audioFile);
                await loadRandomFile();
            } catch (error) {
                console.error('Classification failed:', error);
                setError('An error occurred while classifying the file. Please try again.');
            }
        }
    }, [audioFile]);

    const loadPreviousFile = () => {
        if (previousAudioFile) {
            setAudioFile(previousAudioFile);
            setPreviousAudioFile(null); // Clear after loading
        }
    };

    useEffect(() => {
        loadRandomFile();
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key.toLowerCase()) {
                case 'v':
                    handleClassification('Voice');
                    break;
                case 's':
                    handleClassification('Silent');
                    break;
                case 'a':
                    handleClassification('Answering Machine');
                    break;
                case 'u':
                    handleClassification('Undefined');
                    break;
                case ' ':
                    event.preventDefault();
                    if (audioRef.current) {
                        if (audioRef.current.paused) {
                            audioRef.current.play();
                        } else {
                            audioRef.current.pause();
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleClassification]);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Classify Audio File</Typography>
            {error ? (
                <Typography variant="h6" color="error" align="center" sx={{ marginTop: 4 }}>
                    {error}
                </Typography>
            ) : (
                audioFile && (
                    <div>
                        <Typography variant="h6">File Name: {audioFile.filename}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">Initial Category: {audioFile.initialCategory}</Typography>
                        <audio ref={audioRef} controls src={audioFile?.filePath || ''} style={{ marginTop: 10, marginBottom: 10 }}></audio>
                        <div>
                            <Button variant="contained" onClick={() => handleClassification('Voice')} style={{ marginRight: 10 }}>Voice (V)</Button>
                            <Button variant="contained" onClick={() => handleClassification('Silent')} style={{ marginRight: 10 }}>Silent (S)</Button>
                            <Button variant="contained" onClick={() => handleClassification('Answering Machine')} style={{ marginRight: 10 }}>Answering Machine (A)</Button>
                            <Button variant="contained" onClick={() => handleClassification('Undefined')} style={{ marginRight: 10 }}>Undefined (U)</Button>

                            {/* Button to load the previous file if it exists */}
                            {previousAudioFile && (
                                <Button variant="outlined" color="primary" onClick={loadPreviousFile}>
                                    Previous File
                                </Button>
                            )}
                        </div>

                        {/* Shortcut Information */}
                        <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6" gutterBottom>Shortcut Keys</Typography>
                            <Divider />
                            <Typography variant="body2" sx={{ marginTop: 1 }}>
                                <strong>Space</strong> - Play/Pause audio
                            </Typography>
                            <Typography variant="body2">
                                <strong>V</strong> - Classify as Voice
                            </Typography>
                            <Typography variant="body2">
                                <strong>S</strong> - Classify as Silent
                            </Typography>
                            <Typography variant="body2">
                                <strong>A</strong> - Classify as Answering Machine
                            </Typography>
                            <Typography variant="body2">
                                <strong>U</strong> - Classify as Undefined
                            </Typography>
                        </Box>
                    </div>
                )
            )}

            {/* Success Notification Snackbar */}
            <Snackbar
                open={!!notification}
                autoHideDuration={3000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setNotification(null)} severity="success" sx={{ width: '100%' }}>
                    {notification}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ClassifyPage;