import React, { useState, useEffect } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { fetchCategories, addCategory, editCategory, deleteCategory } from '../services/categoryService';

interface Category {
    id: number;
    name: string;
    shortcut: string;
}

const CategoryManagementPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState('');
    const [shortcut, setShortcut] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const data = await fetchCategories();
        setCategories(data);
    };

    const handleOpenDialog = (category?: Category) => {
        setEditingCategory(category || null);
        setName(category?.name || '');
        setShortcut(category?.shortcut || '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setName('');
        setShortcut('');
    };

    const handleSaveCategory = async () => {
        if (editingCategory) {
            await editCategory(editingCategory.id, { name, shortcut });
        } else {
            await addCategory({ name, shortcut });
        }
        handleCloseDialog();
        loadCategories();
    };

    const handleDeleteCategory = async (id: number) => {
        await deleteCategory(id);
        loadCategories();
    };

    return (
        <Container sx={{ paddingTop: 4 }}>
            <Typography variant="h4" gutterBottom>Category Management</Typography>

            <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ marginBottom: 2 }}>
                Add Category
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Shortcut</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>{category.shortcut}</TableCell>
                                <TableCell align="right">
                                    <Button onClick={() => handleOpenDialog(category)} color="primary">
                                        Edit
                                    </Button>
                                    <Button onClick={() => handleDeleteCategory(category.id)} color="secondary">
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Category Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Shortcut"
                        fullWidth
                        value={shortcut}
                        onChange={(e) => setShortcut(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveCategory} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CategoryManagementPage;
