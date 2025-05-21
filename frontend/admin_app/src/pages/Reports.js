import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Card, CardContent, Typography, Box } from '@mui/material';

const initialRows = [
  { id: 'BC001', MaGiaiDau: 'GD001', NoiDungBaoCao: 'Báo cáo tổng kết', NgayLap: '2024-06-01', VaiTro: 'ADMIN' },
];

export default function Reports() {
  const [rows, setRows] = useState(initialRows);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ MaBaoCao: '', MaGiaiDau: '', NoiDungBaoCao: '', NgayLap: '', VaiTro: '' });

  const handleOpen = (row) => {
    setEditRow(row);
    setForm(row ? { ...row, MaBaoCao: row.id } : { MaBaoCao: '', MaGiaiDau: '', NoiDungBaoCao: '', NgayLap: '', VaiTro: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (editRow) {
      setRows(rows.map(r => r.id === editRow.id ? { ...form, id: form.MaBaoCao } : r));
    } else {
      setRows([...rows, { ...form, id: form.MaBaoCao }]);
    }
    setOpen(false);
  };
  const handleDelete = (id) => setRows(rows.filter(r => r.id !== id));

  const columns = [
    { field: 'id', headerName: 'Mã Báo cáo', flex: 1, minWidth: 120 },
    { field: 'MaGiaiDau', headerName: 'Mã Giải đấu', flex: 2, minWidth: 140 },
    { field: 'NoiDungBaoCao', headerName: 'Nội dung', flex: 3, minWidth: 200 },
    { field: 'NgayLap', headerName: 'Ngày lập', flex: 1, minWidth: 120 },
    { field: 'VaiTro', headerName: 'Vai trò', flex: 1, minWidth: 120 },
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

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ maxWidth: '100%', p: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
            <Typography variant="h5" fontWeight={700}>Quản lý Báo cáo</Typography>
            <Button variant="contained" onClick={() => handleOpen(null)} sx={{ minWidth: 180 }}>Thêm báo cáo</Button>
          </Stack>
          <Box sx={{ height: { xs: 400, md: 520 }, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={7}
              rowsPerPageOptions={[7, 14, 21]}
              autoHeight={false}
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
        <DialogTitle>{editRow ? 'Sửa báo cáo' : 'Thêm báo cáo'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Báo cáo" name="MaBaoCao" value={form.MaBaoCao} onChange={handleChange} fullWidth required disabled={!!editRow} />
          <TextField margin="dense" label="Mã Giải đấu" name="MaGiaiDau" value={form.MaGiaiDau} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Nội dung báo cáo" name="NoiDungBaoCao" value={form.NoiDungBaoCao} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Ngày lập" name="NgayLap" type="date" value={form.NgayLap} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Vai trò" name="VaiTro" value={form.VaiTro} onChange={handleChange} fullWidth required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 