import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { giaiDauAPI, doiBongAPI } from '../services/api';
import { 
  Box, Card, CardContent, Typography, Grid, Button, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, CircularProgress, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, Snackbar, Select, MenuItem, FormControl,
  InputLabel
} from '@mui/material';
import { format, parseISO } from 'date-fns';

function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournamentData, setTournamentData] = useState(null);
  const [tab, setTab] = useState(0);
  const [addTeamDialog, setAddTeamDialog] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchTournamentDetails = async () => {
    setLoading(true);
    try {
      const response = await giaiDauAPI.getDetailForAdmin(id);
      setTournamentData(response.data);
    } catch (err) {
      console.error('Error fetching tournament details:', err);
      setError('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeams = async () => {
    try {
      const [allTeamsResponse, tournamentResponse] = await Promise.all([
        doiBongAPI.getAll(),
        giaiDauAPI.getDetailForAdmin(id)
      ]);
      
      // Filter out teams that are already in the tournament
      const tournamentTeamIds = tournamentResponse.data.teams.map(team => team.MaDoi);
      const availableTeams = allTeamsResponse.data.filter(team => 
        !tournamentTeamIds.includes(team.MaDoi)
      );
      
      setAvailableTeams(availableTeams);
    } catch (err) {
      console.error('Error fetching available teams:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load available teams',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchTournamentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddTeam = async () => {
    if (!selectedTeam) return;
    
    try {
      await giaiDauAPI.addTeam({
        maGiaiDau: id,
        maDoi: selectedTeam
      });
      
      setSnackbar({
        open: true,
        message: 'Team added to tournament successfully',
        severity: 'success'
      });
      
      setAddTeamDialog(false);
      fetchTournamentDetails();
    } catch (err) {
      console.error('Error adding team:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to add team',
        severity: 'error'
      });
    }
  };

  const handleRemoveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to remove this team from the tournament?')) {
      return;
    }
    
    try {
      await giaiDauAPI.removeTeam(id, teamId);
      setSnackbar({
        open: true,
        message: 'Team removed from tournament successfully',
        severity: 'success'
      });
      fetchTournamentDetails();
    } catch (err) {
      console.error('Error removing team:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to remove team',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/tournaments')} sx={{ mt: 2 }}>
          Return to Tournaments
        </Button>
      </Box>
    );
  }

  if (!tournamentData) return null;

  const { tournamentDetails, teams, matches } = tournamentData;

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h1" fontWeight={700}>
              {tournamentDetails.TenGiai} - Chi tiết
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/tournaments')}>
              Quay lại
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600}>Mã giải đấu:</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{tournamentDetails.MaGiaiDau}</Typography>
              
              <Typography variant="subtitle1" fontWeight={600}>Tên giải:</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{tournamentDetails.TenGiai}</Typography>
              
              <Typography variant="subtitle1" fontWeight={600}>Địa điểm:</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{tournamentDetails.DiaDiem}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight={600}>Thời gian bắt đầu:</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{formatDate(tournamentDetails.ThoiGianBatDau)}</Typography>
              
              <Typography variant="subtitle1" fontWeight={600}>Thời gian kết thúc:</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{formatDate(tournamentDetails.ThoiGianKetThuc)}</Typography>
              
              <Typography variant="subtitle1" fontWeight={600}>Số đội tham gia:</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{teams.length}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Box sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
          <Tab label="Đội bóng" id="teams-tab" />
          <Tab label="Lịch thi đấu" id="matches-tab" />
        </Tabs>
      </Box>
      
      <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained"
            onClick={() => {
              fetchAvailableTeams();
              setAddTeamDialog(true);
            }}
          >
            Thêm đội
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Mã đội</TableCell>
                <TableCell>Tên đội</TableCell>
                <TableCell align="center">Điểm số</TableCell>
                <TableCell align="center">Bàn thắng</TableCell>
                <TableCell align="center">Bàn thua</TableCell>
                <TableCell align="center">Hiệu số</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Chưa có đội bóng nào trong giải đấu</TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.MaDoi} hover>
                    <TableCell>{team.MaDoi}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {team.Logo && (
                          <Box 
                            component="img" 
                            src={team.Logo}
                            alt={team.TenDoi}
                            sx={{ width: 30, height: 30, marginRight: 1 }}
                          />
                        )}
                        {team.TenDoi}
                      </Box>
                    </TableCell>
                    <TableCell align="center">{team.DiemSo}</TableCell>
                    <TableCell align="center">{team.BanThang}</TableCell>
                    <TableCell align="center">{team.BanThua}</TableCell>
                    <TableCell align="center">{team.BanThang - team.BanThua}</TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleRemoveTeam(team.MaDoi)}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Mã trận</TableCell>
                <TableCell>Đội nhà</TableCell>
                <TableCell align="center">Tỉ số</TableCell>
                <TableCell>Đội khách</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Chưa có trận đấu nào trong giải đấu</TableCell>
                </TableRow>
              ) : (
                matches.map((match) => (
                  <TableRow key={match.MaTranDau} hover>
                    <TableCell>{match.MaTranDau}</TableCell>
                    <TableCell>{match.TenDoiNha}</TableCell>
                    <TableCell align="center">
                      {match.TrangThai === 'Completed' 
                        ? `${match.BanThangDoiNha} - ${match.BanThangDoiKhach}` 
                        : 'vs'}
                    </TableCell>
                    <TableCell>{match.TenDoiKhach}</TableCell>
                    <TableCell>{formatDate(match.ThoiGian)}</TableCell>
                    <TableCell>{match.DiaDiem}</TableCell>
                    <TableCell>
                      <Box 
                        sx={{ 
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          fontWeight: 'medium',
                          backgroundColor: 
                            match.TrangThai === 'Scheduled' ? '#e3f2fd' :
                            match.TrangThai === 'In Progress' ? '#fff9c4' :
                            match.TrangThai === 'Completed' ? '#e8f5e9' : '#f5f5f5',
                          color:
                            match.TrangThai === 'Scheduled' ? '#0d47a1' :
                            match.TrangThai === 'In Progress' ? '#f57f17' :
                            match.TrangThai === 'Completed' ? '#2e7d32' : '#616161',
                        }}
                      >
                        {match.TrangThai === 'Scheduled' ? 'Lên lịch' :
                         match.TrangThai === 'In Progress' ? 'Đang diễn ra' :
                         match.TrangThai === 'Completed' ? 'Hoàn thành' : match.TrangThai}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      
      {/* Add Team Dialog */}
      <Dialog open={addTeamDialog} onClose={() => setAddTeamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm đội vào giải đấu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="team-select-label">Chọn đội</InputLabel>
              <Select
                labelId="team-select-label"
                value={selectedTeam}
                label="Chọn đội"
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                {availableTeams.length === 0 ? (
                  <MenuItem disabled>Không có đội bóng khả dụng</MenuItem>
                ) : (
                  availableTeams.map((team) => (
                    <MenuItem key={team.MaDoi} value={team.MaDoi}>
                      {team.TenDoi}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTeamDialog(false)}>Hủy</Button>
          <Button 
            onClick={handleAddTeam} 
            variant="contained" 
            disabled={!selectedTeam || availableTeams.length === 0}
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TournamentDetail; 