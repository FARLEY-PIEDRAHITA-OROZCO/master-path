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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// Verificar inicialización
console.log('🔥 Firebase initialized:', app.name);