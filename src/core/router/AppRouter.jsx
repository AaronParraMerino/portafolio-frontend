import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../../features/public/home/pages/HomePage';
import LoginPage from '../../features/auth/pages/LoginPage';
import RegisterPage from '../../features/auth/pages/RegisterPage';
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
         <Route path="/auth/login" element={<LoginPage />} /> 
         <Route path="/auth/register" element={<RegisterPage />} /> 
        
      </Routes>
    </BrowserRouter>
  );
}