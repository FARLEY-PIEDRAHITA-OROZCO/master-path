import { authService } from './auth-service.js';

/**
 * Obtiene la ruta base del proyecto
 */
function getBasePath() {
  const path = window.location.pathname;
  // Si estamos en /app/app/auth.html o similar, extraer la base
  if (path.includes('/app/')) {
    return '/app/';
  }
  return '/';
}

/**
 * Protege una página requiriendo autenticación
 */
export function requireAuth() {
  // Esperar a que el auth service se inicialice
  authService.init().then((user) => {
    if (!user) {
      // No autenticado - redirigir a login
      const basePath = getBasePath();
      const currentPath = window.location.pathname;
      window.location.href = `${basePath}app/auth.html?redirect=${encodeURIComponent(currentPath)}`;
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
      const basePath = getBasePath();
      const redirect = params.get('redirect') || `${basePath}index.html`;
      window.location.href = redirect;
    }
  });
}