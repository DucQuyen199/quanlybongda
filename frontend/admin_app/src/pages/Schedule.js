import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Stack, Card, CardContent, Typography, Box, 
  Alert, Snackbar, MenuItem, Select, FormControl, InputLabel, FormHelperText 
} from '@mui/material';
import { lichThiDauAPI, giaiDauAPI, doiBongAPI } from '../services/api';

export default function Schedule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({
    MaLich: '',
    MaGiaiDau: '',
    MaTran: '',
    NgayThiDau: new Date().toISOString().split('T')[0],
    MaDoiNha: '',
    MaDoiKhach: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalCount, setTotalCount] = useState(0);
  const [setupMessage, setSetupMessage] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await lichThiDauAPI.getPaginated(page + 1, pageSize);
      
      // Check if we got a setup message from the server
      if (response.data.message) {
        setSetupMessage(response.data.message);
      } else {
        setSetupMessage('');
      }
      
      // Set rows if data exists, otherwise empty array
      const schedules = response.data.schedules || [];
      setRows(schedules.map(schedule => ({
        ...schedule,
        id: schedule.MaLich
      })));
      
      // Set pagination data
      setTotalCount(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load schedules',
        severity: 'error'
      });
      setSetupMessage('Error connecting to the schedules API. Database tables may need setup.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await doiBongAPI.getAll();
      // Extract teams from the response structure
      const teamsData = response.data.teams || response.data;
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load teams for dropdown selection',
        severity: 'error'
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoadingTournaments(true);
      const response = await giaiDauAPI.getAll();
      // Extract tournaments from the response
      const tournamentsData = response.data || [];
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load tournaments',
        severity: 'error'
      });
    } finally {
      setLoadingTournaments(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleOpen = (row) => {
    fetchTeams();
    fetchTournaments();
    setEditRow(row);
    
    if (row) {
      // For edit, set all fields including home and away teams
      setForm({ 
        MaLich: row.MaLich || '', 
        MaGiaiDau: row.MaGiaiDau || '', 
        MaTran: row.MaTran || '', 
        NgayThiDau: row.NgayThiDau || '',
        MaDoiNha: row.MaDoiNha || '',
        MaDoiKhach: row.MaDoiKhach || ''
      });
    } else {
      // For new entry, reset the form
      setForm({ 
        MaLich: '', 
        MaGiaiDau: '', 
        MaTran: '', 
        NgayThiDau: new Date().toISOString().split('T')[0],
        MaDoiNha: '',
        MaDoiKhach: ''
      });
    }
    
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Validate that home and away teams are different
      if (form.MaDoiNha && form.MaDoiKhach && form.MaDoiNha === form.MaDoiKhach) {
        setSnackbar({
          open: true,
          message: 'Home team and away team cannot be the same',
          severity: 'error'
        });
        return;
      }
      
      // Make sure we have valid date formatted as YYYY-MM-DD
      const formattedDate = form.NgayThiDau ? new Date(form.NgayThiDau).toISOString().split('T')[0] : null;
      
      // Convert form data to match API expectations
      const scheduleData = {
        maLich: form.MaLich,
        maGiaiDau: form.MaGiaiDau,
        maTran: form.MaTran || null,
        ngayThiDau: formattedDate,
        maDoiNha: form.MaDoiNha || null,
        maDoiKhach: form.MaDoiKhach || null
      };
      
      console.log('Sending schedule data:', scheduleData);

      try {
        if (editRow) {
          await lichThiDauAPI.update(form.MaLich, scheduleData);
          setSnackbar({
            open: true,
            message: 'Schedule updated successfully',
            severity: 'success'
          });
        } else {
          const response = await lichThiDauAPI.create(scheduleData);
          console.log('Schedule creation response:', response);
          setSnackbar({
            open: true,
            message: 'Schedule created successfully',
            severity: 'success'
          });
        }
        setOpen(false);
        fetchSchedules();
      } catch (apiError) {
        console.error('Schedule creation API error:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        setSnackbar({
          open: true,
          message: apiError.response?.data?.message || 'Failed to save schedule',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save schedule',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }
    try {
      await lichThiDauAPI.delete(id);
      setSnackbar({
        open: true,
        message: 'Schedule deleted successfully',
        severity: 'success'
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete schedule',
        severity: 'error'
      });
    }
  };

  const columns = [
    { field: 'MaLich', headerName: 'Mã Lịch', flex: 1, minWidth: 120 },
    { field: 'MaGiaiDau', headerName: 'Mã Giải đấu', flex: 1, minWidth: 120 },
    { field: 'TenGiai', headerName: 'Tên Giải', flex: 2, minWidth: 180 },
    { field: 'MaTran', headerName: 'Mã Trận', flex: 1, minWidth: 120 },
    { field: 'TenDoiNha', headerName: 'Đội nhà', flex: 1.5, minWidth: 150 },
    { field: 'TenDoiKhach', headerName: 'Đội khách', flex: 1.5, minWidth: 150 },
    { field: 'NgayThiDau', headerName: 'Ngày thi đấu', flex: 1.5, minWidth: 140 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 1, minWidth: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => handleOpen(params.row)}>Sửa</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(params.row.id)}>Xóa</Button>
        </Stack>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  // Function to find tournament name by ID
  const getTournamentName = (tournamentId) => {
    const tournament = tournaments.find(t => t.MaGiaiDau === tournamentId);
    return tournament ? tournament.TenGiai : tournamentId;
  };

  // Function to find team name by ID
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.MaDoi === teamId || t.MaCauThu === teamId);
    return team ? team.TenDoi || team.HoTen : teamId;
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ maxWidth: '100%', p: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
            <Typography variant="h5" fontWeight={700}>Quản lý Lịch thi đấu</Typography>
            <Button variant="contained" onClick={() => handleOpen(null)} sx={{ minWidth: 180 }}>Thêm lịch thi đấu</Button>
          </Stack>
          
          {setupMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {setupMessage}
            </Alert>
          )}
          
          <Box sx={{ height: { xs: 400, md: 520 }, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={pageSize}
              rowsPerPageOptions={[7, 14, 21]}
              autoHeight={false}
              paginationMode="server"
              page={page}
              rowCount={totalCount}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              loading={loading}
              sx={{
                borderRadius: 2,
                background: '#fff',
                '& .MuiDataGrid-columnHeaders': { background: '#f5f5f5', fontWeight: 600 },
                '& .MuiDataGrid-row:hover': { background: '#f0f7ff' },
              }}
            />
          </Box>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Sửa lịch thi đấu' : 'Thêm lịch thi đấu'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Lịch" name="MaLich" value={form.MaLich} onChange={handleChange} fullWidth required disabled={!!editRow} />
          
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="tournament-select-label">Giải đấu</InputLabel>
            <Select
              labelId="tournament-select-label"
              id="tournament-select"
              name="MaGiaiDau"
              value={form.MaGiaiDau}
              label="Giải đấu"
              onChange={handleChange}
              disabled={loadingTournaments}
            >
              {tournaments.length === 0 ? (
                <MenuItem value="" disabled>
                  {loadingTournaments ? "Đang tải..." : "Không có giải đấu nào"}
                </MenuItem>
              ) : (
                tournaments.map(tournament => (
                  <MenuItem key={tournament.MaGiaiDau} value={tournament.MaGiaiDau}>
                    {tournament.TenGiai}
                  </MenuItem>
                ))
              )}
            </Select>
            {tournaments.length === 0 && (
              <FormHelperText>
                {loadingTournaments ? "Đang tải danh sách giải đấu..." : "Vui lòng thêm giải đấu trước"}
              </FormHelperText>
            )}
          </FormControl>
          
          <TextField margin="dense" label="Mã Trận" name="MaTran" value={form.MaTran} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Ngày thi đấu" name="NgayThiDau" type="date" value={form.NgayThiDau} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="home-team-select-label">Đội nhà</InputLabel>
            <Select
              labelId="home-team-select-label"
              id="home-team-select"
              name="MaDoiNha"
              value={form.MaDoiNha}
              label="Đội nhà"
              onChange={handleChange}
              disabled={loadingTeams}
            >
              {teams.length === 0 ? (
                <MenuItem value="" disabled>
                  {loadingTeams ? "Đang tải..." : "Không có đội bóng nào"}
                </MenuItem>
              ) : (
                teams.map(team => (
                  <MenuItem 
                    key={team.MaDoi || team.MaCauThu} 
                    value={team.MaDoi || team.MaCauThu}
                    disabled={team.MaDoi === form.MaDoiKhach || team.MaCauThu === form.MaDoiKhach}
                  >
                    {team.TenDoi || team.HoTen}
                  </MenuItem>
                ))
              )}
            </Select>
            {teams.length === 0 && (
              <FormHelperText>
                {loadingTeams ? "Đang tải danh sách đội bóng..." : "Vui lòng thêm đội bóng trước"}
              </FormHelperText>
            )}
          </FormControl>
          
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="away-team-select-label">Đội khách</InputLabel>
            <Select
              labelId="away-team-select-label"
              id="away-team-select"
              name="MaDoiKhach"
              value={form.MaDoiKhach}
              label="Đội khách"
              onChange={handleChange}
              disabled={loadingTeams}
            >
              {teams.length === 0 ? (
                <MenuItem value="" disabled>
                  {loadingTeams ? "Đang tải..." : "Không có đội bóng nào"}
                </MenuItem>
              ) : (
                teams.map(team => (
                  <MenuItem 
                    key={team.MaDoi || team.MaCauThu} 
                    value={team.MaDoi || team.MaCauThu}
                    disabled={team.MaDoi === form.MaDoiNha || team.MaCauThu === form.MaDoiNha}
                  >
                    {team.TenDoi || team.HoTen}
                  </MenuItem>
                ))
              )}
            </Select>
            {teams.length === 0 && (
              <FormHelperText>
                {loadingTeams ? "Đang tải danh sách đội bóng..." : "Vui lòng thêm đội bóng trước"}
              </FormHelperText>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">Lưu</Button>
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