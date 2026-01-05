import { getAuthService, AUTH_CONFIG } from './auth-config.js';
import { redirectIfAuthenticated } from './auth-guard-v2.js';

// ==================== ELEMENTOS DOM ====================

const elements = {
  // Tabs
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),

  // Forms
  formLogin: document.getElementById('form-login'),
  formRegister: document.getElementById('form-register'),

  // Inputs Login
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),

  // Inputs Register
  registerName: document.getElementById('register-name'),
  registerEmail: document.getElementById('register-email'),
  registerPassword: document.getElementById('register-password'),
  registerPasswordConfirm: document.getElementById('register-password-confirm'),

  // Buttons
  btnGoogle: document.getElementById('btn-google'),

  // Message
  message: document.getElementById('message')
};

// Variable global para el servicio de autenticación
let authService = null;

// ==================== INICIALIZACIÓN ====================

async function initAuthUI() {
  console.log('🎨 [AUTH-UI] Inicializando interfaz de autenticación...');
  
  // Cargar el servicio de autenticación según configuración
  authService = await getAuthService();
  
  // Verificar si ya está autenticado
  await redirectIfAuthenticated();
  
  // Si usa Firebase, mostrar botón de Google
  if (!AUTH_CONFIG.USE_BACKEND_AUTH && elements.btnGoogle) {
    elements.btnGoogle.classList.remove('hidden');
  } else if (elements.btnGoogle) {
    // Ocultar botón de Google si usa backend propio
    elements.btnGoogle.classList.add('hidden');
    // Mostrar mensaje informativo
    const googleContainer = elements.btnGoogle.parentElement;
    if (googleContainer) {
      const notice = document.createElement('p');
      notice.className = 'text-xs text-slate-500 text-center mt-4';
      notice.textContent = 'Login con Google próximamente disponible';
      googleContainer.appendChild(notice);
    }
  }
  
  console.log('✅ [AUTH-UI] Interfaz lista');
}

// Inicializar cuando se carga la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthUI);
} else {
  initAuthUI();
}

// ==================== TAB SWITCHING ====================

window.switchTab = (tab) => {
  if (tab === 'login') {
    elements.tabLogin.classList.add('tab-active');
    elements.tabRegister.classList.remove('tab-active');
    elements.formLogin.classList.remove('hidden');
    elements.formRegister.classList.add('hidden');
  } else {
    elements.tabRegister.classList.add('tab-active');
    elements.tabLogin.classList.remove('tab-active');
    elements.formRegister.classList.remove('hidden');
    elements.formLogin.classList.add('hidden');
  }
  hideMessage();
};

// ==================== MESSAGES ====================

function showMessage(message, type = 'info') {
  if (!elements.message) return;
  
  elements.message.classList.remove('hidden');
  elements.message.className = `mb-4 p-4 rounded-2xl text-sm ${
    type === 'error' 
      ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
      : type === 'success'
      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
      : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
  }`;
  elements.message.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} mr-2"></i>
    ${message}
  `;
}

function hideMessage() {
  if (!elements.message) return;
  elements.message.classList.add('hidden');
}

// ==================== FORM HANDLERS ====================

// Login Form
if (elements.formLogin) {
  elements.formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!authService) {
      showMessage('Servicio de autenticación no disponible', 'error');
      return;
    }
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;

    // Validación básica
    if (!email || !password) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    // Validación de email
    if (!isValidEmail(email)) {
      showMessage('Email inválido', 'error');
      return;
    }

    // Mostrar loading
    showMessage('Iniciando sesión...', 'info');
    disableForm(elements.formLogin);

    try {
      // Intentar login
      const result = await authService.login(email, password);

      if (result.success) {
        showMessage('¡Bienvenido de vuelta!', 'success');
        
        // Redirigir al dashboard o a la página solicitada
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/app/pages/dashboard.html';
        
        setTimeout(() => {
          window.location.href = redirect;
        }, 1000);
      } else {
        showMessage(result.error || 'Error al iniciar sesión', 'error');
        enableForm(elements.formLogin);
      }
    } catch (error) {
      console.error('Error en login:', error);
      showMessage('Error inesperado al iniciar sesión', 'error');
      enableForm(elements.formLogin);
    }
  });
}

// Register Form
if (elements.formRegister) {
  elements.formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!authService) {
      showMessage('Servicio de autenticación no disponible', 'error');
      return;
    }
    
    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const passwordConfirm = elements.registerPasswordConfirm.value;

    // Validaciones
    if (!name || !email || !password || !passwordConfirm) {
      showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    if (name.length < 2) {
      showMessage('El nombre debe tener al menos 2 caracteres', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('Email inválido', 'error');
      return;
    }

    if (password.length < 8) {
      showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    if (!hasNumberAndLetter(password)) {
      showMessage('La contraseña debe contener letras y números', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    // Mostrar loading
    showMessage('Creando cuenta...', 'info');
    disableForm(elements.formRegister);

    try {
      // Intentar registro
      const result = await authService.register(email, password, name);

      if (result.success) {
        showMessage('¡Cuenta creada exitosamente! Bienvenido 🎉', 'success');
        
        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '/app/pages/dashboard.html';
        }, 1500);
      } else {
        showMessage(result.error || 'Error al crear cuenta', 'error');
        enableForm(elements.formRegister);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      showMessage('Error inesperado al crear cuenta', 'error');
      enableForm(elements.formRegister);
    }
  });
}

// Google Login Button
if (elements.btnGoogle) {
  elements.btnGoogle.addEventListener('click', async () => {
    if (!authService) {
      showMessage('Servicio de autenticación no disponible', 'error');
      return;
    }
    
    // Solo disponible con Firebase
    if (AUTH_CONFIG.USE_BACKEND_AUTH) {
      showMessage('Google login solo disponible con Firebase', 'error');
      return;
    }

    showMessage('Abriendo Google...', 'info');

    try {
      const result = await authService.loginWithGoogle();

      if (result.success) {
        showMessage('¡Bienvenido!', 'success');
        
        setTimeout(() => {
          window.location.href = '/app/pages/dashboard.html';
        }, 1000);
      } else {
        showMessage(result.error || 'Error al iniciar sesión con Google', 'error');
      }
    } catch (error) {
      console.error('Error en Google login:', error);
      showMessage('Error al iniciar sesión con Google', 'error');
    }
  });
}

// ==================== UTILIDADES ====================

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function hasNumberAndLetter(str) {
  return /\d/.test(str) && /[a-zA-Z]/.test(str);
}

function disableForm(form) {
  const inputs = form.querySelectorAll('input, button');
  inputs.forEach(input => {
    input.disabled = true;
    input.style.opacity = '0.5';
  });
}

function enableForm(form) {
  const inputs = form.querySelectorAll('input, button');
  inputs.forEach(input => {
    input.disabled = false;
    input.style.opacity = '1';
  });
}

// ==================== EXPORTAR ====================

export { showMessage, hideMessage };
