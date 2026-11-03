<?php
require_once __DIR__ . '/settings.php';
require_once SCOTCH_SYS . 'auth.php';
require_once SCOTCH_SYS . 'funcs.php';

if (SCOTCH_DEBUG) { error_reporting(E_ALL); ini_set('display_errors','1'); }

$logged      = sc_is_logged();
$login_error = false;

if (isset($_POST['sc_login'])) {
    if (sc_login($_POST['sc_user']??'', $_POST['sc_pass']??'')) {
        $rs = sc_slug($_POST['sc_redirect_slug']??'');
        header('Location: '.($rs ? '?url='.urlencode($rs).'&edit' : '?edit')); exit;
    }
    $login_error = true;
}
if (isset($_POST['sc_logout'])) {
    sc_logout();
    header('Location: ?url='.urlencode(sc_slug($_POST['sc_current_slug']??'index'))); exit;
}

$slug      = sc_slug($_GET['url']??'index') ?: 'index';
$edit_mode = isset($_GET['edit']) && $logged;
$want_edit = isset($_GET['edit']);
$base_url  = sc_base_url();
$page_data = sc_load_page($slug);
$nav_pages = sc_list_pages();
if (!$page_data) $edit_mode = false;   // page à créer : écran dédié, sans éditeur

$is_draft    = $page_data && (($page_data['meta']['published'] ?? true) === false);
if ($is_draft && !$logged) $page_data = null;   // brouillon : 404 pour les visiteurs
$show_404    = !$page_data && !$logged;
$show_create = !$page_data && $logged;

$page_title = $page_data['meta']['title'] ?? $slug;
$page_desc  = $page_data['meta']['desc']  ?? '';
$page_css   = $page_data['meta']['css']   ?? '';
$do_index   = $page_data['meta']['do_index'] ?? true;

// Réglages du site (thème, CSS/JS globaux)
$site       = sc_load_site();
$themes     = sc_list_themes();

// Thème effectif : celui de la page s'il est défini, sinon celui du site.
// 'none' force le brut même si le site a un thème.
$page_theme  = $page_data['meta']['theme'] ?? '';
$eff_theme   = $page_theme === 'none' ? '' : ($page_theme ?: ($site['theme'] ?? ''));
$theme_js_on = $page_data['meta']['themeJs'] ?? true;

// Injection polices
// Polices : celles du site (globales) + celles héritées des pages (compat)
$site_pre     = sc_load_site();
$all_fonts    = array_merge($site_pre['fonts'] ?? [], $page_data['meta']['fonts'] ?? []);
$seen_fams    = [];
$gf_families  = [];
$face_css     = '';
foreach ($all_fonts as $f) {
    $fam0 = $f['family'] ?? '';
    if (!$fam0 || isset($seen_fams[$fam0])) continue;
    $seen_fams[$fam0] = true;
    if (($f['type']??'') === 'google') $gf_families[] = $fam0;
    elseif (($f['type']??'') === 'upload' && !empty($f['url'])) {
        $url = htmlspecialchars($base_url . ltrim($f['url'],'/'), ENT_QUOTES);
        $fam = htmlspecialchars($fam0, ENT_QUOTES);
        $ext = strtolower(pathinfo($f['url'], PATHINFO_EXTENSION));
        $fmt = ['woff2'=>'woff2','woff'=>'woff','ttf'=>'truetype','otf'=>'opentype'][$ext] ?? 'woff2';
        // font-weight en plage : la même graisse sert pour normal ET gras,
        // sinon chaque navigateur fabrique un faux gras (différent selon le moteur)
        $face_css .= "@font-face{font-family:'{$fam}';src:url('{$url}') format('{$fmt}');font-weight:100 900;font-style:normal;font-display:swap;}\n";
    }
}

