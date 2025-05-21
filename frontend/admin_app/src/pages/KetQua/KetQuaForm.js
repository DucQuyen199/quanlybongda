import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const KetQuaForm = () => {
  const { id } = useParams();
  const isEditing = !!id;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Chỉnh sửa kết quả' : 'Thêm kết quả mới'}
      </Typography>
      <Typography>Đang phát triển...</Typography>
    </Box>
  );
};

export default KetQuaForm; 