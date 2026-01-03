import { authService } from './auth-service.js';

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
  elements.message.classList.remove('hidden');
  elements.message.className = `mb-4 p-4 rounded-2xl text-sm ${
    type === 'error' 
      ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
      : type === 'success'
      ? 'bg-green-500/10 border border-green-500/30 text-green-400'
      : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
  }`;
  elements.message.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} mr-2"></i>
    ${message}
  `;
}

function hideMessage() {
  elements.message.classList.add('hidden');
}

// ==================== FORM HANDLERS ====================

elements.formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  // Validación básica
  if (!email || !password) {
    showMessage('Por favor completa todos los campos', 'error');
    return;
  }

  // Mostrar loading
  showMessage('Iniciando sesión...', 'info');

  // Intentar login
  const result = await authService.login(email, password);

  if (result.success) {
    showMessage('¡Bienvenido de vuelta!', 'success');
    
    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } else {
    showMessage(result.error, 'error');
  }
});

elements.formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = elements.registerName.value.trim();
  const email = elements.registerEmail.value.trim();
  const password = elements.registerPassword.value;
  const passwordConfirm = elements.registerPasswordConfirm.value;

  // Validaciones
  if (!name || !email || !password || !passwordConfirm) {
    showMessage('Por favor completa todos los campos', 'error');
    return;
  }

  if (password !== passwordConfirm) {
    showMessage('Las contraseñas no coinciden', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  // Mostrar loading
  showMessage('Creando cuenta...', 'info');

  // Intentar registro
  const result = await authService.register(email, password, name);

  if (result.success) {
    showMessage('¡Cuenta creada! Revisa tu email para verificar tu cuenta.', 'success');
    
    // Redirigir al dashboard
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 2000);
  } else {
    showMessage(result.error, 'error');
  }
});

// Login con Google
elements.btnGoogle.addEventListener('click', async () => {
  showMessage('Abriendo ventana de Google...', 'info');

  const result = await authService.loginWithGoogle();

  if (result.success) {
    showMessage('¡Bienvenido!', 'success');
    
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
  } else {
    showMessage(result.error, 'error');
  }
});

// Reset password
window.showResetPassword = () => {
  const email = prompt('Ingresa tu email para recuperar tu contraseña:');
  
  if (email) {
    authService.resetPassword(email).then(result => {
      if (result.success) {
        showMessage(result.message, 'success');
      } else {
        showMessage(result.error, 'error');
      }
    });
  }
};

// Estilos para tab activo
const style = document.createElement('style');
style.textContent = `
  .tab-active {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
`;
document.head.appendChild(style);