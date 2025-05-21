import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const DoiBongForm = () => {
  const { id } = useParams();
  const isEditing = !!id;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEditing ? 'Chỉnh sửa đội bóng' : 'Thêm đội bóng mới'}
      </Typography>
      <Typography>Đang phát triển...</Typography>
    </Box>
  );
};

export default DoiBongForm; 