import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Card, CardContent, Typography, Box } from '@mui/material';

const initialRows = [
  { id: 'DB001', HoTen: 'Hà Nội FC', NgaySinh: '2010-01-01', SoLuongCauThu: 25, Logo: 'logo.png' },
];

export default function Teams() {
  const [rows, setRows] = useState(initialRows);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ MaDoiBong: '', HoTen: '', NgaySinh: '', SoLuongCauThu: '', Logo: '' });

  const handleOpen = (row) => {
    setEditRow(row);
    setForm(row ? { ...row, MaDoiBong: row.id } : { MaDoiBong: '', HoTen: '', NgaySinh: '', SoLuongCauThu: '', Logo: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (editRow) {
      setRows(rows.map(r => r.id === editRow.id ? { ...form, id: form.MaDoiBong } : r));
    } else {
      setRows([...rows, { ...form, id: form.MaDoiBong }]);
    }
    setOpen(false);
  };
  const handleDelete = (id) => setRows(rows.filter(r => r.id !== id));

  const columns = [
    { field: 'id', headerName: 'Mã Đội', flex: 1, minWidth: 120 },
    { field: 'HoTen', headerName: 'Tên Đội', flex: 2, minWidth: 180 },
    { field: 'NgaySinh', headerName: 'Ngày thành lập', flex: 1, minWidth: 140 },
    { field: 'SoLuongCauThu', headerName: 'Số lượng cầu thủ', flex: 1, minWidth: 150 },
    { field: 'Logo', headerName: 'Logo', flex: 1, minWidth: 120 },
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
            <Typography variant="h5" fontWeight={700}>Quản lý Đội bóng</Typography>
            <Button variant="contained" onClick={() => handleOpen(null)} sx={{ minWidth: 180 }}>Thêm đội bóng</Button>
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
        <DialogTitle>{editRow ? 'Sửa đội bóng' : 'Thêm đội bóng'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Đội" name="MaDoiBong" value={form.MaDoiBong} onChange={handleChange} fullWidth required disabled={!!editRow} />
          <TextField margin="dense" label="Tên Đội" name="HoTen" value={form.HoTen} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Ngày thành lập" name="NgaySinh" type="date" value={form.NgaySinh} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Số lượng cầu thủ" name="SoLuongCauThu" type="number" value={form.SoLuongCauThu} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Logo" name="Logo" value={form.Logo} onChange={handleChange} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 