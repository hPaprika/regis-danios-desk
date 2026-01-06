# Configuración de Email de Confirmación - Supabase

## Instrucciones para configurar el email de confirmación

### 1. Acceder a la configuración de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Email Templates**
3. Selecciona **Confirm signup**

### 2. Plantilla HTML para el Email de Confirmación

Reemplaza el contenido de la plantilla con el siguiente código HTML:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu cuenta - RegisBags</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background-color: #ffffff;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 24px;
      color: #667eea;
      margin-bottom: 16px;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1a1a1a;
      font-size: 24px;
      margin: 0 0 16px 0;
      font-weight: 600;
    }
    .content p {
      color: #666666;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .button-container {
      text-align: center;
      margin: 32px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #555555;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      color: #999999;
      font-size: 13px;
      margin: 4px 0;
    }
    .divider {
      height: 1px;
      background-color: #e0e0e0;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">RD</div>
      <h1>RegisBags</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2>¡Bienvenido a RegisBags! 🎉</h2>
      <p>
        Gracias por registrarte en nuestro sistema de administración de maletas dañadas.
        Para completar tu registro y acceder a la plataforma, necesitamos que confirmes tu dirección de correo electrónico.
      </p>

      <div class="button-container">
        <a href="{{ .ConfirmationURL }}" class="button">
          Confirmar mi correo electrónico
        </a>
      </div>

      <div class="info-box">
        <p>
          <strong>⏱️ Importante:</strong> Este enlace expirará en 24 horas por razones de seguridad.
          Si no solicitaste esta cuenta, puedes ignorar este correo de forma segura.
        </p>
      </div>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #888888;">
        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
      </p>
      <p style="font-size: 13px; color: #667eea; word-break: break-all;">
        {{ .ConfirmationURL }}
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>RegisBags</strong></p>
      <p>Sistema de administración de maletas dañadas</p>
      <p>Talma Servicios Aeroportuarios</p>
      <p style="margin-top: 16px; font-size: 12px;">
        © 2026 RegisBags. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
```

### 3. Configurar la URL de redirección

En la configuración de Supabase:

1. Ve a **Authentication** → **URL Configuration**
2. En **Site URL**, asegúrate de tener tu URL de producción (ej: `https://tu-dominio.com`)
3. En **Redirect URLs**, agrega:
   - `http://localhost:5173/auth/confirm` (para desarrollo)
   - `https://tu-dominio.com/auth/confirm` (para producción)

### 4. Verificar configuración de Email

1. Ve a **Project Settings** → **Auth**
2. Asegúrate de que **Enable email confirmations** esté activado
3. Verifica que el proveedor de email esté configurado correctamente

### 5. Probar el flujo

1. Registra un nuevo usuario en tu aplicación
2. Revisa el correo de confirmación
3. Haz clic en el botón de confirmación
4. Deberías ser redirigido a `/auth/confirm` y luego a `/login`

## Características del Email

✅ **Diseño moderno y profesional**
- Gradiente atractivo en el header
- Logo de la aplicación
- Diseño responsive para móviles

✅ **Información clara**
- Mensaje de bienvenida
- Botón de confirmación destacado
- Enlace alternativo por si el botón no funciona

✅ **Seguridad**
- Advertencia sobre la expiración del enlace
- Nota sobre ignorar el correo si no fue solicitado

✅ **Branding**
- Colores consistentes con la aplicación
- Footer con información de la empresa
