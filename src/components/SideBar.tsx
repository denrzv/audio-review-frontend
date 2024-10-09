import React from 'react';
import { Link } from 'react-router-dom';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, Typography, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useAuth } from '../context/AuthContext';
import { ImportContacts, ImportContactsTwoTone } from "@mui/icons-material";

const Sidebar: React.FC = () => {
    const { logout, userRole } = useAuth();

    //console.log("Sidebar userRole:", userRole);

    return (
        <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' } }}>
            <Box sx={{ padding: 2, backgroundColor: '#3f51b5', color: 'white' }}>
                <Typography variant="h5">Audio Review</Typography>
            </Box>
            <List>
                {/* Show Dashboard for all users */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/dashboard">
                        <ListItemIcon><DashboardIcon /></ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>

                {/* Show Upload, Files, and Categories only for admin */}
                {userRole === 'ADMIN' && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/admin/upload">
                                <ListItemIcon><UploadFileIcon /></ListItemIcon>
                                <ListItemText primary="Upload File" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/files">
                                <ListItemIcon><ImportContactsTwoTone /></ListItemIcon>
                                <ListItemText primary="Files" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={Link} to="/categories">
                                <ListItemIcon><ImportContacts /></ListItemIcon>
                                <ListItemText primary="Categories" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}

                {/* Show Classify for all users */}
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/classify">
                        <ListItemIcon><AssignmentIcon /></ListItemIcon>
                        <ListItemText primary="Classify" />
                    </ListItemButton>
                </ListItem>
            </List>

            {/* Logout Button */}
            <Box sx={{ padding: 2, textAlign: 'center', marginTop: 'auto' }}>
                <Button variant="contained" color="secondary" startIcon={<ExitToAppIcon />} onClick={logout} fullWidth>
                    Logout
                </Button>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
