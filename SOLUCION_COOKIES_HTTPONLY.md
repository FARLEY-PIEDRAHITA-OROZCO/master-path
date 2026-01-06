# 🔐 Solución: Autenticación con Cookies httpOnly (Local + Emergent)

## 📊 RESUMEN EJECUTIVO

**Problema resuelto:** Las cookies de autenticación NO se establecían en entorno local (localhost), causando que `/auth/me` retornara 401 aunque `/auth/login` respondiera 200 OK.

**Causa raíz identificada:** Configuración incorrecta del parámetro `domain="localhost"` en las cookies.

**Solución implementada:** Eliminar el parámetro `domain` (establecerlo en `None`) para que el navegador use automáticamente el dominio actual.

---

## ❌ PROBLEMA ORIGINAL

### Síntomas en Local:
- ✅ `/api/auth/login` → 200 OK con respuesta JSON correcta
- ❌ Cookie `qa_session` NO aparecía en DevTools → Application → Cookies
- ❌ `/api/auth/me` → 401 Unauthorized (token no encontrado)
- ❌ Frontend redirigía constantemente al login

### Síntomas en Emergent:
- ✅ Todo funcionaba correctamente
- ✅ Cookies se establecían sin problemas
- ✅ Autenticación completa funcionando

---

## 🔍 ANÁLISIS DE CAUSA RAÍZ

### Configuración INCORRECTA (antes):

```python
# ❌ INCORRECTO - En /app/backend/routes/auth.py
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN", "localhost")

response.set_cookie(
    key="qa_session",
    value=access_token,
    domain="localhost",  # ❌ ESTE ES EL PROBLEMA
    httponly=True,
    secure=False,
    samesite="lax",
    path="/"
)
```

### ¿Por qué fallaba?

**Los navegadores modernos rechazan cookies con `domain="localhost"`** por razones de seguridad:

