# 🚀 Galaxy Defender

Un videojuego de defensa espacial desarrollado con Canvas 2D API, Bootstrap 5 y JavaScript vanilla.

## 📁 Estructura del Proyecto

```
galaxy-defender/
├── index.html              # Página principal
├── favicon.svg             # Favicon del juego
├── README.md               # Este archivo
├── assets/
│   └── images/
│       ├── bg-space.jpg         # Fondo espacial estrellado
│       ├── asteroid.png         # Sprite de asteroide
│       ├── enemy-ship.png       # Sprite de nave enemiga
│       └── bonus-star.png       # Sprite de estrella bonus
│       
├── css/
│   └── style.css           # Estilos personalizados
└── js/
    ├── game.js             # Lógica principal del juego
    ├── objects.js          # Clases de objetos del juego
    └── ui.js               # Manejo de interfaz/score
```

## 🎮 Cómo Jugar

1. Haz clic en **"¡INICIAR MISIÓN!"** para comenzar
2. **Apunta y haz clic** sobre los asteroides y naves enemigas para destruirlos
3. Los objetos se mueven y aparecen de forma aleatoria
4. Cada nivel aumenta la velocidad y cantidad de objetos
5. ¡Acumula el mayor puntaje posible!

## ⭐ Sistema de Puntuación

| Objeto          | Puntos |
|-----------------|--------|
| Asteroide       | +10    |
| Nave Enemiga    | +25    |
| Estrella Bonus  | +50    |

## 🛠️ Tecnologías

- **Canvas 2D API** — renderizado del juego
- **Bootstrap 5.3** — layout y componentes UI
- **JavaScript ES6+** — lógica del juego con clases
- **Google Fonts** — tipografía Orbitron + Rajdhani

## 👨‍💻 Desarrollador

**Pedro Said Otero** — Desarrollo Web  
Curso: Programación Web Avanzada

## 🖼️ Imágenes Requeridas

Coloca estas imágenes en `assets/images/`:

| Archivo             | Tipo sugerido  | Dónde buscar                          |
|---------------------|----------------|---------------------------------------|
| `bg-space.jpg`      | JPEG 1920×1080 | NASA Image Gallery / Unsplash "space" |
| `asteroid.png`      | PNG fondo transparente | OpenGameArt.org / itch.io "asteroid sprite" |
| `enemy-ship.png`    | PNG fondo transparente | OpenGameArt.org "spaceship sprite"    |
| `bonus-star.png`    | PNG fondo transparente | OpenGameArt.org "star collectible"    |
