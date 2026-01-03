import { authService } from './auth-service.js';

/**
 * Obtiene la ruta base del proyecto (simplificada)
 */
function getBasePath() {
  return '/app/pages/';
}

/**
 * Protege una página requiriendo autenticación
 * Esta función se ejecuta PRIMERO antes de cargar cualquier contenido
 */
export function requireAuth() {
  console.log('🔐 [AUTH-GUARD] Verificando autenticación...');
  
  // Crear un timeout de 8 segundos para evitar loading infinito
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      console.warn('⚠️ [AUTH-GUARD] Timeout alcanzado - Firebase no responde');
      resolve({ timeout: true });
    }, 8000);
  });
  
  // Carrera entre la inicialización y el timeout
  Promise.race([
    authService.init().then(user => ({ user, timeout: false })),
    timeout
  ]).then((result) => {
    if (result.timeout) {
      // Timeout alcanzado - mostrar error y permitir continuar en modo desarrollo
      console.error('❌ [AUTH-GUARD] Firebase no responde. Iniciando modo desarrollo...');
      showAuthError('Firebase no disponible. Continuando en modo desarrollo...');
      
      // Permitir continuar sin autenticación en modo desarrollo
      setTimeout(() => {
        hideAuthLoading();
      }, 2000);
      
    } else if (!result.user) {
      // No autenticado - redirigir a login
      console.log('🔒 [AUTH-GUARD] Usuario no autenticado, redirigiendo...');
      const currentPath = window.location.pathname;
      window.location.href = `/app/pages/auth.html?redirect=${encodeURIComponent(currentPath)}`;
      
    } else {
      // Usuario autenticado - ocultar loading y mostrar contenido
      console.log('✅ [AUTH-GUARD] Usuario autenticado:', result.user.email);
      hideAuthLoading();
    }
  }).catch((error) => {
    console.error('❌ [AUTH-GUARD] Error en verificación:', error);
    showAuthError('Error al verificar autenticación: ' + error.message);
    
    // Permitir continuar después de mostrar el error
    setTimeout(() => {
      hideAuthLoading();
    }, 3000);
  });
}

/**
 * Redirige al dashboard si ya está autenticado (solo para página de login)
 */
export function redirectIfAuthenticated() {
  console.log('🔓 [AUTH-GUARD] Verificando si ya está autenticado...');
  
  // Timeout de 3 segundos para evitar esperar infinitamente
  const timeout = new Promise((resolve) => {
    setTimeout(() => {
      console.log('⏱️ [AUTH-GUARD] Timeout en redirectIfAuthenticated - continuando...');
      resolve({ timeout: true });
    }, 3000);
  });
  
  Promise.race([
    authService.init().then(user => ({ user, timeout: false })),
    timeout
  ]).then((result) => {
    if (!result.timeout && result.user) {
      // Ya autenticado - redirigir a dashboard
      console.log('✅ [AUTH-GUARD] Usuario ya autenticado, redirigiendo...');
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/app/pages/dashboard.html';
      window.location.href = redirect;
    } else {
      console.log('ℹ️ [AUTH-GUARD] Usuario no autenticado, mostrando formulario');
    }
  }).catch((error) => {
    console.error('❌ [AUTH-GUARD] Error en redirectIfAuthenticated:', error);
    // Continuar normalmente - mostrar el formulario de login
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
  
  console.log('✅ [AUTH-GUARD] Contenido principal mostrado');
}

/**
 * Muestra un mensaje de error en el loading overlay
 */
function showAuthError(message) {
  const loadingEl = document.getElementById('auth-loading');
  
  if (loadingEl) {
    loadingEl.innerHTML = `
      <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl"></i>
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">${message}</p>
      <p class="text-xs text-slate-600 mt-2">La aplicación continuará en modo desarrollo</p>
    `;
  }
}