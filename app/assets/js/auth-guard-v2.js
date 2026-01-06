import { getAuthService } from './auth-config.js';

/**
 * Protege una página requiriendo autenticación
 * Verifica sesión mediante cookie httpOnly en el backend
 */
export async function requireAuth() {
  console.log('🔐 [AUTH-GUARD] Verificando autenticación...');
  
  try {
    // Obtener el servicio de autenticación
    const authService = await getAuthService();
    
    // Crear timeout de 8 segundos
    let timeoutId;
    const timeout = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        console.warn('⚠️ [AUTH-GUARD] Timeout alcanzado');
        resolve({ timeout: true });
      }, 8000);
    });
    
    // Carrera entre inicialización y timeout
    const result = await Promise.race([
      authService.init().then(user => {
        clearTimeout(timeoutId);
        return { user, timeout: false };
      }),
      timeout
    ]);
    
    // Asegurar que el timeout esté cancelado
    clearTimeout(timeoutId);
    
    if (result.timeout) {
      // Timeout - mostrar error
      console.error('❌ [AUTH-GUARD] Sistema de autenticación no responde');
      showAuthError('Sistema de autenticación no disponible');
      
      setTimeout(() => {
        hideAuthLoading();
      }, 2000);
      
    } else if (!result.user) {
      // No autenticado - redirigir a login
      console.log('🔒 [AUTH-GUARD] Usuario no autenticado, redirigiendo...');
      const currentPath = window.location.pathname;
      window.location.href = `/app/pages/auth.html?redirect=${encodeURIComponent(currentPath)}`;
      
    } else {
      // Usuario autenticado - mostrar contenido
      console.log('✅ [AUTH-GUARD] Usuario autenticado:', result.user.email || result.user.display_name);
      hideAuthLoading();
    }
    
  } catch (error) {
    console.error('❌ [AUTH-GUARD] Error en verificación:', error);
    showAuthError('Error al verificar autenticación');
    
    setTimeout(() => {
      // Si hay error, permitir ver la página (modo desarrollo)
      hideAuthLoading();
    }, 3000);
  }
}

/**
 * Redirige al dashboard si ya está autenticado
 * (solo para página de login)
 */
export async function redirectIfAuthenticated() {
  console.log('🔓 [AUTH-GUARD] Verificando si ya está autenticado...');
  
  // Si hay un parámetro logout=true, no hacer nada
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('logout') === 'true') {
    console.log('🚪 [AUTH-GUARD] Logout detectado, mostrando login...');
    return;
  }
  
  try {
    const authService = await getAuthService();
    
    // Timeout de 3 segundos
    const timeout = new Promise((resolve) => {
      setTimeout(() => {
        console.log('⏱️ [AUTH-GUARD] Timeout - continuando...');
        resolve({ timeout: true });
      }, 3000);
    });
    
    const result = await Promise.race([
      authService.init().then(user => ({ user, timeout: false })),
      timeout
    ]);
    
    if (!result.timeout && result.user) {
      // Ya autenticado - redirigir
      console.log('✅ [AUTH-GUARD] Usuario ya autenticado, redirigiendo...');
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/app/pages/dashboard.html';
      window.location.href = redirect;
    } else {
      console.log('ℹ️ [AUTH-GUARD] Usuario no autenticado, mostrando formulario');
    }
    
  } catch (error) {
    console.error('❌ [AUTH-GUARD] Error:', error);
    // Continuar - mostrar formulario
  }
}

/**
 * Oculta el overlay de loading con transición
 */
function hideAuthLoading() {
  const loadingEl = document.getElementById('auth-loading');
  const contentEl = document.getElementById('main-content');
  
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    loadingEl.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
      loadingEl.style.display = 'none';
    }, 200);
  }
  
  if (contentEl) {
    contentEl.style.display = 'block';
    contentEl.style.opacity = '0';
    setTimeout(() => {
      contentEl.style.transition = 'opacity 0.3s ease';
      contentEl.style.opacity = '1';
    }, 10);
  }
  
  console.log('✅ [AUTH-GUARD] Contenido principal mostrado');
}

/**
 * Muestra mensaje de error
 */
function showAuthError(message) {
  const loadingEl = document.getElementById('auth-loading');
  
  if (loadingEl) {
    loadingEl.innerHTML = `
      <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl"></i>
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">${message}</p>
      <p class="text-xs text-slate-600 mt-2">Reintentando...</p>
    `;
  }
}
