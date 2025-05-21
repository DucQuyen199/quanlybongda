import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import giaiDauService from '../../services/giaiDauService';

const GiaiDauList = () => {
  const [giaiDaus, setGiaiDaus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGiaiDaus();
  }, []);

  const fetchGiaiDaus = async () => {
    try {
      setLoading(true);
      const response = await giaiDauService.getAllGiaiDau();
      
      if (response.data.success) {
        setGiaiDaus(response.data.data);
      } else {
        setError('Không thể tải dữ liệu giải đấu');
      }
    } catch (error) {
      console.error('Error fetching giaiDaus:', error);
      setError('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giải đấu này?')) {
      try {
        const response = await giaiDauService.deleteGiaiDau(id);
        
        if (response.data.success) {
          setGiaiDaus(giaiDaus.filter(giaiDau => giaiDau.MAGIAIDAU !== id));
        } else {
          setError('Không thể xóa giải đấu');
        }
      } catch (error) {
        console.error('Error deleting giaiDau:', error);
        setError('Đã xảy ra lỗi khi xóa giải đấu');
      }
    }
  };

  const columns = [
    { field: 'MAGIAIDAU', headerName: 'Mã giải đấu', width: 150 },
    { field: 'TENGIAI', headerName: 'Tên giải đấu', width: 250 },
    { 
      field: 'THOIGIANBATDAU', 
      headerName: 'Thời gian bắt đầu', 
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('vi-VN');
      }
    },
    { 
      field: 'THOIGIANKETTHUC', 
      headerName: 'Thời gian kết thúc', 
      width: 180,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('vi-VN');
      }
    },
    { field: 'DIADIEM', headerName: 'Địa điểm', width: 200 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/giaidau/sua/${params.row.MAGIAIDAU}`)}
          >
            Sửa
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(params.row.MAGIAIDAU)}
          >
            Xóa
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Danh sách giải đấu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/giaidau/them')}
        >
          Thêm giải đấu
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={giaiDaus}
            columns={columns}
            getRowId={(row) => row.MAGIAIDAU}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
          />
        )}
      </Paper>
    </Box>
  );
};

export default GiaiDauList; 