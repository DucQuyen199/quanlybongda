import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import GiaiDauList from './pages/GiaiDau/GiaiDauList';
import GiaiDauForm from './pages/GiaiDau/GiaiDauForm';
import DoiBongList from './pages/DoiBong/DoiBongList';
import DoiBongForm from './pages/DoiBong/DoiBongForm';
import CauThuList from './pages/CauThu/CauThuList';
import CauThuForm from './pages/CauThu/CauThuForm';
import TranDauList from './pages/TranDau/TranDauList';
import TranDauForm from './pages/TranDau/TranDauForm';
import KetQuaList from './pages/KetQua/KetQuaList';
import KetQuaForm from './pages/KetQua/KetQuaForm';
import BaoCaoList from './pages/BaoCao/BaoCaoList';
import BaoCaoForm from './pages/BaoCao/BaoCaoForm';
import NguoiDungList from './pages/NguoiDung/NguoiDungList';
import NguoiDungForm from './pages/NguoiDung/NguoiDungForm';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/giaidau" element={<GiaiDauList />} />
          <Route path="/giaidau/them" element={<GiaiDauForm />} />
          <Route path="/giaidau/sua/:id" element={<GiaiDauForm />} />
          
          <Route path="/doibong" element={<DoiBongList />} />
          <Route path="/doibong/them" element={<DoiBongForm />} />
          <Route path="/doibong/sua/:id" element={<DoiBongForm />} />
          
          <Route path="/cauthu" element={<CauThuList />} />
          <Route path="/cauthu/them" element={<CauThuForm />} />
          <Route path="/cauthu/sua/:id" element={<CauThuForm />} />
          
          <Route path="/trandau" element={<TranDauList />} />
          <Route path="/trandau/them" element={<TranDauForm />} />
          <Route path="/trandau/sua/:id" element={<TranDauForm />} />
          
          <Route path="/ketqua" element={<KetQuaList />} />
          <Route path="/ketqua/them" element={<KetQuaForm />} />
          <Route path="/ketqua/sua/:id" element={<KetQuaForm />} />
          
          <Route path="/baocao" element={<BaoCaoList />} />
          <Route path="/baocao/them" element={<BaoCaoForm />} />
          <Route path="/baocao/sua/:id" element={<BaoCaoForm />} />
          
          <Route path="/nguoidung" element={<NguoiDungList />} />
          <Route path="/nguoidung/them" element={<NguoiDungForm />} />
          <Route path="/nguoidung/sua/:id" element={<NguoiDungForm />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Box>
  );
}

export default App; 