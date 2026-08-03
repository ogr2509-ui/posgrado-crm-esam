# 🎁 GUÍA DE DESPLIEGUE 100% GRATUITO ($0 / MES PARA SIEMPRE)

Esta guía explica cómo activar **Posgrado CRM Enterprise** en internet **100% GRATIS, sin costo de mantenimiento y sin necesidad de ingresar tarjetas de crédito**.

---

## ⚡ Opción 1: Vercel + Firebase (100% GRATIS - POTENCIA MÁXIMA EN LA NUBE)

Combinar **Vercel** (para la aplicación web Next.js) con **Firebase** (para la base de datos y fotos en la nube) es una de las mejores arquitecturas modernas del mundo, **100% gratuita para siempre**.

### ¿Qué ofrece esta combinación?
- **Vercel (Plan Hobby $0/mes)**: Velocidad ultrarrápida, SSL HTTPS automático, despliegue continuo desde GitHub y disponibilidad global 24/7.
- **Firebase Firestore (Plan Spark $0/mes)**: Base de datos en tiempo real para inscripciones y enlaces.
- **Firebase Storage (Plan Spark $0/mes)**: Almacenamiento en la nube para fotos de C.I. (Anverso / Reverso) y afiches promocionales.

### 📋 Pasos para desplegar en Vercel + Firebase:

#### Paso 1: Crear proyecto en Firebase (Gratis)
1. Entra a [console.firebase.google.com](https://console.firebase.google.com) e inicia sesión con tu cuenta de Google.
2. Haz clic en **Agregar proyecto** y ponle de nombre `posgrado-crm`.
3. Activa **Firestore Database** (Crear base de datos en modo prueba).
4. Activa **Firebase Storage** (Crear bucket de almacenamiento para las imágenes del C.I.).
5. En la configuración del proyecto (icono de engranaje ⚙️), registra una Web App y copia las claves de configuración `firebaseConfig`.

#### Paso 2: Desplegar en Vercel (Gratis)
1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** > **Project**.
3. Selecciona tu repositorio `posgrado-crm`.
4. En la sección **Environment Variables**, agrega las variables de Firebase de tu proyecto:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
5. Haz clic en **Deploy**.

#### Paso 3: ¡Tu CRM activo en Vercel!
Vercel generará tu enlace oficial global en segundos (ejemplo: `https://posgrado-crm.vercel.app`).

---

## 🌟 Opción 2: Render.com (100% GRATIS - SERVIDOR PYTHON DIRECTO)

Si prefieres desplegar directamente el servidor Python (`server.py`) en 1 solo clic:

1. Entra a [dashboard.render.com](https://dashboard.render.com) e inicia sesión con GitHub.
2. Presiona **New +** > **Web Service** y selecciona tu repositorio.
3. Elige **Instance Type: Free ($0/mo)**.
4. Campos de inicio:
   - **Build Command**: `pip install openpyxl pillow`
   - **Start Command**: `python server.py`
5. Presiona **Create Web Service**.
6. Obtendrás tu enlace permanente (ej. `https://posgrado-crm.onrender.com`).

---

## 🔑 Acceso por Defecto

- **Administrador**: `admin@posgrado.com` / `Admin123!`
- **Asesor 1**: `juan.perez@posgrado.com` / `Asesor123!`
- **Asesor 2**: `maria.lopez@posgrado.com` / `Asesor123!`
