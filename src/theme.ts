// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light', // You can change to 'dark' for dark mode
        primary: {
            main: '#3f51b5',
        },
        secondary: {
            main: '#ff4081',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h4: {
            fontWeight: 600,
            fontSize: '1.8rem',
        },
        body1: {
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    padding: '16px',
                    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

export default theme;
