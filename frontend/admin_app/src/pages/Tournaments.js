import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Card, CardContent, Typography, Box, 
  CircularProgress, Alert, Snackbar, InputAdornment, IconButton, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { giaiDauAPI } from '../services/api';
import { format, parseISO } from 'date-fns';

export default function Tournaments() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ maGiaiDau: '', tenGiai: '', thoiGianBatDau: '', thoiGianKetThuc: '', diaDiem: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const response = await giaiDauAPI.getPaginated(page + 1, pageSize, search, status);
      setRows(response.data.tournaments.map(tournament => ({
        id: tournament.MaGiaiDau,
        maGiaiDau: tournament.MaGiaiDau,
        tenGiai: tournament.TenGiai,
        thoiGianBatDau: tournament.ThoiGianBatDau.substring(0, 10),
        thoiGianKetThuc: tournament.ThoiGianKetThuc.substring(0, 10),
        diaDiem: tournament.DiaDiem,
        soDoiBong: tournament.SoDoiBong || 0,
        soTranDau: tournament.SoTranDau || 0
      })));
      setTotalRows(response.data.pagination.total);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      
      // Provide more specific error messages
      if (err.response) {
        if (err.response.status === 500) {
          setError('Server error. Please check the database connection or run the initialization script.');
        } else {
          setError(`Failed to load tournaments: ${err.response.data?.message || err.message}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection or the server status.');
      } else {
        setError('Failed to load tournaments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, status]);
  
  const handleOpenDialog = (row) => {
    if (row) {
      setEditRow(row);
      setForm({
        maGiaiDau: row.maGiaiDau,
        tenGiai: row.tenGiai,
        thoiGianBatDau: row.thoiGianBatDau,
        thoiGianKetThuc: row.thoiGianKetThuc,
        diaDiem: row.diaDiem || ''
      });
    } else {
      setEditRow(null);
      setForm({ maGiaiDau: '', tenGiai: '', thoiGianBatDau: '', thoiGianKetThuc: '', diaDiem: '' });
    }
    setOpen(true);
  };
  
  const handleCloseDialog = () => setOpen(false);
  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSave = async () => {
    try {
      if (editRow) {
        await giaiDauAPI.update(form.maGiaiDau, {
          tenGiai: form.tenGiai,
          thoiGianBatDau: form.thoiGianBatDau,
          thoiGianKetThuc: form.thoiGianKetThuc,
          diaDiem: form.diaDiem
        });
        setSnackbar({ open: true, message: 'Giải đấu đã được cập nhật', severity: 'success' });
      } else {
        await giaiDauAPI.create({
          maGiaiDau: form.maGiaiDau,
          tenGiai: form.tenGiai,
          thoiGianBatDau: form.thoiGianBatDau,
          thoiGianKetThuc: form.thoiGianKetThuc,
          diaDiem: form.diaDiem
        });
        setSnackbar({ open: true, message: 'Giải đấu đã được tạo', severity: 'success' });
      }
      setOpen(false);
      fetchTournaments();
    } catch (err) {
      console.error('Error saving tournament:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Đã xảy ra lỗi khi lưu giải đấu', 
        severity: 'error' 
      });
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giải đấu này?')) return;
    
    try {
      await giaiDauAPI.delete(id);
      setSnackbar({ open: true, message: 'Giải đấu đã được xóa', severity: 'success' });
      fetchTournaments();
    } catch (err) {
      console.error('Error deleting tournament:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Không thể xóa giải đấu', 
        severity: 'error' 
      });
    }
  };
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };
  
  const clearSearch = () => {
    setSearch('');
    setPage(0);
  };
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(0);
  };
  
  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  const columns = [
    { field: 'maGiaiDau', headerName: 'Mã Giải', flex: 1, minWidth: 100 },
    { field: 'tenGiai', headerName: 'Tên Giải', flex: 2, minWidth: 180 },
    { 
      field: 'thoiGianBatDau', 
      headerName: 'Bắt đầu', 
      flex: 1, 
      minWidth: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'thoiGianKetThuc', 
      headerName: 'Kết thúc', 
      flex: 1, 
      minWidth: 120,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'diaDiem', headerName: 'Địa điểm', flex: 2, minWidth: 150 },
    { field: 'soDoiBong', headerName: 'Số đội', flex: 0.7, minWidth: 80, type: 'number' },
    { field: 'soTranDau', headerName: 'Số trận', flex: 0.7, minWidth: 80, type: 'number' },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 1.5, minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" color="primary" onClick={() => navigate(`/tournaments/${params.row.id}`)}>
            Chi tiết
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleOpenDialog(params.row)}>Sửa</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(params.row.id)}>Xóa</Button>
        </Stack>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ maxWidth: '100%', p: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
            <Typography variant="h5" fontWeight={700}>Quản lý Giải đấu</Typography>
            <Button variant="contained" onClick={() => handleOpenDialog(null)} sx={{ minWidth: 180 }}>Thêm giải đấu</Button>
          </Stack>
          
          {/* Search and filter section */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                value={search}
                onChange={handleSearchChange}
                placeholder="Tìm kiếm giải đấu..."
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: search && (
                    <InputAdornment position="end">
                      <IconButton onClick={clearSearch} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Trạng thái</InputLabel>
                <Select value={status} onChange={handleStatusChange} label="Trạng thái">
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="active">Đang diễn ra</MenuItem>
                  <MenuItem value="upcoming">Sắp diễn ra</MenuItem>
                  <MenuItem value="completed">Đã kết thúc</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ height: { xs: 400, md: 520 }, width: '100%', position: 'relative' }}>
            {loading && (
              <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 1 }}>
                <CircularProgress />
              </Box>
            )}
            <DataGrid
              rows={rows}
              columns={columns}
              pagination
              paginationMode="server"
              rowCount={totalRows}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[7, 10, 25, 50]}
              disableSelectionOnClick
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
      
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editRow ? 'Sửa giải đấu' : 'Thêm giải đấu'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Giải" name="maGiaiDau" value={form.maGiaiDau} onChange={handleChange} fullWidth required disabled={!!editRow} />
          <TextField margin="dense" label="Tên Giải" name="tenGiai" value={form.tenGiai} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Thời gian bắt đầu" name="thoiGianBatDau" type="date" value={form.thoiGianBatDau} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Thời gian kết thúc" name="thoiGianKetThuc" type="date" value={form.thoiGianKetThuc} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Địa điểm" name="diaDiem" value={form.diaDiem} onChange={handleChange} fullWidth required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 