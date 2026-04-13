// 1. Primero los estilos propios (variables CSS)
import './shared/styles/global.css';

// 2. Luego Bootstrap (las variables de Bootstrap serán sobreescritas por las nuestras)
import 'bootstrap/dist/css/bootstrap.min.css';

import AppRouter from './core/router/AppRouter';

export default function App() {
  return <AppRouter />;
}