// Centrage (écran large) : milieu horizontal de la composition.
// Aussi dans l'éditeur, calculé au chargement : la maquette est placée comme le rendu visiteur.
$center_style = '';
if ($page_data && ($site_pre['center'] ?? true)) {
    $minX = INF; $maxX = -INF;
    foreach ($page_data['elements'] ?? [] as $el) {
        if (!empty($el['hidden'])) continue;
        if (!empty($el['global']) && in_array($el['id'] ?? '', $page_data['meta']['hiddenGlobals'] ?? [], true)) continue;
        $x  = intval($el['pos']['x'] ?? 0);
        $dw = in_array($el['type'] ?? 'bloc', ['image','iframe']) ? 300 : 160;
        $w  = !empty($el['size']['w']) ? intval($el['size']['w']) : $dw;
        $minX = min($minX, $x); $maxX = max($maxX, $x + $w);
    }
    if ($maxX > $minX) $center_style = ' class="sc-centered" style="--sc-cx:' . round(($minX + $maxX) / 2) . 'px"';
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<?php if (!$do_index): ?><meta name="robots" content="noindex,nofollow"><?php endif ?>
<?php if ($page_desc): ?><meta name="description" content="<?= htmlspecialchars($page_desc,ENT_QUOTES) ?>"><?php endif ?>
<title><?= htmlspecialchars($page_title) ?></title>
<link rel="stylesheet" href="<?= $base_url ?>scotch-sys/css/scotch.css?v=<?= sc_asset_v('css/scotch.css') ?>">
<?php if ($edit_mode): ?>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">
<link rel="stylesheet" href="<?= $base_url ?>scotch-sys/css/scotch-edit.css?v=<?= sc_asset_v('css/scotch-edit.css') ?>">
<?php endif ?>
<?php if ($gf_families): ?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=<?= implode('&family=',array_map(fn($f)=>str_replace(' ','+',$f).':wght@400;500;700',$gf_families)) ?>&display=swap" rel="stylesheet">
<?php endif ?>
<?php if ($face_css): ?><style><?= $face_css ?></style><?php endif ?>
<?php
// Thème effectif : celui du visiteur (cookie localStorage géré en JS) sinon celui du site
$switcher_on = !empty($site['themeSwitcher']) && !$edit_mode;
?>
<?php if (!empty($eff_theme) && in_array($eff_theme, $themes)): ?>
<link id="sc-theme-css" rel="stylesheet" href="<?= $base_url ?>scotch-sys/themes/<?= htmlspecialchars($eff_theme,ENT_QUOTES) ?>.css?v=<?= sc_asset_v('themes/'.$eff_theme.'.css') ?>">
<?php if ($theme_js_on && file_exists(SCOTCH_SYS . 'themes/' . $eff_theme . '.js')): ?>
<script id="sc-theme-js" defer src="<?= $base_url ?>scotch-sys/themes/<?= htmlspecialchars($eff_theme,ENT_QUOTES) ?>.js?v=<?= sc_asset_v('themes/'.$eff_theme.'.js') ?>"></script>
<?php endif ?>
<?php endif ?>
<?php if ($switcher_on): 
    $themes_js = [];
    foreach ($themes as $t) $themes_js[$t] = file_exists(SCOTCH_SYS.'themes/'.$t.'.js');
?>
<script>
/* Switcher de thème visiteur : applique le choix stocké avant le rendu */
(function(){
  var THEMES = <?= json_encode($themes_js) ?>;
  var BASE   = <?= json_encode($base_url) ?>;
  var DEF    = <?= json_encode($eff_theme ?? '') ?>;
  var pick   = null;
  try { pick = localStorage.getItem('scotch-theme'); } catch(e){}
  if (pick === null || pick === DEF) return;
  // retirer le thème par défaut
  document.getElementById('sc-theme-css')?.remove();
  document.getElementById('sc-theme-js')?.remove();
  if (pick && THEMES.hasOwnProperty(pick)) {
    var l = document.createElement('link');
    l.id='sc-theme-css'; l.rel='stylesheet';
    l.href = BASE + 'scotch-sys/themes/' + pick + '.css';
    document.head.appendChild(l);
    if (THEMES[pick]) {
      var s = document.createElement('script');
      s.defer = true; s.src = BASE + 'scotch-sys/themes/' + pick + '.js';
      document.head.appendChild(s);
    }
  }
})();
</script>
<?php endif ?>
<?php if (!empty($site['css'])): ?><style>/* CSS global du site */<?= "\n".$site['css'] ?></style><?php endif ?>
<style id="sc-page-css"><?= $page_css ?></style>
<?php
// Fond de page : choisi dans les réglages, il passe devant le thème et le CSS (!important)
$pbg    = $page_data['meta']['bg'] ?? [];
$bg_css = '';
if (!empty($pbg['color']) && preg_match('/^#[0-9a-f]{6}$/i', $pbg['color'])) {
    $bg_css .= "background-color:{$pbg['color']} !important;";
    if (empty($pbg['image'])) $bg_css .= "background-image:none !important;";
}
if (!empty($pbg['image'])) {
    $bg_url  = htmlspecialchars($base_url . ltrim($pbg['image'],'/'), ENT_QUOTES);
    $bg_css .= "background-image:url('{$bg_url}') !important;";
    $bg_css .= ($pbg['mode'] ?? 'tile') === 'cover'
        ? "background-size:cover !important;background-repeat:no-repeat !important;background-position:center !important;background-attachment:fixed !important;"
        : "background-size:auto !important;background-repeat:repeat !important;";
}
// Police par défaut du site (les blocs qui ont leur propre police la gardent)
$def_font = trim($site['font'] ?? '');
?>
<?php if ($bg_css): ?><style id="sc-page-bg">body{<?= $bg_css ?>}</style><?php endif ?>
<?php if ($def_font): ?><style id="sc-site-font-css">#sc-canvas .sc-el{font-family:'<?= htmlspecialchars($def_font, ENT_QUOTES) ?>',sans-serif}</style><?php endif ?>
</head>
<body class="<?= $edit_mode ? 'sc-edit-mode' : '' ?>">
<?php if ($is_draft && $logged && !$edit_mode): ?>
<div id="sc-draft-banner">Brouillon — cette page n'est pas publiée : seuls les éditeurs connectés la voient.</div>
<?php endif ?>

<?php if ($edit_mode): ?>
<!-- ══ BARRE DU HAUT ══ -->
<header id="sc-topbar">
  <span id="sc-logo">✂</span>
  <div class="sc-top-sep"></div>
  <button id="sc-undo-btn" title="Annuler Ctrl+Z" disabled><i class="ti ti-arrow-back-up"></i></button>
  <button id="sc-redo-btn" title="Rétablir Ctrl+Y" disabled><i class="ti ti-arrow-forward-up"></i></button>
  <div class="sc-top-sep"></div>
  <button id="sc-grid-btn"   title="Grille (G)"><i class="ti ti-grid-dots"></i></button>
  <input id="sc-grid-size" type="number" value="8" min="2" max="64" step="2"
    title="Taille de la grille (px)"
    style="width:40px;height:28px;padding:0 4px;border:1px solid #e4e4e4;font-size:11px;text-align:center;color:#333;background:#f8f8f8;outline:none">
  <button id="sc-mobile-btn" title="Vue mobile (M)"><i class="ti ti-device-mobile"></i></button>
  <div class="sc-top-center">
    <span id="sc-page-label">
      <a href="?url=<?= urlencode($slug) ?>" target="_blank"><?= htmlspecialchars($slug) ?> ↗</a>
    </span>
    <span id="sc-unsaved-dot" style="display:none">●</span>
  </div>
  <button id="sc-anim-btn"   title="Animations"><i class="ti ti-sparkles"></i></button>
  <button id="sc-pages-btn"   title="Pages"><i class="ti ti-layout-grid"></i> pages</button>
  <button id="sc-settings-btn" title="Réglages"><i class="ti ti-settings"></i></button>
  <button id="sc-save-btn" title="Ctrl+S"><i class="ti ti-device-floppy"></i> 💾</button>
  <form method="post" style="margin:0">
    <input type="hidden" name="sc_logout" value="1">
    <input type="hidden" name="sc_current_slug" value="<?= htmlspecialchars($slug,ENT_QUOTES) ?>">
    <button type="submit" title="Quitter l'édition"><i class="ti ti-door-exit"></i></button>
  </form>
</header>

<!-- ══ PANNEAU PAGES ══ -->
<div id="sc-pages-panel" class="sc-side-panel" style="display:none">
  <h3>Pages</h3>
  <ul>
    <?php foreach ($nav_pages as $p): ?>
    <li>
      <a href="?url=<?= urlencode($p['slug']) ?>&edit" <?= $p['slug']===$slug?'class="sc-current"':'' ?>><?= htmlspecialchars($p['title']) ?></a>
      <?php if (empty($p['published'])): ?><span class="sc-draft-badge" title="non publiée">brouillon</span><?php endif ?>
      <?php if ($p['slug']!=='index'): ?>
      <button class="sc-del-page" data-slug="<?= htmlspecialchars($p['slug'],ENT_QUOTES) ?>"><i class="ti ti-x"></i></button>
      <?php endif ?>
    </li>
    <?php endforeach ?>
  </ul>
  <div id="sc-new-page-form">
    <input type="text" id="sc-new-slug" placeholder="nouvelle-page">
    <button id="sc-new-page-btn"><i class="ti ti-plus"></i></button>
  </div>
</div>

<!-- ══ PANNEAU RÉGLAGES ══ -->
<div id="sc-settings-panel" class="sc-side-panel sc-side-right sc-settings" style="display:none">
  <div class="sc-set-tabs">
    <button type="button" data-tab="page" class="on">Cette page</button>
    <button type="button" data-tab="site">Tout le site</button>
    <button type="button" id="sc-settings-close" title="Fermer"><i class="ti ti-x"></i></button>
  </div>

  <div class="sc-set-pane" data-pane="page">
    <section class="sc-set-sec">
      <h4>Infos</h4>
      <label for="sc-meta-title">Titre</label>
      <input type="text" id="sc-meta-title" value="<?= htmlspecialchars($page_data['meta']['title']??'',ENT_QUOTES) ?>">
      <label for="sc-meta-desc">Description (moteurs de recherche)</label>
      <textarea id="sc-meta-desc" rows="2"><?= htmlspecialchars($page_data['meta']['desc']??'') ?></textarea>
      <div class="sc-chk-row">
        <label><input type="checkbox" id="sc-meta-nav" <?= ($page_data['meta']['in_nav']??true)?'checked':'' ?>> Dans la navigation</label>
        <label><input type="checkbox" id="sc-meta-index" <?= ($page_data['meta']['do_index']??true)?'checked':'' ?>> Indexée par les moteurs</label>
        <label class="sc-publish-row"><input type="checkbox" id="sc-meta-published" <?= ($page_data['meta']['published']??true)?'checked':'' ?>> <b>Publiée</b> — visible par les visiteurs</label>
        <?php if ($slug === 'index'): ?><p class="sc-set-hint">Page d'accueil : si elle n'est pas publiée, les visiteurs arrivent sur une page introuvable.</p><?php endif ?>
      </div>
    </section>

    <section class="sc-set-sec">
      <h4>Fond de page</h4>
      <p class="sc-set-hint">Appliqué tout de suite. Passe devant le thème.</p>
      <div id="sc-pagebg-zone"></div>
      <label>Image</label>
      <div id="sc-bg-zone"></div>
    </section>

    <section class="sc-set-sec">
      <h4>Thème</h4>
      <select id="sc-meta-theme" class="sc-set-select">
        <option value="">— hérité du site —</option>
        <option value="none" <?= $page_theme==='none'?'selected':'' ?>>brut (forcé)</option>
        <?php foreach ($themes as $t): ?>
        <option value="<?= htmlspecialchars($t,ENT_QUOTES) ?>" <?= $page_theme===$t?'selected':'' ?>><?= htmlspecialchars(ucfirst($t)) ?></option>
        <?php endforeach ?>
      </select>
      <div class="sc-chk-row">
        <label><input type="checkbox" id="sc-meta-themejs" <?= $theme_js_on?'checked':'' ?>> Scripts du thème actifs (câbles, synthé…)</label>
      </div>
    </section>

    <details class="sc-set-sec sc-set-adv">
      <summary>CSS personnalisé <span>avancé</span></summary>
      <textarea id="sc-meta-css" rows="6" spellcheck="false"><?= htmlspecialchars($page_data['meta']['css']??'') ?></textarea>
    </details>

    <button id="sc-settings-apply" type="button">Appliquer à la page</button>
  </div>

  <div class="sc-set-pane" data-pane="site" hidden>
    <section class="sc-set-sec">
      <h4>Polices du site</h4>
      <p class="sc-set-hint">Disponibles sur toutes les pages, y compris celles à venir.</p>
      <div id="sc-site-fonts-list"></div>
      <div id="sc-font-add-google">
        <input type="text" id="sc-font-google-name" placeholder="Google Fonts : Poppins…">
        <button id="sc-font-google-add" type="button" title="Ajouter"><i class="ti ti-plus"></i></button>
      </div>
      <button id="sc-font-upload-btn" type="button"><i class="ti ti-upload"></i> Importer un fichier (.woff2, .woff, .ttf, .otf)</button>
      <input type="file" id="sc-font-file-input" accept=".woff,.woff2,.ttf,.otf" style="display:none">
      <p id="sc-font-status"></p>
      <label for="sc-site-font">Police par défaut de tous les blocs</label>
      <select id="sc-site-font" class="sc-set-select"></select>
    </section>

    <section class="sc-set-sec">
      <h4>Couleurs</h4>
      <div id="sc-palette-zone"></div>
      <div class="sc-chk-row">
        <label><input type="checkbox" id="sc-site-palette-only" <?= !empty($site['paletteOnly'])?'checked':'' ?>> Limiter le choix des couleurs à la palette</label>
      </div>
    </section>

    <section class="sc-set-sec">
      <h4>Thème et mise en page</h4>
      <select id="sc-site-theme" class="sc-set-select">
        <option value="">— aucun (brut) —</option>
        <?php foreach ($themes as $t): ?>
        <option value="<?= htmlspecialchars($t,ENT_QUOTES) ?>" <?= ($site['theme']??'')===$t?'selected':'' ?>><?= htmlspecialchars(ucfirst($t)) ?></option>
        <?php endforeach ?>
      </select>
      <div class="sc-chk-row">
        <label><input type="checkbox" id="sc-site-center" <?= ($site['center']??true)?'checked':'' ?>> Centrer la composition sur grand écran</label>
        <label><input type="checkbox" id="sc-site-switcher" <?= !empty($site['themeSwitcher'])?'checked':'' ?>> Les visiteurs peuvent changer de thème</label>
      </div>
    </section>

    <details class="sc-set-sec sc-set-adv">
      <summary>CSS et JS globaux <span>avancé</span></summary>
      <label for="sc-site-css">CSS (toutes les pages)</label>
      <textarea id="sc-site-css" rows="5" spellcheck="false"><?= htmlspecialchars($site['css']??'') ?></textarea>
      <label for="sc-site-js">JS (visiteurs uniquement)</label>
      <textarea id="sc-site-js" rows="5" spellcheck="false" placeholder="// exécuté sur chaque page, côté visiteur"><?= htmlspecialchars($site['js']??'') ?></textarea>
    </details>

    <section class="sc-set-sec">
      <h4>Éditeur</h4>
      <p class="sc-set-hint">Préférence de ce navigateur, appliquée tout de suite.</p>
      <div class="sc-chk-row">
        <label><input type="checkbox" id="sc-pref-autosave" checked> Enregistrer automatiquement toutes les 10 minutes</label>
      </div>
    </section>

    <button id="sc-site-apply" type="button">Appliquer au site</button>
  </div>
</div>

<?php endif ?>

<?php if ($logged && !$edit_mode && $page_data): ?>
<a id="sc-edit-hint" href="?url=<?= urlencode($slug) ?>&edit">✎ Modifier</a>
<?php endif ?>

<main id="sc-canvas"<?= $center_style ?>>
<?php
if ($want_edit && !$logged):        include SCOTCH_SYS.'pages/login.php';
elseif ($show_404):                 include SCOTCH_SYS.'pages/404.php';
elseif ($show_create):
?>
  <div id="sc-create-page">
    <p>La page «&nbsp;<strong><?= htmlspecialchars($slug) ?></strong>&nbsp;» n'existe pas encore.</p>
    <button id="sc-create-page-btn" type="button">+ Créer cette page</button>
    <span id="sc-create-page-msg"></span>
    <a href="<?= htmlspecialchars($base_url) ?>">← Accueil</a>
  </div>
  <script>
  document.getElementById('sc-create-page-btn').addEventListener('click', async function () {
    var btn = this, msg = document.getElementById('sc-create-page-msg');
    btn.disabled = true; msg.textContent = 'Création…';
    try {
      var r = await fetch(<?= json_encode($base_url . 'api.php') ?>, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'create_page', slug: <?= json_encode($slug) ?>})
      });
      var d = await r.json();
      if (d.ok) { location.href = '?url=' + encodeURIComponent(d.slug) + '&edit'; return; }
      msg.textContent = 'Erreur : ' + (d.error || '?');
    } catch (e) { msg.textContent = 'Erreur réseau'; }
    btn.disabled = false;
  });
  </script>
