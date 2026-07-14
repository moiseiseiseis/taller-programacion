# Comunidad y LMS - TDPPNP

Plataforma educativa interactiva construida para gestionar módulos, foros de comunidad y eventos en vivo, con separación de roles (Estudiantes e Instructores).

## Tecnologías Principales
* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Iconos:** [Lucide React](https://lucide.dev/)
* **Base de Datos y Auth:** [Supabase](https://supabase.com/)

## Instalación Local

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd taller-programacion
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**

   Copiá `.env.example`, renombralo a `.env.local` y completá tus credenciales de Supabase (`Project Settings → API` en el dashboard):
   ```bash
   cp .env.example .env.local
   ```

4. **Levantar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000) para ver el resultado.
