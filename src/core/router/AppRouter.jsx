import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../../features/public/home/pages/HomePage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/*
          Futuras rutas:
          <Route path="/explorar"        element={<ExplorarPage />} />
          <Route path="/proyectos"       element={<ProyectosPage />} />
          <Route path="/desarrolladores" element={<DevsPage />} />
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/:username"       element={<PortafolioPage />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}