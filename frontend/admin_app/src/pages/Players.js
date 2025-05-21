import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Stack, Card, CardContent, Typography, Box, 
  Alert, Snackbar, MenuItem, Select, FormControl, InputLabel, FormHelperText 
} from '@mui/material';
import { cauThuAPI, doiBongAPI } from '../services/api';

export default function Players() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ MaCauThu: '', HoTen: '', NgaySinh: '', ViTri: '', SoAo: '', MaDoi: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalCount, setTotalCount] = useState(0);
  const [setupMessage, setSetupMessage] = useState('');
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await cauThuAPI.getPaginated(page + 1, pageSize);
      
      // Check if the response is well-formed
      if (!response.data.players) {
        setSetupMessage('Player data not available. Database tables may need to be set up.');
        setRows([]);
        setTotalCount(0);
        return;
      }
      
      // Clear setup message if data is valid
      setSetupMessage('');
      
      setRows(response.data.players.map(player => ({
        ...player,
        id: player.MaCauThu
      })));
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching players:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load players',
        severity: 'error'
      });
      setSetupMessage('Error connecting to the player API. Database tables may need setup.');
      setRows([]);
      setTotalCount(0);
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

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleOpen = (row) => {
    fetchTeams();
    setEditRow(row);
    setForm(row ? { ...row } : { MaCauThu: '', HoTen: '', NgaySinh: '', ViTri: '', SoAo: '', MaDoi: '' });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Convert form data to match API expectations
      const playerData = {
        maCauThu: form.MaCauThu,
        hoTen: form.HoTen,
        ngaySinh: form.NgaySinh,
        viTri: form.ViTri,
        soAo: parseInt(form.SoAo) || 0,
        maDoi: form.MaDoi
      };

      if (editRow) {
        await cauThuAPI.update(form.MaCauThu, playerData);
        setSnackbar({
          open: true,
          message: 'Player updated successfully',
          severity: 'success'
        });
      } else {
        await cauThuAPI.create(playerData);
        setSnackbar({
          open: true,
          message: 'Player created successfully',
          severity: 'success'
        });
      }
      setOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save player',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player?')) {
      return;
    }
    try {
      await cauThuAPI.delete(id);
      setSnackbar({
        open: true,
        message: 'Player deleted successfully',
        severity: 'success'
      });
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete player',
        severity: 'error'
      });
    }
  };

  const columns = [
    { field: 'MaCauThu', headerName: 'Mã Cầu thủ', flex: 1, minWidth: 120 },
    { field: 'HoTen', headerName: 'Họ tên', flex: 2, minWidth: 180 },
    { field: 'NgaySinh', headerName: 'Ngày sinh', flex: 1, minWidth: 120 },
    { field: 'ViTri', headerName: 'Vị trí', flex: 1, minWidth: 120 },
    { field: 'SoAo', headerName: 'Số áo', flex: 1, minWidth: 100 },
    { field: 'MaDoi', headerName: 'Mã Đội', flex: 1, minWidth: 120 },
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

  // Function to find team name by ID for display
  const getTeamName = (teamId) => {
    const team = teams.find(t => t.MaDoi === teamId);
    return team ? team.TenDoi || team.HoTen : teamId;
  };

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ maxWidth: '100%', p: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
            <Typography variant="h5" fontWeight={700}>Quản lý Cầu thủ</Typography>
            <Button variant="contained" onClick={() => handleOpen(null)} sx={{ minWidth: 180 }}>Thêm cầu thủ</Button>
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
        <DialogTitle>{editRow ? 'Sửa cầu thủ' : 'Thêm cầu thủ'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Cầu thủ" name="MaCauThu" value={form.MaCauThu} onChange={handleChange} fullWidth required disabled={!!editRow} />
          <TextField margin="dense" label="Họ tên" name="HoTen" value={form.HoTen} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Ngày sinh" name="NgaySinh" type="date" value={form.NgaySinh} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Vị trí" name="ViTri" value={form.ViTri} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Số áo" name="SoAo" type="number" value={form.SoAo} onChange={handleChange} fullWidth required />
          
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="team-select-label">Đội bóng</InputLabel>
            <Select
              labelId="team-select-label"
              id="team-select"
              name="MaDoi"
              value={form.MaDoi}
              label="Đội bóng"
              onChange={handleChange}
              disabled={loadingTeams}
            >
              {teams.length === 0 ? (
                <MenuItem value="" disabled>
                  {loadingTeams ? "Đang tải..." : "Không có đội bóng nào"}
                </MenuItem>
              ) : (
                teams.map(team => (
                  <MenuItem key={team.MaDoi || team.MaCauThu} value={team.MaDoi || team.MaCauThu}>
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