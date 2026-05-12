import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

import EnlacePage from '../pages/EnlacePage';

import {
  fetchEnlaces,
  postEnlace,
  putEnlace,
  patchVisibility,
  removeEnlace,
} from '../services/EnlaceService';

jest.mock('../services/EnlaceService', () => ({
  fetchEnlaces: jest.fn(),
  postEnlace: jest.fn(),
  putEnlace: jest.fn(),
  patchVisibility: jest.fn(),
  removeEnlace: jest.fn(),
}));

describe('HU-07 Gestión de Enlaces - TC Primera corrida', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetchEnlaces.mockResolvedValue([]);
    postEnlace.mockResolvedValue({});
    putEnlace.mockResolvedValue({});
    patchVisibility.mockResolvedValue({});
    removeEnlace.mockResolvedValue({});
  });

  const abrirModalAgregarRed = async () => {
    render(<EnlacePage />);

    const botonAgregar = await screen.findByRole('button', {
      name: /agregar nueva/i,
    });

    fireEvent.click(botonAgregar);

    await screen.findByText(/agregar red social/i);
  };

  test('Paso 1 - La sección Redes Profesionales se visualiza correctamente con el botón Agregar nueva', async () => {
    render(<EnlacePage />);

    expect(
      await screen.findByText(/redes profesionales/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/tus perfiles en plataformas profesionales/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByRole('button', { name: /agregar nueva/i })
    ).toBeInTheDocument();
  });

  test('Paso 2 - Al hacer click en Agregar nueva se despliega el modal', async () => {
    render(<EnlacePage />);

    const botonAgregar = await screen.findByRole('button', {
      name: /agregar nueva/i,
    });

    fireEvent.click(botonAgregar);

    expect(
      await screen.findByText(/agregar red social/i)
    ).toBeInTheDocument();
  });

  test('Paso 3 - El modal contiene campos para URL, título, descripción y botones Cancelar / Agregar red', async () => {
    await abrirModalAgregarRed();

    expect(screen.getByText(/enlace \/ url/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/instagram\.com\/usuario/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/título/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/linkedin|github/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/descripci[oó]n/i)).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/para qu[eé] usas esta red/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /cancelar/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /agregar red/i })
    ).toBeInTheDocument();
  });
});