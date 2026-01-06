# 🏠 Setup para Desarrollo Local

Este documento explica cómo configurar y ejecutar el proyecto QA Master Path en tu máquina local.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Python 3.11+** - [Descargar](https://www.python.org/downloads/)
2. **Node.js 18+** y npm - [Descargar](https://nodejs.org/)
3. **MongoDB 7.0+** - [Descargar](https://www.mongodb.com/try/download/community)
4. **Git** - [Descargar](https://git-scm.com/downloads)

### Verificar Instalaciones

```bash
# Verificar versiones
python --version    # Debe ser 3.11+
node --version      # Debe ser 18+
npm --version       # Debe ser 9+
mongod --version    # Debe ser 7.0+
```

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/FARLEY-PIEDRAHITA-OROZCO/qa-master-path.git
cd qa-master-path
```

### 2. Configurar Backend (FastAPI)

#### a. Instalar Dependencias Python

```bash
cd backend

# Opcional pero recomendado: Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### b. Crear Archivo .env

Crear archivo `backend/.env` con el siguiente contenido:

```env
# JWT Configuration
JWT_SECRET=tu_secret_key_super_seguro_cambiar_en_produccion
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# Cookie Configuration (Valores por defecto óptimos)
# NOTA: NO configurar COOKIE_DOMAIN - el código usa None automáticamente
# domain=None funciona tanto en local como en producción
COOKIE_SAMESITE=lax
COOKIE_HTTPONLY=True
COOKIE_MAX_AGE=604800

# CORS Configuration
FRONTEND_URL=http://localhost:8000
FRONTEND_DEV_URL=http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=True
```

**⚠️ IMPORTANTE**: Genera un JWT_SECRET seguro:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copia el resultado y reemplaza el valor de `JWT_SECRET` en tu `.env`.

#### c. Verificar Conexión MongoDB

```bash
# Asegúrate de que MongoDB esté corriendo

# Windows (como servicio):
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Verificar conexión:
mongosh --eval "db.version()"
```

### 3. Configurar Frontend

```bash
# Volver al directorio raíz
cd ..

# Instalar dependencias
npm install
```

---

## 🎯 Ejecutar la Aplicación

### Opción 1: Desarrollo con Múltiples Terminales

Esta es la forma más común para desarrollo local.

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd /ruta/a/tu/proyecto
npm run dev
```

**Terminal 3 - MongoDB** (si no está como servicio):
```bash
mongod --dbpath /path/to/data
```

### Opción 2: Con Script Combinado

Crear un script `start-dev.sh` en la raíz:

```bash
#!/bin/bash

# Iniciar backend en background
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# Esperar 2 segundos
sleep 2

# Iniciar frontend
cd ..
npm run dev &
FRONTEND_PID=$!

# Función para limpiar al salir
cleanup() {
    echo "Deteniendo servicios..."
    kill $BACKEND_PID $FRONTEND_PID
    exit
}

# Capturar Ctrl+C
trap cleanup INT

# Esperar
echo "Servicios iniciados. Presiona Ctrl+C para detener."
wait
```

```bash
chmod +x start-dev.sh
./start-dev.sh
```

---

## 🌐 URLs de la Aplicación

Una vez iniciados los servicios:

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:8001
- **API Docs (Swagger)**: http://localhost:8001/api/docs
- **API Redoc**: http://localhost:8001/api/redoc
- **MongoDB**: mongodb://localhost:27017

---

## ✅ Verificar que Todo Funciona

### 1. Probar el Backend

```bash
# Health check
curl http://localhost:8001/api/health

# Debería devolver:
# {"status":"ok","database":"connected","environment":"development"}
```

### 2. Probar el Frontend

1. Abre http://localhost:8000
2. Abre la consola del navegador (F12)
3. Deberías ver logs de inicialización:
   ```
   ⚙️ [CONFIG] Backend URL configurado: http://localhost:8001/api
   🔐 [AUTH-SERVICE-V2] Iniciando servicio de autenticación...
   ```

### 3. Probar Registro

1. Ve a http://localhost:8000/app/pages/auth.html
2. Click en pestaña "Registrarse"
3. Completa el formulario:
   - Nombre: Tu Nombre
   - Email: test@example.com
   - Contraseña: TestPass123 (min 8 caracteres con letra y número)
   - Confirmar Contraseña: TestPass123
4. Click en "Crear Cuenta"
5. Deberías ser redirigido al dashboard

### 4. Verificar en MongoDB

```bash
# Conectar a MongoDB
mongosh

# Usar la base de datos
use qa_master_path

# Ver usuarios creados
db.users.find().pretty()

# Salir
exit
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MongoDB"

**Causa**: MongoDB no está corriendo

**Solución**:
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verificar
mongosh --eval "db.version()"
```

### Error: "Port 8001 already in use"

**Causa**: El puerto ya está ocupado por otro proceso

**Solución**:
```bash
# Ver qué proceso usa el puerto
# En Linux/Mac:
lsof -i :8001

# En Windows:
netstat -ano | findstr :8001

# Matar el proceso o usar otro puerto
uvicorn server:app --reload --port 8002
```

### Error: "ModuleNotFoundError: No module named 'fastapi'"

**Causa**: Dependencias no instaladas

**Solución**:
```bash
cd backend
pip install -r requirements.txt
```

### Error: CORS en el navegador

**Causa**: Frontend y backend no tienen CORS configurado correctamente

**Solución**: Verificar que en `backend/.env` esté:
```env
FRONTEND_URL=http://localhost:8000
```

Y que `backend/server.py` incluya esa URL en `allowed_origins`.

### Frontend no carga (página en blanco)

**Causa**: Servidor frontend no está corriendo o directorio incorrecto

**Solución**:
```bash
# Asegúrate de estar en la raíz del proyecto
cd /ruta/a/qa-master-path
npm run dev

# Si no funciona, usa directamente:
npx http-server -p 8000 -c-1
```

### Error: "Invalid JWT Secret"

**Causa**: JWT_SECRET no está configurado en `.env`

**Solución**:
```bash
# Generar secret
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Agregar a backend/.env
echo "JWT_SECRET=<secret_generado>" >> backend/.env

# Reiniciar backend
```

---

## 🔄 Reiniciar Servicios

### Reiniciar Backend

```bash
# Detener: Ctrl+C en la terminal del backend
# Reiniciar:
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Reiniciar Frontend

```bash
# Detener: Ctrl+C en la terminal del frontend
# Reiniciar:
npm run dev
```

### Reiniciar MongoDB

```bash
# Windows
net stop MongoDB
net start MongoDB

# Mac
brew services restart mongodb-community

# Linux
sudo systemctl restart mongod
```

---

## 📊 Comandos Útiles

### Backend

```bash
# Ver logs en tiempo real
tail -f /var/log/backend.log

# Ejecutar tests
cd backend
pytest

# Formatear código
black .

# Verificar tipos
mypy .
```

### Frontend

```bash
# Ejecutar tests
npm test

# Linting
npm run lint
npm run lint:fix

# Formatear código
npm run format
```

### MongoDB

```bash
# Conectar a MongoDB shell
mongosh

# Ver bases de datos
show dbs

# Usar qa_master_path
use qa_master_path

# Ver colecciones
show collections

# Ver todos los usuarios
db.users.find().pretty()

# Contar usuarios
db.users.count()

# Eliminar todos los datos (CUIDADO!)
db.users.deleteMany({})
```

---

## 🎯 Checklist de Setup Exitoso

- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ instalado
- [ ] MongoDB 7.0+ instalado y corriendo
- [ ] Repositorio clonado
- [ ] Dependencias backend instaladas (`pip install -r requirements.txt`)
- [ ] Archivo `backend/.env` creado y configurado
- [ ] JWT_SECRET generado y configurado
- [ ] Dependencias frontend instaladas (`npm install`)
- [ ] Backend corriendo en http://localhost:8001
- [ ] Backend health check exitoso (`curl http://localhost:8001/api/health`)
- [ ] Frontend corriendo en http://localhost:8000
- [ ] Registro de usuario exitoso
- [ ] Login exitoso
- [ ] Redirección al dashboard exitosa

---

## 📖 Siguientes Pasos

Una vez que tengas todo funcionando:

1. **Explora la API**: http://localhost:8001/api/docs
2. **Lee la documentación**: Consulta [`guides/`](./guides/) para más detalles
3. **Ejecuta los tests**: `npm test` y `pytest`
4. **Revisa el código**: Explora `backend/` y `app/assets/js/`

---

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. **Revisa los logs**:
   - Backend: Terminal donde corriste `uvicorn`
   - Frontend: Consola del navegador (F12)
   - MongoDB: `sudo tail -f /var/log/mongodb/mongod.log`

2. **Verifica las conexiones**:
   ```bash
   # Backend corriendo?
   curl http://localhost:8001/api/health
   
   # MongoDB corriendo?
   mongosh --eval "db.version()"
   ```

3. **Revisa la documentación completa**: [`README.md`](./README.md)

4. **Contacta al autor**: frlpiedrahita@gmail.com

---

**¡Listo! Ahora deberías poder desarrollar localmente sin problemas.**

*Última actualización: Enero 2025*
