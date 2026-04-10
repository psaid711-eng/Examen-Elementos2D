/* =============================================
   ui.js — Gestión de interfaz y puntuaciones
   Galaxy Defender
   ============================================= */

// NO usar getElementById aquí arriba — el DOM puede no estar listo todavía.
// Todos los accesos al DOM se hacen dentro de cada función.

var UI = (() => {

  const BEST_KEY = 'galaxyDefender_bestScore';
  let bestScore = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);

  // Helpers seguros: obtienen el elemento en el momento de llamar, no al cargar
  function el(id) { return document.getElementById(id); }

  return {

    getBest() { return bestScore; },

    updateScore(score) {
      el('score-val').textContent = score;
    },

    updateBest(score) {
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(BEST_KEY, bestScore);
      }
      el('best-val').textContent = bestScore;
    },

    updateLevel(level) {
      el('level-val').textContent = level;
    },

    updateLives(lives) {
      el('lives-val').textContent = '❤️'.repeat(Math.max(0, lives));
    },

    showStart() {
      el('overlay-start').classList.remove('hidden');
      el('overlay-gameover').classList.add('hidden');
      el('overlay-pause').classList.add('hidden');
      el('best-val').textContent = bestScore;
    },

    hideStart() {
      el('overlay-start').classList.add('hidden');
    },

    showGameOver(score) {
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(BEST_KEY, bestScore);
      }
      el('go-score').textContent = score;
      el('go-best').textContent  = 'RÉCORD: ' + bestScore;
      el('best-val').textContent = bestScore;
      el('overlay-gameover').classList.remove('hidden');
      el('overlay-start').classList.add('hidden');
      el('overlay-pause').classList.add('hidden');
    },

    hideGameOver() {
      el('overlay-gameover').classList.add('hidden');
    },

    showPause() {
      el('overlay-pause').classList.remove('hidden');
    },

    hidePause() {
      el('overlay-pause').classList.add('hidden');
    },

    announceLevel(level) {
      const ann = el('level-announcement');
      ann.textContent = '— NIVEL ' + level + ' —';
      ann.classList.add('show');
      setTimeout(function() { ann.classList.remove('show'); }, 1500);
    }
  };

})();