<?php elseif ($page_data && !$edit_mode): include SCOTCH_SYS.'renderer.php';
endif; ?>
</main>

<?php if ($edit_mode): ?>
<script>
var SCOTCH_PAGE      = <?= json_encode($page_data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?>;
var SCOTCH_BASE      = <?= json_encode($base_url) ?>;
var SCOTCH_SLUG      = <?= json_encode($slug) ?>;
var SCOTCH_ALL_PAGES = <?= json_encode($nav_pages, JSON_UNESCAPED_UNICODE) ?>;
var SCOTCH_SITE_FONTS = <?= json_encode($site['fonts'] ?? [], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?>;
var SCOTCH_UPLOAD = <?= json_encode(['max'=>sc_upload_max(), 'ext'=>sc_upload_allowed(), 'gd'=>function_exists('imagecreatetruecolor')]) ?>;
var SCOTCH_SITE_FONT = <?= json_encode($site['font'] ?? '', JSON_UNESCAPED_UNICODE) ?>;
var SCOTCH_SITE_PALETTE = <?= json_encode(['colors'=>$site['palette'] ?? [], 'only'=>!empty($site['paletteOnly'])]) ?>;
var SCOTCH_UI_ICONS = <?php
    $ui = [];
    foreach (glob(SCOTCH_SYS . 'ui/*.png') as $f) {
        $ui[basename($f, '.png')] = 'scotch-sys/ui/' . basename($f) . '?v=' . filemtime($f);
    }
    echo json_encode($ui, JSON_UNESCAPED_SLASHES);
?>;
</script>
<script src="<?= $base_url ?>scotch-sys/js/scotch-editor.js?v=<?= sc_asset_v('js/scotch-editor.js') ?>"></script>
<?php endif ?>
<?php if ($switcher_on): ?>
<div id="sc-theme-switcher">
  <button id="sc-ts-btn" title="Changer de thème">🎨</button>
  <div id="sc-ts-menu" style="display:none">
    <div class="sc-ts-item" data-t="">brut</div>
    <?php foreach ($themes as $t): ?>
    <div class="sc-ts-item" data-t="<?= htmlspecialchars($t,ENT_QUOTES) ?>"><?= htmlspecialchars($t) ?></div>
    <?php endforeach ?>
  </div>
</div>
<style>
#sc-theme-switcher { position:fixed;bottom:14px;left:14px;z-index:9998;font-family:sans-serif; }
#sc-ts-btn { width:38px;height:38px;border-radius:50%;border:1px solid rgba(0,0,0,.2);background:rgba(255,255,255,.9);cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,.15); }
#sc-ts-btn:hover { transform:scale(1.08); }
#sc-ts-menu { position:absolute;bottom:44px;left:0;background:#fff;border:1px solid #ddd;box-shadow:0 4px 16px rgba(0,0,0,.15);min-width:110px; }
.sc-ts-item { padding:7px 14px;font-size:12px;color:#333;cursor:pointer;text-transform:capitalize; }
.sc-ts-item:hover { background:#f0f0f0; }
</style>
<script>
(function(){
  var btn=document.getElementById('sc-ts-btn'), menu=document.getElementById('sc-ts-menu');
  btn.addEventListener('click',function(e){ e.stopPropagation(); menu.style.display=menu.style.display==='none'?'block':'none'; });
  document.addEventListener('click',function(){ menu.style.display='none'; });
  menu.querySelectorAll('.sc-ts-item').forEach(function(it){
    it.addEventListener('click',function(){
      try { localStorage.setItem('scotch-theme', it.dataset.t); } catch(e){}
      location.reload();
    });
  });
})();
</script>
<?php endif ?>
<?php if (!$edit_mode && !empty($site['js'])): ?>
<script>/* JS global du site */
<?= $site['js'] ?>
</script>
<?php endif ?>
</body>
</html>
