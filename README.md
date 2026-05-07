# Arcade Finance Pro

Financial Management arcade-style app with Levels, Missions, and CRC Currency support. Highly secure and optimized for mobile.

## 🚀 Comenzar (Local)

Para ejecutar este proyecto en tu computadora localmente, sigue estos pasos:

1. **Clonar el repositorio** (desde GitHub después de exportarlo).
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Configurar Variables de Entorno**:
   - Copia `.env.example` a `.env`.
   - Asegúrate de tener los valores necesarios para Firebase si lo usas externamente.
4. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

## 🛠️ Tecnologías

- **Frontend**: React + Vite + Tailwind CSS
- **Backend/Base de Datos**: Firebase (Firestore & Auth)
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## 📦 Despliegue de forma Gratuita

Si quieres subir esta app a un servidor gratuito después de exportarla a GitHub, te recomendamos:

## 🚀 Despliegue en Vercel (Paso a Paso)

He preparado el archivo `vercel.json` para que tu aplicación funcione perfectamente. Sigue estos pasos para subirla:

### 1. Exportar a GitHub
1. Haz clic en el ícono de **Configuración** (la tuerca ⚙️).
2. Selecciona **Export to GitHub**.
3. Sigue las instrucciones para crear un nuevo repositorio en tu cuenta de GitHub.

### 2. Conectar con Vercel o Netlify (Gratis)
Puedes elegir cualquiera de los dos, ambos son excelentes.

#### Opción A: Vercel
1. Ve a [Vercel](https://vercel.com/) e inicia sesión con GitHub.
2. Importa tu repositorio.
3. Vercel usará el archivo `vercel.json` que ya he configurado.

#### Opción B: Netlify
1. Ve a [Netlify](https://www.netlify.com/) e inicia sesión con GitHub.
2. Haz clic en **"Add new site"** > **"Import an existing project"**.
3. Selecciona tu repositorio.
4. Netlify usará el archivo `netlify.toml` que acabo de crear.

### 3. Configuración Crítica: Firebase
**IMPORTANTE:** Aunque tu app esté en Netlify/Vercel, los datos y usuarios siguen viviendo en **Firebase**.
1. En el panel de control de Netlify/Vercel, busca la sección de **"Environment Variables"**.
2. Debes agregar todas las variables que están en tu `.env.example`.
3. Esto permite que la app desplegada se conecte a tu base de datos de Firebase de forma segura.

### 4. ¡Listo!
Haz clic en **"Deploy"**. Tu app financiera tipo arcade ya estará disponible para todo el mundo.

## 📱 Google Play Store (Android)

He optimizado la app para que puedas subirla a la Play Store usando **Trusted Web Activities (TWA)**.

### Paso 1: Instalar Bubblewrap
En tu computadora local:
```bash
npm install -g @bubblewrap/cli
```

### Paso 2: Generar APK/AAB con PWABuilder
1. Entra en [PWABuilder](https://www.pwabuilder.com/).
2. Introduce la URL de tu app en Netlify.
3. Haz clic en **"Package for Stores"** y selecciona **"Android"**.
4. **IMPORTANTE:** En las opciones de Android, cambia el "Package ID" a `com.arcadepro.app`.
5. En la sección de **"Firma de clave" (Signing Key)**, elige **"Nuevo"**.
6. Descarga el archivo `.zip`.
7. **SOLUCIÓN AL ERROR DE ANÁLISIS:** Dentro del ZIP verás dos archivos APK: `xxxx-unsigned.apk` y otro que NO dice "unsigned". **Instala el que NO dice "unsigned"**. El que dice "unsigned" no tiene firma de seguridad y Android lo bloquea siempre.

**NOTA:** He simplificado el archivo `manifest.json` para que sea 100% compatible con todos los teléfonos Android. Reintenta el proceso en PWABuilder.

### Paso 3: Subir a Google Play Console
- Ve a [Google Play Console](https://play.google.com/console).
- Sube el archivo `app-release-signed.aab` que generó el paso anterior.
- **Privacidad**: Recuerda que esta app es offline y usa SQLite (IndexedDB) internamente. Indica en el formulario de seguridad de datos que no recolectas información en servidores externos.

### ¿Por qué he añadido un `vercel.json`?
He configurado un sistema de "rewrites". Esto es necesario para que, si el usuario recarga la página estando en `/dashboard` o `/calendar`, Vercel sepa que debe cargar el `index.html` y dejar que React maneje la ruta, en lugar de dar un error 404.

### 2. GitHub Pages
- Es gratuito, pero requiere configuración adicional para el manejo de rutas (SPA) y suele ser más complejo para aplicaciones con Firebase.

### 3. Firebase Hosting
- Ya que usas Firebase, puedes usar el hosting de Firebase que tiene un nivel gratuito muy generoso. Solo necesitas instalar `firebase-tools` y ejecutar `firebase deploy`.

## 📤 Cómo Exportar a GitHub desde AI Studio

1. Haz clic en el ícono de **Configuración** (tuerca) en la esquina inferior izquierda/derecha de la interfaz de AI Studio.
2. Selecciona **Export to GitHub**.
3. Sigue los pasos para conectar tu cuenta y crear el repositorio.
