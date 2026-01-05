# 🔧 Solución de Errores - Desarrollo Local

## ❌ Problema Reportado

Estás obteniendo los siguientes errores al intentar crear un usuario:

```
config.js:13  Uncaught SyntaxError: Unexpected token 'export'
localhost:8001/api/auth/register:1   Failed to load resource: net::ERR_CONNECTION_REFUSED
```

---

## ✅ Solución Aplicada

### 1. **Error de config.js - RESUELTO** ✅

**Problema:** El archivo config.js usaba `export` (sintaxis de módulo ES6) pero se cargaba como script normal.

**Solución:** He actualizado `/app/assets/js/config.js` para:
- Eliminar la sintaxis `export`
- Usar solo `window.BACKEND_URL`
- Detectar automáticamente el entorno (local o contenedor)

**Resultado:** El error "Unexpected token 'export'" ya no debería aparecer.

---

### 2. **Error de Conexión al Backend - REQUIERE ACCIÓN** ⚠️

**Problema:** El backend está corriendo en el contenedor de Emergent (localhost:8001) pero NO es accesible desde tu máquina local.

**Tienes 2 opciones:**

---

## 🎯 OPCIÓN 1: Correr Backend Localmente (RECOMENDADO)

Para que la autenticación funcione en tu máquina local, necesitas correr el backend FastAPI localmente:

### Paso 1: Instalar Dependencias

```bash
# Navegar al directorio del proyecto
cd /ruta/a/tu/proyecto

# Instalar dependencias de Python
cd backend
pip install -r requirements.txt
```

### Paso 2: Configurar MongoDB

Asegúrate de tener MongoDB corriendo localmente:

```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Paso 3: Verificar archivo .env

El archivo `backend/.env` ya está creado con la configuración correcta para desarrollo local. Verifica que contenga:

```env
MONGO_URL=mongodb://localhost:27017/
CORS_ORIGINS=["http://localhost:8000","http://127.0.0.1:5500","http://192.168.56.1:8000"]
```

### Paso 4: Correr el Backend

```bash
cd backend

# Opción A: Usar el script automatizado
./run-backend-local.sh

# Opción B: Correr directamente
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Paso 5: Verificar que Funciona

```bash
# Probar health check
curl http://localhost:8001/api/health

# Debería devolver:
# {"status":"ok","database":"connected","environment":"development"}
```

### Paso 6: Correr el Frontend

```bash
# Desde la raíz del proyecto
npm run dev

# O usa Live Server de VSCode
```

### Paso 7: Probar

1. Abre: http://localhost:8000/app/pages/auth.html (o http://127.0.0.1:5500/app/pages/auth.html)
2. Abre la consola del navegador (F12)
3. Ve a la pestaña "Registrarse"
4. Completa el formulario
5. Click en "Crear Cuenta"

**Ahora debería funcionar correctamente** ✅

---

## 🎯 OPCIÓN 2: Usar URL de Emergent (Si aplica)

Si estás usando Emergent y quieres que el frontend local se conecte al backend en Emergent:

### Paso 1: Obtener la URL Externa de Emergent

Pregunta al soporte de Emergent cuál es la URL pública de tu backend. Ejemplo:
```
https://tu-app.emergent.run/api
```

### Paso 2: Actualizar config.js

Modifica `/app/assets/js/config.js`:

```javascript
// Cambiar esta línea:
window.BACKEND_URL = 'http://localhost:8001/api';

// Por esta (con tu URL de Emergent):
window.BACKEND_URL = 'https://tu-app.emergent.run/api';
```

### Paso 3: Actualizar CORS en Backend

Asegúrate de que el backend permita tu origen local:

1. Edita `backend/.env` en Emergent
2. Agrega tu IP local a CORS_ORIGINS:
```env
CORS_ORIGINS=["http://192.168.56.1:8000","http://127.0.0.1:5500"]
```

---

## 📝 Archivos Actualizados

Los siguientes archivos han sido modificados para resolver estos errores:

1. ✅ `/app/assets/js/config.js` - Sin sintaxis de módulo
2. ✅ `/app/backend/server.py` - CORS actualizado con más orígenes
3. ✅ `/app/backend/.env` - Configurado para desarrollo local
4. 🆕 `/app/backend/run-backend-local.sh` - Script para correr backend fácilmente
5. 🆕 `/app/LOCAL_SETUP.md` - Documentación completa de setup local

---

## 🧪 Testing Rápido

### Test 1: Verificar config.js

Abre la consola del navegador en tu página y verifica:

```javascript
console.log(window.BACKEND_URL);
// Debería mostrar: http://localhost:8001/api
```

### Test 2: Verificar Backend

```bash
curl http://localhost:8001/api/health
# Debería devolver: {"status":"ok",...}
```

### Test 3: Verificar CORS

En la consola del navegador, ejecuta:

```javascript
fetch('http://localhost:8001/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Backend accesible:', d))
  .catch(e => console.error('❌ Error:', e));
```

Si ves "✅ Backend accesible", todo está bien.

---

## 🐛 Si Sigues Teniendo Problemas

### Error: "net::ERR_CONNECTION_REFUSED"

**Causa:** El backend no está corriendo o no es accesible.

**Verificaciones:**
1. ¿Está el backend corriendo? → `curl http://localhost:8001/api/health`
2. ¿En qué puerto corre? → `netstat -ano | findstr :8001` (Windows) o `lsof -i :8001` (Mac/Linux)
3. ¿Es accesible desde el navegador? → Abre http://localhost:8001/api/health

**Solución:** Corre el backend localmente (Opción 1 arriba)

---

### Error: CORS Policy

**Síntoma:**
```
Access to fetch at 'http://localhost:8001/api/auth/register' 
from origin 'http://192.168.56.1:8000' has been blocked by CORS policy
```

**Solución:**
1. Verifica que tu origen esté en `backend/.env`:
   ```env
   CORS_ORIGINS=["http://192.168.56.1:8000"]
   ```
2. Reinicia el backend

---

### Error: MongoDB Connection Failed

**Síntoma:** Backend inicia pero dice "database": "disconnected"

**Solución:**
```bash
# Iniciar MongoDB
# Windows:
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

---

## ✅ Checklist de Verificación

Antes de probar de nuevo, verifica:

- [ ] config.js actualizado (sin export)
- [ ] Backend corriendo localmente en puerto 8001
- [ ] MongoDB corriendo localmente
- [ ] Health check exitoso: `curl http://localhost:8001/api/health`
- [ ] Frontend corriendo (npm run dev o Live Server)
- [ ] Consola del navegador sin errores de JavaScript
- [ ] CORS configurado para tu origen

---

## 📞 ¿Necesitas Más Ayuda?

Si después de seguir estos pasos sigues teniendo problemas, comparte:

1. **Output de:** `curl http://localhost:8001/api/health`
2. **Consola del navegador** (F12 → Console) - screenshot del error
3. **Consola del backend** - los últimos 20 líneas donde corriste uvicorn
4. **Qué URL usas en el navegador:** ¿localhost:8000? ¿127.0.0.1:5500? ¿192.168.x.x:8000?

---

**¡Con estos pasos deberías poder desarrollar localmente sin problemas!** 🚀
