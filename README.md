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

### 2. Conectar con Vercel
1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en el botón **"Add New"** y luego en **"Project"**.
3. Busca el repositorio que acabas de exportar y haz clic en **"Import"**.

### 3. Configuración en Vercel
- **Framework Preset**: Vercel detectará automáticamente que es **Vite**.
- **Build and Output Settings**: No necesitas cambiar nada; por defecto usará `npm run build` y la carpeta `dist`.
- **Environment Variables**: Si has configurado Firebase, asegúrate de copiar todas las variables de tu archivo `.env` aquí.

### 4. ¡Listo!
Haz clic en **"Deploy"**. En un par de minutos, tu app estará en vivo con una URL gratuita (ej: `arcade-finance.vercel.app`).

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
