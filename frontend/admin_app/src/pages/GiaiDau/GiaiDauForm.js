import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import giaiDauService from '../../services/giaiDauService';

const GiaiDauForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isEditing = !!id;

  const validationSchema = Yup.object({
    maGiaiDau: Yup.string()
      .required('Mã giải đấu không được để trống')
      .max(20, 'Mã giải đấu không được vượt quá 20 ký tự'),
    tenGiai: Yup.string()
      .required('Tên giải đấu không được để trống')
      .max(100, 'Tên giải đấu không được vượt quá 100 ký tự'),
    thoiGianBatDau: Yup.date()
      .required('Thời gian bắt đầu không được để trống'),
    thoiGianKetThuc: Yup.date()
      .required('Thời gian kết thúc không được để trống')
      .min(
        Yup.ref('thoiGianBatDau'),
        'Thời gian kết thúc phải sau thời gian bắt đầu'
      ),
    diaDiem: Yup.string()
      .required('Địa điểm không được để trống')
      .max(100, 'Địa điểm không được vượt quá 100 ký tự')
  });

  const formik = useFormik({
    initialValues: {
      maGiaiDau: '',
      tenGiai: '',
      thoiGianBatDau: '',
      thoiGianKetThuc: '',
      diaDiem: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');
        
        // Format dates for API
        const formattedValues = {
          ...values,
          thoiGianBatDau: new Date(values.thoiGianBatDau).toISOString(),
          thoiGianKetThuc: new Date(values.thoiGianKetThuc).toISOString()
        };
        
        let response;
        if (isEditing) {
          response = await giaiDauService.updateGiaiDau(id, formattedValues);
        } else {
          response = await giaiDauService.createGiaiDau(formattedValues);
        }
        
        if (response.data.success) {
          setSuccess(isEditing ? 'Cập nhật giải đấu thành công!' : 'Tạo giải đấu thành công!');
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate('/giaidau');
          }, 1500);
        } else {
          setError(response.data.message || 'Có lỗi xảy ra');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (isEditing) {
      const fetchGiaiDau = async () => {
        try {
          setInitialLoading(true);
          const response = await giaiDauService.getGiaiDauById(id);
          
          if (response.data.success) {
            const giaiDau = response.data.data;
            
            // Format dates for form fields (YYYY-MM-DD)
            const formatDate = (dateString) => {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            };
            
            formik.setValues({
              maGiaiDau: giaiDau.MAGIAIDAU,
              tenGiai: giaiDau.TENGIAI,
              thoiGianBatDau: formatDate(giaiDau.THOIGIANBATDAU),
              thoiGianKetThuc: formatDate(giaiDau.THOIGIANKETTHUC),
              diaDiem: giaiDau.DIADIEM
            });
          } else {
            setError('Không thể tải thông tin giải đấu');
          }
        } catch (error) {
          console.error('Error fetching giaiDau:', error);
          setError('Đã xảy ra lỗi khi tải dữ liệu');
        } finally {
          setInitialLoading(false);
        }
      };
      
      fetchGiaiDau();
    }
  }, [id, isEditing]);

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Chỉnh sửa giải đấu' : 'Thêm giải đấu mới'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="maGiaiDau"
                name="maGiaiDau"
                label="Mã giải đấu"
                value={formik.values.maGiaiDau}
                onChange={formik.handleChange}
                error={formik.touched.maGiaiDau && Boolean(formik.errors.maGiaiDau)}
                helperText={formik.touched.maGiaiDau && formik.errors.maGiaiDau}
                disabled={isEditing}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="tenGiai"
                name="tenGiai"
                label="Tên giải đấu"
                value={formik.values.tenGiai}
                onChange={formik.handleChange}
                error={formik.touched.tenGiai && Boolean(formik.errors.tenGiai)}
                helperText={formik.touched.tenGiai && formik.errors.tenGiai}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="thoiGianBatDau"
                name="thoiGianBatDau"
                label="Thời gian bắt đầu"
                type="date"
                value={formik.values.thoiGianBatDau}
                onChange={formik.handleChange}
                error={formik.touched.thoiGianBatDau && Boolean(formik.errors.thoiGianBatDau)}
                helperText={formik.touched.thoiGianBatDau && formik.errors.thoiGianBatDau}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="thoiGianKetThuc"
                name="thoiGianKetThuc"
                label="Thời gian kết thúc"
                type="date"
                value={formik.values.thoiGianKetThuc}
                onChange={formik.handleChange}
                error={formik.touched.thoiGianKetThuc && Boolean(formik.errors.thoiGianKetThuc)}
                helperText={formik.touched.thoiGianKetThuc && formik.errors.thoiGianKetThuc}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="diaDiem"
                name="diaDiem"
                label="Địa điểm"
                value={formik.values.diaDiem}
                onChange={formik.handleChange}
                error={formik.touched.diaDiem && Boolean(formik.errors.diaDiem)}
                helperText={formik.touched.diaDiem && formik.errors.diaDiem}
                required
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/giaidau')}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : isEditing ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default GiaiDauForm; 