1. Según [RFC 6265 (HTTP State Management)](https://tools.ietf.org/html/rfc6265), `domain` debe ser un dominio válido con al menos un punto (`.example.com`) o estar ausente.

2. `localhost` es un nombre especial que NO sigue las reglas normales de dominios.

3. Cuando se establece `domain="localhost"`, el navegador simplemente **ignora la cookie** (no la guarda).

### ¿Por qué funcionaba en Emergent?

En Emergent (producción):
- Frontend y backend comparten el mismo dominio real (ej: `app.emergent.ai`)
- Los dominios reales SÍ son válidos según RFC 6265
- Las cookies se establecen correctamente

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Configuración CORRECTA (ahora):

```python
# ✅ CORRECTO - En /app/backend/routes/auth.py
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CRÍTICO: domain debe ser None para que funcione en localhost y producción
COOKIE_DOMAIN = None

# secure debe ser False en desarrollo, True en producción
COOKIE_SECURE = ENVIRONMENT == "production"

response.set_cookie(
    key="qa_session",
    value=access_token,
    domain=None,  # ✅ None = el navegador usa el dominio actual automáticamente
    httponly=True,
    secure=COOKIE_SECURE,  # False en dev, True en prod
    samesite="lax",
    path="/"
)
```

### ¿Por qué esta solución funciona?

**Cuando `domain=None` (o no se especifica):**
- El navegador establece la cookie **automáticamente** para el dominio actual
- En local: la cookie se establece para `localhost`
- En Emergent: la cookie se establece para el dominio real (ej: `app.emergent.ai`)
- **No hay diferencia de código** entre entornos

---

## 🔧 CAMBIOS REALIZADOS

### 1. `/app/backend/routes/auth.py` (modificado)

```python
# Configuración de cookies desde .env
COOKIE_NAME = "qa_session"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# CRÍTICO: domain debe ser None para localhost
# En producción también funciona con None (usa el dominio actual automáticamente)
COOKIE_DOMAIN = None

# secure debe ser False en desarrollo, True en producción
COOKIE_SECURE = ENVIRONMENT == "production"

COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
COOKIE_HTTPONLY = os.getenv("COOKIE_HTTPONLY", "True").lower() == "true"
COOKIE_MAX_AGE = int(os.getenv("COOKIE_MAX_AGE", "604800"))  # 7 días

# Logs de debug
print(f"🍪 [COOKIE-CONFIG] Entorno: {ENVIRONMENT}")
print(f"🍪 [COOKIE-CONFIG] Cookie name: {COOKIE_NAME}")
print(f"🍪 [COOKIE-CONFIG] Domain: {COOKIE_DOMAIN} (None = dominio actual)")
print(f"🍪 [COOKIE-CONFIG] Secure: {COOKIE_SECURE}")
print(f"🍪 [COOKIE-CONFIG] SameSite: {COOKIE_SAMESITE}")
print(f"🍪 [COOKIE-CONFIG] HttpOnly: {COOKIE_HTTPONLY}")
```

### 2. `/app/backend/.env` (creado con valores correctos)

```env
# JWT Configuration
JWT_SECRET=dev_secret_key_change_in_production_use_python_secrets_token_urlsafe_32
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/
MONGO_DB_NAME=qa_master_path

# Cookie Configuration
# IMPORTANTE: NO configurar COOKIE_DOMAIN
# El código usa domain=None automáticamente (funciona en local y producción)
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

### 3. `/app/LOCAL_SETUP.md` (actualizado)

Se eliminó la línea:
```env
COOKIE_DOMAIN=localhost  # ❌ ELIMINADO
COOKIE_SECURE=False      # ❌ ELIMINADO (ahora se calcula automáticamente)
```

---

## 🧪 VALIDACIÓN DE LA SOLUCIÓN

### Prueba realizada con curl:

```bash
# Login y captura de headers
curl -i -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### ✅ Headers Set-Cookie en la respuesta:

```http
HTTP/1.1 200 OK
set-cookie: qa_session=<JWT_TOKEN>; HttpOnly; Max-Age=604800; Path=/; SameSite=lax
set-cookie: qa_session_refresh=<REFRESH_TOKEN>; HttpOnly; Max-Age=604800; Path=/api/auth/refresh; SameSite=lax
```

**Características clave:**
- ✅ **NO hay parámetro `Domain`** (correcto)
- ✅ `HttpOnly` presente (protección XSS)
- ✅ `SameSite=lax` (protección CSRF)
- ✅ `Secure` ausente en development (correcto para localhost)
- ✅ `Path=/` para cookie principal
- ✅ `Path=/api/auth/refresh` para refresh token (más restrictivo)

### Logs del backend confirmando configuración:

```
🍪 [COOKIE-CONFIG] Entorno: development
🍪 [COOKIE-CONFIG] Cookie name: qa_session
🍪 [COOKIE-CONFIG] Domain: None (None = dominio actual)
🍪 [COOKIE-CONFIG] Secure: False
🍪 [COOKIE-CONFIG] SameSite: lax
🍪 [COOKIE-CONFIG] HttpOnly: True
✅ [COOKIE-SET] Cookies configuradas: qa_session
✅ [COOKIE-SET] Domain: None, Secure: False, SameSite: lax
```

---

## 🌍 DIFERENCIAS POR ENTORNO

### Development (Local):

| Parámetro | Valor | Razón |
|-----------|-------|-------|
| `domain` | `None` | Navegador usa `localhost` automáticamente |
| `secure` | `False` | HTTP funciona en local (no HTTPS) |
| `samesite` | `lax` | Balance entre seguridad y usabilidad |
| `httponly` | `True` | Protección contra XSS |
| CORS origins | `http://localhost:8000`, `http://localhost:3000`, `http://127.0.0.1:8000` | Permitir desarrollo local |

### Production (Emergent):

| Parámetro | Valor | Razón |
|-----------|-------|-------|
| `domain` | `None` | Navegador usa dominio real automáticamente |
| `secure` | `True` | HTTPS obligatorio en producción |
| `samesite` | `lax` | Balance entre seguridad y usabilidad |
| `httponly` | `True` | Protección contra XSS |
| CORS origins | Dominio específico de Emergent | Restringir acceso |

**Nota importante:** El código es **IDÉNTICO** en ambos entornos. Solo cambia la variable de entorno `ENVIRONMENT=development|production`.

---

## 📝 CÓMO VERIFICAR EN LOCAL

### 1. Verificar configuración del backend:

```bash
curl http://localhost:8001/api/auth/status | python3 -m json.tool
```

**Esperado:**
```json
{
    "success": true,
    "auth_mode": "cookie_based",
    "cookie_name": "qa_session",
    "cookie_secure": false,
    "cookie_samesite": "lax",
    "cookie_httponly": true,
    "cookie_max_age": 604800
}
```

### 2. Hacer login y verificar cookies en DevTools:

**Pasos:**
1. Abrir http://localhost:8000 en el navegador
2. Abrir DevTools (F12)
3. Ir a pestaña **Application** → **Cookies** → `http://localhost:8000`
4. Hacer login desde el frontend
5. **Verificar que aparezcan:**
   - ✅ Cookie `qa_session` con valor JWT
   - ✅ Atributos: `HttpOnly`, `SameSite=Lax`, `Path=/`
   - ✅ **NO debe tener** atributo `Secure` (porque es HTTP local)

### 3. Verificar que `/auth/me` funcione:

```bash
# Después de hacer login en el navegador, verifica en la consola del navegador:
fetch('http://localhost:8001/api/auth/me', {
  method: 'GET',
  credentials: 'include'  // CRÍTICO: incluir cookies
})
.then(r => r.json())
.then(console.log)
```

**Esperado:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    ...
  }
}
```

### 4. Verificar logs del backend:

```bash
tail -f /var/log/supervisor/backend.out.log | grep COOKIE
```

**Esperado al hacer login:**
```
✅ [COOKIE-SET] Cookies configuradas: qa_session
✅ [COOKIE-SET] Domain: None, Secure: False, SameSite: lax
```

---

## 🔐 SEGURIDAD

### Protecciones implementadas:

1. **HttpOnly = true**
   - Las cookies NO son accesibles desde JavaScript
   - Protección contra ataques XSS (Cross-Site Scripting)
   - El token NO puede ser robado mediante `document.cookie`

2. **SameSite = lax**
   - Protección contra ataques CSRF (Cross-Site Request Forgery)
   - Las cookies solo se envían en solicitudes del mismo sitio
   - Permite navegación normal con GET

3. **Secure = true (solo en producción)**
   - Las cookies solo se envían sobre HTTPS
   - Protección contra ataques Man-in-the-Middle

4. **Domain = None**
   - Las cookies se limitan al dominio actual
   - No se comparten con subdominios
   - Principio de menor privilegio

5. **Path específicos**
   - Cookie principal: `Path=/` (toda la aplicación)
   - Refresh token: `Path=/api/auth/refresh` (solo endpoint de refresh)
   - Limita exposición del refresh token

---

## 🚀 CRITERIO DE ÉXITO

### ✅ En Local (después del fix):
- [x] Login exitoso (200 OK)
- [x] Cookie `qa_session` aparece en DevTools → Cookies
- [x] `/auth/me` retorna 200 OK con datos del usuario
- [x] Frontend NO redirige al login constantemente
- [x] Navegación fluida en la aplicación

### ✅ En Emergent (sin cambios):
- [x] Mantiene funcionalidad existente
- [x] Sin regresiones
- [x] Código idéntico al local (solo difiere ENVIRONMENT)

---

## 📚 REFERENCIAS TÉCNICAS

1. **RFC 6265 - HTTP State Management Mechanism**
   - https://tools.ietf.org/html/rfc6265
   - Especificación oficial de cookies HTTP

2. **MDN Web Docs - Set-Cookie**
   - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
   - Documentación detallada de parámetros de cookies

3. **OWASP - Session Management Cheat Sheet**
   - https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
   - Mejores prácticas de seguridad para sesiones

4. **FastAPI - Cookie Parameters**
   - https://fastapi.tiangolo.com/advanced/response-cookies/
   - Documentación oficial de FastAPI sobre cookies

---

## 📞 SOPORTE

Si después de aplicar esta solución sigues teniendo problemas:

1. Verifica que `.env` tenga `ENVIRONMENT=development`
2. Reinicia el backend: `sudo supervisorctl restart backend`
3. Limpia las cookies del navegador (Shift+F5)
4. Verifica logs: `tail -f /var/log/supervisor/backend.out.log`
5. Verifica CORS: las URLs del frontend deben estar en `allowed_origins`

---

**Autor:** E1 AI Agent  
**Fecha:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Implementado y validado
