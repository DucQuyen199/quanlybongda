import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const BaoCaoForm = () => {
  const { id } = useParams();
  const isEditing = !!id;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Chỉnh sửa báo cáo' : 'Thêm báo cáo mới'}
      </Typography>
      <Typography>Đang phát triển...</Typography>
    </Box>
  );
};

export default BaoCaoForm; 