const NAV_SEARCH_TRANSFER_KEY = 'portfolio-search:nav-selection';

export const storeNavSearchSelection = (selection) => {
  try {
    window.sessionStorage.setItem(NAV_SEARCH_TRANSFER_KEY, JSON.stringify(selection));
  } catch {
    // La seleccion temporal no debe bloquear la navegacion.
  }
};

export const consumeNavSearchSelection = () => {
  try {
    const raw = window.sessionStorage.getItem(NAV_SEARCH_TRANSFER_KEY);
    window.sessionStorage.removeItem(NAV_SEARCH_TRANSFER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
