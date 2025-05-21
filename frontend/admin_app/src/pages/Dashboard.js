import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { giaiDauAPI, doiBongAPI } from '../services/api';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Paper,
  Box,
  Divider,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    tournaments: [],
    teamCount: 0,
    recentTeams: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get active tournaments
        const tournamentsResponse = await giaiDauAPI.getAll();
        
        // Get teams
        const teamsResponse = await doiBongAPI.getAll();
        
        setDashboardData({
          tournaments: tournamentsResponse.data.slice(0, 3),
          teamCount: teamsResponse.data.length,
          recentTeams: teamsResponse.data.slice(0, 5)
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user?.name || 'Admin'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Football Management System Administration
        </Typography>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmojiEventsIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h6">Tournaments</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {loading ? '...' : dashboardData.tournaments.length}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/tournaments')}>
                Manage Tournaments
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupsIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h6">Teams</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {loading ? '...' : dashboardData.teamCount}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/teams')}>
                Manage Teams
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SportsSoccerIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
                <Typography variant="h6">Players</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {loading ? '...' : '-'}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/players')}>
                Manage Players
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Tournaments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <Typography>Loading...</Typography>
              ) : dashboardData.tournaments.length > 0 ? (
                dashboardData.tournaments.map((tournament) => (
                  <Box key={tournament.MaGiaiDau} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {tournament.TenGiai}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(tournament.ThoiGianBatDau).toLocaleDateString()} - 
                      {new Date(tournament.ThoiGianKetThuc).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No tournaments found</Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/tournaments')}>
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Teams
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <Typography>Loading...</Typography>
              ) : dashboardData.recentTeams.length > 0 ? (
                dashboardData.recentTeams.map((team) => (
                  <Box key={team.MaDoi} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {team.HoTen}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Players: {team.SoLuongCauThu || 0}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2">No teams found</Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/teams')}>
                View All
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 