# 🌋 CARTAGO RESILIENTE

**Experiencia Visual 3D Interactiva** - Visualización épica de la historia sísmica de Cartago, Colombia

![Cartago Resiliente](https://img.shields.io/badge/Resiliencia-LEGENDARIA-purple?style=for-the-badge)
![Sismos](https://img.shields.io/badge/Sismos-255-blue?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-3D-green?style=for-the-badge)

## 🎯 Descripción

**CARTAGO RESILIENTE** es una experiencia visual interactiva que transforma 30 años de datos sísmicos (1994-2024) en una obra de arte 3D. Cartago aparece como un planeta flotante en el espacio, donde cada sismo se visualiza como una explosión de energía con partículas brillantes.

**"Cartago se mueve pero no se cae"** 💪

## ✨ Características Principales

### 🎨 Visualización 3D
- **Planeta Cartago**: Orbe 3D flotante con anillo de energía
- **Skybox Espacial**: 10,000 estrellas de fondo
- **255 Sismos**: Cada uno visualizado con explosiones de partículas
- **Color por Profundidad**:
  - 🔴 **Rojo** (< 20km): Sismos superficiales - erupciones de lava
  - 🟠 **Naranja** (20-60km): Sismos medios
  - 🔵 **Azul** (> 60km): Sismos profundos - implosiones frías
- **Tamaño por Magnitud**: De 0.6 a 3.4 Mi

### 🎭 4 Modos de Visualización

1. **🔍 MODO EXPLORADOR** (Tecla `1`)
   - Vista libre para explorar a tu ritmo
   - Click y arrastra para rotar
   - Zoom con scroll

2. **📖 MODO HISTORIA** (Tecla `2`)
   - Animación cronológica de sismos
   - Cámara cinematográfica automática
   - Revive 30 años en segundos

3. **💥 MODO CAOS** (Tecla `3`)
   - Todos los sismos pulsando simultáneamente
   - Explosiones aleatorias
   - Visualiza la actividad total

4. **☄️ MODO LLUVIA** (Tecla `4`)
   - Sismos caen del cielo como meteoritos
   - Velocidad según magnitud
   - Explosión al impactar

### 🎮 Interactividad

| Acción | Efecto |
|--------|--------|
| **Hover** | El sismo crece y brilla con efecto "wow" |
| **Click** | Explosión de confetti con datos (fecha, hora, magnitud, profundidad) |
| **Doble Click** | Zoom dramático con slow-motion |
| **Teclas 1-4** | Cambiar entre modos de visualización |
| **Shake del Mouse** | Simula un terremoto en pantalla 🌪️ |
| **Touch/Arrastrar** | Rotar planeta (móvil y escritorio) |
| **Scroll** | Zoom in/out |

### 🏆 Easter Eggs & Achievements

- **Sismólogo Pro**: Clickea 10 sismos seguidos 🎓
- **Terremoto Simulado**: Sacude el mouse rápidamente 🌪️
- **Datos Curiosos**: Cambian cada 10 segundos en el panel

### 🖥️ Panel de Control

Interfaz estilo "sala de control" con:
- ✅ Contador animado de sismos (255 eventos)
- ✅ Badge "Cartago Inquebrantable"
- ✅ Sismómetro visual en tiempo real
- ✅ Frases motivadoras rotativas
- ✅ Datos curiosos sobre la resiliencia sísmica
- ✅ Selector de modos con descripciones
- ✅ Instrucciones de controles

## 🚀 Cómo Usar

### ⚡ Sin Instalación (Recomendado)

```bash
# Servidor local simple con Python
python3 -m http.server 8000

# O con Node.js
npx serve

# Luego abre: http://localhost:8000
```

**IMPORTANTE**: Debe ejecutarse desde un servidor local (no file://) para que funcione la carga del CSV.

### 🎯 Estructura del Proyecto

```
cartago-seismic-viewer/
├── index.html          # HTML principal con imports
├── app.js             # Aplicación Three.js (ES6 modules)
├── styles.css         # Estilos modernos con glassmorphism
├── public/
│   └── sismos_cartago.csv  # Datos sísmicos
└── README.md          # Este archivo
```

## 📊 Datos

El proyecto incluye `sismos_cartago.csv` con 255 sismos registrados:
- **Periodo**: 1994-2024 (30 años)
- **Ubicación**: Cartago, Valle del Cauca, Colombia
- **Magnitudes**: 0.6 - 3.4 Mi
- **Profundidades**: 0 - 149.7 km

### Columnas del CSV
- ID, FECHA, HORA_UTC, LATITUD, LONGITUD
- PROFUNDIDAD_KM, MAGNITUD_MI
- DEPARTAMENTO, MUNICIPIO
- CANTIDAD, DÍA, MES

## 🛠️ Tecnologías

- **[Three.js](https://threejs.org/) v0.160** - Renderizado 3D avanzado desde CDN
- **ES6 Modules** - JavaScript moderno y modular
- **OrbitControls** - Controles de cámara suaves
- **EffectComposer** - Post-procesamiento con Bloom
- **Custom CSS3** - Diseño con glassmorphism y gradientes
- **Google Fonts (Orbitron + Inter)** - Tipografía moderna

## 🎨 Diseño

- **Glassmorphism**: Paneles con efecto de vidrio esmerilado y blur
- **Gradientes Épicos**: Colores púrpura (#667eea) → rosa (#f093fb)
- **Bloom Effect**: Post-procesamiento con UnrealBloomPass
- **Animaciones Suaves**: Easing cubic-bezier personalizado
- **Neon Glow**: Efectos de brillo neón en textos
- **Responsive**: Optimizado para móvil y escritorio
- **Tipografía Moderna**: Orbitron (títulos) + Inter (texto)

## 📱 Compatibilidad

- ✅ Chrome/Edge (Recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS/Android)
- ✅ Tablets

**Requisitos**: Navegador moderno con soporte WebGL

## 🎯 Objetivo

Que la gente diga **"WOW, ¿cómo hiciste eso?"**

Esta visualización es:
- ✅ Profesional pero DIVERTIDA
- ✅ Educativa e IMPACTANTE
- ✅ Memorable e INTERACTIVA
- ✅ Un homenaje a la resiliencia de Cartago

## 🤝 Contribuir

¿Ideas para mejorar la experiencia? ¡Abre un issue o pull request!

## 📜 Licencia

Este proyecto celebra la resiliencia de Cartago y está disponible para uso educativo.

---

**Hecho con 💜 para Cartago, Valle del Cauca, Colombia**

*"30 años de datos sísmicos, 30 años de resiliencia"*