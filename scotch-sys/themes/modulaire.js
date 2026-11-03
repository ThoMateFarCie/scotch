/* Thème Modulaire v4 — patch interactif + rack de modules.
   Blocs : barrette de connexion sous le bloc (IN · MOD · MOD · OUT).
   Modules : SCOTCH-01 (nappe, VOL/CUT/RATE, sorties FM/TRM/SUB)
           + ECHO-02 (delay), CRUSH-03 (saturation), NOISE-04 (souffle).
   Tous déplaçables. Câbles pleins = audio, pointillés = modulation. */
(function () {
  'use strict';
  /* lz-string (compression du patch) — MIT, inliné */
  var LZString=function(){var r=String.fromCharCode,o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",e={};function t(r,o){if(!e[r]){e[r]={};for(var n=0;n<r.length;n++)e[r][r.charAt(n)]=n}return e[r][o]}var i={compressToBase64:function(r){if(null==r)return"";var n=i._compress(r,6,function(r){return o.charAt(r)});switch(n.length%4){default:case 0:return n;case 1:return n+"===";case 2:return n+"==";case 3:return n+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(n){return t(o,r.charAt(n))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(r){return null==r?"":""==r?null:i._decompress(r.length,16384,function(o){return r.charCodeAt(o)-32})},compressToUint8Array:function(r){for(var o=i.compress(r),n=new Uint8Array(2*o.length),e=0,t=o.length;e<t;e++){var s=o.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null==o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;e<t;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(r){return null==r?"":i._compress(r,6,function(r){return n.charAt(r)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(o){return t(n,r.charAt(o))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(r,o,n){if(null==r)return"";var e,t,i,s={},u={},a="",p="",c="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<r.length;i+=1)if(a=r.charAt(i),Object.prototype.hasOwnProperty.call(s,a)||(s[a]=f++,u[a]=!0),p=c+a,Object.prototype.hasOwnProperty.call(s,p))c=p;else{if(Object.prototype.hasOwnProperty.call(u,c)){if(c.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(t=c.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;e<h;e++)m=m<<1|t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=c.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[c]}else for(t=s[c],e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;0==--l&&(l=Math.pow(2,h),h++),s[p]=f++,c=String(a)}if(""!==c){if(Object.prototype.hasOwnProperty.call(u,c)){if(c.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(t=c.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;e<h;e++)m=m<<1|t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=c.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[c]}else for(t=s[c],e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;0==--l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;e<h;e++)m=m<<1|1&t,v==o-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==o-1){d.push(n(m));break}v++}return d.join("")},decompress:function(r){return null==r?"":""==r?null:i._decompress(r.length,32768,function(o){return r.charCodeAt(o)})},_decompress:function(o,n,e){var t,i,s,u,a,p,c,l=[],f=4,h=4,d=3,m="",v=[],g={val:e(0),position:n,index:1};for(t=0;t<3;t+=1)l[t]=t;for(s=0,a=Math.pow(2,2),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;switch(s){case 0:for(s=0,a=Math.pow(2,8),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;c=r(s);break;case 1:for(s=0,a=Math.pow(2,16),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;c=r(s);break;case 2:return""}for(l[3]=c,i=c,v.push(c);;){if(g.index>o)return"";for(s=0,a=Math.pow(2,d),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;switch(c=s){case 0:for(s=0,a=Math.pow(2,8),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;l[h++]=r(s),c=h-1,f--;break;case 1:for(s=0,a=Math.pow(2,16),p=1;p!=a;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),s|=(u>0?1:0)*p,p<<=1;l[h++]=r(s),c=h-1,f--;break;case 2:return v.join("")}if(0==f&&(f=Math.pow(2,d),d++),l[c])m=l[c];else{if(c!==h)return null;m=i+i.charAt(0)}v.push(m),l[h++]=i+m.charAt(0),i=m,0==--f&&(f=Math.pow(2,d),d++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module?module.exports=LZString:"undefined"!=typeof angular&&null!=angular&&angular.module("LZString",[]).factory("LZString",function(){return LZString});

  var COLORS   = ['#e03a3a', '#f0c030', '#3a7be0', '#30b060', '#e07830', '#b048d0'];
  var FX_COLOR = { fm:'#9040e0', trem:'#20c0d0', sub:'#e04890',
                   echo:'#40b080', crush:'#e06030', noise:'#8090a0', verb:'#60a0d8' };
  var EDIT     = document.body.classList.contains('sc-edit-mode');
  var svg      = null;
  var blocks   = [];                 // {el, bar, holes:{in,mod0,mod1,out}}
  var cables   = [];                 // {id, from, to, color}
  var modCables= {};                 // fx → [{block, slot}, ...] (plusieurs cibles)
  function modTargets(fx) { return modCables[fx] || []; }
  function modHasBlock(fx, i) { return modTargets(fx).some(function (t) { return t.block === i; }); }
  function modAnyOnBlock(i) { return Object.keys(modCables).some(function (fx) { return modHasBlock(fx, i); }); }
  var cableId  = 0;
  var Z_TOP    = 100;                 // z-index croissant : bloc saisi au 1er plan
  var BARLEN   = 2;                   // longueur de mesure partagée (temps) : grille de recalage
  var pending  = null;               // {type,idx} | {mod:fx}
  var mouse    = { x: 0, y: 0 };
  var VIEW     = { zoom: 1, panX: 0, panY: 0 };   // vue : facteur de zoom + décalage (pan)

  /* ════════ AUDIO ════════ */
  var A = {
    ctx: null, on: false,
    master: null, filter: null, lfo: null, lfoGain: null,
    voices: {}, vol: 0.6, cutoff: 0.5, rate: 0.32,
    SCALE: [0, 3, 5, 7, 10], BASE: 55,
    mini: { echo: { val: 0.4 }, crush: { val: 0.35 }, noise: { val: 0.5 }, verb: { val: 0.5 } },
    echo: null, crush: null,
  };

  function actx() {
    if (!A.ctx) {
      A.ctx = new (window.AudioContext || window.webkitAudioContext)();
      A.master = A.ctx.createGain(); A.master.gain.value = 0;
      A.filter = A.ctx.createBiquadFilter();
      A.filter.type = 'lowpass'; A.filter.Q.value = 6;
      A.lfo = A.ctx.createOscillator(); A.lfoGain = A.ctx.createGain();
      A.lfo.frequency.value = 0.15; A.lfoGain.gain.value = 300;
      A.lfo.connect(A.lfoGain); A.lfoGain.connect(A.filter.frequency);
      A.lfo.start();
      A.filter.connect(A.master); A.master.connect(A.ctx.destination);
      // Bus clavier live : toujours audible, indépendant de l'état du drone
      A.keyBus = A.ctx.createGain(); A.keyBus.gain.value = 0.9;
      A.keyBus.connect(A.ctx.destination);

      // ECHO-02 : delay + feedback (send parallèle)
      var eIn = A.ctx.createGain(), dl = A.ctx.createDelay(1.2),
          fb  = A.ctx.createGain(), eOut = A.ctx.createGain();
      fb.gain.value = 0.45; eOut.gain.value = 0.7;
      eIn.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(eOut);
      eOut.connect(A.filter);
      A.echo = { input: eIn, delay: dl };

      // CRUSH-03 : waveshaper (send parallèle)
      var cIn = A.ctx.createGain(), sh = A.ctx.createWaveShaper(),
          cOut = A.ctx.createGain();
      cOut.gain.value = 0.35;
      cIn.connect(sh); sh.connect(cOut); cOut.connect(A.filter);
      A.crush = { input: cIn, shaper: sh };

      // Bruit blanc partagé (percussions, souffle)
      var nl = A.ctx.sampleRate, nbuf = A.ctx.createBuffer(1, nl, A.ctx.sampleRate);
      var nd = nbuf.getChannelData(0);
      for (var k = 0; k < nl; k++) nd[k] = Math.random() * 2 - 1;
      A.noiseBuf = nbuf;

      // VERB-05 : réverbe à convolution (impulse générée, send post-filtre)
      var il = A.ctx.sampleRate * 3, imp = A.ctx.createBuffer(2, il, A.ctx.sampleRate);
      for (var ch2 = 0; ch2 < 2; ch2++) {
        var idd = imp.getChannelData(ch2);
        for (var k2 = 0; k2 < il; k2++)
          idd[k2] = (Math.random() * 2 - 1) * Math.pow(1 - k2 / il, 2.6);
      }
      var conv = A.ctx.createConvolver(); conv.buffer = imp;
      var vIn = A.ctx.createGain(), vOut = A.ctx.createGain();
      vOut.gain.value = 0.45;
      vIn.connect(conv); conv.connect(vOut); vOut.connect(A.master);
      A.verb = { input: vIn, out: vOut };

      applyKnobs();
    }
    if (A.ctx.state === 'suspended') A.ctx.resume();
    return A.ctx;
  }

  function crushCurve(drive) {
    var k = 2 + drive * 60, n = 256, c = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * 2 - 1;
      c[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    return c;
  }

  function rateHz() { return 0.02 * Math.pow(4 / 0.02, A.rate); }
  function noteFreq(len) {
    var idx = Math.round((1 - Math.min(1, Math.max(0, (len - 80) / 1200))) * 14);
    var oct = Math.floor(idx / A.SCALE.length);
    return A.BASE * Math.pow(2, oct + A.SCALE[idx % A.SCALE.length] / 12);
  }

  /* ── Caractère par bloc (couleur → timbre + rythme) ── */
  function blockCharacter(idx) {
    var b = blocks[idx];
    if (!b) return { wave: 'sine', div: 4 };
    if (!b.chr) {
      var bg = getComputedStyle(b.el).backgroundColor || '';
      var m = bg.match(/(\d+)[, ]+(\d+)[, ]+(\d+)/);
      var r = m ? +m[1] : 128, g = m ? +m[2] : 128, bl = m ? +m[3] : 128;
      var mx = Math.max(r, g, bl), mn = Math.min(r, g, bl);
      var sat = mx - mn, hue = 0;
      if (sat > 0) {
        if (mx === r)      hue = ((g - bl) / sat) % 6;
        else if (mx === g) hue = (bl - r) / sat + 2;
        else               hue = (r - g)  / sat + 4;
        hue = (hue * 60 + 360) % 360;
      }
      var wave, div;
      if (sat < 24)       { wave = 'sine';     div = 8; }
      else if (hue < 60)  { wave = 'square';   div = 4; }
      else if (hue < 180) { wave = 'triangle'; div = 3; }
      else if (hue < 300) { wave = 'sine';     div = 2; }
      else                { wave = 'sawtooth'; div = 6; }
      b.chr = { wave: wave, div: div };
    }
    return b.chr;
  }

  /* ── Réglages sonores par bloc (onde + transposition) ── */
  var WAVES  = ['sine', 'triangle', 'sawtooth', 'square'];
  var GLYPHS = { sine: '\u223F', triangle: '\u25B3', sawtooth: '\u25FF', square: '\u2293' };

  function blockSound(idx) {
    var b = blocks[idx]; if (!b) return { wave: 'sawtooth', pitch: 0, level: 0.8 };
    if (!b.snd) b.snd = { wave: blockCharacter(idx).wave, pitch: 0, level: 0.8 };
    if (b.snd.level == null) b.snd.level = 0.8;
    return b.snd;
  }
  function pitchFactor(idx) { return Math.pow(2, blockSound(idx).pitch / 12); }

  // Chaîne par bloc : sources → gain (niveau) → filtre (brillance Y) → filtre global
  function blockGain(idx) {
    var b = blocks[idx]; if (!b || !A.ctx) return null;
    if (!b.gainNode) {
      b.gainNode = A.ctx.createGain();
      b.gainNode.gain.value = blockSound(idx).level;
      b.filterNode = A.ctx.createBiquadFilter();
      b.filterNode.type = 'lowpass';
      b.filterNode.frequency.value = brightnessHz(idx);
      b.filterNode.Q.value = 0.7;
      b.gainNode.connect(b.filterNode);
      b.filterNode.connect(A.filter);
    }
    return b.gainNode;
  }

  // Brillance : position verticale du bloc → fréquence de coupure.
  // Haut de page = clair (ouvert), bas = sombre (feutré).
  function brightnessHz(idx) {
    var b = blocks[idx]; if (!b) return 8000;
    var ch = Math.max(400, window.innerHeight);
    var r  = b.el.getBoundingClientRect();
    var y  = (r.top + r.height / 2) / ch;          // 0 (haut) → 1 (bas)
    y = Math.max(0, Math.min(1, y));
    // 9000 Hz en haut → 350 Hz en bas, courbe exponentielle (perception)
    return 350 * Math.pow(9000 / 350, 1 - y);
  }

  // Profondeur : taille du bloc → présence. Grand = proche (fort, brillant),
  // petit = lointain (discret, plus sombre). Renvoie un facteur 0.55 → 1.25.
  function depthFactor(idx) {
    var b = blocks[idx]; if (!b) return 1;
    var r = b.el.getBoundingClientRect();
    var area = (r.width * r.height) / (190 * 104);   // 1 = taille par défaut
    return Math.max(0.55, Math.min(1.25, 0.7 + area * 0.28));
  }

  // Applique brillance + profondeur au bloc (appelé au drag et au resize)
  function applySpatial(idx) {
    var b = blocks[idx]; if (!b || !A.ctx) return;
    var t = A.ctx.currentTime;
    var depth = depthFactor(idx);
    if (b.filterNode) {
      b.filterNode.frequency.setTargetAtTime(brightnessHz(idx) * depth, t, 0.05);
    }
    if (b.gainNode) {
      b.gainNode.gain.setTargetAtTime(blockSound(idx).level * depth, t, 0.05);
    }
    updateHalo(idx);
  }

  // ══════ Animations de bloc (mouvement subtil → variation sonore) ══════
  // Chaque bloc peut avoir une animation en boucle. Le mouvement décale sa
  // position/taille autour d'un point d'ancrage, ce qui module le son via la
  // spatialisation (pan, brillance, profondeur) déjà en place.
  var ANIMS = ['off', 'derive', 'balancier', 'flottement', 'cercle', 'respiration'];
  var ANIM_LABELS = { off: 'aucune', derive: 'dérive', balancier: 'balancier',
                      flottement: 'flottement', cercle: 'cercle', respiration: 'respiration' };

  function startAnim(idx, type) {
    var b = blocks[idx]; if (!b || !b.el) return;
    // mémorise le point d'ancrage (position/taille de repos) une seule fois
    if (!b.animAnchor) {
      var r = b.el.getBoundingClientRect(), cr = canvasEl().getBoundingClientRect();
      b.animAnchor = { x: (r.left - cr.left) / VIEW.zoom, y: (r.top - cr.top) / VIEW.zoom, w: r.width / VIEW.zoom, h: r.height / VIEW.zoom };
    }
    b.anim = type;
    b.animPhase = b.animPhase || Math.random() * Math.PI * 2;   // déphasage aléatoire
  }
  function stopAnim(idx) {
    var b = blocks[idx]; if (!b) return;
    b.anim = 'off';
    // revient doucement au point d'ancrage
    if (b.animAnchor && b.el) {
      b.el.style.left = b.animAnchor.x + 'px';
      b.el.style.top  = b.animAnchor.y + 'px';
      b.el.style.width  = b.animAnchor.w + 'px';
      b.el.style.height = b.animAnchor.h + 'px';
      applySpatial(idx); retuneBlock(idx);
    }
    b.animAnchor = null;
  }

  // Boucle d'animation : appelée en continu, déplace les blocs animés
  var _animT0 = null;
  function tickAnims(now) {
    if (_animT0 == null) _animT0 = now;
    var t = (now - _animT0) / 1000;   // secondes
    blocks.forEach(function (b, idx) {
      if (!b || !b.el || !b.anim || b.anim === 'off') return;
      if (b.animFrozen) return;   // bloc sélectionné/en édition : figé pour le modifier
      if (!b.animAnchor) {   // (re)créer l'ancre depuis la position courante
        var r = b.el.getBoundingClientRect(), cr = canvasEl().getBoundingClientRect();
        b.animAnchor = { x: (r.left - cr.left) / VIEW.zoom, y: (r.top - cr.top) / VIEW.zoom, w: r.width / VIEW.zoom, h: r.height / VIEW.zoom };
      }
      var a = b.animAnchor, ph = b.animPhase || 0;
      var speed = (b.animSpeed != null ? b.animSpeed : 0.5);   // cycles/seconde
      var amp   = (b.animAmp   != null ? b.animAmp   : 1);     // multiplicateur
      var ax = 26 * amp, ay = 20 * amp;       // amplitudes (px), réglables
      var w = t * speed * Math.PI * 2 + ph;
      var nx = a.x, ny = a.y, nw = a.w, nh = a.h;
      if (b.anim === 'derive') {                    // petit cercle lent + variation
        nx = a.x + Math.cos(w) * ax * 0.7;
        ny = a.y + Math.sin(w * 1.3) * ay * 0.7;
      } else if (b.anim === 'balancier') {          // va-et-vient horizontal (pan)
        nx = a.x + Math.sin(w) * ax * 1.4;
      } else if (b.anim === 'flottement') {         // haut/bas lent (brillance)
        ny = a.y + Math.sin(w) * ay * 1.4;
      } else if (b.anim === 'cercle') {             // cercle (pan + brillance)
        nx = a.x + Math.cos(w) * ax;
        ny = a.y + Math.sin(w) * ay;
      } else if (b.anim === 'respiration') {        // taille pulse (profondeur)
        var s = 1 + Math.sin(w) * 0.12;
        nw = a.w * s; nh = a.h * s;
        nx = a.x - (nw - a.w) / 2; ny = a.y - (nh - a.h) / 2;  // reste centré
      }
      b.el.style.left = nx + 'px';
      b.el.style.top  = ny + 'px';
      if (b.anim === 'respiration') { b.el.style.width = nw + 'px'; b.el.style.height = nh + 'px'; }
      applySpatial(idx);
      retuneBlock(idx);
    });
  }
  function setBlockLevel(idx, lv) {
    blockSound(idx).level = lv;
    var g = blockGain(idx);
    if (g) g.gain.setTargetAtTime(lv * depthFactor(idx), A.ctx.currentTime, 0.03);
  }

  // Halo visuel : matérialise la brillance (Y) et la présence (taille).
  // Plus le bloc est haut/clair, plus l'aura est lumineuse ; plus il est
  // grand, plus elle est large. Rend le "champ" spatial lisible à l'œil.
  function updateHalo(idx) {
    var b = blocks[idx]; if (!b || !b.el) return;
    var ch = Math.max(400, window.innerHeight);
    var r  = b.el.getBoundingClientRect();
    var y  = Math.max(0, Math.min(1, (r.top + r.height / 2) / ch));
    var bright = 1 - y;                     // 1 en haut, 0 en bas
    var depth  = depthFactor(idx);
    var spread = Math.round(8 + depth * 22);
    var alpha  = (0.12 + bright * 0.45) * Math.min(1, depth);
    var hue    = 150 + bright * 60;         // vert sombre (bas) → cyan clair (haut)
    b.el.style.boxShadow = '0 0 ' + spread + 'px rgba(' +
      Math.round(80 + bright * 60) + ',' + Math.round(180 + bright * 60) + ',' +
      Math.round(160 + bright * 40) + ',' + alpha.toFixed(2) + ')';
  }

  function updateBlockSound(idx) {
    if (!A.ctx) return;
    var t = A.ctx.currentTime;
    cables.forEach(function (cb) {
      if (cb.from !== idx) return;
      var v = A.voices[cb.id]; if (!v) return;
      var snd = blockSound(idx);
      v.o1.type = snd.wave;
      var nf = v.baseF * pitchFactor(idx);
      v.f = nf;
      v.o1.frequency.setTargetAtTime(nf, t, 0.08);
      v.o2.frequency.setTargetAtTime(nf, t, 0.08);
      rebuildVoiceFx(cb); // resynchronise FM/SUB/NOISE sur la nouvelle note
    });
  }

  function previewBlock(idx) {
    try {
      actx();
      var snd = blockSound(idx);
      pluck(A.ctx.currentTime, 220 * pitchFactor(idx), snd.wave, 0.14);
    } catch (e) {}
  }

  /* ════════ LIVE CODING ════════
     Chaque bloc peut contenir un petit programme (une commande par ligne) :
       tempo 120         wave sine|tri|saw|square
       play c3 e3 g3 .   (notes ou nombres MIDI, . = silence)
       sleep 1           up 5 / down 5      vol 0.7      # commentaire
     Le bloc boucle en continu ; il sonne si son OUT est câblé. */

  var LIVE = {};   // idx → {prog, pending, pos, nextT, chain, fx}
  var NOTE_BASE = { c:0, d:2, e:4, f:5, g:7, a:9, b:11 };
  // Solfège français → équivalent anglais (ré/re, la bémol, etc.)
  var NOTE_FR = { do:'c', 'ré':'d', re:'d', mi:'e', fa:'f', sol:'g', la:'a', si:'b' };

  function noteMidi(tok) {
    if (/^\d+$/.test(tok)) { var n = +tok; return (n >= 12 && n <= 120) ? n : null; }
    // Français : do3, ré4, solb2, fa#3 …
    var mf = tok.match(/^(do|ré|re|mi|fa|sol|la|si)(#|b)?(-?\d)$/);
    if (mf) tok = NOTE_FR[mf[1]] + (mf[2] || '') + mf[3];
    var m = tok.match(/^([a-g])(#|b)?(-?\d)$/);
    if (!m) return null;
    var v = NOTE_BASE[m[1]];
    if (m[2] === '#') v++; if (m[2] === 'b') v--;
    return 12 * (+m[3] + 1) + v;
  }

  function parseCode(text) {
    var lines = (text || '').split(/\n/);
    var st = { wave: null, vol: 0.8, trans: 0, dur: 1 };
    var events = [], tempo = 120, hasCmd = false;
    var WAVES_MAP = { sine:'sine', tri:'triangle', triangle:'triangle',
                      saw:'sawtooth', sawtooth:'sawtooth', square:'square', sq:'square' };
    var DRUMS = { kick:'kick', bd:'kick', k:'kick',
                  snare:'snare', sn:'snare', sd:'snare',
                  hat:'hat', hh:'hat', ch:'hat',              // closed hat
                  oh:'ohat', open:'ohat',                     // open hat
                  clap:'clap', cp:'clap',
                  rim:'rim', rs:'rim',                        // rimshot
                  tom:'tomm', tomlow:'toml', tl:'toml',       // toms grave/moyen/aigu
                  tommid:'tomm', tm:'tomm', tomhi:'tomh', th:'tomh',
                  cow:'cow', cowbell:'cow',
                  shaker:'shaker', sh:'shaker',
                  clave:'clave', cl:'clave' };

    // Un token → event (note simple, accord "a+b+c", tirage "choose(a b c)", perc, silence)
    function tokenEvent(tok) {
      if (tok === '.') return { midi: null, dt: st.dur };
      if (DRUMS[tok]) return { midi: null, drum: DRUMS[tok], vol: st.vol, dt: st.dur };
      // choose(a b c) : liste de candidats, tirage à la lecture
      var mc = tok.match(/^choose\(([^)]*)\)$/);
      if (mc) {
        var opts = mc[1].split(/[ ,]+/).map(function (o) {
          var m = noteMidi(o); return m === null ? null : m + st.trans;
        }).filter(function (v) { return v !== null; });
        if (!opts.length) return { midi: null, dt: st.dur };
        return { pick: opts, wave: st.wave, vol: st.vol, dt: st.dur };
      }
      // accord a+b+c
      if (tok.indexOf('+') > 0) {
        var ms = tok.split('+').map(function (o) {
          var m = noteMidi(o); return m === null ? null : m + st.trans;
        }).filter(function (v) { return v !== null; });
        if (!ms.length) return { midi: null, dt: st.dur };
        return { midis: ms, wave: st.wave, vol: st.vol, dt: st.dur };
      }
      var md = noteMidi(tok);
      if (md !== null) return { midi: md + st.trans, wave: st.wave, vol: st.vol, dt: st.dur };
      return { midi: null, dt: st.dur };
    }

    lines.forEach(function (raw) {
      var line = raw.trim().toLowerCase();
      if (!line || line[0] === '#') return;
      var p = line.split(/\s+/), cmd = p[0];
      if (cmd === 'tempo' && p[1]) { tempo = Math.min(600, Math.max(20, parseFloat(p[1]) || 120)); hasCmd = true; }
      else if (cmd === 'wave' && WAVES_MAP[p[1]]) { st.wave = WAVES_MAP[p[1]]; hasCmd = true; }
      else if (cmd === 'vol' && p[1])  { st.vol = Math.min(1, Math.max(0, parseFloat(p[1]) || 0.8)); hasCmd = true; }
      else if (cmd === 'len' && p[1])  { var l = parseFloat(p[1]); if (l > 0) { st.dur = Math.min(16, l); hasCmd = true; } }
      else if (cmd === 'div' && p[1])  { var dv = parseInt(p[1]); if (dv > 0) { st.dur = 1 / Math.min(16, dv); hasCmd = true; } }
      else if (cmd === 'up' && p[1])   { st.trans += parseInt(p[1]) || 0; hasCmd = true; }
      else if (cmd === 'down' && p[1]) { st.trans -= parseInt(p[1]) || 0; hasCmd = true; }
      else if (cmd === 'sleep' && p[1]) {
        var s = parseFloat(p[1]);
        if (s > 0) { events.push({ midi: null, dt: Math.min(16, s) }); hasCmd = true; }
      }
      else if (cmd === 'play' && p.length > 1) {
        hasCmd = true;
        // recoller les choose(...) que le split sur espaces a cassés
        var body = line.slice(5);
        body = body.replace(/choose\(([^)]*)\)/g, function (m0, inner) {
          return 'choose(' + inner.replace(/\s+/g, ',') + ')';
        });
        var toks = body.split(/\s+/).filter(Boolean);
        for (var i = 0; i < toks.length; i++) {
          var tok = toks[i];
          // répétition xN : répète l'event précédent
          var mx = tok.match(/^x(\d+)$/);
          if (mx && events.length) {
            var last = events[events.length - 1];
            var n = Math.min(64, parseInt(mx[1]) || 1);
            for (var r = 1; r < n; r++) events.push(Object.assign({}, last));
            continue;
          }
          events.push(tokenEvent(tok));
        }
      }
    });
    if (!hasCmd || !events.length) return null;
    return { events: events, tempo: tempo };
  }

  function isCoded(i) { return LIVE[i] && LIVE[i].prog; }
  // ── Mute/play par bloc, calé sur la mesure ──
  // Chaque bloc peut être muté ; le changement prend effet au prochain début
  // de mesure pour rester synchro. muteState[i] = état effectif (true=muet),
  // mutePending[i] = état visé en attente du prochain cycle.
  // ── Carrefour : reçoit des blocs câblés, en laisse jouer au hasard ──
  // members: blocs câblés | active: set d'index actifs ce cycle | density: 0..1
  var TURN = { members: [], active: {}, density: 0.34, div: 2, lastStep: null, jackEl: null };

  function turnHas(i) { return TURN.members.indexOf(i) >= 0; }
  // Un bloc câblé au carrefour ne sonne que s'il est dans le tirage courant
  function turnAllows(i) {
    if (!turnHas(i)) return true;              // pas dans le carrefour → libre
    if (TURN.members.length < 2) return true;  // 0-1 membre → pas de filtrage
    return !!TURN.active[i];
  }

  var muteState = {};      // i → true si muet (effectif)
  var mutePending = {};    // i → état visé (bool) en attente de bascule

  function isMuted(i) { return !!muteState[i]; }

  function liveActive(i) {
    return A.on && !isMuted(i) && turnAllows(i) &&
           cables.some(function (c) { return c.from === i; });
  }

  /* Fait avancer le carrefour : re-tire au hasard les blocs actifs, en rythme */
  function advanceTurn() {
    if (!A.on || !A.ctx || A.t0 == null || TURN.members.length < 2) return;
    var stepDur = (60 / bpm()) * TURN.div;
    var step = Math.floor((A.ctx.currentTime - A.t0) / stepDur);
    if (TURN.lastStep == null) { TURN.lastStep = step; rollTurn(); return; }
    if (step > TURN.lastStep) { TURN.lastStep = step; rollTurn(); }
  }

  // Tire au hasard quels membres sonnent ce cycle (selon la densité)
  function rollTurn() {
    TURN.active = {};
    var n = TURN.members.length;
    if (!n) return;
    // au moins un actif, puis chaque autre selon la densité
    var chosen = (Math.random() * n) | 0;
    TURN.active[TURN.members[chosen]] = true;
    TURN.members.forEach(function (idx, k) {
      if (k !== chosen && Math.random() < TURN.density) TURN.active[idx] = true;
    });
    highlightTurn();
    if (A.ctx) balance();
  }

  function highlightTurn() {
    TURN.members.forEach(function (idx) {
      var b = blocks[idx]; if (!b || !b.el) return;
      var on = !!TURN.active[idx];
      b.el.classList.toggle('sc-turn-on', on);
      b.el.classList.toggle('sc-turn-off', !on);
    });
    renderTurnMembers();
  }
  function clearTurnMarks() {
    TURN.members.forEach(function (idx) {
      var b = blocks[idx]; if (!b || !b.el) return;
      b.el.classList.remove('sc-turn-on', 'sc-turn-off');
    });
  }

  function addToTurn(i) {
    if (turnHas(i)) return;
    if (TURN.members.length >= 6) return;   // 6 entrées maximum
    TURN.members.push(i);
    refreshTurnJacks();
    rollTurn();
    renderTurnMembers();
  }
  function removeFromTurn(i) {
    var at = TURN.members.indexOf(i);
    if (at < 0) return;
    TURN.members.splice(at, 1);
    delete TURN.active[i];
    var b = blocks[i];
    if (b && b.el) b.el.classList.remove('sc-turn-on', 'sc-turn-off');
    refreshTurnJacks();
    highlightTurn();
    renderTurnMembers();
  }

  // Clic sur le trou CAR d'un bloc — câble vers le carrefour (deux sens)
  function onCarHole(idx) {
    // déjà membre → débrancher
    if (turnHas(idx)) { removeFromTurn(idx); pending = null; return; }
    // une entrée de carrefour est en attente → connecter
    if (pending && pending.carIn != null) { addToTurn(idx); pending = null; return; }
    // sinon, on arme ce bloc (le prochain clic sur une entrée carrefour connecte)
    pending = (pending && pending.car === idx) ? null : { car: idx };
  }

  // Jacks d'entrée du carrefour : câblage dans les deux sens
  function bindTurnJack(root) {
    TURN.jackEls = Array.prototype.slice.call(root.querySelectorAll('.sc-turn-in'));
    TURN.jackEl = TURN.jackEls[0];
    TURN.jackEls.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var slot = +el.dataset.slot;
        // un bloc est armé (trou CAR cliqué) → connecter
        if (pending && pending.car != null) { addToTurn(pending.car); pending = null; return; }
        // slot occupé, rien en attente → débrancher ce membre
        if (slot < TURN.members.length && !pending) {
          removeFromTurn(TURN.members[slot]); return;
        }
        // sinon on arme cette entrée (le prochain clic sur un trou CAR connecte)
        pending = (pending && pending.carIn === slot) ? null : { carIn: slot };
      });
    });
  }

  function refreshTurnJacks() {
    if (!TURN.jackEls) return;
    TURN.jackEls.forEach(function (el) {
      var slot = +el.dataset.slot;
      el.classList.toggle('on', slot < TURN.members.length);
    });
  }

  // Liste des blocs du carrefour, retrait au clic sur un numéro
  function renderTurnMembers() {
    var host = document.getElementById('sc-turn-members');
    var cnt = document.getElementById('sc-turn-count');
    if (cnt) cnt.textContent = TURN.members.length + ' bloc' + (TURN.members.length > 1 ? 's' : '');
    if (!host) return;
    host.innerHTML = '';
    TURN.members.forEach(function (idx) {
      var chip = document.createElement('span');
      chip.className = 'sc-turn-chip' + (TURN.active[idx] ? ' on' : '');
      chip.textContent = idx;
      chip.title = 'retirer ce bloc du carrefour';
      chip.addEventListener('click', function (e) {
        e.stopPropagation(); removeFromTurn(idx);
      });
      host.appendChild(chip);
    });
  }

  // Remplace le texte-code d'un bloc sans supprimer ses boutons UI
  function setBlockCode(el, code) {
    var btns = [];
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 1 && (n.classList.contains('sc-block-mute') ||
                               n.classList.contains('sc-block-del'))) btns.push(n);
    });
    el.textContent = code;              // efface tout, pose le texte
    btns.forEach(function (btn) { el.appendChild(btn); });  // rétablit les boutons
  }

  // Lit le code d'un bloc en ignorant les boutons UI (mute, croix)
  function blockCode(el) {
    var parts = [];
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 1 && (n.classList.contains('sc-block-mute') ||
                               n.classList.contains('sc-block-del'))) return;
      parts.push(n.textContent);
    });
    return parts.join('');
  }

  function refreshBlockCode(i) {
    var b = blocks[i]; if (!b || !b.el.classList.contains('sc-bloc')) return;
    var prog = parseCode(blockCode(b.el));
    var was  = isCoded(i);
    if (prog) {
      b.el.classList.add('sc-coding');
      ensureResizer(i);
      if (!LIVE[i]) LIVE[i] = { prog: null, pending: null, pos: 0, nextT: 0, chain: null, fx: {} };
      // Prise d'effet immédiate : nouveau programme, position remise à zéro,
      // le scheduler recale l'horloge au prochain tick.
      LIVE[i].prog    = prog;
      LIVE[i].pending = null;
      LIVE[i].pos     = 0;
      LIVE[i].nextT   = 0;
      if (!was) {
        // le bloc devient codé : couper ses voix de nappe
        cables.forEach(function (cb) { if (cb.from === i) removeVoice(cb.id); });
      }
    } else {
      b.el.classList.remove('sc-coding');
      removeResizer(i);
      markPlaying(i, false);
      if (LIVE[i]) LIVE[i].prog = null;
      if (was) {
        // le bloc redevient texte : ses câbles reprennent la nappe
        cables.forEach(function (cb) { if (cb.from === i) addVoice(cb); });
      }
    }
  }

  /* ── Stéréo : la position X du bloc place son son dans l'espace ── */
  function blockPan(i) {
    var b = blocks[i]; if (!b) return 0;
    var cw = Math.max(600, window.innerWidth);
    var r  = b.el.getBoundingClientRect();
    var p  = ((r.left + r.width / 2) / cw) * 2 - 1;
    return Math.max(-0.85, Math.min(0.85, p * 0.9));
  }
  function mkPanner(i) {
    if (!A.ctx.createStereoPanner) return null;
    var p = A.ctx.createStereoPanner();
    p.pan.value = blockPan(i);
    return p;
  }

  /* ── Pulsation visuelle : le bloc flashe à chacune de ses notes ── */
  function pulseBlock(i, atTime) {
    var b = blocks[i]; if (!b) return;
    var ms = Math.max(0, (atTime - A.ctx.currentTime) * 1000);
    setTimeout(function () {
      b.el.classList.add('sc-note-on');
      setTimeout(function () { b.el.classList.remove('sc-note-on'); }, 90);
    }, ms);
  }

  /* ── Déplacement des blocs (visiteur) : la géométrie ré-accorde le patch ── */
  function retuneBlock(i) {
    if (!A.ctx) return;
    var t = A.ctx.currentTime;
    cables.forEach(function (cb) {
      if (cb.from !== i && cb.to !== i) return;
      var v = A.voices[cb.id]; if (!v) return;
      var p1 = jackPos(cb.from, 'out'), p2 = jackPos(cb.to, 'in');
      v.baseF = noteFreq(Math.hypot(p2.x - p1.x, p2.y - p1.y));
      var nf = v.baseF * pitchFactor(cb.from);
      v.f = nf;
      v.o1.frequency.setTargetAtTime(nf, t, 0.06);
      v.o2.frequency.setTargetAtTime(nf, t, 0.06);
      if (v.fx.sub)   v.fx.sub.sub.frequency.setTargetAtTime(nf / 2, t, 0.06);
      if (v.fx.fm)    v.fx.fm.gain.gain.setTargetAtTime(nf * 0.025, t, 0.06);
      if (v.fx.noise) v.fx.noise.bp.frequency.setTargetAtTime(nf * 2, t, 0.06);
      if (v.pan && cb.from === i) v.pan.pan.setTargetAtTime(blockPan(i), t, 0.06);
    });
    if (LIVE[i] && LIVE[i].chain && LIVE[i].chain.pan)
      LIVE[i].chain.pan.pan.setTargetAtTime(blockPan(i), t, 0.06);
    applySpatial(i);   // Y → brillance, taille → profondeur, halo
  }

  function bindBlockDrag(i) {
    var el = blocks[i].el;
    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      if (el.getAttribute('contenteditable') === 'true') return;
      if (e.target.closest('.sc-hole, .sc-jackbar, .sc-wave-btn, .sc-pitch, .sc-level, .sc-live-resize, .sc-modjack, .sc-block-del, .sc-block-mute, .sc-anim-panel')) return;
      selectBlock(i);            // sélection immédiate pour le clavier live
      e._scBlockHit = true;      // signale au listener de fond de ne pas désélectionner
      // au premier plan parmi les blocs, mais toujours sous les câbles (9000)
      Z_TOP = (Z_TOP >= 8000) ? 100 : Z_TOP + 1;
      el.style.zIndex = Z_TOP;
      var cr = canvasEl().getBoundingClientRect();
      var r0 = el.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY, moved = false;
      // position de départ en coordonnées canvas NON zoomées
      var x0 = (r0.left - cr.left) / VIEW.zoom;
      var y0 = (r0.top  - cr.top ) / VIEW.zoom;
      el.setPointerCapture(e.pointerId);
      var mv = function (e) {
        var dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        moved = true;
        // le déplacement écran est divisé par le zoom pour rester juste
        el.style.left = Math.max(0, x0 + dx / VIEW.zoom) + 'px';
        el.style.top  = Math.max(0, y0 + dy / VIEW.zoom) + 'px';
        retuneBlock(i);   // les câbles glissent de note pendant le déplacement
      };
      var up = function () {
        el.removeEventListener('pointermove', mv);
        el.removeEventListener('pointerup', up);
        if (moved) {
          // empêcher le lien de se déclencher après un drag
          var sup = function (ev) { ev.preventDefault(); ev.stopPropagation();
                                    el.removeEventListener('click', sup, true); };
          el.addEventListener('click', sup, true);
          // si le bloc est animé, recaler son point d'ancrage sur la nouvelle position
          var bb = blocks[i];
          if (bb && bb.anim && bb.anim !== 'off') bb.animAnchor = null;
        }
      };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerup', up);
    });
  }

  /* ── Création de blocs (visiteur) : double-clic sur le fond ── */
  function createLiveBlock(x, y, opts) {
    opts = opts || {};
    var cv = canvasEl();
    var el = document.createElement('div');
    el.className = 'sc-el sc-bloc';
    el.style.cssText = 'position:absolute;left:' + Math.max(0, x) + 'px;top:' +
      Math.max(0, y) + 'px;width:' + (opts.w || 190) + 'px;min-height:' + (opts.h || 104) + 'px;' +
      'padding:10px 12px;box-sizing:border-box;z-index:60;background-color:#d8d5cc;color:#1a1a1e;';
    el.textContent = opts.code || '# nouveau module\ntempo 120\nwave saw\nplay c3 . e3 .';
    cv.appendChild(el);
    var i = blocks.length;
    blocks.push({ el: el, created: true });
    makeBar(i);
    bindBlockDrag(i);
    el.addEventListener('dblclick', function (e) {
      e.preventDefault(); e.stopPropagation(); startLiveEdit(i);
    });
    // croix de suppression (blocs créés par le visiteur uniquement)
    var xb = document.createElement('div');
    xb.className = 'sc-block-del';
    xb.setAttribute('contenteditable', 'false');
    xb.textContent = '\u2715';
    xb.title = 'supprimer ce bloc';
    xb.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      deleteBlock(i);
    });
    el.appendChild(xb);
    refreshBlockCode(i);
    if (!opts.noEdit) startLiveEdit(i);
    return i;
  }

  /* Poignée de redimensionnement (visiteur) : lecture/écriture du code à l'aise */
  function ensureResizer(i) {
    var b = blocks[i]; if (!b) return;
    if (b.resizer) return;
    var h = document.createElement('div');
    h.className = 'sc-live-resize';
    h.title = 'redimensionner';
    h.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      h.setPointerCapture(e.pointerId);
      var r0 = b.el.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY;
      // dimensions de départ en canvas non zoomé
      var w0 = r0.width / VIEW.zoom, h0 = r0.height / VIEW.zoom;
      var mv = function (e) {
        b.el.style.width  = Math.max(120, w0 + (e.clientX - sx) / VIEW.zoom) + 'px';
        b.el.style.height = Math.max(60,  h0 + (e.clientY - sy) / VIEW.zoom) + 'px';
        applySpatial(i);   // taille → profondeur (présence + brillance)
      };
      var up = function () {
        h.removeEventListener('pointermove', mv);
        h.removeEventListener('pointerup', up);
      };
      h.addEventListener('pointermove', mv);
      h.addEventListener('pointerup', up);
    });
    canvasEl().appendChild(h);
    b.resizer = h;
  }
  function removeResizer(i) {
    var b = blocks[i]; if (!b || !b.resizer) return;
    b.resizer.remove(); b.resizer = null;
  }
  function placeResizer(i) {
    var b = blocks[i]; if (!b || !b.resizer) return;
    var cr = canvasEl().getBoundingClientRect();
    var r  = b.el.getBoundingClientRect();
    b.resizer.style.left = ((r.right - cr.left) / VIEW.zoom - 8) + 'px';
    b.resizer.style.top  = ((r.bottom - cr.top) / VIEW.zoom - 8) + 'px';
  }

  function markPlaying(i, on) {
    var b = blocks[i]; if (!b) return;
    var led = b.el.querySelector('.sc-live-led');
    if (on && !led) {
      led = document.createElement('span');
      led.className = 'sc-live-led';
      b.el.appendChild(led);
    } else if (!on && led) led.remove();
  }

  function ensureChain(i) {
    var st = LIVE[i];
    if (st.chain) return st.chain;
    var c = A.ctx, gT = c.createGain(), g = c.createGain();
    gT.gain.value = 1; g.gain.value = 0.9;
    gT.connect(g);
    var pan = mkPanner(i);
    var dest = blockGain(i) || A.filter;
    if (pan) { g.connect(pan); pan.connect(dest); } else g.connect(dest);
    st.chain = { gT: gT, g: g, pan: pan };
    rebuildLiveFx(i);
    return st.chain;
  }

  function rebuildLiveFx(i) {
    var st = LIVE[i]; if (!st || !st.chain || !A.ctx) return;
    var c = A.ctx, fx = st.fx;
    ['trem', 'fm'].forEach(function (k) { if (fx[k]) { try { fx[k].osc.stop(); } catch (e) {} } });
    ['echoSend', 'crushSend', 'verbSend'].forEach(function (k) { if (fx[k]) { try { fx[k].disconnect(); } catch (e) {} } });
    if (fx.noise) { try { fx.noise.src.stop(); } catch (e) {} }
    st.fx = fx = {};
    st.chain.gT.gain.setTargetAtTime(1, c.currentTime, 0.1);
    var touch = function (name) { return modHasBlock(name, i); };
    if (touch('echo'))  { var es = c.createGain(); es.gain.value = 0.8; st.chain.g.connect(es); es.connect(A.echo.input);  fx.echoSend = es; }
    if (touch('crush')) { var cs = c.createGain(); cs.gain.value = 0.9; st.chain.g.connect(cs); cs.connect(A.crush.input); fx.crushSend = cs; }
    if (touch('verb'))  { var vs = c.createGain(); vs.gain.value = 0.85; st.chain.g.connect(vs); vs.connect(A.verb.input);  fx.verbSend = vs; }
    if (touch('trem')) {
      var to = c.createOscillator(), tg = c.createGain();
      to.frequency.value = rateHz() * 2; tg.gain.value = 0.45;
      st.chain.gT.gain.setTargetAtTime(0.55, c.currentTime, 0.1);
      to.connect(tg); tg.connect(st.chain.gT.gain); to.start();
      fx.trem = { osc: to, gain: tg };
    }
    if (touch('fm')) {
      var fo = c.createOscillator(), fg = c.createGain();
      fo.frequency.value = rateHz() * 4; fg.gain.value = 8;
      fo.connect(fg); fo.start();
      fx.fm = { osc: fo, gain: fg };
    }
    fx.subOn = touch('sub');
    if (touch('noise')) {
      var len = c.sampleRate * 1.5, buf = c.createBuffer(1, len, c.sampleRate);
      var dd = buf.getChannelData(0);
      for (var k = 0; k < len; k++) dd[k] = Math.random() * 2 - 1;
      var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 440; bp.Q.value = 9;
      var ng = c.createGain(); ng.gain.value = 0.2 * A.mini.noise.val;
      src.connect(bp); bp.connect(ng); ng.connect(st.chain.gT); src.start();
      fx.noise = { src: src, bp: bp, gain: ng };
    }
  }

  function liveNote(i, time, ev, beatDur) {
    // note simple, accord (plusieurs midis) ou tirage choose (pick)
    var midis;
    if (ev.midis)      midis = ev.midis;
    else if (ev.pick)  midis = [ ev.pick[(Math.random() * ev.pick.length) | 0] ];
    else               midis = [ ev.midi ];
    var dur = Math.max(0.09, beatDur * (ev.dt || 1) * 0.88);
    for (var n = 0; n < midis.length; n++) liveTone(i, time, midis[n], ev, dur);
  }

  function liveTone(i, time, midi, ev, dur) {
    var st = LIVE[i], ch = ensureChain(i), c = A.ctx;
    var f = 440 * Math.pow(2, (midi - 69) / 12) * pitchFactor(i);
    var wave = ev.wave || blockSound(i).wave;
    var vol  = (ev.vol != null ? ev.vol : 0.8) * 0.4;
    var o = c.createOscillator(), g = c.createGain();
    o.type = wave; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(vol, time + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g); g.connect(ch.gT);
    if (st.fx.fm) { st.fx.fm.gain.gain.value = f * 0.03; st.fx.fm.gain.connect(o.frequency); }
    o.start(time); o.stop(time + dur + 0.05);
    if (st.fx.subOn) {
      var so = c.createOscillator(), sg = c.createGain();
      so.type = 'square'; so.frequency.value = f / 2;
      sg.gain.setValueAtTime(0.0001, time);
      sg.gain.exponentialRampToValueAtTime(vol * 0.5, time + 0.012);
      sg.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      so.connect(sg); sg.connect(ch.gT);
      so.start(time); so.stop(time + dur + 0.05);
    }
    if (st.fx.noise) st.fx.noise.bp.frequency.setTargetAtTime(f * 2, time, 0.05);
  }

  /* ── Clavier live : jouer des notes à travers le bloc sélectionné ── */
  var LIVE_SEL = -1;   // index du bloc sélectionné pour le jeu au clavier
  // Rangée du clavier (AZERTY/QWERTY, position physique) → degré de gamme
  var KEY_ROW = ['KeyQ','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL'];
  var KEY_SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14];   // gamme majeure sur 2 octaves
  var keyHeld = {};

  function selectBlock(i) {
    if (LIVE_SEL >= 0 && blocks[LIVE_SEL]) {
      blocks[LIVE_SEL].el.classList.remove('sc-kb-sel', 'sc-locked');
      freezeAnim(LIVE_SEL, false);   // l'ancien reprend son mouvement
      showAnimPanel(LIVE_SEL, false);
    }
    LIVE_SEL = i;
    if (i >= 0 && blocks[i]) {
      blocks[i].el.classList.add('sc-kb-sel');
      if (blocks[i].anim && blocks[i].anim !== 'off') blocks[i].el.classList.add('sc-locked');
      freezeAnim(i, true);           // le nouveau se fige pour être modifiable
      showAnimPanel(i, true);
    }
  }

  // Fige (ou relâche) l'animation d'un bloc, sans perdre l'animation choisie
  function freezeAnim(idx, on) {
    var b = blocks[idx]; if (!b) return;
    if (on) {
      b.animFrozen = true;
    } else {
      b.animFrozen = false;
      // recaler l'ancre sur la position actuelle pour repartir sans saut
      if (b.anim && b.anim !== 'off') b.animAnchor = null;
    }
  }

  function playKeyNote(i, midi) {
    if (!blocks[i]) return;
    actx();                       // démarre/réveille l'audio au besoin
    if (A.ctx.state === 'suspended') A.ctx.resume();
    var c = A.ctx, t = c.currentTime;
    var f = 440 * Math.pow(2, (midi - 69) / 12) * pitchFactor(i);
    var wave = blockSound(i).wave;
    var o = c.createOscillator(), g = c.createGain();
    o.type = wave; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + 0.012);
    // pan selon la position du bloc, puis bus clavier (toujours audible)
    o.connect(g);
    if (c.createStereoPanner) {
      var pn = c.createStereoPanner(); pn.pan.value = blockPan(i);
      g.connect(pn); pn.connect(A.keyBus);
    } else g.connect(A.keyBus);
    o.start(t);
    pulseBlock(i, t);
    return { o: o, g: g };
  }
  function releaseKeyNote(voice) {
    if (!voice) return;
    var c = A.ctx, t = c.currentTime;
    voice.g.gain.cancelScheduledValues(t);
    voice.g.gain.setValueAtTime(voice.g.gain.value, t);
    voice.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    voice.o.stop(t + 0.3);
  }

  function initKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (e.target.getAttribute && e.target.getAttribute('contenteditable') === 'true') return;
      if (LIVE_SEL < 0 || keyHeld[e.code]) return;
      var deg = KEY_ROW.indexOf(e.code);
      if (deg < 0) return;
      e.preventDefault();
      var root = 60 + blockSound(LIVE_SEL).pitch;   // do central + pitch du bloc
      keyHeld[e.code] = playKeyNote(LIVE_SEL, root + KEY_SCALE[deg]);
    });
    document.addEventListener('keyup', function (e) {
      if (keyHeld[e.code]) { releaseKeyNote(keyHeld[e.code]); delete keyHeld[e.code]; }
    });
  }

  /* Percussions synthétisées — grain analogique (808/909) */
  function liveDrum(i, time, type, volIn) {
    var ch = ensureChain(i), c = A.ctx;
    var vol = (volIn != null ? volIn : 0.8) * 0.55;
    var out = ch.gT;

    if (type === 'kick') {
      // Kick 808 profond : click d'attaque + corps sinus qui plonge très bas + drive
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(180, time);
      o.frequency.exponentialRampToValueAtTime(38, time + 0.16);   // descend bien plus bas
      // légère saturation pour le "punch" (waveshaper doux)
      var sh = c.createWaveShaper(); sh.curve = kickCurve();
      g.gain.setValueAtTime(vol * 1.15, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);      // queue longue = profondeur
      o.connect(sh); sh.connect(g); g.connect(out);
      o.start(time); o.stop(time + 0.55);
      // click d'attaque (transitoire net)
      var ck = c.createOscillator(), cg = c.createGain();
      ck.type = 'triangle'; ck.frequency.setValueAtTime(1200, time);
      ck.frequency.exponentialRampToValueAtTime(200, time + 0.02);
      cg.gain.setValueAtTime(vol * 0.5, time);
      cg.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
      ck.connect(cg); cg.connect(out);
      ck.start(time); ck.stop(time + 0.04);

    } else if (type === 'snare') {
      // Snare 909 : deux oscillos accordés + nappe de bruit filtrée
      [180, 278].forEach(function (f, n) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(vol * (n ? 0.35 : 0.5), time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
        o.connect(g); g.connect(out); o.start(time); o.stop(time + 0.12);
      });
      var s = c.createBufferSource(); s.buffer = A.noiseBuf;
      var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.7;
      var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200;
      var g1 = c.createGain();
      g1.gain.setValueAtTime(vol * 0.9, time);
      g1.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
      s.connect(bp); bp.connect(hp); hp.connect(g1); g1.connect(out);
      s.start(time); s.stop(time + 0.22);

    } else if (type === 'clap') {
      // Clap : rafale de 3 impulsions de bruit rapprochées + réverbe courte
      [0, 0.009, 0.018, 0.03].forEach(function (dl, n) {
        var s = c.createBufferSource(); s.buffer = A.noiseBuf;
        var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 1.2;
        var g = c.createGain();
        var amp = n === 3 ? vol * 0.7 : vol * 0.5;
        g.gain.setValueAtTime(amp, time + dl);
        g.gain.exponentialRampToValueAtTime(0.0001, time + dl + (n === 3 ? 0.13 : 0.03));
        s.connect(bp); bp.connect(g); g.connect(out);
        s.start(time + dl); s.stop(time + dl + 0.15);
      });

    } else if (type === 'hat' || type === 'ohat') {
      // Hi-hat métallique : bruit très filtré, court (fermé) ou long (ouvert)
      var open = (type === 'ohat');
      var s2 = c.createBufferSource(); s2.buffer = A.noiseBuf;
      var hp2 = c.createBiquadFilter(); hp2.type = 'highpass'; hp2.frequency.value = 8000;
      var bp2 = c.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 11000; bp2.Q.value = 1.4;
      var g3 = c.createGain();
      var dur = open ? 0.32 : 0.05;
      g3.gain.setValueAtTime(vol * (open ? 0.45 : 0.55), time);
      g3.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      s2.connect(hp2); hp2.connect(bp2); bp2.connect(g3); g3.connect(out);
      s2.start(time); s2.stop(time + dur + 0.02);

    } else if (type === 'toml' || type === 'tomm' || type === 'tomh') {
      // Toms : sinus accordé qui descend, corps rond
      var base = type === 'toml' ? 110 : (type === 'tomm' ? 165 : 240);
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base, time);
      o.frequency.exponentialRampToValueAtTime(base * 0.6, time + 0.2);
      g.gain.setValueAtTime(vol, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
      o.connect(g); g.connect(out); o.start(time); o.stop(time + 0.3);

    } else if (type === 'rim') {
      // Rimshot : impulsion très courte, claquante, aiguë
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'square'; o.frequency.value = 440;
      g.gain.setValueAtTime(vol * 0.7, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
      o.connect(g); g.connect(out); o.start(time); o.stop(time + 0.04);

    } else if (type === 'cow') {
      // Cowbell : deux carrés inharmoniques (808 classique)
      [540, 800].forEach(function (f) {
        var o = c.createOscillator(), g = c.createGain();
        o.type = 'square'; o.frequency.value = f;
        g.gain.setValueAtTime(vol * 0.35, time);
        g.gain.exponentialRampToValueAtTime(0.0001, time + 0.16);
        o.connect(g); g.connect(out); o.start(time); o.stop(time + 0.18);
      });

    } else if (type === 'shaker') {
      // Shaker : bruit filtré doux, enveloppe en cloche
      var s3 = c.createBufferSource(); s3.buffer = A.noiseBuf;
      var hp3 = c.createBiquadFilter(); hp3.type = 'highpass'; hp3.frequency.value = 6000;
      var g4 = c.createGain();
      g4.gain.setValueAtTime(0.0001, time);
      g4.gain.linearRampToValueAtTime(vol * 0.4, time + 0.02);
      g4.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
      s3.connect(hp3); hp3.connect(g4); g4.connect(out);
      s3.start(time); s3.stop(time + 0.1);

    } else if (type === 'clave') {
      // Clave : impulsion sinus nette et sèche, bois
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 1150;
      g.gain.setValueAtTime(vol * 0.6, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      o.connect(g); g.connect(out); o.start(time); o.stop(time + 0.06);
    }
  }

  // Courbe de saturation douce pour le punch du kick (mémoïsée)
  var _kickCurve = null;
  function kickCurve() {
    if (_kickCurve) return _kickCurve;
    var n = 1024, curve = new Float32Array(n), k = 2.2;
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * 2 - 1;
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));   // soft clip
    }
    _kickCurve = curve;
    return curve;
  }

  /* Bascule les mutes en attente au début de chaque mesure (synchro) */
  var lastMuteBar = null;
  function commitPendingMutes() {
    // Rien en attente : rien à faire (mais on ne bloque pas si le son est off)
    var keys = Object.keys(mutePending);
    if (!keys.length) { lastMuteBar = null; return; }
    // Si l'audio n'a jamais démarré, on bascule tout de suite (pas de grille)
    if (!A.ctx || A.t0 == null) {
      keys.forEach(function (k) {
        muteState[+k] = mutePending[+k]; delete mutePending[+k]; refreshMuteBtn(+k);
      });
      if (A.ctx) balance();
      return;
    }
    // Quantification du mute : au prochain TEMPS (réactif tout en restant carré).
    // BARLEN reste la grille du reste ; le mute vise la subdivision la plus proche.
    var beatDur = 60 / bpm();
    var beat = Math.floor((A.ctx.currentTime - A.t0) / beatDur);
    if (lastMuteBar == null) { lastMuteBar = beat; return; }
    if (beat > lastMuteBar) {
      lastMuteBar = beat;
      keys.forEach(function (k) {
        var i = +k;
        muteState[i] = mutePending[i];
        delete mutePending[i];
        refreshMuteBtn(i);
      });
      balance();
    }
  }

  // Demande de mute/démute : prend effet au prochain début de mesure
  function toggleMute(i) {
    var current = (mutePending[i] != null) ? mutePending[i] : !!muteState[i];
    var target = !current;
    if (target === !!muteState[i]) delete mutePending[i];
    else mutePending[i] = target;
    refreshMuteBtn(i);
  }

  function refreshMuteBtn(i) {
    var b = blocks[i]; if (!b || !b.muteBtn) return;
    var effective = !!muteState[i];
    var pending = (mutePending[i] != null && mutePending[i] !== effective);
    b.muteBtn.classList.toggle('sc-muted', effective);
    b.muteBtn.classList.toggle('sc-mute-pending', pending);
    b.muteBtn.textContent = effective ? '\u2205' : '\u25CF';
    b.el.classList.toggle('sc-block-muted', effective);
    b.muteBtn.title = effective
      ? (pending ? 'va se rallumer \u2014 prochaine mesure' : 'muet (cliquer pour rallumer)')
      : (pending ? 'va se couper \u2014 prochaine mesure' : 'actif (cliquer pour couper)');
  }


  function scheduleLive() {
    Object.keys(LIVE).forEach(function (k) {
      var i = +k, st = LIVE[k];
      if (!st.prog) return;
      if (!liveActive(i)) { st.nextT = 0; st.pos = 0; markPlaying(i, false); return; }
      markPlaying(i, true);
      var factor  = bpm() / 130;                       // RATE module autour de 130 BPM
      var beatDur = 60 / (st.prog.tempo * factor);
      if (!st.nextT || st.nextT < A.ctx.currentTime - 0.5) {
        // Redémarrage quantifié sur la grille de MESURE partagée (BARLEN temps),
        // pour que la boucle reprenne calée avec les autres, sans dérive.
        var gDur = 60 / bpm();
        var barDur = gDur * BARLEN;
        var t   = A.ctx.currentTime + 0.05;
        var k   = Math.ceil((t - (A.t0 || 0)) / barDur);
        st.nextT = (A.t0 || 0) + k * barDur;
        st.pos   = 0;
      }
      var guard = 0;
      while (st.nextT < A.ctx.currentTime + 0.12 && guard++ < 64) {
        if (st.pos >= st.prog.events.length) {
          st.pos = 0;
          if (st.pending) { st.prog = st.pending; st.pending = null;
                            beatDur = 60 / (st.prog.tempo * factor); }
          if (!st.prog.events.length) break;
        }
        var ev = st.prog.events[st.pos++];
        if (ev.drum) { liveDrum(i, st.nextT, ev.drum, ev.vol); pulseBlock(i, st.nextT); }
        else if (ev.midis || ev.pick || ev.midi != null) { liveNote(i, st.nextT, ev, beatDur); pulseBlock(i, st.nextT); }
        st.nextT += ev.dt * beatDur;
      }
    });
  }

  /* Édition live côté visiteur : double-clic sur un bloc texte */
  function startLiveEdit(i) {
    var el = blocks[i].el;
    if (el.getAttribute('contenteditable') === 'true') return;
    freezeAnim(i, true);   // fige le bloc pendant qu'on écrit dedans
    el.setAttribute('contenteditable', 'true');
    el.classList.add('sc-live-edit');
    el.focus();
    var onKey = function (e) {
      e.stopPropagation();
      if (e.key === 'Escape' || (e.key === 'Enter' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault(); el.blur();
      }
    };
    var done = function () {
      el.removeAttribute('contenteditable');
      el.classList.remove('sc-live-edit');
      el.removeEventListener('blur', done);
      el.removeEventListener('keydown', onKey);
      refreshBlockCode(i);
      // ne dégèle que si le bloc n'est pas aussi sélectionné au clavier
      if (LIVE_SEL !== i) freezeAnim(i, false);
    };
    el.addEventListener('blur', done);
    el.addEventListener('keydown', onKey);
  }

  function fxTouches(cable, fx) {
    return modTargets(fx).some(function (t) {
      return cable.from === t.block || cable.to === t.block;
    });
  }

  /* ── Voix ── */
  function addVoice(cable) {
    if (!A.on || A.voices[cable.id]) return;
    if (isCoded(cable.from)) return; // bloc codé : sa boucle remplace la voix de nappe
    var c  = actx();
    var p1 = jackPos(cable.from, 'out'), p2 = jackPos(cable.to, 'in');
    var baseF = noteFreq(Math.hypot(p2.x - p1.x, p2.y - p1.y));
    var snd = blockSound(cable.from);
    var f  = baseF * pitchFactor(cable.from);
    var o1 = c.createOscillator(), o2 = c.createOscillator();
    var gT = c.createGain(), g = c.createGain();
    o1.type = snd.wave; o2.type = 'triangle';
    o1.frequency.value = f; o2.frequency.value = f;
    o1.detune.value = -5; o2.detune.value = 5;
    gT.gain.value = 1; g.gain.value = 0;
    o1.connect(gT); o2.connect(gT); gT.connect(g);
    var pan = mkPanner(cable.from);
    var dest = blockGain(cable.from) || A.filter;
    if (pan) { g.connect(pan); pan.connect(dest); } else g.connect(dest);
    o1.start(); o2.start();
    A.voices[cable.id] = { o1: o1, o2: o2, gTrem: gT, g: g, pan: pan, f: f, baseF: baseF, fx: {} };
    rebuildVoiceFx(cable);
    balance();
  }

  function clearVoiceFx(v) {
    Object.keys(v.fx).forEach(function (k) {
      var f = v.fx[k];
      ['osc', 'sub', 'src'].forEach(function (p) {
        try { f[p] && f[p].stop(); } catch (e) {}
      });
      try { f.gain && f.gain.disconnect(); } catch (e) {}
      try { f.send && f.send.disconnect(); } catch (e) {}
    });
    v.fx = {};
    if (A.ctx) v.gTrem.gain.setTargetAtTime(1, A.ctx.currentTime, 0.1);
  }

  function rebuildVoiceFx(cable) {
    var v = A.voices[cable.id]; if (!v) return;
    var c = A.ctx;
    clearVoiceFx(v);
    if (fxTouches(cable, 'fm')) {
      var fo = c.createOscillator(), fg = c.createGain();
      fo.frequency.value = rateHz() * 4; fg.gain.value = v.f * 0.025;
      fo.connect(fg); fg.connect(v.o1.frequency); fg.connect(v.o2.frequency);
      fo.start(); v.fx.fm = { osc: fo, gain: fg };
    }
    if (fxTouches(cable, 'trem')) {
      var to = c.createOscillator(), tg = c.createGain();
      to.frequency.value = rateHz() * 2; tg.gain.value = 0.45;
      v.gTrem.gain.setTargetAtTime(0.55, c.currentTime, 0.1);
      to.connect(tg); tg.connect(v.gTrem.gain);
      to.start(); v.fx.trem = { osc: to, gain: tg };
    }
    if (fxTouches(cable, 'sub')) {
      var so = c.createOscillator(), sg = c.createGain();
      so.type = 'square'; so.frequency.value = v.f / 2; sg.gain.value = 0.35;
      so.connect(sg); sg.connect(v.gTrem);
      so.start(); v.fx.sub = { sub: so, gain: sg };
    }
    if (fxTouches(cable, 'echo')) {
      var es = c.createGain(); es.gain.value = 0.8;
      v.g.connect(es); es.connect(A.echo.input);
      v.fx.echo = { send: es };
    }
    if (fxTouches(cable, 'crush')) {
      var cs = c.createGain(); cs.gain.value = 0.9;
      v.g.connect(cs); cs.connect(A.crush.input);
      v.fx.crush = { send: cs };
    }
    if (fxTouches(cable, 'verb')) {
      var vs = c.createGain(); vs.gain.value = 0.85;
      v.g.connect(vs); vs.connect(A.verb.input);
      v.fx.verb = { send: vs };
    }
    if (fxTouches(cable, 'noise')) {
      // souffle accordé : bruit blanc bouclé → bandpass sur l'harmonique de la voix
      var len = c.sampleRate * 1.5, buf = c.createBuffer(1, len, c.sampleRate);
      var d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      var bp = c.createBiquadFilter(); bp.type = 'bandpass';
      bp.frequency.value = v.f * 2; bp.Q.value = 9;
      var ng = c.createGain(); ng.gain.value = 0.28 * A.mini.noise.val;
      src.connect(bp); bp.connect(ng); ng.connect(v.gTrem);
      src.start(); v.fx.noise = { src: src, gain: ng, bp: bp };
    }
  }

  function rebuildAllFx() {
    cables.forEach(rebuildVoiceFx);
    Object.keys(LIVE).forEach(function (k) { rebuildLiveFx(+k); });
  }

  function removeVoice(id) {
    var v = A.voices[id]; if (!v) return;
    var t = A.ctx.currentTime;
    v.g.gain.cancelScheduledValues(t);
    v.g.gain.setValueAtTime(v.g.gain.value, t);
    v.g.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(function () {
      clearVoiceFx(v);
      try { v.o1.stop(); v.o2.stop(); } catch (e) {}
    }, 500);
    delete A.voices[id];
    balance();
  }

  function balance() {
    var ids = Object.keys(A.voices), n = ids.length; if (!n) return;
    var per = 0.28 / Math.sqrt(n), t = A.ctx.currentTime;
    ids.forEach(function (id) {
      var cb = cables.find(function (c) { return c.id == id; });
      var allowed = !cb || (!isMuted(cb.from) && turnAllows(cb.from));
      var g = A.voices[id].g.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(allowed ? per : 0, t + 0.6);
    });
  }

  /* ── Séquenceur (plucks, couleur des blocs) ── */
  var SEQ = { timer: null, step: 0, next: 0 };
  function bpm() { return 50 + A.rate * 250; }   // 50 → 300 BPM (défaut rate .25 → 112)

  function pluck(time, freq, wave, gainVal, panVal) {
    var c = A.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = wave; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gainVal, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);
    o.connect(g);
    if (panVal != null && c.createStereoPanner) {
      var p = c.createStereoPanner(); p.pan.value = panVal;
      g.connect(p); p.connect(A.filter);
    } else g.connect(A.filter);
    o.start(time); o.stop(time + 0.32);
  }

  function startSeq() {
    if (SEQ.timer) return;
    SEQ.step = 0; SEQ.next = A.ctx.currentTime + 0.1;
    SEQ.timer = setInterval(function () {
      if (!A.on) return;
      scheduleLive();
      var stepDur = 60 / bpm() / 2;
      while (SEQ.next < A.ctx.currentTime + 0.12) {
        cables.forEach(function (cb, i) {
          if (isCoded(cb.from)) return;
          if (isMuted(cb.from) || !turnAllows(cb.from)) return;
          var chr = blockCharacter(cb.from);
          if (SEQ.step % chr.div === i % chr.div) {
            var v = A.voices[cb.id];
            var f = v ? v.f * 2 : 220 * pitchFactor(cb.from);
            var n = Math.max(1, Object.keys(A.voices).length);
            pluck(SEQ.next, f, blockSound(cb.from).wave, 0.27 / Math.sqrt(n), blockPan(cb.from));
            pulseBlock(cb.from, SEQ.next);
          }
        });
        SEQ.next += stepDur;
        SEQ.step = (SEQ.step + 1) % 24;
      }
    }, 30);
  }
  function stopSeq() { clearInterval(SEQ.timer); SEQ.timer = null; }

  function powerOn()  { A.on = true; actx();
    A.t0 = A.ctx.currentTime;   // horloge maître : tout se cale dessus
    A.master.gain.linearRampToValueAtTime(A.vol, A.ctx.currentTime + 1.2);
    cables.forEach(addVoice); startSeq();
    blocks.forEach(function (b, i) { if (b) applySpatial(i); }); }
  function powerOff() { A.on = false; if (!A.ctx) return;
    A.master.gain.linearRampToValueAtTime(0, A.ctx.currentTime + 0.8);
    stopSeq();
    setTimeout(function () { Object.keys(A.voices).forEach(removeVoice); }, 900); }

  // Resynchro douce : réaligne toutes les boucles sur la grille, sans couper le son.
  // Repose l'horloge maître au prochain temps et remet à zéro les compteurs de
  // boucle, pour que tout reparte ensemble — l'équivalent d'un stop/play, mais lisse.
  function resync() {
    if (!A.on || !A.ctx) return;
    var now = A.ctx.currentTime;
    var beatDur = 60 / bpm();
    // caler le nouveau départ sur le prochain temps (transition en rythme)
    var k = Math.ceil((now - (A.t0 || 0)) / beatDur);
    A.t0 = (A.t0 || 0) + k * beatDur;
    // réinitialiser tous les compteurs de boucle
    Object.keys(LIVE).forEach(function (key) {
      LIVE[key].nextT = 0; LIVE[key].pos = 0;
    });
    lastMuteBar = null;
    TURN.lastStep = null;
    // recaler le séquenceur de plucks sur le nouveau départ
    if (SEQ) { SEQ.step = 0; SEQ.next = A.t0; }
    // petit repère visuel : flash de la LED
    flashResync();
  }

  function flashResync() {
    var led = document.getElementById('sc-synth-led');
    if (!led) return;
    led.style.transition = 'none';
    led.style.boxShadow = '0 0 14px 4px #7dd8a8';
    setTimeout(function () { led.style.transition = ''; led.style.boxShadow = ''; }, 220);
  }

  function applyKnobs() {
    if (!A.ctx) return;
    var t = A.ctx.currentTime;
    if (A.on) A.master.gain.setTargetAtTime(A.vol, t, 0.1);
    A.filter.frequency.setTargetAtTime(120 * Math.pow(8000 / 120, A.cutoff), t, 0.1);
    A.lfo.frequency.setTargetAtTime(rateHz(), t, 0.1);
    A.lfoGain.gain.setTargetAtTime(150 + A.cutoff * 900, t, 0.1);
    A.echo.delay.delayTime.setTargetAtTime(0.06 + A.mini.echo.val * 0.55, t, 0.1);
    A.crush.shaper.curve = crushCurve(A.mini.crush.val);
    if (A.verb) A.verb.out.gain.setTargetAtTime(A.mini.verb.val * 0.9, t, 0.1);
    Object.keys(A.voices).forEach(function (id) {
      var fx = A.voices[id].fx;
      if (fx.fm)    fx.fm.osc.frequency.setTargetAtTime(rateHz() * 4, t, 0.1);
      if (fx.trem)  fx.trem.osc.frequency.setTargetAtTime(rateHz() * 2, t, 0.1);
      if (fx.noise) fx.noise.gain.gain.setTargetAtTime(0.28 * A.mini.noise.val, t, 0.1);
    });
  }

  function clickFx(up) {
    try {
      var c = actx(), o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(up ? 500 : 300, c.currentTime);
      o.frequency.exponentialRampToValueAtTime(up ? 700 : 90, c.currentTime + 0.06);
      g.gain.setValueAtTime(0.12, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.09);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + 0.1);
    } catch (e) {}
  }

  /* ════════ MODULES (UI) ════════ */
  function knobHtml(key, label) {
    return '<div class="sc-knob-wrap"><div class="sc-knob" data-k="' + key +
           '"><div class="sc-knob-mark"></div></div><span>' + label + '</span></div>';
  }
  function modJackHtml(fx, label) {
    return '<div class="sc-modjack-wrap"><div class="sc-modjack" data-fx="' + fx +
           '" style="border-color:' + FX_COLOR[fx] + '"></div><span>' + label + '</span></div>';
  }

  // Panneau de contrôle du zoom + molette + pan
  function buildZoomControls() {
    var box = document.createElement('div');
    box.className = 'sc-zoom-ctrl';
    box.innerHTML =
      '<button id="sc-zoom-out" title="Dézoomer">\u2212</button>' +
      '<button id="sc-zoom-label-btn" title="Recentrer"><span id="sc-zoom-label">100%</span></button>' +
      '<button id="sc-zoom-in" title="Zoomer">+</button>';
    document.body.appendChild(box);
    box.querySelector('#sc-zoom-in').addEventListener('click', function (e) { e.stopPropagation(); zoomBy(1.2); });
    box.querySelector('#sc-zoom-out').addEventListener('click', function (e) { e.stopPropagation(); zoomBy(1 / 1.2); });
    box.querySelector('#sc-zoom-label-btn').addEventListener('click', function (e) { e.stopPropagation(); resetView(); });

    // Molette : zoom centré sur le curseur (Ctrl+molette ou molette simple sur le fond)
    window.addEventListener('wheel', function (e) {
      // ne pas interférer avec le scroll d'un panneau (aide, etc.)
      if (e.target.closest('.sc-help, .sc-anim-panel, .sc-module')) return;
      if (e.ctrlKey || e.metaKey || !e.target.closest('.sc-el')) {
        e.preventDefault();
        var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
        zoomAt(e.clientX, e.clientY, factor);
      }
    }, { passive: false });

    // Pan : bouton du milieu, ou barre d'espace maintenue + glisser (comme les
    // outils créatifs). Jamais sur simple clic gauche → n'interfère pas avec
    // la sélection, le double-clic création, ni le câblage.
    var panning = false, armed = false, px = 0, py = 0, px0 = 0, py0 = 0;
    var spaceDown = false;
    window.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && e.target === document.body) {
        spaceDown = true; document.body.style.cursor = 'grab'; e.preventDefault();
      }
    });
    window.addEventListener('keyup', function (e) {
      if (e.code === 'Space') { spaceDown = false; if (!panning) document.body.style.cursor = ''; }
    });
    window.addEventListener('pointerdown', function (e) {
      if (e.button === 1 || (e.button === 0 && spaceDown)) {
        armed = true; px = e.clientX; py = e.clientY; px0 = VIEW.panX; py0 = VIEW.panY;
        e.preventDefault();
      }
    });
    window.addEventListener('pointermove', function (e) {
      if (!armed) return;
      var dx = e.clientX - px, dy = e.clientY - py;
      if (!panning && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;   // seuil
      panning = true;
      document.body.style.cursor = 'grabbing';
      VIEW.panX = px0 + dx;
      VIEW.panY = py0 + dy;
      applyView();
    });
    window.addEventListener('pointerup', function () {
      armed = false;
      if (panning) { panning = false; document.body.style.cursor = spaceDown ? 'grab' : ''; }
    });
  }

  // Tiroir : masque/affiche tous les modules d'un coup pour libérer l'espace
  var RACK_OPEN = true;
  function buildRackToggle() {
    var btn = document.createElement('button');
    btn.id = 'sc-rack-toggle';
    btn.title = 'Afficher / masquer les modules';
    btn.innerHTML = '<span class="sc-rack-icon">\u25A4</span><span class="sc-rack-txt">modules</span>';
    document.body.appendChild(btn);
    btn.addEventListener('click', function (e) {
      e.stopPropagation(); toggleRack();
    });
    updateRackToggle();
  }
  function toggleRack() {
    RACK_OPEN = !RACK_OPEN;
    document.body.classList.toggle('sc-rack-hidden', !RACK_OPEN);
    updateRackToggle();
  }
  function updateRackToggle() {
    var btn = document.getElementById('sc-rack-toggle');
    if (!btn) return;
    btn.classList.toggle('closed', !RACK_OPEN);
    var txt = btn.querySelector('.sc-rack-txt');
    if (txt) txt.textContent = RACK_OPEN ? 'masquer' : 'modules';
  }

  function buildModule() {
    var m = document.createElement('div');
    m.id = 'sc-synth'; m.className = 'sc-module'; m.dataset.mod = 'scotch';
    m.innerHTML =
      '<div class="sc-module-title">▚ SCOTCH-01 ▞</div>' +
      // ── TRANSPORT : lancer + volume + débrancher ──
      '<div class="sc-sec">' +
        '<div class="sc-pwr-col">' +
          '<button id="sc-synth-pwr" title="Allumer / éteindre le son">' +
            '<span id="sc-synth-led"></span><span class="sc-pwr-glyph">\u25B6</span></button>' +
          '<div class="sc-pwr-label">appuyer pour lancer</div>' +
        '</div>' +
        '<div class="sc-synth-knobs">' + knobHtml('vol', 'VOL') + '</div>' +
      '</div>' +
      '<div class="sc-sec">' +
        '<button id="sc-synth-resync" title="Recaler toutes les boucles, en douceur">\u21BB RESYNCHRO</button>' +
        '<button id="sc-synth-clean" title="Nettoyer les connexions orphelines ou en double">\u2726 NETTOYER</button>' +
        '<button id="sc-synth-clear" title="Débrancher tous les câbles">\u2702 DÉBRANCHER TOUT</button>' +
      '</div>';
    document.body.appendChild(m);

    document.getElementById('sc-synth-pwr').addEventListener('click', function () {
      var lbl = document.querySelector('.sc-pwr-label');
      var gly = document.querySelector('.sc-pwr-glyph');
      if (A.on) { powerOff(); m.classList.remove('on');
        if (lbl) lbl.textContent = 'appuyer pour lancer';
        if (gly) gly.textContent = '\u25B6'; }              // ▶ play
      else      { powerOn();  m.classList.add('on');
        if (lbl) lbl.textContent = 'son actif';
        if (gly) gly.textContent = '\u25A0'; }              // ■ stop
    });
    document.getElementById('sc-synth-resync').addEventListener('click', function (e) {
      e.stopPropagation(); resync();
    });
    document.getElementById('sc-synth-clean').addEventListener('click', function (e) {
      e.stopPropagation();
      var n = cleanConnections();
      var btn = e.currentTarget;
      var old = btn.textContent;
      btn.textContent = n > 0 ? ('\u2726 ' + n + ' retir\u00e9' + (n > 1 ? 's' : '')) : '\u2726 tout est propre';
      setTimeout(function () { btn.textContent = old; }, 1400);
    });
    document.getElementById('sc-synth-clear').addEventListener('click', function (e) {
      e.stopPropagation(); clearAllCables();
    });
    bindKnob(m.querySelector('.sc-knob[data-k="vol"]'),
      function(){return A.vol;},    function(v){A.vol=v; applyKnobs();});
    bindDrag(m);
    ledLoop();
    buildControlModules();
  }

  // Modules de contrôle séparés (rack éclaté)
  // ══════ GÉNÉRATEUR de motifs (mélodie / rythme) ══════
  // Gammes choisies pour sortir des sentiers battus (degrés en demi-tons)
  var GEN_SCALES = [
    { name: 'dorien',        deg: [0, 2, 3, 5, 7, 9, 10] },
    { name: 'phrygien',      deg: [0, 1, 3, 5, 7, 8, 10] },
    { name: 'lydien',        deg: [0, 2, 4, 6, 7, 9, 11] },
    { name: 'mixolydien',    deg: [0, 2, 4, 5, 7, 9, 10] },
    { name: 'hirajoshi',     deg: [0, 2, 3, 7, 8] },        // japonaise
    { name: 'kumoï',         deg: [0, 2, 3, 7, 9] },        // japonaise
    { name: 'penta mineure', deg: [0, 3, 5, 7, 10] },
    { name: 'par tons',      deg: [0, 2, 4, 6, 8, 10] },    // whole tone
    { name: 'phrygien maj',  deg: [0, 1, 4, 5, 7, 8, 10] }  // teinte espagnole
  ];
  var GEN_WAVES = ['sine', 'tri', 'saw', 'square'];
  var NOTE_LETTERS = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function chance(p) { return Math.random() < p; }

  // convertit un demi-ton absolu (0 = c) en nom de note + octave
  function noteName(semi, baseOct) {
    var oct = baseOct + Math.floor(semi / 12);
    return NOTE_LETTERS[((semi % 12) + 12) % 12] + oct;
  }

  // Rythme euclidien : répartit k pulses sur n pas le plus régulièrement possible
  // (algorithme de Bjorklund — donne des motifs "world" naturellement asymétriques)
  function euclid(k, n) {
    if (k <= 0) return new Array(n).fill(0);
    if (k >= n) return new Array(n).fill(1);
    var pattern = [], counts = [], remainders = [k], divisor = n - k, level = 0;
    while (true) {
      counts.push(Math.floor(divisor / remainders[level]));
      remainders.push(divisor % remainders[level]);
      divisor = remainders[level];
      level++;
      if (remainders[level] <= 1) break;
    }
    counts.push(divisor);
    function build(lvl) {
      if (lvl === -1) pattern.push(0);
      else if (lvl === -2) pattern.push(1);
      else { for (var i = 0; i < counts[lvl]; i++) build(lvl - 1);
             if (remainders[lvl] !== 0) build(lvl - 2); }
    }
    build(level);
    var idx = pattern.indexOf(1);
    var rotated = pattern.slice(idx).concat(pattern.slice(0, idx));
    return rotated;
  }

  // Génère un bloc de code mélodique original
  function genMelody() {
    var scale = pick(GEN_SCALES);
    var wave = pick(GEN_WAVES);
    var tempo = 70 + ((Math.random() * 12) | 0) * 8;        // 70..158, pas de 8
    var baseOct = chance(0.5) ? 3 : (chance(0.5) ? 2 : 4);
    var len = pick([6, 8, 8, 12]);                          // longueur du motif
    var div = pick([1, 2, 2, 4]);                           // finesse rythmique
    var lines = ['# ' + scale.name, 'tempo ' + tempo, 'wave ' + wave];
    if (div > 1) lines.push('div ' + div);

    // marche mélodique : petits pas dans la gamme, quelques sauts, silences
    var deg = scale.deg, pos = (Math.random() * deg.length) | 0, oct = 0;
    var toks = [];
    for (var s = 0; s < len; s++) {
      if (chance(0.16)) { toks.push('.'); continue; }        // respiration
      // déplacement : surtout ±1 degré, parfois saut, rare octave
      var mv = chance(0.7) ? (chance(0.5) ? 1 : -1)
             : chance(0.6) ? (chance(0.5) ? 2 : -2) : 0;
      pos += mv;
      while (pos < 0) { pos += deg.length; oct--; }
      while (pos >= deg.length) { pos -= deg.length; oct++; }
      var semi = deg[pos] + oct * 12;
      var tok = noteName(semi, baseOct);
      if (chance(0.14)) tok += '+' + noteName(deg[(pos + 2) % deg.length] + oct * 12, baseOct); // accord ponctuel
      toks.push(tok);
    }
    lines.push('play ' + toks.join(' '));
    return lines.join('\n');
  }

  // Génère un bloc de code rythmique original (euclidien, palette 808)
  function genRhythm() {
    var tempo = 84 + ((Math.random() * 10) | 0) * 8;
    var steps = pick([8, 12, 16, 16]);
    var div = steps >= 16 ? 4 : (steps >= 12 ? 4 : 2);
    var kHits = 2 + ((Math.random() * 3) | 0);              // 2..4
    var sHits = 1 + ((Math.random() * 3) | 0);              // 1..3
    var kick  = euclid(kHits, steps);
    var snare = rotate(euclid(sHits, steps), 1 + ((Math.random() * (steps - 1)) | 0));
    var hats  = euclid(3 + ((Math.random() * 5) | 0), steps);
    // couche de percussion secondaire, choisie au hasard dans la palette élargie
    var spice = pick(['clap', 'rim', 'toml', 'cow', 'shaker', 'clave', 'oh']);
    var spiceHits = euclid(1 + ((Math.random() * 3) | 0), steps);
    var spiceRot = rotate(spiceHits, 2 + ((Math.random() * (steps - 2)) | 0));
    // hat fermé/ouvert : parfois un open hat en contretemps
    var useOpen = chance(0.5);
    var toks = [];
    for (var i = 0; i < steps; i++) {
      if (kick[i]) toks.push('kick');
      else if (snare[i]) toks.push('snare');
      else if (spiceRot[i] && chance(0.8)) toks.push(spice);
      else if (hats[i] && chance(0.72)) toks.push(useOpen && (i % 4 === 2) ? 'oh' : 'hat');
      else toks.push('.');
    }
    return ['# groove euclidien ' + kHits + '/' + sHits + ' + ' + spice,
            'tempo ' + tempo, 'div ' + div, 'play ' + toks.join(' ')].join('\n');
  }

  function rotate(arr, n) { n = n % arr.length; return arr.slice(n).concat(arr.slice(0, n)); }

  // Crée un bloc rempli d'un motif généré, au centre de la vue
  function spawnGenerated(kind) {
    var code = (kind === 'rhythm') ? genRhythm() : genMelody();
    var cx = window.innerWidth / 2 - 95 + (Math.random() * 120 - 60);
    var cy = window.innerHeight / 2 - 60 + (Math.random() * 120 - 60);
    var i = createLiveBlock(cx, cy, { code: code, noEdit: true });
    // léger flash pour repérer le nouveau bloc
    var b = blocks[i];
    if (b && b.el) {
      b.el.style.transition = 'box-shadow .3s';
      b.el.style.boxShadow = '0 0 0 3px #7dd8a8';
      setTimeout(function () { b.el.style.boxShadow = ''; }, 500);
    }
    return i;
  }

  function buildControlModules() {
    // ── Module GÉNÉRATEUR : crée des blocs remplis de motifs originaux ──
    var gn = document.createElement('div');
    gn.className = 'sc-module sc-mini'; gn.dataset.mod = 'generateur';
    gn.style.bottom = '150px'; gn.style.right = '790px';
    gn.style.width = '132px';
    gn.innerHTML =
      '<div class="sc-module-title">GÉNÉRATEUR</div>' +
      '<button id="sc-gen-melo" title="Créer un bloc mélodie">\u266a MÉLODIE</button>' +
      '<button id="sc-gen-ryth" title="Créer un bloc rythme">\u25AC RYTHME</button>' +
      '<div class="sc-gen-hint">un clic = un nouveau bloc</div>';
    document.body.appendChild(gn);
    gn.querySelector('#sc-gen-melo').addEventListener('click', function (e) {
      e.stopPropagation(); spawnGenerated('melody');
    });
    gn.querySelector('#sc-gen-ryth').addEventListener('click', function (e) {
      e.stopPropagation(); spawnGenerated('rhythm');
    });
    bindDrag(gn);

    // ── Module CARREFOUR : reçoit des blocs câblés, en tire au hasard ──
    var tn = document.createElement('div');
    tn.className = 'sc-module sc-mini'; tn.dataset.mod = 'carrefour';
    tn.style.bottom = '150px'; tn.style.right = '620px';
    tn.style.width = '150px';
    tn.innerHTML =
      '<div class="sc-module-title">CARREFOUR</div>' +
      '<div class="sc-turn-ins" title="Brancher le OUT d\'un bloc sur une entrée libre">' +
        [0,1,2,3,4,5].map(function (n) {
          return '<span class="sc-modjack sc-turn-in" data-fx="turn" data-slot="' + n + '">' + (n+1) + '</span>';
        }).join('') +
      '</div>' +
      '<div class="sc-turn-jackrow"><span id="sc-turn-count">0 bloc</span></div>' +
      '<div class="sc-turn-ctrl">' +
        '<div class="sc-turn-lbl">densit\u00e9</div>' +
        '<div class="sc-turn-dens">' +
          [['rare', 0.15], ['moiti\u00e9', 0.4], ['dense', 0.7]].map(function (d) {
            return '<button class="sc-turn-dbtn' + (Math.abs(TURN.density - d[1]) < 0.03 ? ' on' : '') +
                   '" data-dens="' + d[1] + '">' + d[0] + '</button>';
          }).join('') +
        '</div>' +
        '<div class="sc-turn-lbl" style="margin-top:5px">vitesse</div>' +
        '<div class="sc-turn-div">' +
          [1, 2, 4].map(function (n) {
            return '<button class="sc-turn-vbtn' + (n === TURN.div ? ' on' : '') +
                   '" data-div="' + n + '">' + n + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div id="sc-turn-members"></div>';
    document.body.appendChild(tn);
    bindTurnJack(tn);
    // densité (probabilité qu'un fil soit vivant à chaque tirage)
    tn.querySelectorAll('.sc-turn-dbtn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        TURN.density = +btn.dataset.dens;
        tn.querySelectorAll('.sc-turn-dbtn').forEach(function (b) {
          b.classList.toggle('on', b === btn);
        });
      });
    });
    // vitesse (division rythmique du re-tirage)
    tn.querySelectorAll('.sc-turn-vbtn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        TURN.div = +btn.dataset.div;
        tn.querySelectorAll('.sc-turn-vbtn').forEach(function (b) {
          b.classList.toggle('on', +b.dataset.div === TURN.div);
        });
      });
    });
    bindDrag(tn);
    // ── Module MESURE : longueur de la grille de synchro (mute, transitions) ──
    var me = document.createElement('div');
    me.className = 'sc-module sc-mini'; me.dataset.mod = 'mesure';
    me.style.bottom = '150px'; me.style.right = '470px';
    me.innerHTML =
      '<div class="sc-module-title">MESURE</div>' +
      '<div class="sc-bar-pick">' +
        [1, 2, 4, 8].map(function (n) {
          return '<button class="sc-bar-btn' + (n === BARLEN ? ' on' : '') +
                 '" data-bar="' + n + '">' + n + '</button>';
        }).join('') +
      '</div>' +
      '<div class="sc-bar-lbl">temps / mesure</div>';
    document.body.appendChild(me);
    me.querySelectorAll('.sc-bar-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        BARLEN = +btn.dataset.bar;
        me.querySelectorAll('.sc-bar-btn').forEach(function (b) {
          b.classList.toggle('on', +b.dataset.bar === BARLEN);
        });
      });
    });
    bindDrag(me);
    // ── Module MORCEAU : partager + aide ──
    var mo = document.createElement('div');
    mo.className = 'sc-module sc-mini'; mo.dataset.mod = 'morceau';
    mo.style.bottom = '150px'; mo.style.right = '196px';
    mo.innerHTML =
      '<div class="sc-module-title">MORCEAU</div>' +
      '<button id="sc-synth-share" title="Copier le lien du morceau" style="width:100%;margin:0 0 5px">\u21AA PARTAGER</button>' +
      '<button id="sc-synth-help" title="Aide — comment coder" style="width:100%">? AIDE</button>';
    document.body.appendChild(mo);
    mo.querySelector('#sc-synth-share').addEventListener('click', function (e) {
      e.stopPropagation(); sharePatch();
    });
    mo.querySelector('#sc-synth-help').addEventListener('click', function (e) {
      e.stopPropagation(); toggleHelp();
    });
    bindDrag(mo);

    // ── Module FILTRE / LFO : CUT + RATE ──
    var fl = document.createElement('div');
    fl.className = 'sc-module sc-mini'; fl.dataset.mod = 'filtre';
    fl.style.bottom = '150px'; fl.style.right = '312px';
    fl.style.width = '150px';
    fl.innerHTML =
      '<div class="sc-module-title">FILTRE / LFO</div>' +
      '<div class="sc-synth-knobs" style="gap:22px">' +
        knobHtml('cutoff', 'CUT') + knobHtml('rate', 'RATE') +
      '</div>';
    document.body.appendChild(fl);
    bindKnob(fl.querySelector('.sc-knob[data-k="cutoff"]'),
      function(){return A.cutoff;}, function(v){A.cutoff=v; applyKnobs();});
    bindKnob(fl.querySelector('.sc-knob[data-k="rate"]'),
      function(){return A.rate;},   function(v){A.rate=v; applyKnobs();});
    bindDrag(fl);

    // ── Modules FM / TRM / SUB séparés (colonne à droite) ──
    var MODS = [
      { fx: 'fm',   title: 'FM'  },
      { fx: 'trem', title: 'TRM' },
      { fx: 'sub',  title: 'SUB' }
    ];
    MODS.forEach(function (def, i) {
      var mm = document.createElement('div');
      mm.className = 'sc-module sc-mini sc-mod-tiny'; mm.dataset.mod = 'mod-' + def.fx;
      mm.style.bottom = (200 + i * 74) + 'px';
      mm.style.right = '14px';
      mm.innerHTML =
        '<div class="sc-module-title">' + def.title + '</div>' +
        '<div class="sc-synth-outs" style="border-top:none;padding-top:2px;margin-top:2px;justify-content:center">' +
          modJackHtml(def.fx, 'OUT') +
        '</div>';
      document.body.appendChild(mm);
      bindModJack(mm, def.fx);
      bindDrag(mm);
    });
  }

  var MINIS = [
    { fx: 'echo',  title: 'ECHO-02',  knob: 'TIME'  },
    { fx: 'crush', title: 'CRUSH-03', knob: 'DRIVE' },
    { fx: 'noise', title: 'NOISE-04', knob: 'AIR'   },
    { fx: 'verb',  title: 'VERB-05',  knob: 'SIZE'  },
  ];

  function buildMinis() {
    MINIS.forEach(function (def, i) {
      var m = document.createElement('div');
      m.className = 'sc-module sc-mini'; m.dataset.mod = 'fx-' + def.fx;
      m.style.right = (200 + i * 104) + 'px';
      m.innerHTML =
        '<div class="sc-module-title">' + def.title + '</div>' +
        knobHtml(def.fx, def.knob) +
        '<div class="sc-synth-outs" style="border-top:none;padding-top:2px;margin-top:4px;justify-content:center">' +
          modJackHtml(def.fx, 'OUT') +
        '</div>';
      document.body.appendChild(m);
      bindKnob(m.querySelector('.sc-knob'),
        function(){ return A.mini[def.fx].val; },
        function(v){ A.mini[def.fx].val = v; if (A.ctx) applyKnobs(); });
      bindModJack(m, def.fx);
      bindDrag(m);
    });
  }

  var KNOBS = [];   // {el, get} — pour resynchroniser l'affichage au chargement d'un patch
  function refreshAllKnobs() {
    KNOBS.forEach(function (k) {
      k.el.style.transform = 'rotate(' + (k.get() * 270 - 135) + 'deg)';
    });
  }

  function bindKnob(el, get, set) {
    var setRot = function () { el.style.transform = 'rotate(' + (get() * 270 - 135) + 'deg)'; };
    KNOBS.push({ el: el, get: get });
    setRot();
    el.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      el.setPointerCapture(e.pointerId);
      var sy = e.clientY, sv = get();
      var mv = function (e) {
        set(Math.min(1, Math.max(0, sv + (sy - e.clientY) / 150)));
        setRot();
      };
      var up = function () {
        el.removeEventListener('pointermove', mv);
        el.removeEventListener('pointerup', up);
      };
      el.addEventListener('pointermove', mv);
      el.addEventListener('pointerup', up);
    });
  }

  function bindModJack(root, fx) {
    var el = root.querySelector('.sc-modjack[data-fx="' + fx + '"]');
    el.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      // le jack arme la modulation ; on branche ensuite sur un trou MOD d'un bloc.
      // (le débranchement se fait bloc par bloc, en cliquant le trou MOD occupé)
      pending = (pending && pending.mod === fx) ? null : { mod: fx };
    });
  }

  function bindDrag(m) {
    var hd = m.querySelector('.sc-module-title');
    hd.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      hd.setPointerCapture(e.pointerId);
      var r = m.getBoundingClientRect();
      var dx = e.clientX - r.left, dy = e.clientY - r.top;
      m.style.left = r.left + 'px'; m.style.top = r.top + 'px';
      m.style.right = 'auto'; m.style.bottom = 'auto';
      var mv = function (e) {
        m.style.left = Math.max(0, Math.min(window.innerWidth  - r.width,  e.clientX - dx)) + 'px';
        m.style.top  = Math.max(0, Math.min(window.innerHeight - r.height, e.clientY - dy)) + 'px';
      };
      var up = function () {
        hd.removeEventListener('pointermove', mv);
        hd.removeEventListener('pointerup', up);
      };
      hd.addEventListener('pointermove', mv);
      hd.addEventListener('pointerup', up);
    });
  }

  function ledLoop() {
    var led = document.getElementById('sc-synth-led');
    var t0 = performance.now();
    (function tick(t) {
      if (A.on && A.ctx) {
        var phase = Math.sin((t - t0) / 1000 * rateHz() * Math.PI * 2);
        led.style.opacity = 0.35 + 0.65 * (phase * 0.5 + 0.5);
      } else led.style.opacity = 0.15;
      requestAnimationFrame(tick);
    })(t0);
  }

  /* ════════ BARRETTES DE CONNEXION ════════ */
  function canvasEl() { return document.getElementById('sc-canvas') || document.body; }

  // ══════ ZOOM / PAN (vue) ══════
  // Le canvas est transformé par CSS (scale + translate). getBoundingClientRect
  // reflète déjà cette transformation, donc la plupart du code suit tout seul.
  // Seules les conversions souris→canvas (drag) ont besoin du facteur de zoom.
  function applyView() {
    var cv = document.getElementById('sc-canvas');
    if (!cv) return;
    cv.style.transformOrigin = '0 0';
    cv.style.transform = 'translate(' + VIEW.panX + 'px,' + VIEW.panY + 'px) scale(' + VIEW.zoom + ')';
    var lbl = document.getElementById('sc-zoom-label');
    if (lbl) lbl.textContent = Math.round(VIEW.zoom * 100) + '%';
    // les barrettes/poignées sont positionnées en coordonnées non-zoomées : les recaler
    if (typeof placeAllBars === 'function') placeAllBars();
  }

  // Zoom centré sur un point écran (cx, cy), en gardant ce point fixe à l'écran
  function zoomAt(cx, cy, factor) {
    var z0 = VIEW.zoom;
    var z1 = Math.min(2.5, Math.max(0.25, z0 * factor));
    if (z1 === z0) return;
    // le point (cx,cy) écran correspond à un point canvas ; on le garde immobile.
    // Origine du canvas à l'écran hors transformation (≠ 0 quand la page est centrée)
    var cv = document.getElementById('sc-canvas'), ox = 0, oy = 0;
    if (cv) { var cr = cv.getBoundingClientRect(); ox = cr.left - VIEW.panX; oy = cr.top - VIEW.panY; }
    VIEW.panX = (cx - ox) - (cx - ox - VIEW.panX) * (z1 / z0);
    VIEW.panY = (cy - oy) - (cy - oy - VIEW.panY) * (z1 / z0);
    VIEW.zoom = z1;
    applyView();
  }
  function zoomBy(factor) {
    // zoom centré sur le milieu de l'écran
    zoomAt(window.innerWidth / 2, window.innerHeight / 2, factor);
  }
  function resetView() { VIEW.zoom = 1; VIEW.panX = 0; VIEW.panY = 0; applyView(); }

  function makeBar(idx) {
    var bar = document.createElement('div');
    bar.className = 'sc-jackbar';
    var holes = {};

    // Sélecteur d'onde (cycle au clic)
    var wb = document.createElement('div');
    wb.className = 'sc-wave-btn';
    var refreshWave = function () {
      var snd = blockSound(idx);
      wb.textContent = GLYPHS[snd.wave];
      wb.title = 'onde : ' + snd.wave;
    };
    wb.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var snd = blockSound(idx);
      snd.wave = WAVES[(WAVES.indexOf(snd.wave) + 1) % WAVES.length];
      refreshWave();
      updateBlockSound(idx);
      previewBlock(idx);
    });
    bar.appendChild(wb);

    [['in', 'entrée'], ['mod0', 'modulation 1'], ['mod1', 'modulation 2'],
     ['out', 'sortie'], ['car', 'carrefour']]
      .forEach(function (def) {
        var h = document.createElement('div');
        h.className = 'sc-hole' + (def[0].indexOf('mod') === 0 ? ' sc-hole-mod' :
                                   def[0] === 'car' ? ' sc-hole-car' : '');
        h.title = def[1];
        h.addEventListener('click', function (e) {
          e.preventDefault(); e.stopPropagation();
          if (def[0] === 'car') onCarHole(idx);
          else onHoleClick(idx, def[0]);
        });
        bar.appendChild(h);
        holes[def[0]] = h;
      });

    // Mini-potard de transposition (±12 demi-tons)
    var pk = document.createElement('div');
    pk.className = 'sc-pitch';
    pk.innerHTML = '<div class="sc-pitch-mark"></div>';
    var refreshPitch = function () {
      var p = blockSound(idx).pitch;
      pk.style.transform = 'rotate(' + (p / 12 * 135) + 'deg)';
      pk.title = 'pitch : ' + (p > 0 ? '+' : '') + p + ' st';
    };
    pk.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      pk.setPointerCapture(e.pointerId);
      var sy = e.clientY, sp = blockSound(idx).pitch;
      var mv = function (e) {
        var p = Math.round(Math.min(12, Math.max(-12, sp + (sy - e.clientY) / 8)));
        if (p !== blockSound(idx).pitch) {
          blockSound(idx).pitch = p;
          refreshPitch();
          updateBlockSound(idx);
        }
      };
      var up = function () {
        pk.removeEventListener('pointermove', mv);
        pk.removeEventListener('pointerup', up);
        previewBlock(idx);
      };
      pk.addEventListener('pointermove', mv);
      pk.addEventListener('pointerup', up);
    });
    bar.appendChild(pk);

    // Potard VOL : niveau de sortie du bloc (0 à 1), réglé au geste
    var vk = document.createElement('div');
    vk.className = 'sc-level';
    vk.innerHTML = '<div class="sc-level-mark"></div>';
    var refreshLevel = function () {
      var lv = blockSound(idx).level;
      // course de -135° (muet) à +135° (max), 0.8 ≈ +81°
      vk.style.transform = 'rotate(' + (lv * 270 - 135) + 'deg)';
      vk.title = 'niveau : ' + Math.round(lv * 100) + '%';
    };
    vk.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation();
      vk.setPointerCapture(e.pointerId);
      var sy = e.clientY, sl = blockSound(idx).level;
      var mv = function (e) {
        var lv = Math.min(1, Math.max(0, sl + (sy - e.clientY) / 120));
        setBlockLevel(idx, lv);
        refreshLevel();
      };
      var up = function () {
        vk.removeEventListener('pointermove', mv);
        vk.removeEventListener('pointerup', up);
      };
      vk.addEventListener('pointermove', mv);
      vk.addEventListener('pointerup', up);
    });
    bar.appendChild(vk);

    canvasEl().appendChild(bar);
    blocks[idx].bar = bar;
    blocks[idx].holes = holes;
    blocks[idx].refreshSndUI = function () { refreshWave(); refreshPitch(); refreshLevel(); };
    refreshWave(); refreshPitch(); refreshLevel();
    placeBar(idx);

    // Pastille mute/play au coin haut-gauche du bloc
    var b = blocks[idx];
    if (b && b.el && !b.muteBtn) {
      var mb = document.createElement('div');
      mb.className = 'sc-block-mute';
      mb.setAttribute('contenteditable', 'false');
      mb.textContent = '\u25CF';
      mb.addEventListener('pointerdown', function (e) {
        e.preventDefault(); e.stopPropagation();
        toggleMute(idx);
      });
      b.el.appendChild(mb);
      b.muteBtn = mb;
      refreshMuteBtn(idx);
    }

    // Panneau d'animation, affiché quand le bloc est sélectionné (locké)
    if (b && b.el && !b.animPanel) {
      var pan = document.createElement('div');
      pan.className = 'sc-anim-panel';
      pan.setAttribute('contenteditable', 'false');
      var moves = [['off','—'],['derive','dérive'],['balancier','balancier'],
                   ['flottement','flottement'],['cercle','cercle'],['respiration','respiration']];
      pan.innerHTML =
        '<div class="sc-anim-title">animation</div>' +
        '<div class="sc-anim-moves">' +
          moves.map(function (m) {
            return '<button class="sc-anim-move" data-mv="' + m[0] + '">' + m[1] + '</button>';
          }).join('') +
        '</div>' +
        '<label class="sc-anim-row">vitesse<input type="range" class="sc-anim-speed" min="10" max="150" value="50"></label>' +
        '<label class="sc-anim-row">ampleur<input type="range" class="sc-anim-amp" min="20" max="250" value="100"></label>';
      b.el.appendChild(pan);
      b.animPanel = pan;

      pan.querySelectorAll('.sc-anim-move').forEach(function (btn) {
        btn.addEventListener('pointerdown', function (e) {
          e.preventDefault(); e.stopPropagation();
          var mv = btn.dataset.mv;
          if (mv === 'off') stopAnim(idx); else startAnim(idx, mv);
          // reste figé tant que sélectionné
          if (LIVE_SEL === idx) freezeAnim(idx, true);
          refreshAnimPanel(idx);
        });
      });
      var sp = pan.querySelector('.sc-anim-speed');
      sp.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      sp.addEventListener('input', function (e) {
        e.stopPropagation(); blocks[idx].animSpeed = (+sp.value) / 100;
      });
      var am = pan.querySelector('.sc-anim-amp');
      am.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      am.addEventListener('input', function (e) {
        e.stopPropagation(); blocks[idx].animAmp = (+am.value) / 100;
      });
      refreshAnimPanel(idx);
    }
  }

  function refreshAnimPanel(idx) {
    var b = blocks[idx]; if (!b || !b.animPanel) return;
    var cur = b.anim || 'off';
    b.animPanel.querySelectorAll('.sc-anim-move').forEach(function (btn) {
      btn.classList.toggle('on', btn.dataset.mv === cur);
    });
    var sp = b.animPanel.querySelector('.sc-anim-speed');
    var am = b.animPanel.querySelector('.sc-anim-amp');
    if (sp) sp.value = Math.round((b.animSpeed != null ? b.animSpeed : 0.5) * 100);
    if (am) am.value = Math.round((b.animAmp != null ? b.animAmp : 1) * 100);
  }

  // Affiche/masque le panneau selon la sélection
  function showAnimPanel(idx, show) {
    var b = blocks[idx]; if (!b || !b.animPanel) return;
    b.animPanel.classList.toggle('visible', show);
    if (show) refreshAnimPanel(idx);
  }

  function placeBar(idx) {
    var b = blocks[idx]; if (!b || !b.bar) return;
    var cr = canvasEl().getBoundingClientRect();
    var r  = b.el.getBoundingClientRect();
    var z  = VIEW.zoom;
    var bw = b.bar.offsetWidth || 92;
    // la barrette est dans le canvas zoomé : ses coordonnées sont non-zoomées
    b.bar.style.left = ((r.left - cr.left) / z + (r.width / z - bw) / 2) + 'px';
    b.bar.style.top  = ((r.bottom - cr.top) / z - 3) + 'px';
  }
  function placeAllBars() {
    blocks.forEach(function (b, i) { placeBar(i); placeResizer(i); });
  }

  function jackPos(idx, type) {
    var b = blocks[idx];
    if (!b || !b.el) return null;   // bloc supprimé → pas de position
    if (!b.holes || !b.holes[type]) {
      var r0 = b.el.getBoundingClientRect();
      return { x: (type === 'out' ? r0.right : r0.left), y: r0.top + r0.height / 2 };
    }
    var r = b.holes[type].getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function modJackScreenPos(fx) {
    var el = document.querySelector('.sc-modjack[data-fx="' + fx + '"]');
    if (!el) return { x: 0, y: 0 };
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function jackBusy(idx, type) {
    return cables.some(function (c) {
      return type === 'out' ? c.from === idx : c.to === idx;
    });
  }
  function modSlotOf(idx, slot) {
    var found = null;
    Object.keys(modCables).forEach(function (fx) {
      if (modTargets(fx).some(function (t) { return t.block === idx && t.slot === slot; })) found = fx;
    });
    return found;
  }

  function onHoleClick(idx, type) {
    // ── Trous MOD ──
    if (type === 'mod0' || type === 'mod1') {
      var slot = type === 'mod1' ? 1 : 0;
      var occ  = modSlotOf(idx, slot);
      if (occ && !pending) {                 // débrancher ce mod-câble (ce bloc seul)
        modCables[occ] = modTargets(occ).filter(function (t) {
          return !(t.block === idx && t.slot === slot);
        });
        if (!modCables[occ].length) {
          delete modCables[occ];
          document.querySelector('.sc-modjack[data-fx="' + occ + '"]')?.classList.remove('on');
        }
        clickFx(false); rebuildAllFx();
        return;
      }
      if (pending && pending.mod && !occ) {  // brancher la modulation ici (ajoute à la liste)
        if (!modCables[pending.mod]) modCables[pending.mod] = [];
        modCables[pending.mod].push({ block: idx, slot: slot });
        document.querySelector('.sc-modjack[data-fx="' + pending.mod + '"]')?.classList.add('on');
        clickFx(true); rebuildAllFx();
        pending = null;
      }
      return;
    }
    // ── Trous IN / OUT (voix) ──
    if (pending && pending.mod) { pending = null; return; }
    var ci = cables.findIndex(function (c) {
      return type === 'out' ? c.from === idx : c.to === idx;
    });
    if (ci >= 0 && !pending) {
      removeVoice(cables[ci].id);
      cables.splice(ci, 1);
      clickFx(false);
      return;
    }
    if (!pending) {
      if (!jackBusy(idx, type)) pending = { type: type, idx: idx };
      return;
    }
    if (pending.type !== type && pending.idx !== idx) {
      var from = pending.type === 'out' ? pending.idx : idx;
      var to   = pending.type === 'out' ? idx : pending.idx;
      if (!jackBusy(from, 'out') && !jackBusy(to, 'in')) {
        var cable = { id: ++cableId, from: from, to: to,
                      color: COLORS[cables.length % COLORS.length] };
        cables.push(cable);
        clickFx(true);
        addVoice(cable);
      }
    }
    pending = null;
  }

  /* Débrancher tous les câbles (audio + modulations) */
  function clearAllCables() {
    cables.forEach(function (c) { removeVoice(c.id); });
    cables = [];
    modCables = {};
    document.querySelectorAll('.sc-modjack.on').forEach(function (el) { el.classList.remove('on'); });
    pending = null;
    rebuildAllFx();
    draw();
  }

  // Nettoyage : retire les connexions orphelines (vers des blocs disparus) et
  // les doublons, sans toucher aux connexions valides. Remet l'état au propre.
  function cleanConnections() {
    var before = cables.length;
    // 1. câbles bloc→bloc : garder ceux dont les deux extrémités existent
    var seen = {};
    cables = cables.filter(function (c) {
      if (!blocks[c.from] || !blocks[c.to]) { removeVoice(c.id); return false; }
      var key = c.from + '>' + c.to;
      if (seen[key]) { removeVoice(c.id); return false; }   // doublon
      seen[key] = true;
      return true;
    });
    // 2. modulations : retirer les cibles vers des blocs disparus
    Object.keys(modCables).forEach(function (fx) {
      modCables[fx] = modTargets(fx).filter(function (t) { return blocks[t.block]; });
      if (!modCables[fx].length) delete modCables[fx];
    });
    document.querySelectorAll('.sc-modjack').forEach(function (el) {
      el.classList.toggle('on', modTargets(el.dataset.fx).length > 0);
    });
    // 3. carrefour : retirer les membres disparus
    TURN.members = TURN.members.filter(function (idx) { return blocks[idx]; });
    if (typeof refreshTurnJacks === 'function') refreshTurnJacks();
    // 4. annuler toute connexion en attente
    pending = null;
    rebuildAllFx();
    draw();
    return before - cables.length;   // nombre de câbles retirés
  }

  /* Supprimer un bloc : ses câbles, ses modulations, son audio et son DOM */
  function deleteBlock(idx) {
    // nettoyer l'état de mute du bloc
    delete muteState[idx]; delete mutePending[idx];
    removeFromTurn(idx);
    // couper et retirer les câbles touchant ce bloc
    for (var i = cables.length - 1; i >= 0; i--) {
      if (cables[i].from === idx || cables[i].to === idx) {
        removeVoice(cables[i].id);
        cables.splice(i, 1);
      }
    }
    // retirer ce bloc de toutes les listes de modulation
    Object.keys(modCables).forEach(function (fx) {
      modCables[fx] = modTargets(fx).filter(function (t) { return t.block !== idx; });
      if (!modCables[fx].length) {
        delete modCables[fx];
        document.querySelector('.sc-modjack[data-fx="' + fx + '"]')?.classList.remove('on');
      }
    });
    // couper la boucle live éventuelle
    if (LIVE[idx]) { markPlaying(idx, false); LIVE[idx].prog = null; delete LIVE[idx]; }
    if (LIVE_SEL === idx) selectBlock(-1);
    // retirer barrette, poignée, gain, DOM
    var b = blocks[idx];
    if (b) {
      if (b.bar) b.bar.remove();
      if (b.resizer) b.resizer.remove();
      if (b.gainNode) { try { b.gainNode.disconnect(); } catch (e) {} }
      if (b.el) b.el.remove();
      blocks[idx] = null;   // on garde l'index pour ne pas décaler les câbles restants
    }
    rebuildAllFx();
    draw();
  }
  function ensureSvg() {
    if (svg && document.body.contains(svg)) return svg;
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'sc-patch-cables';
    // Le SVG couvre le viewport, hors du canvas zoomé : on dessine en coordonnées
    // ÉCRAN réelles (getBoundingClientRect brut), donc aucune conversion de zoom
    // n'est nécessaire — blocs (zoomés) et modules (fixes) sont traités pareil.
    svg.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;' +
                        'pointer-events:none;z-index:9000;overflow:visible';
    document.body.appendChild(svg);
    return svg;
  }

  function collectBlocks() {
    var els = Array.prototype.slice.call(canvasEl().querySelectorAll('.sc-el'))
      .filter(function (e) { return e.offsetParent !== null; });
    els.sort(function (a, b) {
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });
    return els;
  }

  function cablePath(x1, y1, x2, y2, color, opacity, dashed) {
    // sécurité : ignorer toute coordonnée invalide (bloc disparu, position aberrante)
    if (![x1, y1, x2, y2].every(function (v) { return typeof v === 'number' && isFinite(v); })) return '';
    // épaisseur du trait qui suit le zoom (lisible à tous les niveaux)
    var z = VIEW.zoom || 1;
    var sw = (5 * z).toFixed(1), rr = (6 * z).toFixed(1), rs = (2.5 * z).toFixed(1);
    var dash = dashed ? ' stroke-dasharray="' + (10 * z).toFixed(0) + ' ' + (7 * z).toFixed(0) + '"' : '';
    var sag = (40 + Math.abs(x2 - x1) * 0.25);
    var my  = Math.max(y1, y2) + sag;
    return '<path d="M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' +
           x2 + ',' + my + ' ' + x2 + ',' + y2 + '" fill="none" stroke="' + color +
           '" stroke-width="' + sw + '" stroke-linecap="round" opacity="' + (opacity || 0.9) + '"' +
           dash + '/>' +
           '<circle cx="' + x1 + '" cy="' + y1 + '" r="' + rr + '" fill="#222" stroke="' + color + '" stroke-width="' + rs + '"/>' +
           '<circle cx="' + x2 + '" cy="' + y2 + '" r="' + rr + '" fill="#222" stroke="' + color + '" stroke-width="' + rs + '"/>';
  }

  function draw() {
    var s = ensureSvg(), out = '';
    if (EDIT) {
      var els = collectBlocks(), cr = canvasEl().getBoundingClientRect();
      for (var i = 0; i < els.length - 1; i++) {
        var r1 = els[i].getBoundingClientRect(), r2 = els[i + 1].getBoundingClientRect();
        out += cablePath(r1.right - cr.left, r1.top - cr.top + r1.height / 2,
                         r2.left - cr.left, r2.top - cr.top + r2.height / 2,
                         COLORS[i % COLORS.length]);
      }
    } else {
      placeAllBars();
      cables.forEach(function (c) {
        if (!blocks[c.from] || !blocks[c.to]) return;   // câble orphelin : ignorer
        var p1 = jackPos(c.from, 'out'), p2 = jackPos(c.to, 'in');
        if (p1 && p2) out += cablePath(p1.x, p1.y, p2.x, p2.y, c.color);
      });
      if (RACK_OPEN) Object.keys(modCables).forEach(function (fx) {
        var p1 = modJackScreenPos(fx);
        modTargets(fx).forEach(function (t) {
          if (!blocks[t.block]) return;
          var p2 = jackPos(t.block, t.slot === 1 ? 'mod1' : 'mod0');
          if (p1 && p2) out += cablePath(p1.x, p1.y, p2.x, p2.y, FX_COLOR[fx], 0.85, true);
        });
      });
      // Câbles du carrefour : chaque bloc membre → son jack d'entrée, actif = illuminé
      if (RACK_OPEN && TURN.members.length && TURN.jackEls) {
        TURN.members.forEach(function (idx, rank) {
          if (!blocks[idx]) return;
          var jackEl = TURN.jackEls[rank] || TURN.jackEls[TURN.jackEls.length - 1];
          var jr = jackEl.getBoundingClientRect();
          var pj = { x: jr.left + jr.width / 2, y: jr.top + jr.height / 2 };
          var pb = jackPos(idx, 'car');
          var on = !!TURN.active[idx];
          if (pb && jackEl) out += cablePath(pb.x, pb.y, pj.x, pj.y,
                           on ? '#ffcf4d' : '#8a7a3a', on ? 1 : 0.4, false);
        });
      }
      if (pending) {
        var p;
        if (pending.mod)            p = modJackScreenPos(pending.mod);
        else if (pending.car != null)   p = jackPos(pending.car, 'car');
        else if (pending.carIn != null) {
          var je = TURN.jackEls && TURN.jackEls[pending.carIn];
          if (je) { var jr2 = je.getBoundingClientRect();
                    p = { x: jr2.left + jr2.width/2, y: jr2.top + jr2.height/2 }; }
        }
        else p = jackPos(pending.idx, pending.type);
        if (p) {
          var col = pending.mod ? FX_COLOR[pending.mod]
                  : (pending.car != null || pending.carIn != null) ? '#ffcf4d' : '#999';
          out += cablePath(p.x, p.y, mouse.x, mouse.y, col, 0.55, false);
        }
      }
    }
    s.innerHTML = out;
  }

  /* ════════ SAUVEGARDE / PARTAGE ════════
     Le morceau = blocs créés par le visiteur (code, position, taille,
     onde, pitch) + câbles + modulations + potards. Encodé dans l'URL. */

  function serializePatch() {
    // Index stable : on repère chaque bloc par son ordre dans `blocks`.
    var blockData = blocks.map(function (b, i) {
      if (!b) return { del: 1 };   // bloc supprimé : placeholder pour garder l'index
      var cr = canvasEl().getBoundingClientRect();
      var r  = b.el.getBoundingClientRect();
      var snd = b.snd || {};
      var coded = b.el.classList.contains('sc-coding');
      return {
        gen: b.created ? 1 : 0,                          // bloc à recréer au chargement
        c: (b.created || coded) ? blockCode(b.el) : null, // code live de tout bloc codé
        x: Math.round((b.animAnchor ? b.animAnchor.x : r.left - cr.left)),
        y: Math.round((b.animAnchor ? b.animAnchor.y : r.top - cr.top)),
        w: Math.round((b.animAnchor ? b.animAnchor.w : r.width)),
        h: Math.round((b.animAnchor ? b.animAnchor.h : r.height)),
        wv: snd.wave || null,
        p: snd.pitch || 0,
        lv: snd.level != null ? snd.level : 0.8,
        an: (b.anim && b.anim !== 'off') ? b.anim : null,
        asp: (b.anim && b.anim !== 'off' && b.animSpeed != null) ? Math.round(b.animSpeed * 100) : null,
        aamp: (b.anim && b.anim !== 'off' && b.animAmp != null) ? Math.round(b.animAmp * 100) : null
      };
    });
    return {
      v: 1,
      b: blockData,
      c: cables.map(function (x) { return [x.from, x.to]; }),
      m: (function () {
        var arr = [];
        Object.keys(modCables).forEach(function (fx) {
          modTargets(fx).forEach(function (t) { arr.push([fx, t.block, t.slot]); });
        });
        return arr;
      })(),
      k: { vol: A.vol, cut: A.cutoff, rate: A.rate,
           echo: A.mini.echo.val, crush: A.mini.crush.val,
           noise: A.mini.noise.val, verb: A.mini.verb.val },
      mp: (function () {                         // positions des modules du rack
        var out = {};
        document.querySelectorAll('.sc-module[data-mod]').forEach(function (el) {
          var r = el.getBoundingClientRect();
          out[el.dataset.mod] = [Math.round(r.left), Math.round(r.top)];
        });
        return out;
      })(),
      ch: blocks.map(function (b, i) { return isMuted(i) ? 1 : 0; }),
      tn: { m: TURN.members.slice(), dn: Math.round(TURN.density * 100), d: TURN.div }
    };
  }

  var WAVE_LETTER = { sine:'i', triangle:'t', sawtooth:'w', square:'q' };
  var WAVE_FROM   = { i:'sine', t:'triangle', w:'sawtooth', q:'square' };

  // Format compact : clés courtes, valeurs par défaut omises.
  function slimPatch(p) {
    return {
      v: 1,
      b: p.b.map(function (b) {
        if (b.del) return { d: 1 };   // bloc supprimé
        var o = { x: b.x, y: b.y };
        if (b.gen) o.g = 1;
        if (b.c != null) o.c = b.c;
        if (b.w && b.w !== 190) o.w = b.w;
        if (b.h && b.h !== 104) o.h = b.h;
        if (b.wv && WAVE_LETTER[b.wv]) o.s = WAVE_LETTER[b.wv];
        if (b.p) o.p = b.p;
        if (b.lv != null && Math.abs(b.lv - 0.8) > 0.001) o.l = Math.round(b.lv * 100);
        if (b.an) o.an = b.an;
        if (b.asp != null) o.asp = b.asp;
        if (b.aamp != null) o.aamp = b.aamp;
        return o;
      }),
      c: p.c,
      m: p.m,
      k: [p.k.vol, p.k.cut, p.k.rate, p.k.echo, p.k.crush, p.k.noise, p.k.verb]
           .map(function (v) { return Math.round(v * 100); }),
      mp: p.mp || {},
      ch: p.ch || [],
      tn: p.tn || null
    };
  }
  // Reconstruit la structure complète attendue par applyPatch().
  function fatPatch(s) {
    if (!s || s.v !== 1) return null;
    var k = s.k || [];
    return {
      v: 1,
      b: (s.b || []).map(function (o) {
        if (o.d) return { del: 1 };
        return {
          gen: o.g ? 1 : 0,
          c:   o.c != null ? o.c : null,
          x:   o.x || 0, y: o.y || 0,
          w:   o.w || 190, h: o.h || 104,
          wv:  o.s ? WAVE_FROM[o.s] : null,
          p:   o.p || 0,
          lv:  o.l != null ? o.l / 100 : 0.8,
          an:  o.an || null,
          asp: o.asp != null ? o.asp : null,
          aamp: o.aamp != null ? o.aamp : null
        };
      }),
      c: s.c || [],
      m: s.m || [],
      k: { vol:(k[0]||60)/100, cut:(k[1]||50)/100, rate:(k[2]||25)/100,
           echo:(k[3]||40)/100, crush:(k[4]||35)/100,
           noise:(k[5]||50)/100, verb:(k[6]||50)/100 },
      mp: s.mp || {},
      ch: s.ch || [],
      tn: s.tn || null
    };
  }

  // Encodage compressé (préfixe "1") ; ancien base64 lisible en repli.
  function encodePatch(obj) {
    var json = JSON.stringify(slimPatch(obj));
    return '1' + LZString.compressToEncodedURIComponent(json);
  }
  function decodePatch(str) {
    try {
      if (str.charAt(0) === '1') {                       // format compressé
        var j = LZString.decompressFromEncodedURIComponent(str.slice(1));
        return fatPatch(JSON.parse(j));
      }
      // rétrocompat : ancien base64 non compressé
      var b64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      return JSON.parse(decodeURIComponent(escape(atob(b64))));
    } catch (e) { return null; }
  }

  function applyPatch(patch) {
    if (!patch || patch.v !== 1) return;
    // 1. Recréer les blocs manquants (ceux ajoutés par l'auteur du patch).
    //    Les blocs d'origine de la page existent déjà ; on complète.
    patch.b.forEach(function (bd, i) {
      if (bd.del) {
        // placeholder : réserver l'index pour aligner les câbles
        if (i >= blocks.length) blocks.push(null);
        return;
      }
      // rétrocompat : anciens patchs sans 'gen' → 'c' non nul = bloc créé
      var isGen = bd.gen != null ? bd.gen : (i >= blocks.length && bd.c !== null ? 1 : 0);
      if (i >= blocks.length && isGen && bd.c != null) {
        createLiveBlock(bd.x, bd.y, { code: bd.c, w: bd.w, h: bd.h, noEdit: true });
      }
    });
    // 2. Position / taille / onde / pitch + code live sur tous les blocs concernés.
    patch.b.forEach(function (bd, i) {
      if (bd.del) return;
      var b = blocks[i]; if (!b) return;
      b.el.style.left = bd.x + 'px';
      b.el.style.top  = bd.y + 'px';
      if (bd.w) b.el.style.width  = bd.w + 'px';
      if (bd.h) b.el.style.height = bd.h + 'px';
      // réinjecter le code live d'un bloc d'origine (non recréé plus haut)
      if (bd.c != null && !b.created) setBlockCode(b.el, bd.c);
      if (bd.wv || bd.p || bd.lv != null) {
        b.snd = { wave: bd.wv || blockSound(i).wave, pitch: bd.p || 0,
                  level: bd.lv != null ? bd.lv : 0.8 };
        if (A.ctx) setBlockLevel(i, b.snd.level);
        if (b.refreshSndUI) b.refreshSndUI();
      }
      refreshBlockCode(i);
      applySpatial(i);   // brillance/profondeur/halo d'après x,y,taille restaurés
      // rétablir l'animation en boucle éventuelle
      if (bd.an && ANIMS.indexOf(bd.an) > 0) {
        if (bd.asp != null) b.animSpeed = bd.asp / 100;
        if (bd.aamp != null) b.animAmp = bd.aamp / 100;
        startAnim(i, bd.an); refreshAnimPanel(i);
      }
      else { stopAnim(i); refreshAnimPanel(i); }
    });
    // 3. Rétablir les câbles (en remplaçant le patch par défaut).
    cables = [];
    patch.c.forEach(function (pair) {
      if (blocks[pair[0]] && blocks[pair[1]])
        cables.push({ id: ++cableId, from: pair[0], to: pair[1],
                      color: COLORS[cables.length % COLORS.length] });
    });
    // 4. Rétablir les modulations (plusieurs cibles par effet possibles).
    modCables = {};
    (patch.m || []).forEach(function (m) {
      if (!blocks[m[1]]) return;
      if (!modCables[m[0]]) modCables[m[0]] = [];
      modCables[m[0]].push({ block: m[1], slot: m[2] });
    });
    document.querySelectorAll('.sc-modjack').forEach(function (el) {
      el.classList.toggle('on', modTargets(el.dataset.fx).length > 0);
    });
    // 5. Rétablir les potards.
    if (patch.k) {
      A.vol = patch.k.vol; A.cutoff = patch.k.cut; A.rate = patch.k.rate;
      A.mini.echo.val = patch.k.echo; A.mini.crush.val = patch.k.crush;
      A.mini.noise.val = patch.k.noise; A.mini.verb.val = patch.k.verb;
      refreshAllKnobs();
      if (A.ctx) applyKnobs();
    }
    // 6. Rétablir la position des modules du rack.
    if (patch.mp) {
      Object.keys(patch.mp).forEach(function (id) {
        var el = document.querySelector('.sc-module[data-mod="' + id + '"]');
        if (el) {
          el.style.left = patch.mp[id][0] + 'px';
          el.style.top  = patch.mp[id][1] + 'px';
          el.style.right = 'auto'; el.style.bottom = 'auto';
        }
      });
    }
    // 7. Rétablir les blocs mutés.
    muteState = {}; mutePending = {};
    (patch.ch || []).forEach(function (m, i) {
      if (m && blocks[i]) muteState[i] = true;
      refreshMuteBtn(i);
    });
    if (A.ctx) balance();
    // 8. Rétablir le carrefour.
    clearTurnMarks();
    if (patch.tn) {
      TURN.members = (patch.tn.m || []).filter(function (x) { return blocks[x]; });
      TURN.density = patch.tn.dn != null ? patch.tn.dn / 100 : 0.34;
      TURN.div = patch.tn.d || 2;
      TURN.active = {}; TURN.lastStep = null;
      document.querySelectorAll('.sc-turn-dbtn').forEach(function (b) {
        b.classList.toggle('on', Math.abs(+b.dataset.dens - TURN.density) < 0.03);
      });
      document.querySelectorAll('.sc-turn-vbtn').forEach(function (b) {
        b.classList.toggle('on', +b.dataset.div === TURN.div);
      });
      refreshTurnJacks();
      if (TURN.members.length) rollTurn();
      renderTurnMembers();
    }
  }

  function sharePatch() {
    var code = encodePatch(serializePatch());
    var url  = location.origin + location.pathname + location.search +
               '#patch=' + code;
    // Copier dans le presse-papier, avec repli invite manuelle
    var notify = function (ok) {
      var n = document.getElementById('sc-share-note');
      if (!n) {
        n = document.createElement('div'); n.id = 'sc-share-note';
        document.body.appendChild(n);
      }
      n.textContent = ok ? 'Lien du morceau copié !' : 'Lien prêt (copie manuelle)';
      n.className = 'sc-share-show';
      setTimeout(function () { n.className = ''; }, 2600);
      if (!ok) window.prompt('Copiez le lien de votre morceau :', url);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { notify(true); },
                                             function () { notify(false); });
    } else notify(false);
  }

  function loadPatchFromUrl() {
    var m = location.hash.match(/patch=([^&]+)/);
    if (!m) return;
    var patch = decodePatch(m[1]);
    if (patch) setTimeout(function () { applyPatch(patch); }, 60);
  }

  /* Panneau d'aide escamotable */
  function toggleHelp() {
    var ex = document.getElementById('sc-help');
    if (ex) { ex.remove(); return; }
    var h = document.createElement('div');
    h.id = 'sc-help';
    h.innerHTML =
      '<button id="sc-help-x" title="Fermer">\u2715</button>' +
      '<h4>SCOTCH \u2014 mode d\'emploi</h4>' +
      '<p><b>Brancher</b> : clic sur un trou de la barrette d\'un bloc, ' +
      'puis sur un trou d\'un autre. Un bloc sonne quand sa sortie (OUT) est reli\u00e9e. ' +
      'Clic sur un trou occup\u00e9 = d\u00e9brancher.</p>' +
      '<p><b>\u00c9crire du son</b> : double-clic sur un bloc, une commande par ligne :</p>' +
      '<pre>tempo 120      vitesse (20\u2013300)\n' +
      'wave saw       sine / tri / saw / square\n' +
      'play do3 mi3 sol3 .   notes, . = silence\n' +
      'play kick . snare .   percussions (voir liste)\n' +
      'sleep 1        attendre 1 temps\n' +
      'len 0.5        dur\u00e9e des notes suivantes\n' +
      'div 4          d\u00e9coupe le temps (4 = doubles-croches)\n' +
      'up 5 / down 5  transposer (demi-tons)\n' +
      'vol 0.7        volume du bloc</pre>' +
      '<p><b>Percussions</b> (dans <i>play</i>) : <b>kick</b>, <b>snare</b>, ' +
      '<b>hat</b> (ferm\u00e9), <b>oh</b> (ouvert), <b>clap</b>, <b>rim</b>, ' +
      '<b>tomlow/tom/tomhi</b>, <b>cow</b> (cloche), <b>shaker</b>, <b>clave</b>. ' +
      'Grain analogique 808 \u2014 kick profond.</p>' +
      '<p><b>Notes</b> : en fran\u00e7ais (do r\u00e9 mi fa sol la si) ou anglais ' +
      '(c d e f g a b), suivies de l\'octave : <i>do3</i>, <i>la4</i>, <i>fa#3</i>, <i>solb2</i>. ' +
      'Ou un num\u00e9ro MIDI (60 = do central).</p>' +
      '<p><b>Astuces de jeu</b> dans <i>play</i> :</p>' +
      '<pre>do3+mi3+sol3   accord (notes ensemble)\n' +
      'choose(do3 mi3 sol3)  une au hasard\n' +
      'do3 x4         r\u00e9p\u00e8te 4 fois</pre>' +
      '<p><b>Jouer avec l\'espace</b> : double-clic sur le fond = nouveau bloc. ' +
      'D\u00e9placer un bloc le module en direct : c\u00e2ble plus long = plus grave, ' +
      'gauche/droite = st\u00e9r\u00e9o, <b>haut = son clair, bas = son feutr\u00e9</b>. ' +
      'La <b>taille</b> fait la pr\u00e9sence : grand = proche et pr\u00e9sent, petit = lointain. ' +
      'Poign\u00e9e jaune = redimensionner. ' +
      'La croix \u2715 (en haut d\'un bloc cr\u00e9\u00e9) le supprime. ' +
      'Le bouton <b>D\u00c9BRANCHER TOUT</b> retire tous les c\u00e2bles d\'un coup.</p>' +
      '<p><b>Clavier live</b> : clique un bloc pour le s\u00e9lectionner (contour vert), ' +
      'puis joue au clavier \u2014 rang\u00e9e <b>Q S D F G H J K L</b> = gamme, ' +
      'dans le son de ce bloc. Fonctionne m\u00eame si le son g\u00e9n\u00e9ral n\'est pas lanc\u00e9.</p>' +
      '<p><b>Animations</b> : le petit rond en bas \u00e0 gauche d\'un bloc ' +
      'lui donne un mouvement lent en boucle (d\u00e9rive, balancier, flottement, ' +
      'cercle, respiration). Clique pour changer. Le bloc bouge tout seul et ' +
      'son <b>son varie</b> avec lui : le st\u00e9r\u00e9o, la brillance, la profondeur ' +
      'ondulent doucement. De quoi faire vivre le morceau sans y toucher.</p>' +
      '<p><b>Mute / play</b> : la pastille en haut \u00e0 gauche de chaque bloc ' +
      'le coupe ou le r\u00e9active. Le changement tombe au d\u00e9but de la mesure ' +
      'suivante (calé sur le tempo) \u2014 pas de d\u00e9calage. Coupe et rallume tes ' +
      'blocs pour construire ton morceau : intro, mont\u00e9e, break\u2026 ' +
      'Le module <b>MESURE</b> r\u00e8gle la longueur de cette grille (1 \u00e0 8 temps).</p>' +
      '<p><b>Zoom / d\u00e9placement</b> : pour les gros morceaux, zoome \u00e0 la ' +
      '<b>molette</b> (centr\u00e9e sur le curseur) ou avec les boutons <b>+ / \u2212</b> ' +
      'en bas \u00e0 gauche. Pour te d\u00e9placer, maintiens la <b>barre d\'espace</b> et ' +
      'glisse (ou le bouton du milieu de la souris). Clique le <b>pourcentage</b> ' +
      'pour recentrer \u00e0 100%. Le bouton <b>modules</b> masque tout le rack dans ' +
      'un tiroir pour lib\u00e9rer l\'espace.</p>' +
      '<p><b>Nettoyer</b> : si les câbles s\'emm\u00ealent (par ex. apr\u00e8s avoir ' +
      'supprim\u00e9 des blocs), le bouton <b>\u2726 NETTOYER</b> (sur le SCOTCH-01) ' +
      'retire les connexions orphelines ou en double, sans toucher aux bonnes. ' +
      '<b>D\u00c9BRANCHER TOUT</b> enl\u00e8ve toutes les connexions d\'un coup.</p>' +
      '<p><b>Resynchro</b> : si les boucles se d\u00e9calent \u00e0 force de manipulations, ' +
      'le bouton <b>\u21bb RESYNCHRO</b> (sur le SCOTCH-01) les recale toutes ensemble ' +
      'sur le prochain temps, sans couper le son. Plus besoin d\'arr\u00eater et relancer.</p>' +
      '<p><b>G\u00e9n\u00e9rateur</b> : le module G\u00c9N\u00c9RATEUR cr\u00e9e un bloc tout ' +
      'rempli d\'un motif original \u2014 <b>M\u00c9LODIE</b> (dans une gamme peu banale : ' +
      'dorien, phrygien, gammes japonaises\u2026) ou <b>RYTHME</b> (motifs euclidiens ' +
      'asym\u00e9triques). Un clic = un nouveau bloc au centre, pr\u00eat \u00e0 câbler. ' +
      'Re-clique pour une autre id\u00e9e, \u00e9dite-le pour l\'ajuster.</p>' +
      '<p><b>Carrefour</b> : le module CARREFOUR fait jouer tes blocs ' +
      '<b>au hasard</b>. Chaque bloc a un petit trou <b>orange</b> sur sa ' +
      'barrette : relie-le \u00e0 une entr\u00e9e du carrefour (dans un sens ou ' +
      'l\'autre) pour l\'ajouter, jusqu\'\u00e0 six. Les fils sont visibles et ' +
      'celui qui joue s\'illumine. \u00c0 chaque cycle le carrefour tire au sort ' +
      'quels blocs sonnent (r\u00e9glage <b>densit\u00e9</b>) et \u00e0 quelle <b>vitesse</b> ' +
      '(1, 2, 4 temps). Reclique le trou orange pour d\u00e9brancher.</p>' +
      '<p><b>Sculpter le son</b> : sur la barrette de chaque bloc, ' +
      'le <b>symbole d\'onde</b> (clic), le potard <b>pitch</b> (rep\u00e8re jaune, ' +
      '\u00b112 demi-tons) et le potard <b>VOL</b> (rep\u00e8re vert) qui r\u00e8gle ' +
      'le niveau de ce bloc dans le m\u00e9lange. Glisse-les de haut en bas.</p>' +
      '<p><b>Modulations</b> : FM/TRM/SUB (SCOTCH-01), ECHO, CRUSH, NOISE, VERB. ' +
      'Clique la sortie du module puis un trou MOD (cerclé jaune) d\'un bloc. ' +
      'Tu peux relier une m\u00eame modulation \u00e0 <b>plusieurs blocs</b> \u2014 rearme ' +
      'la sortie et branche un autre bloc. Reclique un trou MOD occup\u00e9 pour ' +
      'd\u00e9brancher ce bloc-l\u00e0. RATE = tempo g\u00e9n\u00e9ral + vitesse des modulations.</p>' +
      '<p><b>Partager</b> : PARTAGER copie un lien de ton morceau. ' +
      'CHARGER colle un lien re\u00e7u. Tout dispara\u00eet au rechargement.</p>';
    document.body.appendChild(h);
    h.querySelector('#sc-help-x').addEventListener('click', function () { h.remove(); });
  }

  /* Import par collage : un musicien colle le lien (ou le code) reçu. */
  function loadPatchFromPrompt() {
    var input = window.prompt('Collez le lien du morceau reçu :', '');
    if (!input) return;
    input = input.trim();
    var m = input.match(/patch=([^&\s]+)/);      // lien complet…
    var code = m ? m[1] : input;                 // …ou juste le code collé
    var patch = decodePatch(code);
    if (patch) applyPatch(patch);
    else window.alert('Lien non reconnu — vérifiez qu il est complet.');
  }

  /* ════════ INIT ════════ */
  function init() {
    if (!EDIT) {
      var els = collectBlocks();
      blocks = els.map(function (el) { return { el: el }; });
      blocks.forEach(function (b, i) { makeBar(i); });
      for (var i = 0; i < blocks.length - 1; i++) {
        cables.push({ id: ++cableId, from: i, to: i + 1, color: COLORS[i % COLORS.length] });
      }
      var cv = canvasEl();
      cv.addEventListener('mousemove', function (e) {
        // le SVG est en fixed sur le viewport : coordonnées écran directes
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') pending = null;
      });
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.sc-hole') && !e.target.closest('.sc-modjack')
            && !e.target.closest('.sc-wave-btn') && !e.target.closest('.sc-pitch')) pending = null;
      });
      window.addEventListener('resize', placeAllBars);
      // Live coding : compiler le contenu des blocs + édition au double-clic
      blocks.forEach(function (b, i) {
        refreshBlockCode(i);
        bindBlockDrag(i);
        if (b.el.classList.contains('sc-bloc')) {
          b.el.addEventListener('dblclick', function (e) {
            e.preventDefault(); e.stopPropagation();
            startLiveEdit(i);
          });
        }
      });
      // Double-clic sur le fond : nouveau bloc-module
      document.addEventListener('dblclick', function (e) {
        if (e.target !== cv && e.target !== document.body) return;
        var cr = cv.getBoundingClientRect();
        var x = (e.clientX - cr.left) / VIEW.zoom - 95;
        var y = (e.clientY - cr.top)  / VIEW.zoom - 55;
        createLiveBlock(x, y);
      });
      buildModule();
      buildZoomControls();
      buildRackToggle();
      buildMinis();
      initKeyboard();
      // Clic sur le fond : désélectionner (le clavier ne joue plus)
      document.addEventListener('pointerdown', function (e) {
        if (e._scBlockHit) return;
        if (e.target.closest('.sc-el, .sc-module, .sc-jackbar')) return;
        selectBlock(-1);
      });
      loadPatchFromUrl();
      // Halos spatiaux visibles dès le départ (même son éteint)
      setTimeout(function () {
        blocks.forEach(function (b, i) { if (b) updateHalo(i); });
      }, 100);
    }
    (function loop(now) { draw(); commitPendingMutes(); advanceTurn(); tickAnims(now || 0); requestAnimationFrame(loop); })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
