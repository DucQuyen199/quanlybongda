import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  CircularProgress,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import SportsIcon from '@mui/icons-material/Sports';
import giaiDauService from '../services/giaiDauService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [giaiDauCount, setGiaiDauCount] = useState(0);
  const [recentGiaiDau, setRecentGiaiDau] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await giaiDauService.getAllGiaiDau();
        if (response.data.success) {
          setGiaiDauCount(response.data.data.length);
          
          // Get 3 most recent tournaments
          const sortedGiaiDau = [...response.data.data].sort((a, b) => {
            return new Date(b.THOIGIANBATDAU) - new Date(a.THOIGIANBATDAU);
          });
          
          setRecentGiaiDau(sortedGiaiDau.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const dashboardItems = [
    {
      title: 'Giải đấu',
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      count: giaiDauCount,
      path: '/giaidau',
      color: '#1976d2'
    },
    {
      title: 'Đội bóng',
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      count: '...',
      path: '/doibong',
      color: '#2e7d32'
    },
    {
      title: 'Cầu thủ',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      count: '...',
      path: '/cauthu',
      color: '#ed6c02'
    },
    {
      title: 'Trận đấu',
      icon: <SportsIcon sx={{ fontSize: 40 }} />,
      count: '...',
      path: '/trandau',
      color: '#9c27b0'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tổng quan
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {dashboardItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Card 
              sx={{ 
                height: '100%',
                borderTop: `4px solid ${item.color}`
              }}
            >
              <CardActionArea 
                sx={{ height: '100%' }}
                onClick={() => navigate(item.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" component="div">
                        {item.count}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {item.title}
                      </Typography>
                    </Box>
                    <Box sx={{ color: item.color }}>
                      {item.icon}
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Giải đấu gần đây
      </Typography>
      
      {recentGiaiDau.length > 0 ? (
        <Grid container spacing={3}>
          {recentGiaiDau.map((giaiDau) => (
            <Grid item xs={12} sm={6} md={4} key={giaiDau.MAGIAIDAU}>
              <Paper 
                elevation={2} 
                sx={{ p: 2, cursor: 'pointer' }}
                onClick={() => navigate(`/giaidau/sua/${giaiDau.MAGIAIDAU}`)}
              >
                <Typography variant="h6">{giaiDau.TENGIAI}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian: {new Date(giaiDau.THOIGIANBATDAU).toLocaleDateString('vi-VN')} - {new Date(giaiDau.THOIGIANKETTHUC).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2">
                  Địa điểm: {giaiDau.DIADIEM}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">Chưa có giải đấu nào.</Typography>
      )}
    </Box>
  );
};

export default Dashboard; 