import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Stack, Card, CardContent, Typography, Box,
  CircularProgress, Alert, Snackbar, InputAdornment, IconButton
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { doiBongAPI } from '../services/api';
import { format, parseISO } from 'date-fns';

export default function Teams() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ 
    maDoi: '', 
    tenDoi: '', 
    ngayThanhLap: '', 
    soLuongCauThu: '', 
    logo: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Pagination and search
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await doiBongAPI.getPaginated(page + 1, pageSize, search);
      setRows(response.data.teams.map(team => ({
        id: team.MaDoi,
        maDoi: team.MaDoi,
        tenDoi: team.TenDoi,
        ngayThanhLap: team.NgayThanhLap,
        soLuongCauThu: team.SoLuongCauThu,
        logo: team.Logo
      })));
      setTotalRows(response.data.pagination.total);
      setError(null); // Clear any previous error
    } catch (err) {
      console.error('Error fetching teams:', err);
      if (err.response) {
        setError(`Failed to load teams: ${err.response.data?.message || err.message}`);
      } else if (err.request) {
        setError('Network error. Please check your connection or the server status.');
      } else {
        setError('Failed to load teams. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search]);

  const handleOpenDialog = (row) => {
    if (row) {
      setEditRow(row);
      setForm({
        maDoi: row.maDoi,
        tenDoi: row.tenDoi,
        ngayThanhLap: row.ngayThanhLap,
        soLuongCauThu: row.soLuongCauThu,
        logo: row.logo || ''
      });
    } else {
      setEditRow(null);
      setForm({ 
        maDoi: '', 
        tenDoi: '', 
        ngayThanhLap: '', 
        soLuongCauThu: '', 
        logo: ''
      });
    }
    setOpen(true);
  };
  
  const handleCloseDialog = () => setOpen(false);
  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSave = async () => {
    try {
      if (editRow) {
        await doiBongAPI.update(form.maDoi, {
          tenDoi: form.tenDoi,
          ngayThanhLap: form.ngayThanhLap,
          soLuongCauThu: form.soLuongCauThu,
          logo: form.logo
        });
        setSnackbar({ open: true, message: 'Đội bóng đã được cập nhật', severity: 'success' });
      } else {
        await doiBongAPI.create({
          maDoi: form.maDoi,
          tenDoi: form.tenDoi,
          ngayThanhLap: form.ngayThanhLap,
          soLuongCauThu: form.soLuongCauThu,
          logo: form.logo
        });
        setSnackbar({ open: true, message: 'Đội bóng đã được tạo', severity: 'success' });
      }
      setOpen(false);
      fetchTeams();
    } catch (err) {
      console.error('Error saving team:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Đã xảy ra lỗi khi lưu đội bóng', 
        severity: 'error' 
      });
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đội bóng này?')) return;
    
    try {
      await doiBongAPI.delete(id);
      setSnackbar({ open: true, message: 'Đội bóng đã được xóa', severity: 'success' });
      fetchTeams();
    } catch (err) {
      console.error('Error deleting team:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Không thể xóa đội bóng', 
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
  
  const formatDate = (dateStr) => {
    try {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const columns = [
    { field: 'maDoi', headerName: 'Mã Đội', flex: 1, minWidth: 120 },
    { field: 'tenDoi', headerName: 'Tên Đội', flex: 2, minWidth: 180 },
    { 
      field: 'ngayThanhLap', 
      headerName: 'Ngày thành lập', 
      flex: 1, 
      minWidth: 140,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'soLuongCauThu', headerName: 'Số lượng cầu thủ', flex: 1, minWidth: 150, type: 'number' },
    {
      field: 'actions',
      headerName: 'Thao tác',
      flex: 1, minWidth: 150,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
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
            <Typography variant="h5" fontWeight={700}>Quản lý Đội bóng</Typography>
            <Button variant="contained" onClick={() => handleOpenDialog(null)} sx={{ minWidth: 180 }}>Thêm đội bóng</Button>
          </Stack>
          
          {/* Search bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm đội bóng..."
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
          </Box>
          
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
        <DialogTitle>{editRow ? 'Sửa đội bóng' : 'Thêm đội bóng'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Đội" name="maDoi" value={form.maDoi} onChange={handleChange} fullWidth required disabled={!!editRow} />
          <TextField margin="dense" label="Tên Đội" name="tenDoi" value={form.tenDoi} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Ngày thành lập" name="ngayThanhLap" type="date" value={form.ngayThanhLap} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Số lượng cầu thủ" name="soLuongCauThu" type="number" value={form.soLuongCauThu} onChange={handleChange} fullWidth />
          <TextField margin="dense" label="Logo URL" name="logo" value={form.logo} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.maDoi || !form.tenDoi}>Lưu</Button>
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