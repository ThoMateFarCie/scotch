/* Centrage du canvas sur grand écran (thèmes "classiques" — pas modulaire,
   qui gère sa propre vue via zoom/pan). Les éléments gardent leurs
   coordonnées x/y d'origine ; on décale juste tout le groupe pour que son
   emprise réelle (de son bord gauche à son bord droit) soit centrée dans
   la fenêtre, s'il reste de la place. Rien à configurer par page. */
(function () {
  'use strict';

  function centerCanvas() {
    var canvas = document.getElementById('sc-canvas');
    if (!canvas) return;

    // Mobile : mise en page dédiée (colonne empilée), pas de centrage à appliquer
    if (window.innerWidth <= 768) { canvas.style.transform = ''; return; }

    var els = canvas.querySelectorAll('.sc-el');
    if (!els.length) { canvas.style.transform = ''; return; }

    var minLeft = Infinity, maxRight = -Infinity;
    els.forEach(function (el) {
      var left = el.offsetLeft, right = left + el.offsetWidth;
      if (left < minLeft) minLeft = left;
      if (right > maxRight) maxRight = right;
    });

    var contentWidth = maxRight - minLeft;
    var extra = window.innerWidth - contentWidth;
    if (extra <= 0) { canvas.style.transform = ''; return; }   // pas de place en trop

    var shift = extra / 2 - minLeft;
    canvas.style.transform = 'translateX(' + Math.round(shift) + 'px)';
  }

  document.addEventListener('DOMContentLoaded', centerCanvas);
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t); t = setTimeout(centerCanvas, 120);
  });
})();
