import React, { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../services/fileService';
import { Container, Typography, Card, CardContent, Grid, Box } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    BarElement,
    LinearScale,
    ChartOptions
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, BarElement, LinearScale);

interface DashboardStats {
    totalFiles: number;
    filesByInitialCategory: { [key: string]: number };
    filesByCurrentCategory: { [key: string]: number };
    reclassifiedCount: number;
    filesToClassifyCount: number;
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const loadStats = async () => {
        try {
            const data = await fetchDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch dashboard statistics:', error);
        }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(loadStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const formatPercentages = (count: number) => {
        if (!stats) return 0;
        return ((count / stats.totalFiles) * 100).toFixed(1);
    };


    const initialCategoryData = {
        labels: stats ? Object.keys(stats.filesByInitialCategory) : [],
        datasets: [
            {
                label: 'Files by Initial Category',
                data: stats ? Object.values(stats.filesByInitialCategory) : [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            },
        ],
    };

    const currentCategoryData = {
        labels: stats ? Object.keys(stats.filesByCurrentCategory) : [],
        datasets: [
            {
                label: 'Files by Current Category',
                data: stats ? Object.values(stats.filesByCurrentCategory) : [],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            },
        ],
    };

    const pieOptions: ChartOptions<'doughnut'> = {
        plugins: {
            datalabels: {
                formatter: (value: number) => `${formatPercentages(value)}%`, // Use formatPercentages
                color: '#fff',
                font: {
                    weight: 'bold' as 'bold' | 'normal' | 'bolder' | 'lighter' | number,
                },
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <Container sx={{ paddingTop: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Dashboard
            </Typography>

            {stats && (
                <Grid container spacing={2} alignItems="center" justifyContent="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ textAlign: 'center', padding: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Total Files Uploaded</Typography>
                                <Typography variant="h4">{stats.totalFiles}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ textAlign: 'center', padding: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Files Reclassified</Typography>
                                <Typography variant="h4">{stats.reclassifiedCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ textAlign: 'center', padding: 2 }}>
                            <CardContent>
                                <Typography variant="h6">Files to Classify</Typography>
                                <Typography variant="h4">{stats.filesToClassifyCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ padding: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CardContent>
                                <Typography variant="h6" align="center">Files by Initial Category</Typography>
                                <Box sx={{ maxWidth: 300, maxHeight: 300, margin: '0 auto' }}>
                                    <Doughnut data={initialCategoryData} options={pieOptions} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ padding: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CardContent>
                                <Typography variant="h6" align="center">Files by Current Category</Typography>
                                <Box sx={{ maxWidth: 300, maxHeight: 300, margin: '0 auto' }}>
                                    <Doughnut data={currentCategoryData} options={pieOptions} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>
            )}
        </Container>
    );
};

export default Dashboard;