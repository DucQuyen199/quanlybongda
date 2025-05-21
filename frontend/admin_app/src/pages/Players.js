import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Card, CardContent, Typography, Box } from '@mui/material';

const initialRows = [
  { id: 'CT001', HoTen: 'Nguyễn Văn A', NgaySinh: '2000-01-01', ViTri: 'Tiền đạo', SoAo: 9, MaDoi: 'DB001' },
];

export default function Players() {
  const [rows, setRows] = useState(initialRows);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({ MaCauThu: '', HoTen: '', NgaySinh: '', ViTri: '', SoAo: '', MaDoi: '' });

  const handleOpen = (row) => {
    setEditRow(row);
    setForm(row ? { ...row, MaCauThu: row.id } : { MaCauThu: '', HoTen: '', NgaySinh: '', ViTri: '', SoAo: '', MaDoi: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (editRow) {
      setRows(rows.map(r => r.id === editRow.id ? { ...form, id: form.MaCauThu } : r));
    } else {
      setRows([...rows, { ...form, id: form.MaCauThu }]);
    }
    setOpen(false);
  };
  const handleDelete = (id) => setRows(rows.filter(r => r.id !== id));

  const columns = [
    { field: 'id', headerName: 'Mã Cầu thủ', flex: 1, minWidth: 120 },
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

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <Card elevation={3} sx={{ maxWidth: '100%', p: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={2}>
            <Typography variant="h5" fontWeight={700}>Quản lý Cầu thủ</Typography>
            <Button variant="contained" onClick={() => handleOpen(null)} sx={{ minWidth: 180 }}>Thêm cầu thủ</Button>
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
        <DialogTitle>{editRow ? 'Sửa cầu thủ' : 'Thêm cầu thủ'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Mã Cầu thủ" name="MaCauThu" value={form.MaCauThu} onChange={handleChange} fullWidth required disabled={!!editRow} />
          <TextField margin="dense" label="Họ tên" name="HoTen" value={form.HoTen} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Ngày sinh" name="NgaySinh" type="date" value={form.NgaySinh} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
          <TextField margin="dense" label="Vị trí" name="ViTri" value={form.ViTri} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Số áo" name="SoAo" type="number" value={form.SoAo} onChange={handleChange} fullWidth required />
          <TextField margin="dense" label="Mã Đội" name="MaDoi" value={form.MaDoi} onChange={handleChange} fullWidth required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 