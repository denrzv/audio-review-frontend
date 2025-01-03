import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchRandomFile, classifyFile, fetchClassificationHistory } from '../services/fileService';
import { Button, Container, Typography, Box, Divider, Snackbar, Alert, List, ListItem, ListItemText, Pagination } from '@mui/material';
import { AxiosError } from 'axios';

interface AudioFile {
    id: number;
    filePath: string;
    filename: string;
    initialCategory: string;
    uploadedAt: string;
    uploadedBy: string;
    currentCategory: string;
    classifiedAt?: string;
}

const categoryColors: Record<'Voice' | 'Silent' | 'Answering Machine' | 'Undefined', string> = {
    Voice: '#94da97',
    Silent: '#faee88',
    "Answering Machine": '#f59089',
    Undefined: '#BDBDBD'
};

const ClassifyPage: React.FC = () => {
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [classifiedFiles, setClassifiedFiles] = useState<AudioFile[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const isFirstLoad = useRef(true);

    const loadRandomFile = useCallback(async () => {
        if (isFirstLoad.current || !audioFile) {
            try {
                const file = await fetchRandomFile();
                setAudioFile(file);
                setError(null);
            } catch (error) {
                const axiosError = error as AxiosError;
                console.error('Failed to load file:', axiosError.message);
                setError(axiosError.response?.status === 400 ? 'No unclassified files are left to listen to.' : 'An error occurred while loading the file. Please try again later.');
            } finally {
                isFirstLoad.current = false;
            }
        }
    }, [audioFile]);

    const loadClassificationHistory = useCallback(async (page: number) => {
        try {
            const response = await fetchClassificationHistory(page, 10);
            setClassifiedFiles(response.content);
            setTotalPages(response.page.totalPages); // Access totalPages correctly from the nested page object
        } catch (error) {
            console.error('Failed to fetch classification history:', error);
        }
    }, []);

    const handleClassification = useCallback(async (category: string) => {
        if (audioFile) {
            try {
                await classifyFile(audioFile.id, category);
                setNotification("Successfully classified!");
                setAudioFile(null);
                await loadRandomFile();
                await loadClassificationHistory(0);
            } catch (error) {
                console.error('Classification failed:', error);
                setError('An error occurred while classifying the file. Please try again.');
            }
        }
    }, [audioFile, loadRandomFile, loadClassificationHistory]);

    const handleReclassify = useCallback((file: AudioFile) => {
        setAudioFile(file);
    }, []);


    useEffect(() => {
        loadRandomFile();
        loadClassificationHistory(0);
    }, [loadRandomFile, loadClassificationHistory]);

    useEffect(() => {
        loadClassificationHistory(currentPage);
    }, [currentPage, loadClassificationHistory]);

    useEffect(() => {
        if (audioFile && audioRef.current) {
            audioRef.current.play().catch((error) => {
                console.error('Error playing audio:', error);
            });
        }
    }, [audioFile]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key.toLowerCase()) {
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
                <Typography variant="h6" color="error" align="center" sx={{ marginTop: 4 }}>{error}</Typography>
            ) : (
                <div>
                    <Typography variant="h6">File Name: {audioFile?.filename}</Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Initial Category: <span
                        style={{color: categoryColors[audioFile?.initialCategory as keyof typeof categoryColors]}}>{audioFile?.initialCategory}</span>
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Current Category: <span
                        style={{color: categoryColors[audioFile?.currentCategory as keyof typeof categoryColors]}}>{audioFile?.currentCategory}</span>
                    </Typography>
                    <audio ref={audioRef} controls src={audioFile?.filePath || ''}
                           style={{marginTop: 10, marginBottom: 10}}></audio>
                    <div>
                        <Button variant="contained" onClick={() => handleClassification('Voice')}
                                style={{backgroundColor: categoryColors.Voice, color: '#fff', marginRight: 10}}>Voice
                            (V)</Button>
                        <Button variant="contained" onClick={() => handleClassification('Silent')}
                                style={{backgroundColor: categoryColors.Silent, color: '#fff', marginRight: 10}}>Silent
                            (S)</Button>
                        <Button variant="contained" onClick={() => handleClassification('Answering Machine')} style={{
                            backgroundColor: categoryColors["Answering Machine"],
                            color: '#fff',
                            marginRight: 10
                        }}>Answering Machine (A)</Button>
                        <Button variant="contained" onClick={() => handleClassification('Undefined')}
                                style={{backgroundColor: categoryColors.Undefined, color: '#fff', marginRight: 10}}>Undefined
                            (U)</Button>
                    </div>
                    <Box sx={{
                        marginTop: 4,
                        padding: 2,
                        border: '1px solid #ddd',
                        borderRadius: 1,
                        backgroundColor: '#f9f9f9'
                    }}>
                        <Typography variant="h6" gutterBottom>Shortcut Keys</Typography>
                        <Divider/>
                        <Typography variant="body2" sx={{marginTop: 1}}><strong>Space</strong> - Play/Pause
                            audio</Typography>
                        <Typography variant="body2"><strong>V</strong> - Classify as Voice</Typography>
                        <Typography variant="body2"><strong>S</strong> - Classify as Silent</Typography>
                        <Typography variant="body2"><strong>A</strong> - Classify as Answering Machine</Typography>
                        <Typography variant="body2"><strong>U</strong> - Classify as Undefined</Typography>
                    </Box>
                </div>
            )}

            {classifiedFiles.length > 0 && (
                <Box sx={{marginTop: 5}}>
                    <Typography variant="h5" gutterBottom>Classification History</Typography>
                    <List sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, padding: 2 }}>
                        {classifiedFiles.map((file) => (
                            <ListItem
                                key={`${file.id}-${file.classifiedAt}`}
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <Box sx={{ flexGrow: 1 }}>
                                    <ListItemText
                                        primary={file.filename}
                                        secondary={
                                            <>
                                                Classified At: {new Date(file.classifiedAt || '').toLocaleString()}<br />
                                                Current Category: <span style={{ color: categoryColors[file.currentCategory as keyof typeof categoryColors] }}>{file.currentCategory}</span>
                                            </>
                                        }
                                    />
                                    <audio controls src={file.filePath} style={{ width: '100%' }}></audio>
                                </Box>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleReclassify(file)}
                                    sx={{ marginLeft: 2 }}
                                >
                                    Reclassify
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage + 1}
                            onChange={(_, page) => setCurrentPage(page - 1)}
                            color="primary"
                        />
                    </Box>
                </Box>
            )}

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