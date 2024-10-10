import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TablePagination,
    Button,
    TextField,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Checkbox, Box
} from '@mui/material';
import { fetchFiles, deleteFile, updateFile, deleteAllFiles, deleteMultipleFiles, updateMultipleFiles } from '../services/fileService';
import { fetchCategories } from '../services/categoryService';

interface FileData {
    id: number;
    filename: string;
    initialCategory: string;
    currentCategory: string;
    uploadedBy: string;
    uploadedAt: string;
}

interface Category {
    id: number;
    name: string;
}

const FileListPage: React.FC = () => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalFiles, setTotalFiles] = useState(0);
    const [editingFileId, setEditingFileId] = useState<number | null>(null);
    const [updatedFile, setUpdatedFile] = useState<Partial<FileData>>({});
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [openConfirmDialog, setOpenConfirmDialog] = useState<{ open: boolean, action: 'deleteAll' | 'deleteSelected', fileId?: number }>({ open: false, action: 'deleteAll' });
    const [openBulkEditDialog, setOpenBulkEditDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        loadFiles(page, rowsPerPage, searchTerm);
        loadCategories(); // Call this to fetch categories on component load
    }, [page, rowsPerPage, searchTerm]);

    const loadFiles = async (page: number, pageSize: number, searchTerm: string = '') => {
        try {
            const response = await fetchFiles(page, pageSize, searchTerm);
            setFiles(response.data);
            setTotalFiles(response.total);
        } catch (error) {
            console.error('Failed to fetch files:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const categoryData = await fetchCategories();
            setCategories(categoryData);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteFile(id);
            await loadFiles(page, rowsPerPage);
        } catch (error) {
            console.error('Failed to delete file:', error);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllFiles();
            await loadFiles(page, rowsPerPage);
            setSelectedFiles([]);
        } catch (error) {
            console.error('Failed to delete all files:', error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await deleteMultipleFiles(selectedFiles);
            setSelectedFiles([]);
            await loadFiles(page, rowsPerPage);
        } catch (error) {
            console.error('Failed to delete selected files:', error);
        }
    };

    const handleBulkUpdate = async () => {
        try {
            await updateMultipleFiles(selectedFiles, selectedCategory);
            setSelectedFiles([]);
            await loadFiles(page, rowsPerPage);
            setOpenBulkEditDialog(false);
            setSelectedCategory('');
        } catch (error) {
            console.error('Failed to update selected files:', error);
        }
    };

    const handleEditClick = (file: FileData) => {
        setEditingFileId(file.id);
        setUpdatedFile({ ...file });
    };

    const handleSaveClick = async () => {
        if (editingFileId) {
            try {
                await updateFile(editingFileId, updatedFile);
                setEditingFileId(null);
                await loadFiles(page, rowsPerPage);
            } catch (error) {
                console.error('Failed to update file:', error);
            }
        }
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = files.map((file) => file.id);
            setSelectedFiles(newSelected);
        } else {
            setSelectedFiles([]);
        }
    };

    const handleSelectClick = (id: number) => {
        setSelectedFiles((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        loadFiles(0, rowsPerPage, searchTerm); // Reset to page 0 when searching
    };



    return (
        <TableContainer component={Paper} sx={{ marginTop: 3 }}>
            <Typography variant="h5" align="center" sx={{ padding: 2 }}>Uploaded Files</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 2 }}>
                <TextField
                    variant="outlined"
                    label="Search Filename"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{ marginRight: 2 }}
                />
                <Button variant="contained" onClick={handleSearch}>Search</Button>
            </Box>
            <Button
                variant="contained"
                color="error"
                onClick={() => setOpenConfirmDialog({ open: true, action: 'deleteAll' })}
                disabled={totalFiles === 0}
                sx={{ margin: 2 }}
            >
                Delete All Files
            </Button>
            <Button
                variant="contained"
                color="error"
                onClick={() => setOpenConfirmDialog({ open: true, action: 'deleteSelected' })}
                disabled={selectedFiles.length === 0}
                sx={{ margin: 2 }}
            >
                Delete Selected
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => setOpenBulkEditDialog(true)}
                disabled={selectedFiles.length === 0}
                sx={{ margin: 2 }}
            >
                Update Category for Selected
            </Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
                            <Checkbox
                                indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                                checked={files.length > 0 && selectedFiles.length === files.length}
                                onChange={handleSelectAllClick}
                            />
                        </TableCell>
                        <TableCell>Filename</TableCell>
                        <TableCell>Initial Category</TableCell>
                        <TableCell>Current Category</TableCell>
                        <TableCell>Uploaded By</TableCell>
                        <TableCell>Uploaded At</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {files.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedFiles.includes(file.id)}
                                    onChange={() => handleSelectClick(file.id)}
                                />
                            </TableCell>
                            <TableCell>
                                {editingFileId === file.id ? (
                                    <TextField
                                        value={updatedFile.filename || ''}
                                        onChange={(e) => setUpdatedFile({ ...updatedFile, filename: e.target.value })}
                                    />
                                ) : file.filename}
                            </TableCell>
                            <TableCell>{file.initialCategory}</TableCell>
                            <TableCell>
                                {editingFileId === file.id ? (
                                    <Select
                                        variant="outlined"
                                        value={updatedFile.currentCategory || ''}
                                        onChange={(e) => setUpdatedFile({ ...updatedFile, currentCategory: e.target.value as string })}
                                        displayEmpty
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.id} value={category.name}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                ) : file.currentCategory}
                            </TableCell>
                            <TableCell>{file.uploadedBy}</TableCell>
                            <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                            <TableCell>
                                {editingFileId === file.id ? (
                                    <>
                                        <Button onClick={handleSaveClick}>Save</Button>
                                        <Button onClick={() => setEditingFileId(null)}>Cancel</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={() => handleEditClick(file)}>Edit</Button>
                                        <Button color="error" onClick={() => handleDelete(file.id)}>Delete</Button>
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={totalFiles}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Confirm Action Dialog */}
            <Dialog
                open={openConfirmDialog.open}
                onClose={() => setOpenConfirmDialog({ ...openConfirmDialog, open: false })}
            >
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {openConfirmDialog.action === 'deleteAll'
                            ? 'Are you sure you want to delete all files? This action cannot be undone.'
                            : 'Are you sure you want to delete the selected files? This action cannot be undone.'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirmDialog({ ...openConfirmDialog, open: false })} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (openConfirmDialog.action === 'deleteAll') {
                                handleDeleteAll();
                            } else if (openConfirmDialog.action === 'deleteSelected') {
                                handleBulkDelete();
                            }
                            setOpenConfirmDialog({ ...openConfirmDialog, open: false });
                        }}
                        color="error"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Edit Category Dialog */}
            <Dialog open={openBulkEditDialog} onClose={() => setOpenBulkEditDialog(false)}>
                <DialogTitle>Update Category for Selected Files</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please select a category to apply to all selected files.
                    </DialogContentText>
                    <Select
                        variant="outlined"
                        fullWidth
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>Select Category</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.name}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkEditDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleBulkUpdate} color="secondary" disabled={!selectedCategory}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </TableContainer>
    );
};

export default FileListPage;