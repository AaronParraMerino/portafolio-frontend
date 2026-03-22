import React, { useEffect, useState } from 'react';
import { get } from './services/http/Service';
import './App.css';

function App() {
  const [estado, setEstado] = useState('Conectando...');

  useEffect(() => {
    get('/ping')
      .then(data => setEstado(data.message))
      .catch(err => setEstado('Error: ' + err.message));
  }, []);

  return (
    <div className="container mt-5">
      <h1>Sistema de Cotización</h1>
      <div className="alert alert-info mt-3">
        Estado del backend: <strong>{estado}</strong>
      </div>
    </div>
  );
}

export default App;