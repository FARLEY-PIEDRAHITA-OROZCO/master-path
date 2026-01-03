import { authService } from './auth-service.js';

/**
 * Obtiene la ruta base del proyecto (simplificada)
 */
function getBasePath() {
  return '/app/';
}

/**
 * Protege una página requiriendo autenticación
 * Esta función se ejecuta PRIMERO antes de cargar cualquier contenido
 */
export function requireAuth() {
  // Esperar a que el auth service se inicialice
  authService.init().then((user) => {
    if (!user) {
      // No autenticado - redirigir a login
      const currentPath = window.location.pathname;
      window.location.href = `/app/auth.html?redirect=${encodeURIComponent(currentPath)}`;
    } else {
      // Usuario autenticado - ocultar loading y mostrar contenido
      hideAuthLoading();
    }
  });
}

/**
 * Redirige al dashboard si ya está autenticado (solo para página de login)
 */
export function redirectIfAuthenticated() {
  authService.init().then((user) => {
    if (user) {
      // Ya autenticado - redirigir a dashboard
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/app/index.html';
      window.location.href = redirect;
    }
  });
}

/**
 * Oculta el overlay de loading y muestra el contenido
 */
function hideAuthLoading() {
  const loadingEl = document.getElementById('auth-loading');
  const contentEl = document.getElementById('main-content');
  
  if (loadingEl) {
    loadingEl.style.display = 'none';
  }
  
  if (contentEl) {
    contentEl.style.display = 'block';
  }
}