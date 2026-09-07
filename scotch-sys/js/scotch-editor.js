'use strict';

class ScotchEditor {

  constructor(pageData, slug, base) {
    this.page     = JSON.parse(JSON.stringify(pageData));
    this.slug     = slug;
    this.base     = base;
    this.selId    = null;          // élément principal sélectionné
    this.selIds   = new Set();     // tous les éléments sélectionnés
    this.history  = [JSON.parse(JSON.stringify(pageData))];
    this.histIdx  = 0;
    this.gridSnap = false;
    this.gridSize = 8;
    this.mobile   = false;
    this.dirty    = false;
    this._uid     = Date.now();
    this._openPop = null;
    this.siteFonts = (typeof SCOTCH_SITE_FONTS !== 'undefined' ? SCOTCH_SITE_FONTS : []);
    this._dragStarts = new Map(); // id → {x,y} pour déplacement groupé

    this.canvas = document.getElementById('sc-canvas');
    this._init();
  }

  /* ═══════════════════════════════════════
     INIT
  ═══════════════════════════════════════ */

  _init() {
    this._initCustomIcons();
    this._loadFonts();
    this._applyPageBg();
    this._renderAll();
    this._bindCanvas();
    this._bindTopbar();
    this._bindKeyboard();
  }

  /* ═══════════════════════════════════════
     PICTOS PERSONNALISÉS (scotch-sys/ui/)
     Chaque PNG présent remplace l'icône intégrée.
  ═══════════════════════════════════════ */

  static ICON_MAP = {
    // toolbar bloc
    'ti-link':'connexions', 'ti-palette':'style', 'ti-arrows-move':'position',
    'ti-flip-horizontal':'miroir', 'ti-copy':'dupliquer', 'ti-stack-2':'ordre',
    'ti-lock-open':'verrou-ouvert', 'ti-lock':'verrou-ferme', 'ti-trash':'supprimer',
    // topbar
    'ti-arrow-back-up':'annuler', 'ti-arrow-forward-up':'refaire',
    'ti-device-floppy':'sauvegarder', 'ti-grid-dots':'grille',
    'ti-device-mobile':'mobile', 'ti-sparkles':'animations',
    'ti-layout-grid':'pages', 'ti-settings':'reglages', 'ti-door-exit':'quitter',
    // alignement
    'ti-layout-align-left':'aligner-gauche', 'ti-layout-align-center':'aligner-centre',
    'ti-layout-align-right':'aligner-droite', 'ti-layout-align-top':'aligner-haut',
    'ti-layout-align-middle':'aligner-milieu', 'ti-layout-align-bottom':'aligner-bas',
    'ti-layout-distribute-horizontal':'distribuer-h',
    'ti-layout-distribute-vertical':'distribuer-v', 'ti-x':'fermer',
    // popovers & création
    'ti-align-left':'texte-gauche', 'ti-align-center':'texte-centre',
    'ti-align-right':'texte-droite', 'ti-arrows-horizontal':'miroir-h',
    'ti-arrows-vertical':'miroir-v', 'ti-square-arrow-up':'devant',
    'ti-square-arrow-down':'derriere', 'ti-upload':'televerser', 'ti-plus':'ajouter',
    'ti-photo':'image', 'ti-paperclip':'fichier', 'ti-player-play':'video',
  };
  static BADGE_MAP = { 'ti-link':'badge-lien', 'ti-hash':'badge-ancre', 'ti-world':'badge-globe' };

  _initCustomIcons() {
    this.uiIcons = (typeof SCOTCH_UI_ICONS !== 'undefined' ? SCOTCH_UI_ICONS : {});
    if (!Object.keys(this.uiIcons).length) return;

    const swap = (i) => {
      const inBadge = !!i.closest('.sc-badge');
      const map = inBadge ? ScotchEditor.BADGE_MAP : ScotchEditor.ICON_MAP;
      for (const cls of i.classList) {
        const name = map[cls];
        if (name && this.uiIcons[name]) {
          const img = document.createElement('img');
          img.src = this.base + this.uiIcons[name];
          img.className = 'sc-ui-icon' + (inBadge ? ' sc-ui-badge' : '');
          img.alt = '';
          i.replaceWith(img);
          return;
        }
      }
    };

    // Remplacer l'existant puis observer tout nouvel élément (toolbars, popovers…)
    document.querySelectorAll('i.ti').forEach(swap);
    new MutationObserver(muts => {
      muts.forEach(m => m.addedNodes.forEach(n => {
        if (n.nodeType !== 1) return;
        if (n.matches?.('i.ti')) swap(n);
        n.querySelectorAll?.('i.ti').forEach(swap);
      }));
    }).observe(document.body, { childList: true, subtree: true });

    // Curseur et poignée personnalisés (optionnels)
    if (this.uiIcons['cursor']) {
      this.canvas.style.cursor = `url('${this.base + this.uiIcons['cursor']}') 4 4, auto`;
    }
    if (this.uiIcons['handle']) {
      const s = document.createElement('style');
      s.textContent = `.sc-resize-handle{background:url('${this.base + this.uiIcons['handle']}') no-repeat center/contain !important;border:none !important;image-rendering:pixelated;}`;
      document.head.appendChild(s);
    }
  }

  /* ═══════════════════════════════════════
     RENDU
  ═══════════════════════════════════════ */

  _renderAll() {
    this.canvas.innerHTML = '';
    const els = [...(this.page.elements||[])].sort((a,b)=>(a.z||0)-(b.z||0));
    els.forEach(el => this.canvas.appendChild(this._buildDom(el)));
    this._applyMobileOrder();
    document.getElementById('sc-ctoolbar')?.remove();
    this.selId  = null;
    this.selIds = new Set();
  }

  /* Ordre d'empilement mobile : mobileOrder explicite, sinon Y croissant.
     Posé en style.order — utilisé par le flexbox de la preview mobile
     et identique au calcul du renderer visiteur. */
  _applyMobileOrder() {
    const sorted = [...(this.page.elements||[])]
      .filter(el => !el.mobileRole)   // seuls les blocs "empilés" participent à la pile
      .sort((a,b) => {
        const oa = a.mobileOrder ?? (a.pos?.y || 0);
        const ob = b.mobileOrder ?? (b.pos?.y || 0);
        return oa - ob;
      });
    sorted.forEach((el, rank) => {
      const dom = document.getElementById('dom-' + el.id);
      if (dom) dom.style.order = rank;
    });
  }

  _buildDom(el) {
    const dom = document.createElement('div');
    dom.id = 'dom-' + el.id;
    dom.className = 'sc-el sc-' + (el.type || 'bloc')
      + (el.locked ? ' sc-locked' : '')
      + (el.mobileRole==='hidden' ? ' sc-mob-hidden' : '')
      + (el.mobileRole==='background' ? ' sc-mob-bg' : '')
      + (el.hover ? ' sc-hover-' + el.hover : '');
    dom.dataset.id = el.id;
    this._applyStyle(dom, el);
    this._buildContent(dom, el);
    this._bindEl(dom, el);
    this._updateBadges(dom, el);
    return dom;
  }

  _applyStyle(dom, el) {
    const pos     = el.pos;
    const s       = el.style || {};
    const isMedia = el.type === 'image' || el.type === 'iframe';

    let bgParts = [];
    if (!isMedia) {
      if (s.bgImage) {
        const url = s.bgImage.startsWith('http') ? s.bgImage : this.base + s.bgImage;
        bgParts.push(`background-image:url('${url}')`);
        if (s.bgRepeat === 'cover' || s.bgRepeat === 'contain') {
          bgParts.push(`background-size:${s.bgRepeat}`, 'background-repeat:no-repeat', 'background-position:center');
        } else {
          bgParts.push('background-repeat:repeat');
        }
        if (s.bg && !s.bgTransparent) bgParts.push(`background-color:${s.bg}`);
      } else if (s.bgTransparent) {
        bgParts.push('background:transparent');
      } else {
        bgParts.push(`background:${s.bg || '#ddd'}`);
      }
    }

    const parts = [
      'position:absolute',
      `left:${pos.x||0}px`, `top:${pos.y||0}px`, `z-index:${el.z||1}`,
      el.size?.w ? `width:${el.size.w}px`  : (isMedia ? 'width:300px'  : 'width:160px'),
      el.size?.h ? `height:${el.size.h}px` : (isMedia ? 'height:200px' : 'min-height:60px'),
      ...bgParts,
      s.color      ? `color:${s.color}`                         : '',
      s.fontSize   ? `font-size:${s.fontSize}px`               : '',
      s.fontFamily ? `font-family:'${s.fontFamily}',sans-serif` : '',
      s.mirrorH && s.mirrorV ? 'transform:scale(-1,-1)' :
        s.mirrorH ? 'transform:scaleX(-1)' :
        s.mirrorV ? 'transform:scaleY(-1)' : '',
      s.opacity != null && s.opacity !== 1 ? `opacity:${s.opacity}` : '',
      el.hidden ? 'display:none' : '',
      isMedia ? 'overflow:hidden' : '',
    ];

    dom.style.cssText    = parts.filter(Boolean).join(';');
    dom.style.padding    = isMedia ? '0' : '10px 12px';
    dom.style.borderRadius = '0';
    dom.style.cursor     = el.locked ? 'not-allowed' : 'move';
    dom.style.userSelect = 'none';
    dom.style.boxSizing  = 'border-box';
    // Alignement du texte dans le bloc
    if (el.type === 'bloc' || !el.type) {
      dom.style.display = 'flex';
      dom.style.flexDirection = 'column';
      dom.style.justifyContent = {top:'flex-start', middle:'center', bottom:'flex-end'}[s.alignV] || 'flex-start';
      dom.style.textAlign = s.alignH || 'left';
    }
    if (el.link) dom.dataset.link = el.link;
  }

