import { authService } from './auth-service.js';

/**
 * Protege una página requiriendo autenticación
 */
export function requireAuth() {
  // Esperar a que el auth service se inicialice
  authService.init().then((user) => {
    if (!user) {
      // No autenticado - redirigir a login
      const currentPath = window.location.pathname;
      window.location.href = `/auth.html?redirect=${encodeURIComponent(currentPath)}`;
    }
  });
}

/**
 * Redirige al dashboard si ya está autenticado
 */
export function redirectIfAuthenticated() {
  authService.init().then((user) => {
    if (user) {
      // Ya autenticado - redirigir a dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/index.html';
      window.location.href = redirect;
    }
  });
}