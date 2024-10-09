import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/SideBar';
import { Box, CircularProgress } from '@mui/material';
import Dashboard from './pages/Dashboard';
import AdminUpload from './pages/AdminUpload';
import ClassifyPage from './pages/Classify';
import FileListPage from './pages/FileListPage';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryManagementPage from './pages/CategoryManagementPage';
import AuthPage from './pages/AuthPage'; // Combined login/register page
import { useAuth } from './context/AuthContext';

function App() {
    const { isAuthenticated, loading } = useAuth(); // Use loading state from AuthContext

    if (loading) {
        // Display a loading spinner while authentication is being verified
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            {isAuthenticated && <Sidebar />} {/* Conditionally render Sidebar only if authenticated */}
            <Box component="main" sx={{ flexGrow: 1, padding: 3 }}>
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin/upload" element={<AdminUpload />} />
                        <Route path="/classify" element={<ClassifyPage />} />
                        <Route path="/files" element={<FileListPage />} />
                        <Route path="/categories" element={<CategoryManagementPage />} />
                    </Route>
                    <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
                </Routes>
            </Box>
        </Box>
    );
}

export default App;
