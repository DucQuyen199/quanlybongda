import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Stack, Card, CardContent, Typography, Box, 
  Alert, Snackbar, MenuItem, Select, FormControl, InputLabel, FormHelperText, 
  CircularProgress, Grid 
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
    MaDoiKhach: '',
    BanThangDoiNha: '',
    BanThangDoiKhach: '',
    TrangThai: 'Chưa diễn ra'
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalCount, setTotalCount] = useState(0);
  const [setupMessage, setSetupMessage] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingTournaments, setLoadingTournaments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await lichThiDauAPI.getPaginated(page + 1, pageSize);
      
      console.log('Schedule API response:', response.data);
      
      // Check if we got a setup message from the server
      if (response.data.message) {
        setSetupMessage(response.data.message);
      } else {
        setSetupMessage('');
      }
      
      // Get schedules from the response based on the structure
      // The backend returns either response.data.data or response.data.schedules
      const schedules = response.data.data || response.data.schedules || [];
      
      // Debug the first schedule to check if it has BanThangDoiNha, BanThangDoiKhach, and TrangThai
      if (schedules.length > 0) {
        console.log('First schedule details:', {
          id: schedules[0].MaLich || schedules[0].id,
          teams: `${schedules[0].TenDoiNha || 'Unknown'} vs ${schedules[0].TenDoiKhach || 'Unknown'}`,
          scores: `${schedules[0].BanThangDoiNha || 'N/A'} - ${schedules[0].BanThangDoiKhach || 'N/A'}`,
          status: schedules[0].TrangThai || 'Status not available'
        });
      }
      
      setRows(schedules.map(schedule => ({
        ...schedule,
        id: schedule.MaLich || schedule.id
      })));
      
      // Set pagination data from meta or pagination object
      const paginationData = response.data.meta || response.data.pagination || {};
      setTotalCount(paginationData.total || schedules.length);
      
      console.log(`Displaying ${schedules.length} schedules out of ${paginationData.total || schedules.length} total`);
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
  }, [forceRefresh]);

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleOpen = (row) => {
    // Reset form errors
    setFormErrors({});
    
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
        MaDoiKhach: row.MaDoiKhach || '',
        BanThangDoiNha: row.BanThangDoiNha !== undefined ? row.BanThangDoiNha : '',
        BanThangDoiKhach: row.BanThangDoiKhach !== undefined ? row.BanThangDoiKhach : '',
        TrangThai: row.TrangThai || 'Chưa diễn ra'
      });
    } else {
      // For new entry, reset the form
      setForm({ 
        MaLich: '', 
        MaGiaiDau: '', 
        MaTran: '', 
        NgayThiDau: new Date().toISOString().split('T')[0],
        MaDoiNha: '',
        MaDoiKhach: '',
        BanThangDoiNha: '',
        BanThangDoiKhach: '',
        TrangThai: 'Chưa diễn ra'
      });
    }
    
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.MaLich) errors.MaLich = 'Mã lịch is required';
    if (!form.MaGiaiDau) errors.MaGiaiDau = 'Giải đấu is required';
    if (!form.NgayThiDau) errors.NgayThiDau = 'Ngày thi đấu is required';
    
    // Validate that home and away teams are different if both are selected
    if (form.MaDoiNha && form.MaDoiKhach && form.MaDoiNha === form.MaDoiKhach) {
      errors.MaDoiNha = 'Home and away teams must be different';
      errors.MaDoiKhach = 'Home and away teams must be different';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        setSnackbar({
          open: true,
          message: 'Please fix the form errors before submitting',
          severity: 'error'
        });
        return;
      }
      
      setSubmitting(true);
      
      // Make sure we have valid date formatted as YYYY-MM-DD
      const formattedDate = form.NgayThiDau ? new Date(form.NgayThiDau).toISOString().split('T')[0] : null;
      
      // Convert form data to match API expectations
      const scheduleData = {
        maLich: form.MaLich.trim(),
        maGiaiDau: form.MaGiaiDau.trim(),
        maTran: form.MaTran ? form.MaTran.trim() : null,
        ngayThiDau: formattedDate,
        maDoiNha: form.MaDoiNha ? form.MaDoiNha.trim() : null,
        maDoiKhach: form.MaDoiKhach ? form.MaDoiKhach.trim() : null,
        banThangDoiNha: form.BanThangDoiNha !== '' ? parseInt(form.BanThangDoiNha, 10) : null,
        banThangDoiKhach: form.BanThangDoiKhach !== '' ? parseInt(form.BanThangDoiKhach, 10) : null,
        trangThai: form.TrangThai
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
        
        // Close the dialog
        setOpen(false);
        
        // Force immediate refresh, no delay
        setForceRefresh(prev => prev + 1);
      } catch (apiError) {
        console.error('Schedule creation API error:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        
        const errorMessage = apiError.response?.data?.message || 'Failed to save schedule';
        
        // Check for specific validation errors
        if (apiError.response?.data?.errors) {
          const backendErrors = apiError.response.data.errors;
          const formattedErrors = {};
          
          // Map backend errors to form fields
          Object.keys(backendErrors).forEach(key => {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1); // Convert maLich to MaLich
            formattedErrors[fieldName] = backendErrors[key];
          });
          
          setFormErrors(formattedErrors);
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
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
    } finally {
      setSubmitting(false);
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
    { field: 'MaLich', headerName: 'Mã Lịch', flex: 1, minWidth: 100 },
    { field: 'MaGiaiDau', headerName: 'Mã Giải đấu', flex: 1, minWidth: 100 },
    { 
      field: 'TenGiai', 
      headerName: 'Tên Giải', 
      flex: 1.5, 
      minWidth: 150,
      renderCell: (params) => (
        params.value || getTournamentName(params.row.MaGiaiDau) || '-'
      )
    },
    { 
      field: 'TenDoiNha', 
      headerName: 'Đội nhà', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: (params) => (
        params.value || (params.row.MaDoiNha ? getTeamName(params.row.MaDoiNha) : '-')
      )
    },
    { 
      field: 'Score', 
      headerName: 'Tỉ số', 
      flex: 1, 
      minWidth: 100,
      renderCell: (params) => {
        // Debug what we're receiving
        console.log(`Rendering score for match: ${params.row.MaLich}`, {
          status: params.row.TrangThai,
          homeScore: params.row.BanThangDoiNha,
          awayScore: params.row.BanThangDoiKhach
        });
        
        if (params.row.TrangThai === 'Đã kết thúc' || params.row.TrangThai === 'Kết thúc') {
          return `${params.row.BanThangDoiNha || 0} - ${params.row.BanThangDoiKhach || 0}`;
        } else if (params.row.TrangThai === 'Đang diễn ra') {
          return (
            <Box sx={{ color: 'green', fontWeight: 'bold' }}>
              {params.row.BanThangDoiNha || 0} - {params.row.BanThangDoiKhach || 0}
            </Box>
          );
        } else {
          return 'VS';
        }
      }
    },
    { 
      field: 'TenDoiKhach', 
      headerName: 'Đội khách', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: (params) => (
        params.value || (params.row.MaDoiKhach ? getTeamName(params.row.MaDoiKhach) : '-')
      )
    },
    { 
      field: 'NgayThiDau', 
      headerName: 'Ngày thi đấu', 
      flex: 1.5, 
      minWidth: 120,
      renderCell: (params) => {
        if (!params.value) return '-';
        return params.value;
      }
    },
    {
      field: 'TrangThai',
      headerName: 'Trạng thái',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 1, minWidth: 130,
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
    const team = teams.find(t => t.MaDoi === teamId);
    return team ? team.TenDoi : teamId;
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ maxWidth: '100%', p: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
            <Typography variant="h5" fontWeight={700}>Quản lý Lịch thi đấu</Typography>
            <Stack direction="row" spacing={1}>
              <Button 
                variant="outlined" 
                onClick={() => setForceRefresh(prev => prev + 1)} 
                startIcon={loading ? <CircularProgress size={20} /> : null}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button variant="contained" onClick={() => handleOpen(null)} sx={{ minWidth: 180 }}>Thêm lịch thi đấu</Button>
            </Stack>
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
          <TextField 
            margin="dense" 
            label="Mã Lịch" 
            name="MaLich" 
            value={form.MaLich} 
            onChange={handleChange} 
            fullWidth 
            required 
            disabled={!!editRow}
            error={!!formErrors.MaLich}
            helperText={formErrors.MaLich}
          />
          
          <FormControl fullWidth margin="dense" required error={!!formErrors.MaGiaiDau}>
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
            {formErrors.MaGiaiDau && (
              <FormHelperText error>{formErrors.MaGiaiDau}</FormHelperText>
            )}
            {tournaments.length === 0 && (
              <FormHelperText>
                {loadingTournaments ? "Đang tải danh sách giải đấu..." : "Vui lòng thêm giải đấu trước"}
              </FormHelperText>
            )}
          </FormControl>
          
          <TextField 
            margin="dense" 
            label="Mã Trận" 
            name="MaTran" 
            value={form.MaTran} 
            onChange={handleChange} 
            fullWidth
            error={!!formErrors.MaTran}
            helperText={formErrors.MaTran}
          />
          
          <TextField 
            margin="dense" 
            label="Ngày thi đấu" 
            name="NgayThiDau" 
            type="date" 
            value={form.NgayThiDau} 
            onChange={handleChange} 
            fullWidth 
            required 
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.NgayThiDau}
            helperText={formErrors.NgayThiDau} 
          />
          
          <FormControl fullWidth margin="dense" error={!!formErrors.MaDoiNha}>
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
              <MenuItem value="">-- Chọn đội nhà --</MenuItem>
              {teams.length === 0 ? (
                <MenuItem value="" disabled>
                  {loadingTeams ? "Đang tải..." : "Không có đội bóng nào"}
                </MenuItem>
              ) : (
                teams.map(team => (
                  <MenuItem 
                    key={team.MaDoi} 
                    value={team.MaDoi}
                    disabled={team.MaDoi === form.MaDoiKhach}
                  >
                    {team.TenDoi}
                  </MenuItem>
                ))
              )}
            </Select>
            {formErrors.MaDoiNha && (
              <FormHelperText error>{formErrors.MaDoiNha}</FormHelperText>
            )}
            {teams.length === 0 && (
              <FormHelperText>
                {loadingTeams ? "Đang tải danh sách đội bóng..." : "Vui lòng thêm đội bóng trước"}
              </FormHelperText>
            )}
          </FormControl>
          
          <FormControl fullWidth margin="dense" error={!!formErrors.MaDoiKhach}>
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
              <MenuItem value="">-- Chọn đội khách --</MenuItem>
              {teams.length === 0 ? (
                <MenuItem value="" disabled>
                  {loadingTeams ? "Đang tải..." : "Không có đội bóng nào"}
                </MenuItem>
              ) : (
                teams.map(team => (
                  <MenuItem 
                    key={team.MaDoi} 
                    value={team.MaDoi}
                    disabled={team.MaDoi === form.MaDoiNha}
                  >
                    {team.TenDoi}
                  </MenuItem>
                ))
              )}
            </Select>
            {formErrors.MaDoiKhach && (
              <FormHelperText error>{formErrors.MaDoiKhach}</FormHelperText>
            )}
            {teams.length === 0 && (
              <FormHelperText>
                {loadingTeams ? "Đang tải danh sách đội bóng..." : "Vui lòng thêm đội bóng trước"}
              </FormHelperText>
            )}
          </FormControl>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bàn thắng đội nhà"
                name="BanThangDoiNha"
                type="number"
                value={form.BanThangDoiNha}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Bàn thắng đội khách"
                name="BanThangDoiKhach"
                type="number"
                value={form.BanThangDoiKhach}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Trạng thái trận đấu</InputLabel>
            <Select
              name="TrangThai"
              value={form.TrangThai}
              label="Trạng thái trận đấu"
              onChange={handleChange}
            >
              <MenuItem value="Chưa diễn ra">Chưa diễn ra</MenuItem>
              <MenuItem value="Đang diễn ra">Đang diễn ra</MenuItem>
              <MenuItem value="Đã kết thúc">Đã kết thúc</MenuItem>
              <MenuItem value="Hoãn">Hoãn</MenuItem>
              <MenuItem value="Hủy">Hủy</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting}>Hủy</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
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