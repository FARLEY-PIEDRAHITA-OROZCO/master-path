# 🏠 Setup para Desarrollo Local

Este documento explica cómo correr el proyecto en tu máquina local (fuera del contenedor de Emergent).

---

## 📋 Prerrequisitos

1. **Python 3.11+** instalado
2. **Node.js 18+** y npm instalados
3. **MongoDB** instalado y corriendo localmente
4. **Git** para clonar el repositorio

---

## 🚀 Setup del Backend (FastAPI)

### 1. Instalar dependencias de Python

```bash
cd /ruta/a/tu/proyecto/backend

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en `/backend/`:

```env
# JWT Configuration
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB Configuration (LOCAL)
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# CORS Configuration (LOCAL)
FRONTEND_URL=http://localhost:8000
FRONTEND_DEV_URL=http://127.0.0.1:5500
CORS_ORIGINS=["http://localhost:8000","http://127.0.0.1:5500","http://192.168.56.1:8000"]

# Environment
ENVIRONMENT=development
DEBUG=True
```

### 3. Iniciar MongoDB localmente

```bash
# Asegúrate de que MongoDB esté corriendo
# En Windows (como servicio):
net start MongoDB

# En Mac:
brew services start mongodb-community

# En Linux:
sudo systemctl start mongod
```

### 4. Correr el backend

```bash
cd backend

# Opción 1: Con uvicorn directamente
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Opción 2: Con el script de Python
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**El backend estará disponible en:**
- API: http://localhost:8001/api
- Documentación: http://localhost:8001/api/docs
- Health Check: http://localhost:8001/api/health

---

## 🎨 Setup del Frontend

### 1. Instalar dependencias

```bash
cd /ruta/a/tu/proyecto

# Instalar dependencias
npm install
```

### 2. Configurar config.js (IMPORTANTE)

El archivo `/app/assets/js/config.js` ya detecta automáticamente el entorno, pero si tienes problemas, puedes modificarlo manualmente:

```javascript
// Para desarrollo local
window.BACKEND_URL = 'http://localhost:8001/api';
```

### 3. Correr el frontend

```bash
# Opción 1: Con npm (puerto 8000)
npm run dev

# Opción 2: Con Live Server de VSCode (puerto 5500)
# Click derecho en index.html → "Open with Live Server"
```

**El frontend estará disponible en:**
- npm: http://localhost:8000/app/pages/auth.html
- Live Server: http://127.0.0.1:5500/app/pages/auth.html

---

## ✅ Verificar que Todo Funciona

### 1. Probar el backend

```bash
# Health check
curl http://localhost:8001/api/health

# Debería devolver:
# {"status":"ok","database":"connected","environment":"development"}
```

### 2. Probar el frontend

1. Abre: http://localhost:8000/app/pages/auth.html
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   ⚙️ [CONFIG] Backend URL configurado: http://localhost:8001/api
   🔐 [AUTH-SERVICE-V2] Iniciando servicio de autenticación...
   ```

### 3. Probar registro

1. Ve a la pestaña "Registrarse"
2. Completa el formulario:
   - Nombre: Tu Nombre
   - Email: test@example.com
   - Contraseña: TestPass123 (min 8 caracteres)
   - Confirmar Contraseña: TestPass123
3. Click en "Crear Cuenta"
4. Deberías ser redirigido al dashboard

---

## 🐛 Solución de Problemas

### Error: "ERR_CONNECTION_REFUSED en localhost:8001"

**Causa:** El backend no está corriendo

**Solución:**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Error: "Uncaught SyntaxError: Unexpected token 'export'"

**Causa:** config.js tiene sintaxis de módulo pero se carga como script

**Solución:** Ya está arreglado en la versión actual de config.js (sin export)

### Error: "MongoDB connection failed"

**Causa:** MongoDB no está corriendo localmente

**Solución:**
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Error: CORS en el navegador

**Causa:** El backend no permite peticiones desde tu origen

**Solución:** Verifica que tu URL esté en el .env del backend:
```env
CORS_ORIGINS=["http://localhost:8000","http://127.0.0.1:5500"]
```

---

## 📝 Estructura del Proyecto Local

```
tu-proyecto/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── .env  (crear este archivo)
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── ...
│
├── app/
│   ├── pages/
│   │   ├── auth.html
│   │   ├── dashboard.html
│   │   └── ...
│   └── assets/
│       └── js/
│           ├── config.js  (detecta automáticamente el backend)
│           ├── auth-service-v2.js
│           └── ...
│
├── package.json
└── README.md
```

---

## 🎯 Checklist de Setup Exitoso

- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ instalado
- [ ] MongoDB instalado y corriendo
- [ ] Backend dependencies instaladas (`pip install -r requirements.txt`)
- [ ] Backend .env creado y configurado
- [ ] Backend corriendo en http://localhost:8001
- [ ] Backend health check exitoso (`curl http://localhost:8001/api/health`)
- [ ] Frontend dependencies instaladas (`npm install`)
- [ ] Frontend corriendo en http://localhost:8000 o http://127.0.0.1:5500
- [ ] Registro de usuario exitoso
- [ ] Login exitoso
- [ ] Redirección al dashboard exitosa

---

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. **Verifica los logs del backend:**
   - La terminal donde corriste uvicorn
   - Busca errores en rojo

2. **Verifica los logs del frontend:**
   - Consola del navegador (F12 → Console)
   - Busca errores en rojo

3. **Verifica la conexión:**
   ```bash
   # ¿Está el backend corriendo?
   curl http://localhost:8001/api/health
   
   # ¿Está MongoDB corriendo?
   mongo --eval "db.version()"
   ```

---

**¡Listo! Ahora deberías poder desarrollar localmente sin problemas.**
