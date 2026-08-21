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
        $face_css .= "@font-face{font-family:'{$fam}';src:url('{$url}') format('{$fmt}');font-display:swap;}\n";
    }
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
<link rel="stylesheet" href="<?= $base_url ?>scotch-sys/css/scotch.css?v=<?= SCOTCH_VERSION ?>">
<?php if ($edit_mode): ?>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">
<link rel="stylesheet" href="<?= $base_url ?>scotch-sys/css/scotch-edit.css?v=<?= SCOTCH_VERSION ?>">
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
<link id="sc-theme-css" rel="stylesheet" href="<?= $base_url ?>scotch-sys/themes/<?= htmlspecialchars($eff_theme,ENT_QUOTES) ?>.css?v=<?= SCOTCH_VERSION ?>">
<?php if ($theme_js_on && file_exists(SCOTCH_SYS . 'themes/' . $eff_theme . '.js')): ?>
<script id="sc-theme-js" defer src="<?= $base_url ?>scotch-sys/themes/<?= htmlspecialchars($eff_theme,ENT_QUOTES) ?>.js?v=<?= SCOTCH_VERSION ?>"></script>
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
<?php if ($page_css): ?><style><?= $page_css ?></style><?php endif ?>
<?php if (!empty($page_data['meta']['bg']['image'])):
    $bg_url  = htmlspecialchars($base_url . ltrim($page_data['meta']['bg']['image'],'/'), ENT_QUOTES);
    $bg_mode = ($page_data['meta']['bg']['mode'] ?? 'tile') === 'cover'
        ? "background-size:cover;background-repeat:no-repeat;background-position:center;background-attachment:fixed;"
        : "background-repeat:repeat;";
?>
<style>body{background-image:url('<?= $bg_url ?>');<?= $bg_mode ?>}</style>
<?php endif ?>
</head>
<body class="<?= $edit_mode ? 'sc-edit-mode' : '' ?>">

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
<div id="sc-settings-panel" class="sc-side-panel" style="display:none">
  <h3>Réglages · <?= htmlspecialchars($slug) ?></h3>
  <div class="sc-settings-body">
    <label>Titre</label>
    <input type="text" id="sc-meta-title" value="<?= htmlspecialchars($page_data['meta']['title']??'',ENT_QUOTES) ?>">
    <label>Description SEO</label>
    <textarea id="sc-meta-desc" rows="2"><?= htmlspecialchars($page_data['meta']['desc']??'') ?></textarea>
    <div class="sc-chk-row">
      <label><input type="checkbox" id="sc-meta-nav" <?= ($page_data['meta']['in_nav']??true)?'checked':'' ?>> Dans la navigation</label>
      <label><input type="checkbox" id="sc-meta-index" <?= ($page_data['meta']['do_index']??true)?'checked':'' ?>> Indexé par les moteurs</label>
    </div>
    <label>Thème de cette page</label>
    <select id="sc-meta-theme" style="width:100%;padding:5px 8px;background:#f8f8f8;border:1px solid #e0e0e0;color:#222;font-size:12px;outline:none;margin-bottom:8px">
      <option value="">— hérité du site —</option>
      <option value="none" <?= $page_theme==='none'?'selected':'' ?>>brut (forcé)</option>
      <?php foreach ($themes as $t): ?>
      <option value="<?= htmlspecialchars($t,ENT_QUOTES) ?>" <?= $page_theme===$t?'selected':'' ?>><?= htmlspecialchars(ucfirst($t)) ?></option>
      <?php endforeach ?>
    </select>
    <div class="sc-chk-row">
      <label><input type="checkbox" id="sc-meta-themejs" <?= $theme_js_on?'checked':'' ?>> Scripts du thème actifs (câbles, synthé…)</label>
    </div>
    <label>Image de fond de page</label>
    <div id="sc-bg-zone" style="margin-bottom:8px"></div>
    <label>CSS personnalisé</label>
    <textarea id="sc-meta-css" rows="5" style="font-family:monospace;font-size:11px"><?= htmlspecialchars($page_data['meta']['css']??'') ?></textarea>
    <button id="sc-settings-apply">Appliquer</button>

    <h3 style="padding:14px 0 6px;margin:8px -14px 0;font-size:10px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:.05em;border-top:1px solid #f0f0f0;padding-left:14px">Site entier</h3>
    <label>Thème</label>
    <select id="sc-site-theme" style="width:100%;padding:5px 8px;background:#f8f8f8;border:1px solid #e0e0e0;color:#222;font-size:12px;outline:none;margin-bottom:8px">
      <option value="">— aucun (brut) —</option>
      <?php foreach ($themes as $t): ?>
      <option value="<?= htmlspecialchars($t,ENT_QUOTES) ?>" <?= ($site['theme']??'')===$t?'selected':'' ?>><?= htmlspecialchars(ucfirst($t)) ?></option>
      <?php endforeach ?>
    </select>
    <label>CSS global (toutes les pages)</label>
    <textarea id="sc-site-css" rows="5" style="font-family:monospace;font-size:11px"><?= htmlspecialchars($site['css']??'') ?></textarea>
    <label>JS global (visiteurs uniquement)</label>
    <textarea id="sc-site-js" rows="5" style="font-family:monospace;font-size:11px" placeholder="// exécuté sur chaque page, côté visiteur"><?= htmlspecialchars($site['js']??'') ?></textarea>
    <div class="sc-chk-row">
      <label><input type="checkbox" id="sc-site-switcher" <?= !empty($site['themeSwitcher'])?'checked':'' ?>> Les visiteurs peuvent changer de thème</label>
    </div>
    <button id="sc-site-apply">Appliquer au site</button>
    <h3 style="padding:12px 0 6px;margin:0;font-size:11px;font-weight:500;color:#555;text-transform:uppercase;letter-spacing:.05em">
      Polices <span id="sc-fonts-count"><?= count($page_data['meta']['fonts']??[]) ?> police(s)</span>
    </h3>
    <div id="sc-font-add-google">
      <input type="text" id="sc-font-google-name" placeholder="Poppins, Playfair…">
      <button id="sc-font-google-add"><i class="ti ti-plus"></i></button>
    </div>
    <button id="sc-font-upload-btn"><i class="ti ti-upload"></i> Importer .woff2 / .ttf</button>
    <input type="file" id="sc-font-file-input" accept=".woff,.woff2,.ttf,.otf" style="display:none">
    <p id="sc-font-status"></p>
  </div>