  _buildContent(dom, el) {
    const handle = dom.querySelector('.sc-resize-handle');
    dom.innerHTML = '';
    if (handle) dom.appendChild(handle);

    switch (el.type) {
      case 'image': {
        if (el.content) {
          const img = document.createElement('img');
          img.src = el.content.startsWith('http') ? el.content : this.base + el.content;
          img.alt = el.alt || ''; img.draggable = false;
          const fit = el.style?.imgFit === 'contain' ? 'contain' : 'cover';
          img.style.cssText = `width:100%;height:100%;object-fit:${fit};display:block;pointer-events:none`;
          dom.appendChild(img);
        } else {
          dom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;flex-direction:column;gap:6px"><i class="ti ti-photo" style="font-size:2em"></i><span style="font-size:11px">Image</span></div>';
        }
        break;
      }
      case 'file': {
        const name = el.filename || (el.content||'').split('/').pop() || 'fichier';
        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;align-items:center;gap:8px;height:100%;pointer-events:none;padding:0 4px;word-break:break-all';
        wrap.innerHTML = `<i class="ti ti-paperclip" style="font-size:1.3em;flex-shrink:0"></i><span style="font-size:13px">${name}</span>`;
        dom.appendChild(wrap);
        break;
      }
      case 'iframe': {
        if (el.content && el.content !== 'https://') {
          const ifr = document.createElement('iframe');
          ifr.src = el.content; ifr.frameBorder = '0';
          ifr.setAttribute('allowfullscreen','');
          ifr.style.cssText = 'width:100%;height:100%;border:none;display:block;pointer-events:none';
          dom.appendChild(ifr);
        } else {
          dom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;flex-direction:column;gap:6px"><i class="ti ti-player-play" style="font-size:2em"></i><span style="font-size:11px">Double-clic pour définir l\'URL</span></div>';
        }
        break;
      }
      default: {
        const inner = document.createElement('div');
        inner.className = 'sc-bloc-content';
        inner.innerHTML = el.content || '';
        inner.style.cssText = 'outline:none;min-height:1em;pointer-events:none';
        dom.appendChild(inner);
      }
    }
  }

  /* ═══════════════════════════════════════
     SELECTION (simple + multi)
  ═══════════════════════════════════════ */

  _select(id, add = false) {
    if (!add) {
      // Désélectionner tout
      this.selIds.forEach(sid => {
        document.getElementById('dom-' + sid)?.classList.remove('sc-selected');
      });
      this.selIds.clear();
      document.getElementById('sc-ctoolbar')?.remove();
      this._closePop();
    }

    if (!id) { this.selId = null; return; }

    this.selIds.add(id);
    this.selId = id;
    const dom = document.getElementById('dom-' + id);
    if (dom) dom.classList.add('sc-selected');

    if (this.selIds.size === 1) {
      if (dom) this._showToolbar(dom);
    } else {
      this._showAlignToolbar();
    }
  }

  _deselect(removeToolbar = true) {
    this.selIds.forEach(sid => {
      const d = document.getElementById('dom-' + sid);
      d?.classList.remove('sc-selected');
      const c = d?.querySelector('.sc-bloc-content');
      if (c) { c.style.pointerEvents = 'none'; c.contentEditable = 'false'; }
    });
    this.selIds.clear();
    this.selId = null;
    if (removeToolbar) {
      document.getElementById('sc-ctoolbar')?.remove();
      this._closePop();
    }
  }

  /* ═══════════════════════════════════════
     TOOLBAR SIMPLE (1 élément)
  ═══════════════════════════════════════ */

  _showToolbar(dom) {
    document.getElementById('sc-ctoolbar')?.remove();
    const tb = document.createElement('div');
    tb.id = 'sc-ctoolbar';
    tb.innerHTML = `
      <button data-a="conn"   title="Connexions"><i class="ti ti-link"></i></button>
      <button data-a="style"  title="Style"><i class="ti ti-palette"></i></button>
      <button data-a="pos"    title="Position / taille"><i class="ti ti-arrows-move"></i></button>
      <button data-a="mirror" title="Miroir"><i class="ti ti-flip-horizontal"></i></button>
      <span class="sc-tsep"></span>
      <button data-a="dup"    title="Dupliquer"><i class="ti ti-copy"></i></button>
      <button data-a="z"      title="Ordre"><i class="ti ti-stack-2"></i></button>
      <span class="sc-tsep"></span>
      <button data-a="lock"   title="Verrouiller" id="sc-tb-lock"><i class="ti ti-lock-open"></i></button>
      <button data-a="del"    title="Supprimer" class="sc-tb-danger"><i class="ti ti-trash"></i></button>`;
    document.body.appendChild(tb);
    this._positionToolbar(dom, tb);

    const el = this._el(this.selId);
    if (el?.locked) tb.querySelector('#sc-tb-lock i').className = 'ti ti-lock';

    this._bindToolbar(tb, dom);
  }

  _positionToolbar(dom, tb) {
    const r      = dom.getBoundingClientRect();
    const tbH    = 46;
    const TOPBAR = 50; // barre du haut fixe (46px) + marge
    // Au-dessus du bloc seulement si la toolbar ne passe pas sous la topbar,
    // sinon en dessous du bloc.
    const top = (r.top - tbH - 4) >= TOPBAR
      ? r.top - tbH + window.scrollY
      : r.bottom + 8 + window.scrollY;
    tb.style.top  = top + 'px';
    tb.style.left = (r.left + r.width / 2 + window.scrollX) + 'px';
  }

  _repositionToolbar(dom) {
    const tb = document.getElementById('sc-ctoolbar'); if (!tb) return;
    if (this.selIds.size > 1) {
      this._repositionAlignToolbar();
    } else {
      this._positionToolbar(dom, tb);
    }
  }

