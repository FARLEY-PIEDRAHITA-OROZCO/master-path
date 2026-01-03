import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ IMPORTANTE: Estas credenciales NO son secretas para apps web
// Son públicas por naturaleza. La seguridad se maneja con reglas de Firestore
const firebaseConfig = {
  apiKey: "AIzaSyBLbl7dLODi6c2OU6mUPbyifmZF_AWLOv8",
  authDomain: "qa-master-path.firebaseapp.com",
  projectId: "qa-master-path",
  storageBucket: "qa-master-path.firebasestorage.app",
  messagingSenderId: "488441406240",
  appId: "1:488441406240:web:2d7c23095ce86c66f7ad45"
};

// Inicializar Firebase con manejo de errores
let app, auth, db;

try {
  console.log('🔥 [FIREBASE-CONFIG] Inicializando Firebase...');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ [FIREBASE-CONFIG] Firebase inicializado correctamente:', app.name);
} catch (error) {
  console.error('❌ [FIREBASE-CONFIG] Error al inicializar Firebase:', error);
  console.error('Detalles del error:', error.message);
  
  // Crear objetos mock para evitar errores en el resto de la app
  console.warn('⚠️ [FIREBASE-CONFIG] Continuando con objetos mock...');
}

// Exportar servicios
export { auth, db };

// Verificar inicialización
if (app) {
  console.log('🔥 Firebase initialized:', app.name);
} else {
  console.error('❌ Firebase failed to initialize');
}