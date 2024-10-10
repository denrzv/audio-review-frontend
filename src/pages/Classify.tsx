import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchRandomFile, classifyFile, fetchClassificationHistory } from '../services/fileService';
import { Button, Container, Typography, Box, Divider, Snackbar, Alert, List, ListItem, ListItemText, Select, MenuItem, Pagination, CircularProgress } from '@mui/material';
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

const categoryColors: Record<'Voice' | 'Silent' | 'Answering Machine' | 'Undefined', string> = {
    Voice: '#4CAF50',
    Silent: '#FFEB3B',
    "Answering Machine": '#F44336',
    Undefined: '#BDBDBD'
};

const ClassifyPage: React.FC = () => {
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<string | null>(null);
    const [classifiedFiles, setClassifiedFiles] = useState<AudioFile[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const pageSize = 10; // Number of items per page

    const loadRandomFile = async () => {
        try {
            const file = await fetchRandomFile();
            setAudioFile(file);
            setError(null);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Failed to load file:', axiosError.message);
            setError(axiosError.response?.status === 400 ? 'No unclassified files are left to listen to.' : 'An error occurred while loading the file. Please try again later.');
        }
    };

    const loadClassificationHistory = async (pageNumber: number) => {
        setLoading(true);
        try {
            const { content, totalPages } = await fetchClassificationHistory(pageNumber - 1, pageSize);
            setClassifiedFiles(content);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Failed to load classification history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassification = useCallback(async (category: string) => {
        if (audioFile) {
            try {
                await classifyFile(audioFile.id, category);
                setNotification("Successfully classified!");

                const updatedFile = { ...audioFile, currentCategory: category };
                setClassifiedFiles(prev => [updatedFile, ...prev.slice(0, pageSize - 1)]);
                setAudioFile(null);
                await loadRandomFile();
            } catch (error) {
                console.error('Classification failed:', error);
                setError('An error occurred while classifying the file. Please try again.');
            }
        }
    }, [audioFile]);

    const reclassifyFile = async (file: AudioFile, category: string) => {
        try {
            await classifyFile(file.id, category);
            setNotification("File reclassified successfully!");
            setClassifiedFiles(prev =>
                prev.map(f => (f.id === file.id ? { ...f, currentCategory: category } : f))
            );
        } catch (error) {
            console.error('Failed to reclassify file:', error);
            setError('An error occurred while reclassifying the file.');
        }
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        loadClassificationHistory(value);
    };

    useEffect(() => {
        loadRandomFile();
        loadClassificationHistory(page);
    }, []);

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Classify Audio File</Typography>
            {error ? (
                <Typography variant="h6" color="error" align="center" sx={{ marginTop: 4 }}>{error}</Typography>
            ) : (
                audioFile && (
                    <div>
                        <Typography variant="h6">File Name: {audioFile.filename}</Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            Initial Category: <span style={{ color: categoryColors[audioFile.initialCategory as keyof typeof categoryColors] }}>{audioFile.initialCategory}</span>
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary">
                            Current Category: <span style={{ color: categoryColors[audioFile.currentCategory as keyof typeof categoryColors] }}>{audioFile.currentCategory}</span>
                        </Typography>
                        <audio ref={audioRef} controls src={audioFile?.filePath || ''} style={{ marginTop: 10, marginBottom: 10 }}></audio>
                        <div>
                            <Button variant="contained" onClick={() => handleClassification('Voice')} style={{ backgroundColor: categoryColors.Voice, color: '#fff', marginRight: 10 }}>Voice (V)</Button>
                            <Button variant="contained" onClick={() => handleClassification('Silent')} style={{ backgroundColor: categoryColors.Silent, color: '#fff', marginRight: 10 }}>Silent (S)</Button>
                            <Button variant="contained" onClick={() => handleClassification('Answering Machine')} style={{ backgroundColor: categoryColors["Answering Machine"], color: '#fff', marginRight: 10 }}>Answering Machine (A)</Button>
                            <Button variant="contained" onClick={() => handleClassification('Undefined')} style={{ backgroundColor: categoryColors.Undefined, color: '#fff', marginRight: 10 }}>Undefined (U)</Button>
                        </div>
                        <Box sx={{ marginTop: 4, padding: 2, border: '1px solid #ddd', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                            <Typography variant="h6" gutterBottom>Shortcut Keys</Typography>
                            <Divider />
                            <Typography variant="body2" sx={{ marginTop: 1 }}><strong>Space</strong> - Play/Pause audio</Typography>
                            <Typography variant="body2"><strong>V</strong> - Classify as Voice</Typography>
                            <Typography variant="body2"><strong>S</strong> - Classify as Silent</Typography>
                            <Typography variant="body2"><strong>A</strong> - Classify as Answering Machine</Typography>
                            <Typography variant="body2"><strong>U</strong> - Classify as Undefined</Typography>
                        </Box>
                    </div>
                )
            )}

            {classifiedFiles.length > 0 && (
                <Box sx={{ marginTop: 5 }}>
                    <Typography variant="h5" gutterBottom>Classification History</Typography>
                    <List sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #ddd', borderRadius: 1, padding: 2 }}>
                        {loading ? (
                            <CircularProgress />
                        ) : (
                            classifiedFiles.map((file) => (
                                <ListItem key={file.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <ListItemText primary={file.filename} secondary={
                                            <>
                                                Current Category: <span style={{ color: categoryColors[file.currentCategory as keyof typeof categoryColors] }}>{file.currentCategory}</span>
                                            </>
                                        } />
                                        <audio controls src={file.filePath} style={{ width: '100%' }}></audio>
                                    </Box>
                                    <Select
                                        value={file.currentCategory}
                                        onChange={(e) => reclassifyFile(file, e.target.value)}
                                        variant="outlined"
                                        sx={{ minWidth: 120, marginLeft: 2 }}
                                    >
                                        <MenuItem value="Voice">Voice</MenuItem>
                                        <MenuItem value="Silent">Silent</MenuItem>
                                        <MenuItem value="Answering Machine">Answering Machine</MenuItem>
                                        <MenuItem value="Undefined">Undefined</MenuItem>
                                    </Select>
                                </ListItem>
                            ))
                        )}
                    </List>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}
                    />
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