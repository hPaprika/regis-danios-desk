# 📘 Manual de Usuario - RegisBags

## Sistema de Gestión de Maletas Dañadas
**Talma Servicios Aeroportuarios**

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel Principal (Dashboard)](#panel-principal-dashboard)
4. [Módulo Counter](#módulo-counter)
5. [Módulo Siberia](#módulo-siberia)
6. [Generación de Reportes](#generación-de-reportes)
7. [Preguntas Frecuentes](#preguntas-frecuentes)
8. [Soporte Técnico](#soporte-técnico)

---

## 🎯 Introducción

### ¿Qué es RegisBags?

**RegisBags** es un sistema web integral diseñado para la gestión y seguimiento de maletas dañadas en operaciones aeroportuarias. El sistema permite registrar, consultar, analizar y generar reportes sobre incidencias de equipaje dañado.

### Características Principales

- ✅ **Registro de daños en Counter**: Documentación detallada de maletas dañadas con categorización
- 📸 **Registro de casos severos (Siberia)**: Casos críticos con evidencia fotográfica
- 📊 **Dashboard analítico**: Visualización de estadísticas y tendencias en tiempo real
- 📄 **Generación de reportes**: Exportación de datos en formato PDF
- 📧 **Envío de reportes por email**: Distribución automática de informes
- 🔐 **Autenticación segura**: Control de acceso mediante credenciales
- 📱 **Diseño responsivo**: Acceso desde cualquier dispositivo

### Usuarios del Sistema

El sistema está diseñado para:
- Personal de Counter
- Supervisores de turno
- Gerentes de operaciones
- Personal de calidad

---

## 🔐 Acceso al Sistema

### Inicio de Sesión

1. **Abrir el navegador web** (Chrome, Firefox, Edge o Safari)
2. **Navegar a la URL del sistema** proporcionada por su administrador
3. **Ingresar credenciales**:
   - **Correo Electrónico**: Su email corporativo
   - **Contraseña**: Contraseña asignada

4. **Hacer clic en "Iniciar Sesión"**

![Pantalla de Login](docs/login-screen.png)

### Funcionalidades de la Pantalla de Login

- **Mostrar/Ocultar contraseña**: Haga clic en el ícono del ojo para visualizar su contraseña
- **Mensajes de error**: Si las credenciales son incorrectas, aparecerá un mensaje de error en rojo
- **Indicador de carga**: Durante el proceso de autenticación verá un indicador giratorio

### Recuperación de Contraseña

Si olvidó su contraseña, contacte al administrador del sistema para solicitar un restablecimiento.

---

## 📊 Panel Principal (Dashboard)

El Dashboard es la página principal del sistema donde puede visualizar estadísticas y métricas clave sobre los daños registrados.

### Modos de Visualización

El Dashboard ofrece tres modos de visualización:

#### 1. **Vista "Hoy"**
- Muestra todos los registros del día actual
- Actualización automática cada 30 segundos
- Ideal para monitoreo en tiempo real

#### 2. **Vista "Últimos 7 días"**
- Presenta datos de la última semana
- Útil para análisis de tendencias semanales

#### 3. **Vista "Mes"**
- Permite seleccionar cualquier mes específico
- Perfecto para reportes mensuales y comparativas

### Tarjetas de Indicadores (KPIs)

El Dashboard presenta 6 tarjetas principales con información clave:

#### 📦 **1. Total Daños**
- **Descripción**: Cantidad total de maletas dañadas en el período seleccionado
- **Incluye**: Registros de Counter + Siberia
- **Actualización**: Tiempo real

#### ✈️ **2. Aerolínea con Más Daños**
- **Descripción**: Aerolínea con mayor cantidad de incidencias
- **Muestra**: Nombre de la aerolínea y cantidad de daños
- **Uso**: Identificar patrones por aerolínea

#### ⚠️ **3. Tipo de Daño Frecuente**
- **Descripción**: Categoría de daño más común
- **Categorías**:
  - **A**: Asa rota
  - **B**: Maleta rota
  - **C**: Rueda rota
- **Muestra**: Tipo y cantidad de casos

#### ✍️ **4. Tasa de Firmas**
- **Descripción**: Porcentaje de registros con firma del pasajero
- **Objetivo**: ≥ 80%
- **Indicador visual**: 
  - ✓ Verde si cumple objetivo
  - ⚠ Amarillo si está por debajo

#### 🕐 **5. Comparativa Turnos**
- **Descripción**: Comparación entre turnos de trabajo
- **Turnos**:
  - **BRC-ERC**: Turno mañana
  - **IRC-KRC**: Turno tarde
- **Muestra**: Turno dominante y cantidades

#### 📸 **6. Casos Severos**
- **Descripción**: Cantidad de registros Siberia (con fotografía)
- **Uso**: Monitorear casos críticos que requieren evidencia visual

### Filtros de Fecha

Puede refinar los datos mostrados usando los filtros de fecha:

1. **Desde**: Fecha de inicio del rango
2. **Hasta**: Fecha de fin del rango
3. **Botón "Restablecer"**: Limpia los filtros aplicados

### Gráficos Analíticos

El Dashboard incluye 4 gráficos interactivos:

#### 📊 **1. Daños por Aerolínea** (Gráfico de Barras)
- **Visualiza**: Distribución de daños por cada aerolínea
- **Colores distintivos**:
  - LATAM: Morado oscuro
  - SKY: Morado medio
  - JET SMART: Azul oscuro
  - AVIANCA: Rojo
- **Interacción**: Haga clic en una barra para filtrar la tabla por esa aerolínea

#### 🥧 **2. Daños por Categoría** (Gráfico Circular)
- **Visualiza**: Proporción de cada tipo de daño
- **Categorías**: A (Asa), B (Maleta), C (Rueda)
- **Interacción**: Haga clic en una sección para filtrar por categoría

#### 📈 **3. Tendencia Temporal** (Gráfico de Líneas)
- **Visualiza**: Evolución de registros en los últimos 7 días
- **Líneas**:
  - Azul: Registros Counter
  - Verde: Registros Siberia
- **Uso**: Identificar picos y tendencias

#### 📊 **4. Daños por Turno y Aerolínea** (Gráfico de Barras Agrupadas)
- **Visualiza**: Comparación de daños por turno, desglosado por aerolínea
- **Turnos**: BRC-ERC (Mañana) vs IRC-KRC (Tarde)
- **Uso**: Análisis cruzado turno-aerolínea

### Tabla de Registros Detallados

Debajo de los gráficos encontrará una tabla completa con todos los registros:

#### Columnas de la Tabla:
- **Código**: Identificador único del equipaje
- **Fuente**: Counter o Siberia
- **Aerolínea**: Compañía aérea (si aplica)
- **Vuelo**: Número de vuelo (si aplica)
- **Categorías**: Tipos de daño (si aplica)
- **Observación**: Notas adicionales
- **Fecha/Hora**: Timestamp del registro
- **Usuario**: Quien registró el incidente
- **Turno**: BRC-ERC o IRC-KRC
- **Firma**: ✓ o ✗
- **Imagen**: 📷 si tiene foto adjunta
- **Acciones**: Menú de opciones

#### Filtros de Tabla:
- **Búsqueda por código**: Campo de texto para buscar códigos específicos
- **Aerolíneas**: Selección múltiple de aerolíneas
- **Categorías**: Filtro por tipo de daño
- **Turnos**: Filtro por turno de trabajo
- **Fuente**: Counter o Siberia
- **Firma**: Todos / Con firma / Sin firma

#### Acciones Disponibles:
- **👁 Ver Detalles**: Abre un modal con información completa del registro
- **✏️ Editar**: Permite modificar el registro
- **🗑️ Eliminar**: Borra el registro (requiere confirmación)

#### Paginación:
- **Registros por página**: 20
- **Navegación**: Botones "Anterior" y "Siguiente"
- **Indicador**: Muestra página actual y total de páginas

---

## 📝 Módulo Counter

El módulo Counter permite gestionar registros de maletas dañadas procesadas en el mostrador.

### Acceso al Módulo

1. Haga clic en **"Counter"** en el menú de navegación lateral
2. Se mostrará la página de gestión de registros Counter

### Visualización de Registros

#### Barra de Búsqueda y Filtros

**Búsqueda por Texto:**
- Ingrese código, aerolínea u observación en el campo de búsqueda
- La búsqueda es en tiempo real (no requiere presionar Enter)
- No distingue mayúsculas de minúsculas

**Filtro por Fecha:**
- Seleccione una fecha específica del calendario
- Solo se mostrarán registros de esa fecha
- Botón "Limpiar" para remover el filtro

#### Tabla de Registros

La tabla muestra los siguientes campos:

1. **Código**: Identificador del equipaje (formato alfanumérico)
2. **Aerolínea**: Compañía aérea responsable
3. **Categorías**: Badges de colores indicando tipos de daño:
   - 🔴 **A** (Rojo): Asa rota
   - 🔵 **B** (Azul): Maleta rota
   - 🟢 **C** (Verde): Rueda rota
4. **Observación**: Descripción adicional del daño
5. **Fecha/Hora**: Timestamp del registro
6. **Usuario**: Nombre del operador que registró
7. **Turno**: BRC-ERC o IRC-KRC
8. **Firma**: 
   - ✓ (Verde): Pasajero firmó
   - ✗ (Gris): Sin firma
9. **Acciones**: Menú desplegable con opciones

### Acciones sobre Registros

#### ✏️ Editar Registro

1. Haga clic en el menú de acciones (⋮) del registro
2. Seleccione **"Editar"**
3. Se abrirá un modal con los campos editables:
   - Código
   - Aerolínea (selector desplegable)
   - Categorías (selección múltiple)
   - Observación (campo de texto)
   - Fecha y hora
   - Usuario
   - Turno (selector)
   - Firma (checkbox)
4. Modifique los campos necesarios
5. Haga clic en **"Guardar"** para confirmar o **"Cancelar"** para descartar

**Validaciones:**
- El código es obligatorio
- La aerolínea debe seleccionarse de la lista
- Al menos una categoría debe estar seleccionada
- La fecha no puede ser futura

#### 🗑️ Eliminar Registro

1. Haga clic en el menú de acciones (⋮)
2. Seleccione **"Eliminar"**
3. Aparecerá un diálogo de confirmación
4. Lea el mensaje: "¿Estás seguro de que deseas eliminar el registro [CÓDIGO]? Esta acción no se puede deshacer."
5. Haga clic en **"Confirmar"** para eliminar o **"Cancelar"** para abortar

⚠️ **Advertencia**: La eliminación es permanente y no se puede revertir.

### Paginación

- **Registros por página**: 10
- **Navegación**: Use los botones "Anterior" y "Siguiente"
- **Contador**: Muestra "Mostrando X - Y de Z registros"
- **Comportamiento**: Al aplicar filtros, la paginación se reinicia a la página 1

### Actualización Automática

- Los datos se actualizan automáticamente cada **5 segundos**
- No es necesario recargar la página manualmente
- Durante la actualización, los datos se mantienen visibles (sin parpadeo)

---

## 📸 Módulo Siberia

El módulo Siberia gestiona casos severos de equipaje dañado que requieren evidencia fotográfica.

### Acceso al Módulo

1. Haga clic en **"Siberia"** en el menú de navegación lateral
2. Se mostrará la página de gestión de registros Siberia

### Características Especiales

A diferencia del módulo Counter, Siberia:
- **Requiere fotografía obligatoria** de la maleta dañada
- Se usa para **casos críticos o severos**
- Incluye **número de vuelo** en lugar de aerolínea
- **No usa categorías** de daño (A, B, C)

### Visualización de Registros

#### Barra de Búsqueda y Filtros

**Búsqueda por Texto:**
- Busque por código de equipaje o número de vuelo
- Búsqueda en tiempo real
- No sensible a mayúsculas/minúsculas

**Filtro por Fecha:**
- Seleccione una fecha del calendario
- Filtra registros de esa fecha específica
- Botón "Limpiar" para remover filtro

#### Tabla de Registros

Columnas de la tabla:

1. **Código**: Identificador del equipaje
2. **Vuelo**: Número de vuelo asociado
3. **Fecha/Hora**: Timestamp del registro
4. **Usuario**: Operador que registró el caso
5. **Firma**: Indicador ✓ o ✗
6. **Imagen**: Miniatura de la fotografía adjunta
7. **Acciones**: Menú de opciones

### Acciones sobre Registros

#### 👁️ Ver Imagen

1. Haga clic en la miniatura de la imagen en la tabla
   **O**
2. Use el menú de acciones (⋮) y seleccione **"Ver Imagen"**

Se abrirá un modal con:
- **Imagen en tamaño completo**
- **Información del registro**:
  - Código
  - Vuelo
  - Fecha y hora
  - Usuario
- **Botones**:
  - **Descargar**: Guarda la imagen en su dispositivo
  - **Cerrar**: Cierra el modal

**Funcionalidades del visor:**
- Zoom con la rueda del mouse
- Arrastrar para mover la imagen
- Doble clic para zoom rápido

#### ✏️ Editar Registro

1. Abra el menú de acciones (⋮)
2. Seleccione **"Editar"**
3. Modal de edición con campos:
   - Código (texto)
   - Vuelo (texto)
   - Fecha y hora (selector)
   - Firma (checkbox)
   - Usuario (texto)
4. Modifique los campos necesarios
5. **"Guardar"** para confirmar o **"Cancelar"** para descartar

**Nota**: La imagen no puede modificarse después del registro inicial.

#### 🗑️ Eliminar Registro

1. Menú de acciones (⋮) → **"Eliminar"**
2. Confirme en el diálogo
3. El registro y la imagen asociada se eliminarán permanentemente

⚠️ **Importante**: Al eliminar un registro Siberia, la fotografía también se elimina del almacenamiento.

### Paginación y Actualización

- **Registros por página**: 10
- **Actualización automática**: Cada 5 segundos
- **Navegación**: Botones "Anterior" y "Siguiente"

---

## 📄 Generación de Reportes

El módulo de Reportes permite crear, visualizar y distribuir informes sobre los daños registrados.

### Acceso al Módulo

1. Haga clic en **"Reportes"** en el menú de navegación lateral
2. Se mostrará la página de generación de reportes

### Configuración del Reporte

#### Paso 1: Seleccionar Tipo de Período

Elija uno de los siguientes tipos:

**📅 Diario**
- Genera reporte de un día específico
- Seleccione la fecha en el calendario

**📅 Semanal**
- Reporte de una semana completa
- Seleccione el año y número de semana (1-52)

**📅 Mensual**
- Reporte de un mes completo
- Seleccione año y mes

**📅 Anual**
- Reporte de todo un año
- Seleccione el año

#### Paso 2: Seleccionar Período Específico

Según el tipo elegido, aparecerá el selector correspondiente:
- **Diario**: Calendario de fecha
- **Semanal**: Selectores de año y semana
- **Mensual**: Selector de mes y año
- **Anual**: Selector de año

#### Paso 3: Generar Reporte

1. Haga clic en el botón **"Generar Reporte"**
2. El sistema procesará los datos (puede tomar unos segundos)
3. Se mostrará una vista previa del reporte

### Contenido del Reporte

El reporte generado incluye:

#### Encabezado
- **Logo de Talma**
- **Título**: "Reporte de Maletas Dañadas"
- **Período**: Rango de fechas del reporte
- **Fecha de generación**: Timestamp de creación

#### Resumen Ejecutivo

**Estadísticas Generales:**
- 📦 Total de daños registrados
- ✈️ Aerolínea con más incidencias
- ⚠️ Categoría de daño más frecuente
- ✍️ Tasa de firmas (porcentaje)
- 🕐 Comparativa entre turnos
- 📸 Cantidad de casos Siberia

#### Gráficos

**1. Daños por Aerolínea** (Gráfico de Barras)
- Distribución de incidencias por compañía aérea
- Colores corporativos de cada aerolínea

**2. Daños por Categoría** (Gráfico Circular)
- Proporción de cada tipo de daño
- Leyenda con cantidades y porcentajes

**3. Tendencia Temporal** (Gráfico de Líneas)
- Evolución diaria de registros
- Líneas separadas para Counter y Siberia

#### Tabla Detallada

Listado completo de todos los registros del período:
- Código
- Fuente (Counter/Siberia)
- Aerolínea/Vuelo
- Categorías
- Fecha y hora
- Usuario
- Turno
- Firma

#### Pie de Página
- Número de página
- Fecha y hora de generación
- Marca de agua "Talma Servicios Aeroportuarios"

### Acciones sobre el Reporte

Una vez generado el reporte, dispone de tres opciones:

#### 🖨️ Imprimir

1. Haga clic en el botón **"Imprimir"**
2. Se abrirá el diálogo de impresión del navegador
3. Configure las opciones:
   - Impresora (física o PDF)
   - Orientación: Vertical
   - Tamaño: A4
   - Márgenes: Normales
4. Haga clic en **"Imprimir"**

**Recomendaciones de impresión:**
- Use orientación vertical para mejor legibilidad
- Active "Gráficos de fondo" para imprimir colores
- Para reportes largos, considere impresión a doble cara

#### 📥 Descargar PDF

1. Haga clic en el botón **"Descargar PDF"**
2. El archivo se generará automáticamente
3. Se descargará con el nombre: `Reporte_Maletas_Danadas_[PERÍODO].pdf`
4. Guarde el archivo en la ubicación deseada

**Características del PDF:**
- Formato A4
- Resolución alta (300 DPI)
- Optimizado para impresión
- Tamaño típico: 500KB - 2MB (según cantidad de datos)

#### 📧 Enviar por Email

1. Haga clic en el botón **"Enviar por Email"**
2. Se abrirá un modal con un formulario
3. Ingrese la **dirección de email del destinatario**
4. (Opcional) Agregue destinatarios adicionales separados por comas
5. Haga clic en **"Enviar"**

**Proceso de envío:**
- El sistema genera el PDF automáticamente
- Se envía un email con:
  - **Asunto**: "Reporte de Maletas Dañadas - [PERÍODO]"
  - **Cuerpo**: Resumen ejecutivo en texto
  - **Adjunto**: PDF completo del reporte
- Recibirá una confirmación cuando el envío sea exitoso

**Validaciones:**
- El email debe tener formato válido (ejemplo@dominio.com)
- Se pueden enviar a múltiples destinatarios
- El tamaño del PDF no debe exceder 10MB

### Interpretación de Datos

#### Indicadores Clave

**Tasa de Firmas:**
- **≥ 80%**: ✅ Excelente - Cumple objetivo de calidad
- **60-79%**: ⚠️ Aceptable - Requiere atención
- **< 60%**: ❌ Crítico - Acción inmediata necesaria

**Distribución por Aerolínea:**
- Identifique aerolíneas con mayor incidencia
- Compare con volumen de vuelos para contexto
- Use para negociaciones y mejoras de proceso

**Tendencia Temporal:**
- **Picos**: Identifique días con mayor actividad
- **Valles**: Analice días de baja incidencia
- **Tendencia**: Ascendente, descendente o estable

**Comparativa de Turnos:**
- Evalúe desempeño entre turnos
- Identifique necesidades de capacitación
- Optimice asignación de recursos

### Casos de Uso Comunes

#### Reporte Diario (Operativo)
- **Cuándo**: Al final de cada día
- **Para**: Supervisores de turno
- **Objetivo**: Monitoreo operativo diario

#### Reporte Semanal (Táctico)
- **Cuándo**: Lunes de cada semana
- **Para**: Jefes de área
- **Objetivo**: Análisis de tendencias semanales

#### Reporte Mensual (Estratégico)
- **Cuándo**: Primeros días del mes
- **Para**: Gerencia
- **Objetivo**: Evaluación de KPIs y toma de decisiones

#### Reporte Anual (Ejecutivo)
- **Cuándo**: Enero (año anterior)
- **Para**: Dirección ejecutiva
- **Objetivo**: Planificación estratégica anual

---

## ❓ Preguntas Frecuentes

### Generales

**P: ¿Puedo acceder al sistema desde mi celular?**
R: Sí, el sistema es completamente responsivo y funciona en smartphones y tablets.

**P: ¿Los datos se guardan automáticamente?**
R: Sí, todos los cambios se guardan inmediatamente en la base de datos.

**P: ¿Puedo trabajar sin conexión a internet?**
R: No, el sistema requiere conexión a internet para funcionar.

**P: ¿Cuánto tiempo se conservan los registros?**
R: Los registros se conservan indefinidamente en la base de datos.

### Dashboard

**P: ¿Con qué frecuencia se actualizan los datos del Dashboard?**
R: Los datos se actualizan automáticamente cada 30 segundos.

**P: ¿Puedo exportar los gráficos?**
R: Los gráficos se pueden exportar como parte del reporte PDF.

**P: ¿Qué significa "casos severos"?**
R: Son registros Siberia que requieren evidencia fotográfica por la gravedad del daño.

### Módulo Counter

**P: ¿Puedo registrar múltiples categorías en un mismo daño?**
R: Sí, puede seleccionar A, B, C o cualquier combinación.

**P: ¿Es obligatorio que el pasajero firme?**
R: Se recomienda obtener la firma, pero no es obligatorio en el sistema.

**P: ¿Puedo modificar un registro después de crearlo?**
R: Sí, use la opción "Editar" en el menú de acciones.

### Módulo Siberia

**P: ¿Qué tipo de imágenes puedo subir?**
R: JPG, PNG, WEBP. Tamaño máximo recomendado: 5MB.

**P: ¿Puedo tomar la foto directamente con la cámara?**
R: Sí, en dispositivos móviles puede usar la cámara directamente.

**P: ¿Puedo cambiar la foto después de subirla?**
R: No, la imagen no puede modificarse. Debe eliminar el registro y crear uno nuevo.

### Reportes

**P: ¿Cuánto tiempo tarda en generarse un reporte?**
R: Depende de la cantidad de datos:
- Diario: 2-5 segundos
- Mensual: 5-15 segundos
- Anual: 15-30 segundos

**P: ¿Puedo programar envíos automáticos de reportes?**
R: Actualmente no. Los reportes deben generarse y enviarse manualmente.

**P: ¿El PDF incluye las imágenes de Siberia?**
R: No, el PDF incluye solo datos tabulares y gráficos estadísticos.

### Seguridad

**P: ¿Puedo compartir mi contraseña con compañeros?**
R: No, cada usuario debe tener sus propias credenciales.

**P: ¿Cuánto tiempo dura mi sesión?**
R: La sesión permanece activa mientras use el sistema. Se cierra al cerrar el navegador.

**P: ¿Qué hago si olvidé mi contraseña?**
R: Contacte al administrador del sistema para restablecerla.

---

## 🛠️ Soporte Técnico

### Problemas Comunes y Soluciones

#### "No puedo iniciar sesión"

**Posibles causas y soluciones:**

1. **Credenciales incorrectas**
   - Verifique que el email esté escrito correctamente
   - Asegúrese de que Bloq Mayús esté desactivado
   - Intente restablecer su contraseña

2. **Sin conexión a internet**
   - Verifique su conexión WiFi o datos móviles
   - Intente abrir otra página web para confirmar conectividad

3. **Navegador desactualizado**
   - Actualice su navegador a la última versión
   - Pruebe con otro navegador (Chrome, Firefox, Edge)

#### "Los datos no se cargan"

**Soluciones:**

1. **Recargar la página**
   - Presione F5 o Ctrl+R (Cmd+R en Mac)
   - Espere unos segundos para que carguen los datos

2. **Limpiar caché del navegador**
   - Chrome: Ctrl+Shift+Supr → Seleccione "Imágenes y archivos en caché"
   - Firefox: Ctrl+Shift+Supr → Marque "Caché"

3. **Verificar conexión**
   - Asegúrese de tener conexión estable a internet
   - Si usa WiFi, intente acercarse al router

#### "El reporte no se genera"

**Soluciones:**

1. **Verificar período seleccionado**
   - Asegúrese de haber seleccionado un período válido
   - Verifique que existan datos en ese período

2. **Esperar más tiempo**
   - Reportes grandes pueden tardar hasta 30 segundos
   - No cierre la ventana durante la generación

3. **Intentar con período más corto**
   - Si el reporte anual falla, intente por meses
   - Reduzca el rango de fechas

#### "La imagen no se sube (Siberia)"

**Soluciones:**

1. **Verificar tamaño del archivo**
   - Máximo recomendado: 5MB
   - Comprima la imagen si es muy grande

2. **Verificar formato**
   - Use JPG, PNG o WEBP
   - Evite formatos como BMP, TIFF, GIF

3. **Verificar conexión**
   - Imágenes grandes requieren buena conexión
   - Intente con WiFi en lugar de datos móviles

### Contacto de Soporte

Si los problemas persisten, contacte al equipo de soporte:

**📧 Email**: soporte.regisdanos@talma.com.pe  
**📞 Teléfono**: +51 (01) XXX-XXXX  
**🕐 Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM  

**Al contactar, proporcione:**
- Descripción detallada del problema
- Capturas de pantalla (si es posible)
- Navegador y versión que está usando
- Pasos para reproducir el error

### Navegadores Recomendados

Para una experiencia óptima, use:

- ✅ **Google Chrome** (versión 90 o superior)
- ✅ **Mozilla Firefox** (versión 88 o superior)
- ✅ **Microsoft Edge** (versión 90 o superior)
- ✅ **Safari** (versión 14 o superior)

⚠️ **No recomendado**: Internet Explorer

### Requisitos del Sistema

**Computadora:**
- Procesador: Intel Core i3 o equivalente
- RAM: 4GB mínimo
- Conexión: 5 Mbps mínimo

**Móvil/Tablet:**
- Android 8.0+ o iOS 12+
- 2GB RAM mínimo
- Conexión: 3G/4G/5G o WiFi

---

## 📚 Glosario de Términos

**Aerolínea**: Compañía aérea responsable del vuelo y equipaje.

**Badge**: Etiqueta visual de color que indica una categoría o estado.

**Counter**: Mostrador de atención donde se registran daños estándar.

**Dashboard**: Panel principal con estadísticas y gráficos.

**KPI**: Key Performance Indicator (Indicador Clave de Desempeño).

**Modal**: Ventana emergente sobre la interfaz principal.

**Paginación**: División de datos en múltiples páginas.

**Registro**: Entrada individual de una maleta dañada.

**Siberia**: Módulo para casos severos con evidencia fotográfica.

**Timestamp**: Marca de fecha y hora de un evento.

**Turno**: Período de trabajo (BRC-ERC: Mañana, IRC-KRC: Tarde).

---

## 📝 Notas Finales

### Mejores Prácticas

1. **Registre los daños inmediatamente** después de detectarlos
2. **Sea específico en las observaciones** para facilitar seguimiento
3. **Obtenga la firma del pasajero** siempre que sea posible
4. **Use Siberia solo para casos severos** que requieran evidencia visual
5. **Revise el Dashboard diariamente** para monitorear tendencias
6. **Genere reportes semanales** para análisis continuo

### Actualizaciones del Sistema

Este manual corresponde a la **versión 1.0** del sistema RegisBags.

El sistema se actualiza periódicamente con nuevas funcionalidades. Consulte la sección de "Novedades" en el Dashboard para conocer las últimas actualizaciones.

### Capacitación

Para capacitación adicional o sesiones de entrenamiento, contacte al departamento de Capacitación de Talma.

---

**© 2025 Talma Servicios Aeroportuarios. Todos los derechos reservados.**

*Este manual es confidencial y de uso exclusivo para personal autorizado de Talma.*

---

**Versión del Manual**: 1.0  
**Fecha de Publicación**: Noviembre 2025  
**Última Actualización**: 29/11/2025