  _bindToolbar(tb, dom) {
    const el = this._el(this.selId);
    tb.querySelectorAll('button[data-a]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const a = btn.dataset.a;
        if (this._openPop === a) { this._closePop(); return; }
        this._closePop();
        if (a === 'dup')  { this._duplicate(el.id); return; }
        if (a === 'del')  { if (confirm('Supprimer ?')) this._delete(el.id); return; }
        if (a === 'lock') { this._toggleLock(el, dom, tb); return; }
        btn.classList.add('active');
        this._openPop = a;
        const pop = this._buildPop(a, el, dom, btn);
        document.body.appendChild(pop);
        this._posPop(pop, btn);
      });
    });
  }

  /* ═══════════════════════════════════════
     TOOLBAR ALIGNEMENT (multi-sélection)
  ═══════════════════════════════════════ */

  _showAlignToolbar() {
    document.getElementById('sc-ctoolbar')?.remove();
    const tb = document.createElement('div');
    tb.id = 'sc-ctoolbar';
    tb.innerHTML = `
      <span class="sc-tb-count">${this.selIds.size} blocs</span>
      <span class="sc-tsep"></span>
      <button data-al="left"     title="Aligner bord gauche"><i class="ti ti-layout-align-left"></i></button>
      <button data-al="center-h" title="Centrer horizontalement"><i class="ti ti-layout-align-center"></i></button>
      <button data-al="right"    title="Aligner bord droit"><i class="ti ti-layout-align-right"></i></button>
      <span class="sc-tsep"></span>
      <button data-al="top"      title="Aligner bord haut"><i class="ti ti-layout-align-top"></i></button>
      <button data-al="center-v" title="Centrer verticalement"><i class="ti ti-layout-align-middle"></i></button>
      <button data-al="bottom"   title="Aligner bord bas"><i class="ti ti-layout-align-bottom"></i></button>
      <span class="sc-tsep"></span>
      <button data-al="distrib-h" title="Distribuer horizontalement"><i class="ti ti-layout-distribute-horizontal"></i></button>
      <button data-al="distrib-v" title="Distribuer verticalement"><i class="ti ti-layout-distribute-vertical"></i></button>
      <span class="sc-tsep"></span>
      <button data-al="deselect"  title="Tout désélectionner" class="sc-tb-danger"><i class="ti ti-x"></i></button>`;
    document.body.appendChild(tb);
    this._repositionAlignToolbar();

    tb.querySelectorAll('[data-al]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const a = btn.dataset.al;
        if (a === 'deselect') { this._deselect(); return; }
        this._align(a);
      });
    });
  }

  _repositionAlignToolbar() {
    const tb = document.getElementById('sc-ctoolbar'); if (!tb) return;
    // BBox de la sélection en coordonnées viewport (fiable même en scroll)
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    this.selIds.forEach(id => {
      const d = document.getElementById('dom-' + id); if (!d) return;
      const r = d.getBoundingClientRect();
      x1 = Math.min(x1, r.left);  y1 = Math.min(y1, r.top);
      x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom);
    });
    if (x1 === Infinity) return;
    const tbH = 46, TOPBAR = 50;
    const top = (y1 - tbH - 4) >= TOPBAR
      ? y1 - tbH + window.scrollY
      : y2 + 8 + window.scrollY;
    tb.style.top  = top + 'px';
    tb.style.left = ((x1 + x2) / 2 + window.scrollX) + 'px';
  }

  _selBBox() {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    this.selIds.forEach(id => {
      const el  = this._el(id);
      const dom = document.getElementById('dom-' + id);
      if (!el || !dom) return;
      const pos = el.pos;
      const w   = el.size?.w || dom.offsetWidth;
      const h   = el.size?.h || dom.offsetHeight;
      x1 = Math.min(x1, pos.x); y1 = Math.min(y1, pos.y);
      x2 = Math.max(x2, pos.x + w); y2 = Math.max(y2, pos.y + h);
    });
    return { left:x1, top:y1, right:x2, bottom:y2, cx:(x1+x2)/2, cy:(y1+y2)/2, w:x2-x1, h:y2-y1 };
  }

  _align(action) {
    const bbox = this._selBBox();
    const els  = [...this.selIds]
      .map(id => ({ el:this._el(id), dom:document.getElementById('dom-'+id) }))
      .filter(x => x.el && x.dom);

    if (action === 'distrib-h') {
      const sorted = [...els].sort((a,b) => ((a.el.pos?.x||0) - (b.el.pos?.x||0)));
      const totalW = sorted.reduce((acc,{el,dom}) => acc + (el.size?.w || dom.offsetWidth), 0);
      const gap    = (bbox.w - totalW) / Math.max(1, sorted.length - 1);
      let cur = bbox.left;
      sorted.forEach(({el,dom}) => {
        const pos = el.pos;
        pos.x = Math.round(cur); dom.style.left = pos.x + 'px';
        cur += (el.size?.w || dom.offsetWidth) + gap;
      });
    } else if (action === 'distrib-v') {
      const sorted = [...els].sort((a,b) => ((a.el.pos?.y||0) - (b.el.pos?.y||0)));
      const totalH = sorted.reduce((acc,{el,dom}) => acc + (el.size?.h || dom.offsetHeight), 0);
      const gap    = (bbox.h - totalH) / Math.max(1, sorted.length - 1);
      let cur = bbox.top;
      sorted.forEach(({el,dom}) => {
        const pos = el.pos;
        pos.y = Math.round(cur); dom.style.top = pos.y + 'px';
        cur += (el.size?.h || dom.offsetHeight) + gap;
      });
    } else {
      els.forEach(({el, dom}) => {
        const pos = el.pos;
        const w = el.size?.w || dom.offsetWidth;
        const h = el.size?.h || dom.offsetHeight;
        switch (action) {
          case 'left':     pos.x = bbox.left;              dom.style.left = pos.x+'px'; break;
          case 'center-h': pos.x = bbox.left+(bbox.w-w)/2; dom.style.left = pos.x+'px'; break;
          case 'right':    pos.x = bbox.right-w;           dom.style.left = pos.x+'px'; break;
          case 'top':      pos.y = bbox.top;               dom.style.top  = pos.y+'px'; break;
          case 'center-v': pos.y = bbox.top+(bbox.h-h)/2;  dom.style.top  = pos.y+'px'; break;
          case 'bottom':   pos.y = bbox.bottom-h;          dom.style.top  = pos.y+'px'; break;
        }
      });
    }
    this._repositionAlignToolbar();
    this._push(); this._dirty();
  }

  /* ═══════════════════════════════════════
     POPOVERS
  ═══════════════════════════════════════ */

  _closePop() {
    document.getElementById('sc-pop')?.remove();
    document.querySelectorAll('#sc-ctoolbar button').forEach(b => b.classList.remove('active'));
    this._openPop = null;
  }

  _posPop(pop, anchorBtn) {
    const MARGIN = 8;
    const vw = window.innerWidth, vh = window.innerHeight;
    const btn = anchorBtn.getBoundingClientRect();
    const domEl = this.selId ? document.getElementById('dom-' + this.selId) : null;
    const elR   = domEl ? domEl.getBoundingClientRect() : btn;
    const pw = pop.offsetWidth || 210, ph = pop.offsetHeight || 200;
    let top, left;

    if (btn.top - MARGIN >= ph)                { top = btn.top - ph - MARGIN; left = btn.left + btn.width/2 - pw/2; }
    else if (vh - elR.bottom - MARGIN >= ph)   { top = elR.bottom + MARGIN;   left = elR.left + elR.width/2 - pw/2; }
    else if (vw - elR.right - MARGIN >= pw)    { top = Math.max(MARGIN, elR.top); left = elR.right + MARGIN; }
    else                                        { top = MARGIN + 46;           left = btn.left + btn.width/2 - pw/2; }

    left = Math.max(MARGIN, Math.min(left, vw - pw - MARGIN));
    top  = Math.max(MARGIN, Math.min(top,  vh - ph - MARGIN));
    pop.style.position = 'fixed'; pop.style.top = top+'px'; pop.style.left = left+'px';
  }

  _buildPop(type, el, dom, anchorBtn) {
    const pop = document.createElement('div');
    pop.id = 'sc-pop'; pop.className = 'sc-pop';
    pop.addEventListener('click', e => e.stopPropagation());
    if (type === 'conn')   this._popConn(pop, el, dom);
    if (type === 'style')  this._popStyle(pop, el, dom);
    if (type === 'pos')    this._popPos(pop, el, dom);
    if (type === 'mirror') this._popMirror(pop, el, dom);
    if (type === 'z')      this._popZ(pop, el, dom);
    return pop;
  }

  _popConn(pop, el, dom) {
    const pages = (typeof SCOTCH_ALL_PAGES !== 'undefined' ? SCOTCH_ALL_PAGES : [])
      .map(p => `<div class="sc-sugg" data-v="${p.slug}">${p.title||p.slug}</div>`).join('');
    pop.innerHTML = `
      <p class="sc-pop-title">Connexions</p>
      <div class="sc-pop-row"><span class="sc-pop-label">ce bloc mène vers</span>
        <input id="pci-link" type="text" placeholder="page, page#ancre ou https://…" value="${this._esc(el.link||'')}">
        <div id="pci-sugg" class="sc-sugg-box" style="display:none">${pages}</div>
      </div>
      <div class="sc-pop-row"><label class="sc-chk-label">
        <input type="checkbox" id="pci-tab" ${el.linkTarget==='_blank'?'checked':''}> ouvrir dans un nouvel onglet</label></div>
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">nom d'ancre <em>#</em></span>
        <input id="pci-anchor" type="text" placeholder="ex: section-contact" value="${this._esc(el.anchor||'')}">
      </div>
      <div class="sc-pop-row sc-pop-sep"><label class="sc-chk-label">
        <input type="checkbox" id="pci-global" ${el.global?'checked':''}> apparaît sur toutes les pages</label></div>
      <div class="sc-pop-actions">
        <button id="pci-remove">retirer</button>
        <button id="pci-apply" class="sc-pop-primary">appliquer</button>
      </div>`;

    const linkInp = pop.querySelector('#pci-link');
    const suggBox = pop.querySelector('#pci-sugg');
    linkInp.addEventListener('input', () => {
      const v = linkInp.value.trim().toLowerCase();
      if (!v || v.startsWith('http')) { suggBox.style.display='none'; return; }
      const items = suggBox.querySelectorAll('.sc-sugg');
      let any = false;
      items.forEach(s => { const show = s.dataset.v.includes(v); s.style.display = show?'block':'none'; if(show) any=true; });
      suggBox.style.display = any ? 'block' : 'none';
    });
    suggBox.querySelectorAll('.sc-sugg').forEach(s => {
      s.addEventListener('click', () => { linkInp.value = s.dataset.v; suggBox.style.display='none'; });
    });
    pop.querySelector('#pci-apply').addEventListener('click', () => {
      el.link       = pop.querySelector('#pci-link').value.trim();
      el.linkTarget = pop.querySelector('#pci-tab').checked ? '_blank' : '';
      el.anchor     = pop.querySelector('#pci-anchor').value.trim().replace(/[^a-z0-9_-]/gi,'-');
      el.global     = pop.querySelector('#pci-global').checked;
      this._updateBadges(dom, el); this._push(); this._dirty(); this._closePop();
    });
    pop.querySelector('#pci-remove').addEventListener('click', () => {
      el.link = el.linkTarget = el.anchor = ''; el.global = false;
      this._updateBadges(dom, el); this._push(); this._dirty(); this._closePop();
    });
  }

  _updateBadges(dom, el) {
    dom.querySelectorAll('.sc-badge').forEach(b => b.remove());
    if (el.link)   this._badge(dom, 'ti-link',  'right');
    if (el.anchor) this._badge(dom, 'ti-hash',  'left');
    if (el.global) this._badge(dom, 'ti-world', 'top');
  }
  _badge(dom, icon, side) {
    const b = document.createElement('span');
    b.className = `sc-badge sc-badge-${side}`;
    b.innerHTML = `<i class="ti ${icon}"></i>`;
    dom.appendChild(b);
  }

  _popStyle(pop, el, dom) {
    const s  = el.style || {};
    const op = Math.round((s.opacity??1)*100);
    const opSlider = `
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">opacité — <span id="psi-opv">${op}%</span></span>
        <input id="psi-op" type="range" min="0" max="100" value="${op}" style="width:100%;accent-color:#378ADD"></div>`;
    const bindOp = () => {
      pop.querySelector('#psi-op')?.addEventListener('input', e => {
        const v=parseInt(e.target.value)/100;
        if(!el.style)el.style={}; el.style.opacity=v; dom.style.opacity=v;
        pop.querySelector('#psi-opv').textContent=e.target.value+'%'; this._dirty();
      });
      pop.querySelector('#psi-op')?.addEventListener('change', () => this._push());
    };

    if (el.type==='image'||el.type==='file') {
      const fit = s.imgFit === 'contain' ? 'contain' : 'cover';
      const fitRow = el.type==='image' ? `
        <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">cadrage de l'image</span>
          <div style="display:flex;gap:4px">
            <button id="psi-fit-cover" class="sc-rep-btn${fit==='cover'?' on':''}" style="flex:1">Remplir</button>
            <button id="psi-fit-contain" class="sc-rep-btn${fit==='contain'?' on':''}" style="flex:1">Tout montrer</button>
          </div></div>` : '';
      pop.innerHTML = `
        <p class="sc-pop-title">Style</p>
        <div class="sc-pop-row"><button id="psi-change" style="width:100%;padding:7px;background:#378ADD;color:#fff;border:none;cursor:pointer;font-size:12px">
          <i class="ti ti-upload"></i> Changer ${el.type==='image'?'l\'image':'le fichier'}…</button></div>${fitRow}${opSlider}${this._hoverSectionHtml(el)}`;
      pop.querySelector('#psi-change').addEventListener('click', () => { this._closePop(); this._showUpload(el.type, el.pos.x, el.pos.y, el); });
      if (el.type==='image') {
        const setFit = v => {
          if(!el.style)el.style={}; el.style.imgFit=v;
          pop.querySelector('#psi-fit-cover').classList.toggle('on', v==='cover');
          pop.querySelector('#psi-fit-contain').classList.toggle('on', v==='contain');
          this._buildContent(dom, el); this._dirty(); this._push();
        };
        pop.querySelector('#psi-fit-cover').addEventListener('click', () => setFit('cover'));
        pop.querySelector('#psi-fit-contain').addEventListener('click', () => setFit('contain'));
      }
      this._bindHoverSection(pop, el, dom);
      bindOp(); return;
    }
    if (el.type==='iframe') {
      pop.innerHTML = `
        <p class="sc-pop-title">Style</p>
        <div class="sc-pop-row"><span class="sc-pop-label">URL</span>
          <input id="psi-url" type="url" value="${this._esc(el.content||'')}" placeholder="https://…"></div>${opSlider}${this._hoverSectionHtml(el)}`;
      pop.querySelector('#psi-url').addEventListener('change', e => { el.content=e.target.value; this._buildContent(dom,el); this._push(); this._dirty(); });
      this._bindHoverSection(pop, el, dom);
      bindOp(); return;
    }

    // bloc
    const fonts = this._allFonts().map(f =>
      `<div class="sc-fitem${s.fontFamily===f.family?' on':''}" data-f="${f.family}" style="font-family:'${f.family}',sans-serif">${f.family}</div>`
    ).join('');
    const swatches = ['#f5c2d1','#ffd966','#a8d8a8','#a8c8f8','#d4b8f0','#f8c8a8','#d0d0d0','#1a1a2e']
      .map(c=>`<div class="sc-sw${(s.bg||'')===c?' on':''}" data-c="${c}" style="background:${c}"></div>`).join('');
    const repOpts = ['repeat','cover','contain'].map(r =>
      `<button class="sc-rep-btn${(s.bgRepeat||'repeat')===r?' on':''}" data-r="${r}">${r==='repeat'?'Tuile':r==='cover'?'Couvrir':'Contenir'}</button>`
    ).join('');
    const bgImgName = s.bgImage ? s.bgImage.split('/').pop() : '';

    pop.innerHTML = `
      <p class="sc-pop-title">Style</p>
      <div class="sc-pop-row"><span class="sc-pop-label">couleur du bloc</span>
        <div class="sc-swatches">${swatches}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:5px">
          <input id="psi-color" type="color" value="${s.bg||'#d0d0d0'}" style="flex:1;height:26px;padding:1px 2px;border:1px solid #ddd;cursor:pointer">
          <label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#666;white-space:nowrap;cursor:pointer">
            <input type="checkbox" id="psi-transparent" ${s.bgTransparent?'checked':''}> transparent</label>
        </div>
      </div>
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">image de fond</span>
        <div style="display:flex;gap:5px;margin-bottom:4px">
          <button id="psi-bgimg-btn" style="flex:1;padding:5px;background:#f0f0f0;border:1px solid #ddd;cursor:pointer;font-size:11px">📂 Choisir…</button>
          ${s.bgImage?`<button id="psi-bgimg-rm" style="padding:5px 8px;background:#fff;border:1px solid #ddd;cursor:pointer;font-size:11px;color:#c00">✕</button>`:''}
        </div>
        ${bgImgName?`<div style="font-size:10px;color:#aaa;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${bgImgName}</div>`:''}
        <div style="display:flex;gap:4px">${repOpts}</div>
      </div>
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">alignement du texte</span>
        <div style="display:flex;gap:4px;margin-bottom:4px">
          ${['left','center','right'].map(a=>`<button class="sc-rep-btn sc-alh${(s.alignH||'left')===a?' on':''}" data-a="${a}"><i class="ti ti-align-${a==='left'?'left':a==='center'?'center':'right'}"></i></button>`).join('')}
        </div>
        <div style="display:flex;gap:4px">
          ${[['top','⤒'],['middle','↕'],['bottom','⤓']].map(([a,ic])=>`<button class="sc-rep-btn sc-alv${(s.alignV||'top')===a?' on':''}" data-a="${a}">${ic}</button>`).join('')}
        </div>
      </div>
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">couleur du texte</span>
        <input id="psi-txt" type="color" value="${s.color||'#000000'}" style="width:100%;height:26px;padding:1px 2px;border:1px solid #ddd;cursor:pointer">
      </div>
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">taille de police (px)</span>
        <input id="psi-fs" type="number" placeholder="hérité" value="${s.fontSize||''}">
      </div>
      ${fonts?`<div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">police chargée</span><div class="sc-font-list">${fonts}</div></div>`:''}
      ${opSlider}${this._hoverSectionHtml(el)}`;

    pop.querySelectorAll('.sc-sw').forEach(sw => {
      sw.addEventListener('click', () => {
        pop.querySelectorAll('.sc-sw').forEach(s=>s.classList.remove('on')); sw.classList.add('on');
        pop.querySelector('#psi-color').value = sw.dataset.c;
        pop.querySelector('#psi-transparent').checked = false;
        if(!el.style)el.style={}; el.style.bg=sw.dataset.c; el.style.bgTransparent=false;
        this._applyStyle(dom,el); this._dirty();
      });
    });
    pop.querySelector('#psi-color').addEventListener('input', e=>{
      if(!el.style)el.style={}; el.style.bg=e.target.value; el.style.bgTransparent=false;
      this._applyStyle(dom,el); this._dirty();
    });
    pop.querySelector('#psi-color').addEventListener('change', ()=>this._push());
    pop.querySelector('#psi-transparent').addEventListener('change', e=>{
      if(!el.style)el.style={}; el.style.bgTransparent=e.target.checked;
      this._applyStyle(dom,el); this._push(); this._dirty();
    });
    pop.querySelector('#psi-bgimg-btn').addEventListener('click', ()=>this._pickBgImage(el,dom,pop));
    pop.querySelector('#psi-bgimg-rm')?.addEventListener('click', ()=>{
      if(!el.style)el.style={}; el.style.bgImage='';
      this._applyStyle(dom,el); this._push(); this._dirty(); this._closePop();
    });
    pop.querySelectorAll('.sc-rep-btn').forEach(rb=>{
      rb.addEventListener('click', ()=>{
        pop.querySelectorAll('.sc-rep-btn').forEach(b=>b.classList.remove('on')); rb.classList.add('on');
        if(!el.style)el.style={}; el.style.bgRepeat=rb.dataset.r;
        this._applyStyle(dom,el); this._push(); this._dirty();
      });
    });
    pop.querySelectorAll('.sc-alh').forEach(b=>{
      b.addEventListener('click',()=>{
        pop.querySelectorAll('.sc-alh').forEach(x=>x.classList.remove('on')); b.classList.add('on');
        if(!el.style)el.style={}; el.style.alignH=b.dataset.a;
        this._applyStyle(dom,el); this._push(); this._dirty();
      });
    });
    pop.querySelectorAll('.sc-alv').forEach(b=>{
      b.addEventListener('click',()=>{
        pop.querySelectorAll('.sc-alv').forEach(x=>x.classList.remove('on')); b.classList.add('on');
        if(!el.style)el.style={}; el.style.alignV=b.dataset.a;
        this._applyStyle(dom,el); this._push(); this._dirty();
      });
    });
    pop.querySelector('#psi-txt').addEventListener('input', e=>{
      if(!el.style)el.style={}; el.style.color=e.target.value; dom.style.color=e.target.value; this._dirty();
    });
    pop.querySelector('#psi-txt').addEventListener('change', ()=>this._push());
    pop.querySelector('#psi-fs').addEventListener('change', e=>{
      if(!el.style)el.style={}; el.style.fontSize=parseInt(e.target.value)||null;
      dom.style.fontSize=el.style.fontSize?el.style.fontSize+'px':''; this._push(); this._dirty();
    });
    pop.querySelectorAll('.sc-fitem').forEach(fi=>{
      fi.addEventListener('click', ()=>{
        pop.querySelectorAll('.sc-fitem').forEach(f=>f.classList.remove('on')); fi.classList.add('on');
        if(!el.style)el.style={}; el.style.fontFamily=fi.dataset.f;
        dom.style.fontFamily=`'${fi.dataset.f}',sans-serif`; this._push(); this._dirty();
      });
    });
    this._bindHoverSection(pop, el, dom);
    bindOp();
  }

  _popPos(pop, el, dom) {
    const pos = el.pos;
    pop.innerHTML = `
      <p class="sc-pop-title">Position et taille</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div><span class="sc-pop-label">X</span><input id="pp-x" type="number" value="${Math.round(pos.x||0)}"></div>
        <div><span class="sc-pop-label">Y</span><input id="pp-y" type="number" value="${Math.round(pos.y||0)}"></div>
        <div><span class="sc-pop-label">Largeur</span><input id="pp-w" type="number" value="${el.size?.w||''}"></div>
        <div><span class="sc-pop-label">Hauteur</span><input id="pp-h" type="number" value="${el.size?.h||''}"></div>
      </div>
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">comportement mobile</span>
        <div style="display:flex;gap:4px">
          <button class="sc-rep-btn sc-mrole${!el.mobileRole?' on':''}" data-mr="">Empilé</button>
          <button class="sc-rep-btn sc-mrole${el.mobileRole==='hidden'?' on':''}" data-mr="hidden">Masqué</button>
          <button class="sc-rep-btn sc-mrole${el.mobileRole==='background'?' on':''}" data-mr="background">Fond</button>
        </div>
      </div>
      <div class="sc-pop-row"><span class="sc-pop-label">Ordre mobile <em>(position dans la pile)</em></span>
        <input id="pp-mob" type="number" min="0" value="${el.mobileOrder??''}" placeholder="auto (par Y)">
      </div>`;
    const upd = () => {
      const x=parseInt(pop.querySelector('#pp-x').value)||0;
      const y=parseInt(pop.querySelector('#pp-y').value)||0;
      const w=parseInt(pop.querySelector('#pp-w').value)||null;
      const h=parseInt(pop.querySelector('#pp-h').value)||null;
      pos.x=x; pos.y=y;
      if(!el.size)el.size={};
      el.size.w=w; el.size.h=h;
      dom.style.left=x+'px'; dom.style.top=y+'px';
      if(w) dom.style.width=w+'px'; if(h) dom.style.height=h+'px';
      this._repositionToolbar(dom); this._push(); this._dirty();
    };
    pop.querySelectorAll('.sc-mrole').forEach(rb => {
      rb.addEventListener('click', () => {
        pop.querySelectorAll('.sc-mrole').forEach(b=>b.classList.remove('on'));
        rb.classList.add('on');
        el.mobileRole = rb.dataset.mr || undefined;
        dom.classList.toggle('sc-mob-hidden', el.mobileRole==='hidden');
        dom.classList.toggle('sc-mob-bg',     el.mobileRole==='background');
        this._applyMobileOrder();
        this._push(); this._dirty();
      });
    });
    pop.querySelector('#pp-mob').addEventListener('change', e=>{
      const v = parseInt(e.target.value);
      el.mobileOrder = isNaN(v) ? undefined : v;
      this._applyMobileOrder();
      this._push(); this._dirty();
    });
    pop.querySelectorAll('#pp-x,#pp-y,#pp-w,#pp-h').forEach(i=>i.addEventListener('change',upd));
  }

  _popMirror(pop, el, dom) {
    const s = el.style||{};
    pop.innerHTML = `
      <p class="sc-pop-title">Miroir</p>
      <div style="display:flex;gap:6px">
        <button id="pm-h" class="sc-pop-mbtn${s.mirrorH?' on':''}"><i class="ti ti-arrows-horizontal"></i> horizontal</button>
        <button id="pm-v" class="sc-pop-mbtn${s.mirrorV?' on':''}"><i class="ti ti-arrows-vertical"></i> vertical</button>
      </div>`;
    const apply = () => {
      const mh=pop.querySelector('#pm-h').classList.contains('on');
      const mv=pop.querySelector('#pm-v').classList.contains('on');
      if(!el.style)el.style={}; el.style.mirrorH=mh; el.style.mirrorV=mv;
      dom.style.transform=mh&&mv?'scale(-1,-1)':mh?'scaleX(-1)':mv?'scaleY(-1)':'';
      this._push(); this._dirty();
    };
    pop.querySelector('#pm-h').addEventListener('click', e=>{ e.currentTarget.classList.toggle('on'); apply(); });
    pop.querySelector('#pm-v').addEventListener('click', e=>{ e.currentTarget.classList.toggle('on'); apply(); });
  }

  _popZ(pop, el, dom) {
    pop.innerHTML = `
      <p class="sc-pop-title">Ordre</p>
      <div style="display:flex;gap:6px">
        <button id="pz-front" class="sc-pop-mbtn"><i class="ti ti-square-arrow-up"></i> devant</button>
        <button id="pz-back"  class="sc-pop-mbtn"><i class="ti ti-square-arrow-down"></i> derrière</button>
      </div>`;
    pop.querySelector('#pz-front').addEventListener('click', ()=>{
      el.z=Math.max(0,...(this.page.elements||[]).map(e=>e.z||0))+1;
      dom.style.zIndex=el.z; this._push();this._dirty(); this._closePop();
    });
    pop.querySelector('#pz-back').addEventListener('click', ()=>{
      const mn=Math.min(1,...(this.page.elements||[]).map(e=>e.z||1));
      el.z=Math.max(0,mn-1); dom.style.zIndex=el.z;
      this._push();this._dirty(); this._closePop();
    });
  }

  /* ═══════════════════════════════════════
     DRAG ÉLÉMENT (simple + groupé)
  ═══════════════════════════════════════ */

  _bindEl(dom, el) {
    let sx, sy, moved = false;

    dom.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      if (e.target.classList.contains('sc-resize-handle')) return;
      if (dom.classList.contains('sc-editing') && e.target.closest('.sc-bloc-content')) return;
      e.stopPropagation();
      this._closePop();

      if (e.shiftKey) {
        // Shift+clic : toggle multi-sélection
        if (this.selIds.has(el.id)) {
          this.selIds.delete(el.id);
          dom.classList.remove('sc-selected');
          if (this.selId === el.id) this.selId = [...this.selIds][0] || null;
          if (this.selIds.size === 1) {
            const remainId = [...this.selIds][0];
            this._showToolbar(document.getElementById('dom-'+remainId));
          } else if (this.selIds.size > 1) {
            this._showAlignToolbar();
          } else {
            document.getElementById('sc-ctoolbar')?.remove();
          }
        } else {
          this._select(el.id, true);
        }
        return;
      }

      // Clic normal : sélection simple (sauf si déjà dans la sélection multi → on laisse)
      if (!this.selIds.has(el.id)) this._select(el.id);

      if (el.locked) return;
      if (this.mobile) { this._startMobileReorder(e, el, dom); return; }

      // Stocker les positions de départ pour déplacement groupé
      sx = e.clientX; sy = e.clientY;
      this._dragStarts.clear();
      this.selIds.forEach(sid => {
        const sel = this._el(sid);
        if (!sel) return;
        const p = sel.pos;
        this._dragStarts.set(sid, { x: p.x||0, y: p.y||0 });
      });
      moved = false;
      dom.setPointerCapture(e.pointerId);

      const onMove = e => {
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        moved = true;

        this.selIds.forEach(sid => {
          const sel = this._el(sid);
          const sd  = document.getElementById('dom-' + sid);
          if (!sel || !sd || sel.locked) return;
          const start = this._dragStarts.get(sid) || { x:0, y:0 };
          let nx = Math.max(0, start.x + dx);
          let ny = Math.max(0, start.y + dy);
          if (this.gridSnap) {
            nx = Math.round(nx / this.gridSize) * this.gridSize;
            ny = Math.round(ny / this.gridSize) * this.gridSize;
          }
          const pp = sel.pos;
          pp.x = nx; pp.y = ny;
          sd.style.left = nx+'px'; sd.style.top = ny+'px';
        });
        this._repositionToolbar(dom);
      };
      const onUp = () => {
        dom.removeEventListener('pointermove', onMove);
        dom.removeEventListener('pointerup', onUp);
        if (moved) { this._push(); this._dirty(); }
      };
      dom.addEventListener('pointermove', onMove);
      dom.addEventListener('pointerup', onUp);
    });

    dom.addEventListener('click', e => e.stopPropagation());

    dom.addEventListener('dblclick', e => {
      e.stopPropagation();
      if (el.locked) return;
      if (el.type === 'bloc')   this._startEdit(dom, el);
      if (el.type === 'iframe') this._editIframeUrl(el, dom);
      if (el.type === 'image')  this._showUpload('image', el.pos.x, el.pos.y, el);
      if (el.type === 'file')   this._showUpload('file',  el.pos.x, el.pos.y, el);
    });

    dom.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); this._select(el.id); });

    // Poignée resize
    const handle = document.createElement('div');
    handle.className = 'sc-resize-handle';
    dom.appendChild(handle);
    let rsx, rsy, rsw, rsh;
    handle.addEventListener('pointerdown', e => {
      e.stopPropagation(); e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      rsx=e.clientX; rsy=e.clientY;
      rsw=el.size?.w||dom.offsetWidth; rsh=el.size?.h||dom.offsetHeight;
      const onMove = e => {
        let nw=Math.max(60,rsw+(e.clientX-rsx)), nh=Math.max(40,rsh+(e.clientY-rsy));
        if(this.gridSnap){nw=Math.round(nw/this.gridSize)*this.gridSize;nh=Math.round(nh/this.gridSize)*this.gridSize;}
        if(!el.size)el.size={}; el.size.w=nw; el.size.h=nh;
        dom.style.width=nw+'px'; dom.style.height=nh+'px';
        this._repositionToolbar(dom);
      };
      const onUp = ()=>{ handle.removeEventListener('pointermove',onMove); handle.removeEventListener('pointerup',onUp); this._push();this._dirty(); };
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
    });
  }

  /* ═══════════════════════════════════════
     RÉORDONNANCEMENT MOBILE (drag vertical)
  ═══════════════════════════════════════ */

  _startMobileReorder(e, el, dom) {
    if (el.mobileRole) return; // masqués/fond : pas dans la pile
    // Liste des blocs empilés, dans l'ordre visuel actuel
    let order = (this.page.elements||[])
      .filter(x => !x.mobileRole)
      .sort((a,b) => {
        const oa=a.mobileOrder ?? (a.pos?.y||0), ob=b.mobileOrder ?? (b.pos?.y||0);
        return oa-ob;
      });
    dom.classList.add('sc-mob-dragging');
    dom.setPointerCapture(e.pointerId);

    const apply = () => {
      order.forEach((x,i) => {
        const d=document.getElementById('dom-'+x.id);
        if(d) d.style.order=i;
      });
    };

    const onMove = e => {
      const myIdx = order.indexOf(el);
      // comparer au centre des voisins pour permuter
      for (let i=0; i<order.length; i++) {
        if (order[i]===el) continue;
        const d=document.getElementById('dom-'+order[i].id);
        if (!d) continue;
        const r=d.getBoundingClientRect();
        const mid=r.top+r.height/2;
        if (i<myIdx && e.clientY<mid) { order.splice(myIdx,1); order.splice(i,0,el); apply(); break; }
        if (i>myIdx && e.clientY>mid) { order.splice(myIdx,1); order.splice(i,0,el); apply(); break; }
      }
    };
    const onUp = () => {
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerup', onUp);
      dom.classList.remove('sc-mob-dragging');
      // figer l'ordre dans mobileOrder
      order.forEach((x,i) => { x.mobileOrder=i; });
      this._push(); this._dirty();
    };
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerup', onUp);
  }

  /* ═══════════════════════════════════════
     EDITION TEXTE INLINE
  ═══════════════════════════════════════ */

  _startEdit(dom, el) {
    const c = dom.querySelector('.sc-bloc-content'); if(!c) return;
    dom.classList.add('sc-editing');
    c.style.pointerEvents='auto'; c.contentEditable='true'; c.focus();
    dom.style.cursor='text';
    c.addEventListener('blur', ()=>{
      el.content=c.innerHTML; dom.classList.remove('sc-editing');
      c.contentEditable='false'; c.style.pointerEvents='none';
      dom.style.cursor='move'; this._push(); this._dirty();
    }, {once:true});
  }

  /* ═══════════════════════════════════════
     CANVAS — RUBBER BAND + MENUS
  ═══════════════════════════════════════ */

  _bindCanvas() {
    let rbAnchor = null, rbEl = null;

    this.canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      if (e.target !== this.canvas) return;
      this._deselect();
      document.getElementById('sc-createmenu')?.remove();

      const r = this.canvas.getBoundingClientRect();
      rbAnchor = { x: e.clientX - r.left + this.canvas.scrollLeft,
                   y: e.clientY - r.top  + this.canvas.scrollTop };
      this.canvas.setPointerCapture(e.pointerId);

      rbEl = document.createElement('div');
      rbEl.id = 'sc-rubberband';
      Object.assign(rbEl.style, {
        position:'absolute', left:rbAnchor.x+'px', top:rbAnchor.y+'px',
        width:'0', height:'0', border:'1.5px dashed #378ADD',
        background:'rgba(55,138,221,.07)', pointerEvents:'none', zIndex:'7999'
      });
      this.canvas.appendChild(rbEl);

      const onMove = e => {
        const cx = e.clientX - r.left + this.canvas.scrollLeft;
        const cy = e.clientY - r.top  + this.canvas.scrollTop;
        const x = Math.min(rbAnchor.x, cx), y = Math.min(rbAnchor.y, cy);
        const w = Math.abs(cx - rbAnchor.x), h = Math.abs(cy - rbAnchor.y);
        Object.assign(rbEl.style, {left:x+'px', top:y+'px', width:w+'px', height:h+'px'});
      };
      const onUp = e => {
        this.canvas.removeEventListener('pointermove', onMove);
        this.canvas.removeEventListener('pointerup', onUp);
        if (!rbEl) return;
        const rbR = rbEl.getBoundingClientRect();
        rbEl.remove(); rbEl = null;
        if (rbR.width < 5 && rbR.height < 5) return; // simple clic
        let first = true;
        (this.page.elements||[]).forEach(el => {
          const d = document.getElementById('dom-' + el.id); if (!d) return;
          const er = d.getBoundingClientRect();
          if (er.left < rbR.right && er.right > rbR.left && er.top < rbR.bottom && er.bottom > rbR.top) {
            this._select(el.id, !first); first = false;
          }
        });
      };
      this.canvas.addEventListener('pointermove', onMove);
      this.canvas.addEventListener('pointerup', onUp);
    });

    this.canvas.addEventListener('dblclick', e => {
      if (e.target !== this.canvas) return;
      this._closePop();
      const r = this.canvas.getBoundingClientRect();
      this._showCreateMenu(e.clientX, e.clientY, e.clientX-r.left, e.clientY-r.top);
    });
    this.canvas.addEventListener('contextmenu', e => {
      if (e.target !== this.canvas) return;
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      this._showCreateMenu(e.clientX, e.clientY, e.clientX-r.left, e.clientY-r.top);
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#sc-pop') && !e.target.closest('#sc-ctoolbar') && !e.target.closest('#sc-createmenu'))
        this._closePop();
      if (!e.target.closest('#sc-createmenu') && !e.target.closest('.sc-el'))
        document.getElementById('sc-createmenu')?.remove();
    });
  }

  /* ═══════════════════════════════════════
     CRÉATION + SUPPRESSION + DUPLICATION
  ═══════════════════════════════════════ */

  _showCreateMenu(sx, sy, cx, cy) {
    document.getElementById('sc-createmenu')?.remove();
    const m = document.createElement('div');
    m.id = 'sc-createmenu'; m.className = 'sc-pop';
    m.style.cssText = `position:fixed;top:${Math.min(sy,innerHeight-240)}px;left:${Math.min(sx,innerWidth-210)}px`;
    m.innerHTML = `
      <p class="sc-pop-title">Bloc coloré</p>
      <div class="sc-create-colors">
        ${['#f5c2d1','#ffd966','#a8d8a8','#a8c8f8','#d4b8f0','#f8c8a8','#d0d0d0','#1a1a2e']
          .map(c=>`<div class="sc-ccsw" data-c="${c}" style="background:${c}"></div>`).join('')}
      </div>
      <div class="sc-create-media-sep"></div>
      <p class="sc-pop-title" style="margin-top:4px">Médias</p>
      <div class="sc-create-media">
        <button data-m="image"><i class="ti ti-photo"></i> Image</button>
        <button data-m="file"><i class="ti ti-paperclip"></i> Fichier</button>
        <button data-m="iframe"><i class="ti ti-player-play"></i> Vidéo / iframe</button>
      </div>`;
    m.addEventListener('click', e => e.stopPropagation());
    document.body.appendChild(m);
    m.querySelectorAll('.sc-ccsw').forEach(sw => {
      sw.addEventListener('click', () => { this._create(cx, cy, 'bloc', sw.dataset.c); m.remove(); });
    });
    m.querySelectorAll('[data-m]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.m; m.remove();
        if (type==='image'||type==='file') this._showUpload(type, cx, cy, null);
        else this._create(cx, cy, 'iframe');
      });
    });
  }

  _create(x, y, type='bloc', bg='#d0d0d0', content='', extra={}) {
    const id   = 'el_'+(++this._uid);
    const maxZ = Math.max(0,...(this.page.elements||[]).map(e=>e.z||0));
    if(this.gridSnap){x=Math.round(x/this.gridSize)*this.gridSize;y=Math.round(y/this.gridSize)*this.gridSize;}
    const sizes = {bloc:{w:200,h:80}, image:{w:300,h:200}, file:{w:240,h:52}, iframe:{w:420,h:300}};
    const sz = sizes[type]||{w:200,h:80};
    const el = { id, type, content,
      pos:{x:Math.max(0,x), y:Math.max(0,y)},
      size:{w:sz.w, h:sz.h},
      z:maxZ+1, locked:false, hidden:false, global:false, link:'', anchor:'',
      style: type==='bloc' ? {bg} : {}, ...extra };
    (this.page.elements=this.page.elements||[]).push(el);
    const dom = this._buildDom(el);
    this.canvas.appendChild(dom);
    this._select(id);
    if(type==='bloc')   setTimeout(()=>this._startEdit(dom,el), 80);
    if(type==='iframe') setTimeout(()=>this._editIframeUrl(el,dom), 80);
    this._push(); this._dirty();
    return el;
  }

  _delete(id) {
    this.page.elements=(this.page.elements||[]).filter(e=>e.id!==id);
    document.getElementById('dom-'+id)?.remove();
    this._deselect(); this._push(); this._dirty();
  }

  _duplicate(id) {
    const el=this._el(id); if(!el) return;
    const maxZ=Math.max(0,...(this.page.elements||[]).map(e=>e.z||0));
    const n=JSON.parse(JSON.stringify(el));
    n.id='el_'+(++this._uid);
    n.pos={x:(el.pos.x||0)+20, y:(el.pos.y||0)+20}; n.z=maxZ+1;
    this.page.elements.push(n);
    const dom=this._buildDom(n);
    this.canvas.appendChild(dom);
    this._select(n.id); this._push(); this._dirty();
  }

  _toggleLock(el, dom, tb) {
    el.locked=!el.locked;
    dom.classList.toggle('sc-locked',el.locked); dom.style.cursor=el.locked?'not-allowed':'move';
    const i=tb.querySelector('#sc-tb-lock i');
    if(i) i.className=el.locked?'ti ti-lock':'ti ti-lock-open';
    this._push(); this._dirty();
  }

  /* ═══════════════════════════════════════
     EFFETS AU SURVOL + TABLEAU DE BORD
  ═══════════════════════════════════════ */

  static HOVER_FX = [
    ['',       '— aucun —'],
    ['grow',   'Grossit'],
    ['shrink', 'Rétrécit'],
    ['tilt',   'Penche'],
    ['wiggle', 'Gigote'],
    ['invert', 'Couleurs inversées'],
    ['glow',   'Halo lumineux'],
  ];

  _hoverSectionHtml(el) {
    const opts = ScotchEditor.HOVER_FX.map(([v,l]) =>
      `<option value="${v}" ${(el.hover||'')===v?'selected':''}>${l}</option>`).join('');
    return `
      <div class="sc-pop-row sc-pop-sep"><span class="sc-pop-label">au survol (visiteur)</span>
        <div style="display:flex;gap:5px">
          <select id="psi-hover" style="flex:1;padding:5px;border:1px solid #e0e0e0;background:#f8f8f8;font-size:12px;outline:none">${opts}</select>
          <button id="psi-hover-prev" title="Prévisualiser" style="padding:5px 9px;background:#f0f0f0;border:1px solid #ddd;cursor:pointer;font-size:12px">▶</button>
        </div>
      </div>`;
  }

  _bindHoverSection(pop, el, dom) {
    pop.querySelector('#psi-hover')?.addEventListener('change', e => {
      this._setHover(el, e.target.value);
    });
    pop.querySelector('#psi-hover-prev')?.addEventListener('click', () => {
      this._previewHover(el.id);
    });
  }

  _setHover(el, fx) {
    el.hover = fx || undefined;
    const dom = document.getElementById('dom-' + el.id);
    if (dom) {
      dom.className = dom.className.replace(/\s?sc-hover-\w+/g, '');
      if (fx) dom.classList.add('sc-hover-' + fx);
    }
    this._push(); this._dirty();
  }

  _previewHover(id) {
    const el  = this._el(id);
    const dom = document.getElementById('dom-' + id);
    if (!el || !dom || !el.hover) return;
    dom.classList.add('sc-hover-on');
    setTimeout(() => dom.classList.remove('sc-hover-on'), 1200);
  }

  /* ─ Tableau de bord des animations ─ */

  _toggleAnimPanel() {
    let p = document.getElementById('sc-anim-panel');
    if (p) { p.remove(); return; }

    p = document.createElement('div');
    p.id = 'sc-anim-panel';
    p.className = 'sc-side-panel sc-side-right';

    const opts = fx => ScotchEditor.HOVER_FX.map(([v,l]) =>
      `<option value="${v}" ${(fx||'')===v?'selected':''}>${l}</option>`).join('');

    const rows = (this.page.elements||[]).map(el => {
      const label = this._elLabel(el);
      return `
        <li data-id="${el.id}">
          <span class="sc-anim-name" title="${el.id}">${label}</span>
          <select class="sc-anim-select">${opts(el.hover)}</select>
          <button class="sc-anim-prev" title="Prévisualiser">▶</button>
        </li>`;
    }).join('');

    p.innerHTML = `
      <h3>Animations <button id="sc-anim-close" style="float:right;background:none;border:none;cursor:pointer;color:#999;font-size:13px">✕</button></h3>
      <ul id="sc-anim-list">${rows || '<li style="color:#aaa;font-size:11px;font-style:italic">Aucun bloc sur cette page</li>'}</ul>
      <p style="font-size:10px;color:#aaa;padding:8px 14px;line-height:1.5">Les effets se déclenchent au survol chez le visiteur. ▶ pour prévisualiser ici.</p>`;
    document.body.appendChild(p);

    p.querySelector('#sc-anim-close').addEventListener('click', () => p.remove());
    p.querySelectorAll('li[data-id]').forEach(li => {
      const id = li.dataset.id;
      li.querySelector('.sc-anim-select').addEventListener('change', e => {
        const el = this._el(id); if (el) this._setHover(el, e.target.value);
      });
      li.querySelector('.sc-anim-prev').addEventListener('click', () => this._previewHover(id));
      li.querySelector('.sc-anim-name').addEventListener('click', () => this._select(id));
    });
  }

  _elLabel(el) {
    if (el.type === 'image')  return '🖼 ' + (el.filename || 'image');
    if (el.type === 'file')   return '📎 ' + (el.filename || 'fichier');
    if (el.type === 'iframe') return '▶ iframe';
    const txt = (el.content||'').replace(/<[^>]*>/g,'').trim();
    return txt ? txt.slice(0, 22) + (txt.length > 22 ? '…' : '') : '▬ bloc vide';
  }

  /* ═══════════════════════════════════════
     IMAGE DE FOND + UPLOAD
  ═══════════════════════════════════════ */

  _pickBgImage(el, dom, pop) {
    const input = document.createElement('input');
    input.type='file'; input.accept='image/*'; input.style.display='none';
    document.body.appendChild(input);
    input.addEventListener('change', async () => {
      if(!input.files.length){input.remove();return;}
      const fd=new FormData(); fd.append('file',input.files[0]); fd.append('page_slug',this.slug); fd.append('optimize','1');
      try {
        const r=await fetch(this.base+'api.php',{method:'POST',body:fd});
        const d=await r.json();
        if(d.ok){
          if(!el.style)el.style={}; el.style.bgImage=d.url; el.style.bgRepeat=el.style.bgRepeat||'repeat';
          this._applyStyle(dom,el); this._push(); this._dirty(); this._closePop();
        } else alert('Erreur : '+d.error);
      } catch { alert('Erreur réseau'); }
      input.remove();
    });
    input.click();
  }

  _showUpload(type, cx, cy, targetEl=null) {
    document.getElementById('sc-upload-overlay')?.remove();
    const ov=document.createElement('div');
    ov.id='sc-upload-overlay';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9900;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    const accept=type==='image'?'image/*':'*/*';
    const label=type==='image'?'Choisir une image':'Choisir un fichier';
    const imgOpts = type==='image' ? `
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:#555;margin:0 0 8px;cursor:pointer;justify-content:center">
        <input type="checkbox" id="sc-upl-optimize" checked> Optimiser (max 1600px)</label>
      ${!targetEl?`<div style="margin:0 0 12px"><span style="font-size:11px;color:#888;display:block;margin-bottom:4px">Utiliser comme :</span>
      <select id="sc-upl-usage" style="width:100%;padding:5px;border:1px solid #e0e0e0;background:#f8f8f8;font-size:12px;outline:none">
        <option value="">bloc image</option>
        <option value="tile">fond de page — tuilage</option>
        <option value="cover">fond de page — couvrant</option>
      </select></div>`:''}` : '';
    ov.innerHTML=`<div style="background:#fff;border:1px solid #e4e4e4;padding:2rem 2.5rem;min-width:280px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.15)">
      <p style="color:#333;font-size:14px;font-weight:500;margin:0 0 1.2rem">${label}</p>
      <input type="file" id="sc-upl-input" accept="${accept}" style="display:block;margin:0 auto 1rem;font-size:12px;color:#666">
      ${imgOpts}
      <div style="display:flex;gap:8px;justify-content:center">
        <button id="sc-upl-browse" style="padding:8px 18px;background:#378ADD;color:#fff;border:none;cursor:pointer;font-size:13px"><i class="ti ti-upload"></i> Parcourir…</button>
        <button id="sc-upl-cancel" style="padding:8px 18px;background:#fff;border:1px solid #ddd;color:#555;cursor:pointer;font-size:13px">Annuler</button>
      </div>
      <p id="sc-upl-status" style="font-size:11px;color:#aaa;margin:10px 0 0;min-height:1.2em"></p>
    </div>`;
    document.body.appendChild(ov);
    const inp=ov.querySelector('#sc-upl-input');
    ov.querySelector('#sc-upl-browse').onclick=()=>inp.click();
    ov.querySelector('#sc-upl-cancel').onclick=()=>ov.remove();
    ov.addEventListener('click', e=>{ if(e.target===ov) ov.remove(); });
    inp.onchange=()=>{ if(inp.files.length) this._doUpload(inp.files[0],type,cx,cy,targetEl); };
  }

  async _doUpload(file, type, cx, cy, targetEl=null) {
    const st=document.getElementById('sc-upl-status');
    if(st) st.textContent='Envoi en cours…';
    const optimize=document.getElementById('sc-upl-optimize')?.checked ?? true;
    const usage=document.getElementById('sc-upl-usage')?.value || '';
    const fd=new FormData(); fd.append('file',file); fd.append('page_slug',this.slug);
    if(optimize) fd.append('optimize','1');
    try {
      const r=await fetch(this.base+'api.php',{method:'POST',body:fd});
      const d=await r.json();
      if(d.ok){
        document.getElementById('sc-upload-overlay')?.remove();
        if(targetEl){
          targetEl.content=d.url; targetEl.filename=d.original||d.name;
          const dom=document.getElementById('dom-'+targetEl.id);
          if(dom){this._applyStyle(dom,targetEl);this._buildContent(dom,targetEl);}
        } else if(usage==='tile'||usage==='cover'){
          // Image de fond de page
          if(!this.page.meta) this.page.meta={};
          this.page.meta.bg={image:d.url, mode:usage};
          this._applyPageBg();
        } else {
          const elType=file.type.startsWith('image/')?'image':'file';
          this._create(cx,cy,elType,'',d.url,{filename:d.original||d.name});
        }
        this._push(); this._dirty();
      } else { if(st) st.textContent='Erreur : '+(d.error||'?'); }
    } catch { if(st) st.textContent='Erreur réseau'; }
  }

  _applyPageBg() {
    const bg=this.page.meta?.bg;
    if(bg?.image){
      document.body.style.backgroundImage=`url('${this.base+bg.image}')`;
      if(bg.mode==='cover'){
        document.body.style.backgroundSize='cover';
        document.body.style.backgroundRepeat='no-repeat';
        document.body.style.backgroundPosition='center';
        document.body.style.backgroundAttachment='fixed';
      } else {
        document.body.style.backgroundSize='auto';
        document.body.style.backgroundRepeat='repeat';
        document.body.style.backgroundAttachment='';
      }
    } else {
      document.body.style.backgroundImage='';
    }
  }

  _editIframeUrl(el, dom) {
    const url=prompt('URL de la vidéo ou iframe :',el.content||'https://');
    if(url!==null){ el.content=url; this._buildContent(dom,el); this._push(); this._dirty(); }
  }

  /* ═══════════════════════════════════════
     BARRE DU HAUT
  ═══════════════════════════════════════ */

  _bindTopbar() {
    const b=(id,fn)=>document.getElementById(id)?.addEventListener('click',fn);
    b('sc-undo-btn', ()=>this._undo());
    b('sc-redo-btn', ()=>this._redo());
    b('sc-save-btn', ()=>this._save());

    b('sc-grid-btn', ()=>{
      this.gridSnap=!this.gridSnap;
      document.getElementById('sc-grid-btn')?.classList.toggle('active',this.gridSnap);
      document.body.classList.toggle('sc-grid-on',this.gridSnap);
      this._updateGridOverlay();
    });

    // Taille de grille — activer la grille automatiquement au changement
    document.getElementById('sc-grid-size')?.addEventListener('change', e => {
      this.gridSize = Math.max(2, parseInt(e.target.value)||8);
      this._updateGridOverlay();
      if (!this.gridSnap) document.getElementById('sc-grid-btn')?.click();
    });

    b('sc-mobile-btn', ()=>{
      this.mobile=!this.mobile;
      document.getElementById('sc-mobile-btn')?.classList.toggle('active',this.mobile);
      document.body.classList.toggle('sc-mobile-view',this.mobile);
      this._renderAll();
    });
    b('sc-anim-btn',  ()=>this._toggleAnimPanel());
    b('sc-pages-btn', ()=>this._toggleSidePanel('sc-pages-panel'));
    b('sc-settings-btn', ()=>this._toggleSidePanel('sc-settings-panel'));
    b('sc-pages-close', ()=>document.getElementById('sc-pages-panel').style.display='none');
    b('sc-settings-close', ()=>document.getElementById('sc-settings-panel').style.display='none');

    b('sc-settings-apply', async()=>{
      const m=this.page.meta=this.page.meta||{};
      const g=id=>document.getElementById(id);
      const oldTheme=m.theme||'', oldJs=m.themeJs??true;
      if(g('sc-meta-title'))  m.title    =g('sc-meta-title').value;
      if(g('sc-meta-desc'))   m.desc     =g('sc-meta-desc').value;
      if(g('sc-meta-nav'))    m.in_nav   =g('sc-meta-nav').checked;
      if(g('sc-meta-index'))  m.do_index =g('sc-meta-index').checked;
      if(g('sc-meta-css'))    m.css      =g('sc-meta-css').value;
      if(g('sc-meta-theme'))  m.theme    =g('sc-meta-theme').value;
      if(g('sc-meta-themejs'))m.themeJs  =g('sc-meta-themejs').checked;
      document.getElementById('sc-settings-panel').style.display='none';
      this._push(); this._dirty();
      // Le thème nécessite un rechargement pour être visible
      if((m.theme||'')!==oldTheme || (m.themeJs??true)!==oldJs){
        await this._save(); location.reload();
      }
    });

    b('sc-site-apply', async()=>{
      const g=id=>document.getElementById(id);
      const site = {
        theme: g('sc-site-theme')?.value || '',
        css:   g('sc-site-css')?.value   || '',
        js:    g('sc-site-js')?.value    || '',
        themeSwitcher: g('sc-site-switcher')?.checked || false,
      };
      const r = await this._api({action:'save_site', site});
      if (r.ok) location.reload(); // recharger pour voir le thème appliqué
      else alert('Erreur : '+(r.error||'?'));
    });

    b('sc-new-page-btn', async()=>{
      const s=document.getElementById('sc-new-slug')?.value.trim(); if(!s) return;
      const r=await this._api({action:'create_page',slug:s});
      if(r.ok) location.href=this.base+'?url='+encodeURIComponent(r.slug)+'&edit';
      else alert('Erreur : '+r.error);
    });
    document.querySelectorAll('.sc-del-page').forEach(btn=>{
      btn.addEventListener('click', async()=>{
        const sl=btn.dataset.slug;
        if(!confirm('Supprimer «'+sl+'» ?')) return;
        const r=await this._api({action:'delete_page',slug:sl});
        if(r.ok) btn.closest('li').remove(); else alert('Erreur : '+r.error);
      });
    });

    b('sc-font-google-add', ()=>{
      const inp=document.getElementById('sc-font-google-name');
      this._addGoogleFont(inp?.value); if(inp) inp.value='';
    });
    b('sc-font-upload-btn', ()=>document.getElementById('sc-font-file-input')?.click());
    document.getElementById('sc-font-file-input')?.addEventListener('change', e=>{
      if(e.target.files.length) this._uploadFont(e.target.files[0]); e.target.value='';
    });

    window.scotch = this;
    this.createThisPage = async()=>{
      const r=await this._api({action:'create_page',slug:this.slug});
      if(r.ok) location.reload(); else alert('Erreur : '+r.error);
    };
  }

  _toggleSidePanel(id){
    const p=document.getElementById(id); if(!p) return;
    p.style.display=p.style.display==='none'?'block':'none';
    if(id==='sc-settings-panel' && p.style.display==='block') this._refreshBgZone();
  }

  /* Zone "image de fond de page" du panneau réglages */
  _refreshBgZone(){
    const z=document.getElementById('sc-bg-zone'); if(!z) return;
    const bg=this.page.meta?.bg;
    if(bg?.image){
      const name=bg.image.split('/').pop();
      z.innerHTML=`
        <img src="${this.base+bg.image}" style="width:100%;height:56px;object-fit:cover;border:1px solid #e0e0e0;display:block;margin-bottom:5px" alt="">
        <div style="font-size:10px;color:#aaa;margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</div>
        <div style="display:flex;gap:4px;margin-bottom:5px">
          <button class="sc-rep-btn${bg.mode!=='cover'?' on':''}" data-bgm="tile" style="flex:1">Tuilage</button>
          <button class="sc-rep-btn${bg.mode==='cover'?' on':''}" data-bgm="cover" style="flex:1">Couvrant</button>
        </div>
        <div style="display:flex;gap:4px">
          <button id="sc-bgz-pick" style="flex:1;padding:5px;background:#f0f0f0;border:1px solid #ddd;cursor:pointer;font-size:11px">📂 Changer…</button>
          <button id="sc-bgz-rm" style="padding:5px 9px;background:#fff;border:1px solid #ddd;color:#c00;cursor:pointer;font-size:11px">✕</button>
        </div>`;
      z.querySelectorAll('[data-bgm]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          bg.mode=btn.dataset.bgm;
          this._applyPageBg(); this._refreshBgZone(); this._push(); this._dirty();
        });
      });
      z.querySelector('#sc-bgz-rm').addEventListener('click',()=>{
        delete this.page.meta.bg;
        this._applyPageBg(); this._refreshBgZone(); this._push(); this._dirty();
      });
      z.querySelector('#sc-bgz-pick').addEventListener('click',()=>this._pickPageBg());
    } else {
      z.innerHTML=`<button id="sc-bgz-pick" style="width:100%;padding:6px;background:#f0f0f0;border:1px solid #ddd;cursor:pointer;font-size:11px">📂 Choisir une image…</button>`;
      z.querySelector('#sc-bgz-pick').addEventListener('click',()=>this._pickPageBg());
    }
  }

  _pickPageBg(){
    const input=document.createElement('input');
    input.type='file'; input.accept='image/*'; input.style.display='none';
    document.body.appendChild(input);
    input.addEventListener('change', async()=>{
      if(!input.files.length){input.remove();return;}
      const fd=new FormData();
      fd.append('file',input.files[0]); fd.append('page_slug',this.slug); fd.append('optimize','1');
      try{
        const r=await fetch(this.base+'api.php',{method:'POST',body:fd});
        const d=await r.json();
        if(d.ok){
          if(!this.page.meta) this.page.meta={};
          const mode=this.page.meta.bg?.mode||'tile';
          this.page.meta.bg={image:d.url, mode};
          this._applyPageBg(); this._refreshBgZone(); this._push(); this._dirty();
        } else alert('Erreur : '+(d.error||'?'));
      }catch{ alert('Erreur réseau'); }
      input.remove();
    });
    input.click();
  }

  _updateGridOverlay() {
    document.body.style.setProperty('--sc-grid-size', this.gridSize + 'px');
  }

  /* ═══════════════════════════════════════
     CLAVIER
  ═══════════════════════════════════════ */

  _bindKeyboard() {
    document.addEventListener('keydown', e => {
      if(e.target.matches('input,textarea,[contenteditable="true"]')) return;
      const ctrl=e.ctrlKey||e.metaKey;
      if(ctrl&&e.key==='z'&&!e.shiftKey){e.preventDefault();this._undo();}
      if(ctrl&&(e.key==='y'||(e.key==='z'&&e.shiftKey))){e.preventDefault();this._redo();}
      if(ctrl&&e.key==='s'){e.preventDefault();this._save();}
      if(ctrl&&e.key==='a'){e.preventDefault();this._selectAll();}
      if(e.key==='g') document.getElementById('sc-grid-btn')?.click();
      if(e.key==='m') document.getElementById('sc-mobile-btn')?.click();
      if(e.key==='Escape'){this._deselect();document.getElementById('sc-createmenu')?.remove();}
      if((e.key==='Delete'||e.key==='Backspace')&&this.selId){
        if(confirm('Supprimer ?')) this._delete(this.selId);
      }
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&this.selIds.size>0){
        e.preventDefault();
        const step=e.shiftKey?10:1;
        this.selIds.forEach(id=>{
          const el=this._el(id); if(!el||el.locked) return;
          if(e.key==='ArrowLeft')  el.pos.x-=step;
          if(e.key==='ArrowRight') el.pos.x+=step;
          if(e.key==='ArrowUp')    el.pos.y-=step;
          if(e.key==='ArrowDown')  el.pos.y+=step;
          const dom=document.getElementById('dom-'+id);
          if(dom){dom.style.left=el.pos.x+'px';dom.style.top=el.pos.y+'px';}
        });
        if(this.selIds.size>1) this._repositionAlignToolbar();
        this._dirty();
      }
    });
    document.addEventListener('keyup', e=>{
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&this.selIds.size>0)
        this._push();
    });
  }

  _selectAll() {
    let first=true;
    (this.page.elements||[]).forEach(el=>{
      this._select(el.id, !first); first=false;
    });
  }

  /* ═══════════════════════════════════════
     HISTORIQUE
  ═══════════════════════════════════════ */

  _push(){
    this.history=this.history.slice(0,this.histIdx+1);
    this.history.push(JSON.parse(JSON.stringify(this.page)));
    if(this.history.length>40) this.history.shift();
    this.histIdx=this.history.length-1;
    this._updateUR();
  }
  _undo(){
    if(this.histIdx<=0) return;
    this.histIdx--;
    this.page=JSON.parse(JSON.stringify(this.history[this.histIdx]));
    this._renderAll(); this._updateUR(); this._dirty();
  }
  _redo(){
    if(this.histIdx>=this.history.length-1) return;
    this.histIdx++;
    this.page=JSON.parse(JSON.stringify(this.history[this.histIdx]));
    this._renderAll(); this._updateUR(); this._dirty();
  }
  _updateUR(){
    const u=document.getElementById('sc-undo-btn');
    const r=document.getElementById('sc-redo-btn');
    if(u) u.disabled=this.histIdx<=0;
    if(r) r.disabled=this.histIdx>=this.history.length-1;
  }

  /* ═══════════════════════════════════════
     POLICES
  ═══════════════════════════════════════ */

  _loadFonts(){
    [...this.siteFonts, ...(this.page.meta?.fonts||[])].forEach(f=>this._injectFont(f));
  }
  _allFonts(){
    const seen=new Set(), out=[];
    [...this.siteFonts, ...(this.page.meta?.fonts||[])].forEach(f=>{
      if(f.family && !seen.has(f.family)){ seen.add(f.family); out.push(f); }
    });
    return out;
  }
  _injectFont(f){
    if(f.type==='google'){
      const id='sc-gf-'+f.family.replace(/\s/g,'-');
      if(document.getElementById(id)) return;
      const l=document.createElement('link');
      l.id=id; l.rel='stylesheet';
      l.href='https://fonts.googleapis.com/css2?family='+f.family.replace(/\s/g,'+')
             +':wght@400;500;700&display=swap';
      document.head.appendChild(l);
    } else if(f.type==='upload'){
      const id='sc-ff-'+f.family.replace(/\s/g,'-');
      if(document.getElementById(id)) return;
      const ext=(f.url.split('.').pop()||'').toLowerCase();
      const fmt={woff2:'woff2',woff:'woff',ttf:'truetype',otf:'opentype'}[ext]||'woff2';
      const s=document.createElement('style');
      s.id=id;
      s.textContent=`@font-face{font-family:'${f.family}';src:url('${this.base+f.url}') format('${fmt}');font-display:swap;}`;
      document.head.appendChild(s);
    }
  }
  async _addGoogleFont(name){
    name=(name||'').trim(); if(!name) return;
    if(this._allFonts().some(f=>f.family===name)){alert('Police déjà ajoutée.');return;}
    const f={type:'google',family:name};
    const r=await this._api({action:'add_site_font',font:f});
    if(!r.ok){alert('Erreur : '+(r.error||'?'));return;}
    this.siteFonts.push(f); this._injectFont(f);
  }
  async _uploadFont(file){
    const st=document.getElementById('sc-font-status'); if(st) st.textContent='Envoi…';
    const fd=new FormData(); fd.append('file',file); fd.append('upload_kind','font');
    try{
      const r=await fetch(this.base+'api.php',{method:'POST',body:fd});
      const d=await r.json();
      if(d.ok){
        const f={type:'upload',family:d.family,url:d.url};
        const r2=await this._api({action:'add_site_font',font:f});
        if(r2.ok){
          this.siteFonts.push(f); this._injectFont(f);
          if(st) st.textContent='✓ '+d.family+' ajoutée (tout le site)';
        } else if(st) st.textContent='Erreur : '+(r2.error||'?');
      } else if(st) st.textContent='Erreur : '+d.error;
    } catch { if(st) st.textContent='Erreur réseau'; }
  }

  /* ═══════════════════════════════════════
     SAUVEGARDE + API
  ═══════════════════════════════════════ */

  _dirty(){this.dirty=true; document.getElementById('sc-unsaved-dot').style.display='inline';}
  _clean(){this.dirty=false; document.getElementById('sc-unsaved-dot').style.display='none';}

  async _save(){
    const btn=document.getElementById('sc-save-btn');
    if(btn){btn.textContent='⏳';btn.disabled=true;}
    try{
      const r=await this._api({action:'save_page',page:this.page});
      if(r.ok){this._clean();if(btn) btn.innerHTML='<i class="ti ti-device-floppy"></i> ✓';
        setTimeout(()=>{if(btn){btn.innerHTML='<i class="ti ti-device-floppy"></i> 💾';btn.disabled=false;}},2000);}
      else{if(btn){btn.textContent='✗';btn.disabled=false;} alert('Erreur : '+(r.error||'?'));}
    }catch{if(btn){btn.textContent='✗';btn.disabled=false;}}
  }
  async _api(data){
    const r=await fetch(this.base+'api.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    return r.json();
  }

  /* ═══════════════════════════════════════
     UTILS
  ═══════════════════════════════════════ */

  _el(id){ return (this.page.elements||[]).find(e=>e.id===id); }
  _esc(s){ return String(s).replace(/"/g,'&quot;'); }
}

window.addEventListener('DOMContentLoaded', ()=>{
  if(typeof SCOTCH_PAGE!=='undefined')
    window.scotch=new ScotchEditor(SCOTCH_PAGE,SCOTCH_SLUG,SCOTCH_BASE);
});