</div>

<?php endif ?>

<?php if ($logged && !$edit_mode): ?>
<a id="sc-edit-hint" href="?url=<?= urlencode($slug) ?>&edit">✎ Modifier</a>
<?php endif ?>

<main id="sc-canvas">
<?php
if ($want_edit && !$logged):        include SCOTCH_SYS.'pages/login.php';
elseif ($show_404):                 include SCOTCH_SYS.'pages/404.php';
elseif ($show_create):
?>
  <div id="sc-create-page">
    <p>La page «&nbsp;<strong><?= htmlspecialchars($slug) ?></strong>&nbsp;» n'existe pas encore.</p>
    <button onclick="scotch.createThisPage()">+ Créer cette page</button>
    <a href="<?= htmlspecialchars($base_url) ?>">← Accueil</a>
  </div>
<?php elseif ($page_data && !$edit_mode): include SCOTCH_SYS.'renderer.php';
endif; ?>
</main>

<?php if ($page_data && !$edit_mode && !$show_404 && !$show_create && $eff_theme !== 'modulaire'): ?>
<script src="<?= $base_url ?>scotch-sys/js/scotch-center.js?v=<?= SCOTCH_VERSION ?>"></script>
<?php endif ?>

<?php if ($edit_mode): ?>
<script>
var SCOTCH_PAGE      = <?= json_encode($page_data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?>;
var SCOTCH_BASE      = <?= json_encode($base_url) ?>;
var SCOTCH_SLUG      = <?= json_encode($slug) ?>;
var SCOTCH_ALL_PAGES = <?= json_encode($nav_pages, JSON_UNESCAPED_UNICODE) ?>;
var SCOTCH_SITE_FONTS = <?= json_encode($site['fonts'] ?? [], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES) ?>;
var SCOTCH_UI_ICONS = <?php
    $ui = [];
    foreach (glob(SCOTCH_SYS . 'ui/*.png') as $f) {
        $ui[basename($f, '.png')] = 'scotch-sys/ui/' . basename($f) . '?v=' . filemtime($f);
    }
    echo json_encode($ui, JSON_UNESCAPED_SLASHES);
?>;
</script>
<script src="<?= $base_url ?>scotch-sys/js/scotch-editor.js?v=<?= SCOTCH_VERSION ?>"></script>
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
