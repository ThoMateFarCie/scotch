<?php

// ── URL helpers ────────────────────────────────────────────

function sc_base_url() {
    $proto  = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $script = $_SERVER['SCRIPT_NAME'] ?? '/index.php';
    $dir    = rtrim(dirname($script), '/\\');
    return $proto . '://' . $host . $dir . '/';
}

// ── Slug ──────────────────────────────────────────────────

function sc_slug($str) {
    $str = strtolower(trim((string)$str));
    // Translittération basique des accents courants
    $str = strtr($str, ['é'=>'e','è'=>'e','ê'=>'e','ë'=>'e','à'=>'a','â'=>'a','ä'=>'a',
        'ô'=>'o','ö'=>'o','ù'=>'u','û'=>'u','ü'=>'u','î'=>'i','ï'=>'i','ç'=>'c',
        'É'=>'e','È'=>'e','Ê'=>'e','À'=>'a','Â'=>'a','Ô'=>'o','Û'=>'u','Î'=>'i','Ç'=>'c']);
    $str = preg_replace('/[^a-z0-9]+/', '-', $str);
    return trim($str, '-');
}

// ── Réglages du site (thème, CSS/JS globaux) ──────────────

function sc_site_path() { return SCOTCH_DATA . '_site.json'; }

// Version d'un fichier de scotch-sys pour l'URL (?v=) : change à chaque modification,
// le navigateur ne garde donc jamais un ancien CSS/JS en cache
function sc_asset_v($rel) {
    $t = @filemtime(SCOTCH_SYS . $rel);
    return SCOTCH_VERSION . ($t ? '.' . $t : '');
}

function sc_load_site() {
    $p = sc_site_path();
    $def = ['theme'=>'', 'css'=>'', 'js'=>'', 'themeSwitcher'=>false, 'fonts'=>[],
            'center'=>true, 'palette'=>[], 'paletteOnly'=>false, 'font'=>''];
    if (!file_exists($p)) return $def;
    $d = json_decode(file_get_contents($p), true);
    return is_array($d) ? array_merge($def, $d) : $def;
}

function sc_save_site($data) {
    $fonts = [];
    foreach (($data['fonts'] ?? []) as $f) {
        if (!is_array($f) || empty($f['family'])) continue;
        if (($f['type'] ?? '') === 'google')
            $fonts[] = ['type'=>'google', 'family'=>(string)$f['family']];
        elseif (($f['type'] ?? '') === 'upload' && !empty($f['url']))
            $fonts[] = ['type'=>'upload', 'family'=>(string)$f['family'], 'url'=>(string)$f['url']];
    }
    // Palette : couleurs hexa #rrggbb, sans doublon
    $palette = [];
    foreach (($data['palette'] ?? []) as $c) {
        $c = strtolower(trim((string)$c));
        if (preg_match('/^#[0-9a-f]{6}$/', $c) && !in_array($c, $palette)) $palette[] = $c;
    }
    $clean = [
        'theme'         => preg_replace('/[^a-z0-9_-]/i', '', $data['theme'] ?? ''),
        'css'           => (string)($data['css'] ?? ''),
        'js'            => (string)($data['js'] ?? ''),
        'themeSwitcher' => !empty($data['themeSwitcher']),
        'fonts'         => $fonts,
        'center'        => !array_key_exists('center', $data) || !empty($data['center']),
        'palette'       => array_slice($palette, 0, 32),
        'paletteOnly'   => !empty($data['paletteOnly']),
        // police par défaut : nom de famille seul (pas de guillemets, accolades…)
        'font'          => trim(preg_replace('/[^\p{L}\p{N} _.-]/u', '', (string)($data['font'] ?? ''))),
    ];
    return file_put_contents(
        sc_site_path(),
        json_encode($clean, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ) !== false;
}

function sc_list_themes() {
    $out = [];
    foreach (glob(SCOTCH_SYS . 'themes/*.css') as $f) {
        $out[] = basename($f, '.css');
    }
    sort($out);
    return $out;
}

// ── Optimisation d'images (GD) ────────────────────────────

function sc_optimize_image($path, $max = 1600, $quality = 80) {
    if (!function_exists('imagecreatetruecolor')) return false; // GD absent
    $info = @getimagesize($path);
    if (!$info) return false;
    [$w, $h] = $info;
    $type = $info[2];

    $needResize = max($w, $h) > $max;
    // PNG non redimensionné : la recompression GD gagne peu, on ne touche pas
    if (!$needResize && $type === IMAGETYPE_PNG) return false;

    switch ($type) {
        case IMAGETYPE_JPEG: $src = @imagecreatefromjpeg($path); break;
        case IMAGETYPE_PNG:  $src = @imagecreatefrompng($path);  break;
        case IMAGETYPE_WEBP: $src = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null; break;
        default: return false; // gif animés & co : ne pas toucher
    }
    if (!$src) return false;

    if ($needResize) {
        $ratio = $max / max($w, $h);
        $nw = (int)round($w * $ratio);
        $nh = (int)round($h * $ratio);
        $dst = imagecreatetruecolor($nw, $nh);
        if ($type === IMAGETYPE_PNG) {
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
        }
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        imagedestroy($src);
        $src = $dst;
    }

    switch ($type) {
        case IMAGETYPE_JPEG: $ok = imagejpeg($src, $path, $quality); break;
        case IMAGETYPE_PNG:  $ok = imagepng($src, $path, 6); break;
        case IMAGETYPE_WEBP: $ok = imagewebp($src, $path, $quality); break;
        default: $ok = false;
    }
    imagedestroy($src);
    return $ok;
}

// ── Éléments globaux (présents sur toutes les pages) ──────

function sc_global_path() { return SCOTCH_DATA . '_global.json'; }

function sc_load_globals() {
    $p = sc_global_path();
    if (!file_exists($p)) return [];
    $d = json_decode(file_get_contents($p), true);
    return is_array($d) ? $d : [];
}

function sc_save_globals($els) {
    return file_put_contents(
        sc_global_path(),
        json_encode(array_values($els), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ) !== false;
}

// ── Page I/O ──────────────────────────────────────────────

function sc_page_path($slug) {
    return SCOTCH_DATA . $slug . '/page.json';
}

function sc_load_page($slug) {
    $path = sc_page_path($slug);
    if (!file_exists($path)) return null;
    $data = json_decode(file_get_contents($path), true);
    if (!$data) return null;

    // Fusionner les éléments globaux (sans dupliquer un id déjà présent)
    $globals = sc_load_globals();
    if ($globals) {
        $ids = array_column($data['elements'] ?? [], 'id');
        foreach ($globals as $g) {
            if (!in_array($g['id'], $ids, true)) $data['elements'][] = $g;
        }
    }
    return $data;
}

function sc_save_page($data) {
    $slug = $data['page'] ?? '';
    if (!sc_valid_slug($slug)) return false;
    $dir = SCOTCH_DATA . $slug;
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    if (!is_dir($dir . '/files')) mkdir($dir . '/files', 0775, true);

    // Séparer les éléments globaux des éléments locaux.
    // La page chargée contenait déjà tous les globaux (fusion au load),
    // donc l'état sauvegardé fait référence : les globaux de cette
    // sauvegarde REMPLACENT intégralement _global.json. Un global
    // supprimé dans l'éditeur disparaît ainsi de toutes les pages, et
    // un global détogglé redevient local à cette page.
    $els     = $data['elements'] ?? [];
    $globals = array_values(array_filter($els, fn($e) => !empty($e['global'])));
    $locals  = array_values(array_filter($els, fn($e) => empty($e['global'])));
    $data['elements'] = $locals;
    sc_save_globals($globals);

    return file_put_contents(
        $dir . '/page.json',
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ) !== false;
}

function sc_create_page($slug) {
    $slug = sc_slug($slug);
    if (!sc_valid_slug($slug)) return false;
    $dir = SCOTCH_DATA . $slug;
    // la page existe si son page.json existe (un dossier vide restant ne bloque plus la création)
    if (file_exists($dir . '/page.json')) return false;
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    if (!is_dir($dir . '/files')) mkdir($dir . '/files', 0775, true);
    $data = [
        'page'     => $slug,
        'meta'     => ['title' => $slug, 'desc' => '', 'css' => '', 'in_nav' => true, 'do_index' => true],
        'elements' => []
    ];
    file_put_contents($dir . '/page.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    return $slug;
}

function sc_delete_page($slug) {
    if ($slug === 'index') return false;
    $dir = SCOTCH_DATA . $slug;
    if (!is_dir($dir)) return false;
    sc_rmdir($dir);
    return true;
}

function sc_list_pages() {
    $pages = [];
    foreach (glob(SCOTCH_DATA . '*', GLOB_ONLYDIR) as $dir) {
        $slug = basename($dir);
        if (!file_exists($dir . '/page.json')) continue;
        $d = sc_load_page($slug);
        $pages[] = [
            'slug'   => $slug,
            'title'  => $d['meta']['title'] ?? $slug,
            'in_nav' => $d['meta']['in_nav'] ?? true,
            'published' => ($d['meta']['published'] ?? true) !== false,
        ];
    }
    return $pages;
}

function sc_handle_font_upload() {
    $allowed = ['woff','woff2','ttf','otf'];
    if (empty($_FILES['file'])) return ['ok' => false, 'error' => 'Aucun fichier'];

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) return ['ok' => false, 'error' => 'Erreur upload '.$file['error']];

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) return ['ok' => false, 'error' => 'Format non supporté (woff, woff2, ttf, otf)'];

    $dir = SCOTCH_DATA . '_fonts/';
    if (!is_dir($dir)) mkdir($dir, 0775, true);

    $base = pathinfo($file['name'], PATHINFO_FILENAME);
    $base = preg_replace('/[^a-zA-Z0-9_-]/', '-', $base);
    $safe = $base . '_' . substr(uniqid(), -6) . '.' . $ext;
    $dest = $dir . $safe;

    if (!move_uploaded_file($file['tmp_name'], $dest)) return ['ok' => false, 'error' => 'Déplacement impossible'];

    return [
        'ok'     => true,
        'url'    => 'scotch-data/_fonts/' . $safe,
        'family' => $base,
    ];
}

function sc_list_uploaded_fonts() {
    $dir = SCOTCH_DATA . '_fonts/';
    if (!is_dir($dir)) return [];
    $out = [];
    foreach (glob($dir . '*') as $f) {
        $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
        if (!in_array($ext, ['woff','woff2','ttf','otf'])) continue;
        $out[] = ['file' => basename($f), 'url' => 'scotch-data/_fonts/' . basename($f)];
    }
    return $out;
}

// ── Upload ────────────────────────────────────────────────

// Formats acceptés à l'upload (partagés avec l'éditeur pour prévenir avant l'envoi)
function sc_upload_allowed() {
    return ['jpg','jpeg','png','gif','webp','svg','pdf','mp3','mp4','zip','txt','woff','woff2','ttf','otf'];
}

// Valeur php.ini (« 40M », « 2G »…) → octets
function sc_ini_bytes($v) {
    $v = trim((string)$v); $n = (float)$v;
    switch (strtolower(substr($v, -1))) { case 'g': $n *= 1024; case 'm': $n *= 1024; case 'k': $n *= 1024; }
    return (int)$n;
}

// Taille maximale réellement acceptée par le serveur (la plus petite des deux limites PHP)
function sc_upload_max() {
    $a = sc_ini_bytes(ini_get('upload_max_filesize'));
    $b = sc_ini_bytes(ini_get('post_max_size'));
    return min(array_filter([$a, $b]) ?: [0]);
}

function sc_upload_error_msg($code) {
    $mo = round(sc_upload_max() / 1048576, 1);
    return [
        UPLOAD_ERR_INI_SIZE  => "Fichier trop lourd : le serveur accepte au maximum {$mo} Mo",
        UPLOAD_ERR_FORM_SIZE => "Fichier trop lourd : le serveur accepte au maximum {$mo} Mo",
        UPLOAD_ERR_PARTIAL   => "Envoi interrompu, réessaie",
        UPLOAD_ERR_NO_FILE   => "Aucun fichier reçu",
        UPLOAD_ERR_NO_TMP_DIR=> "Dossier temporaire du serveur manquant",
        UPLOAD_ERR_CANT_WRITE=> "Écriture impossible sur le serveur",
    ][$code] ?? "Erreur d'envoi ({$code})";
}

function sc_handle_upload($slug) {
    $allowed = sc_upload_allowed();
    if (empty($_FILES['file'])) return ['ok' => false, 'error' => 'Aucun fichier'];
    if (!sc_valid_slug($slug))  return ['ok' => false, 'error' => 'Page invalide'];

    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) return ['ok' => false, 'error' => sc_upload_error_msg($file['error'])];

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) return ['ok' => false, 'error' => 'Format non accepté (.' . $ext . ')'];

    $dir = SCOTCH_DATA . $slug . '/files/';
    if (!is_dir($dir)) mkdir($dir, 0775, true);

    $safe = uniqid() . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '', $file['name']);
    $dest = $dir . $safe;

    if (!move_uploaded_file($file['tmp_name'], $dest)) return ['ok' => false, 'error' => 'Déplacement impossible'];

    // Optimisation demandée : redimensionner/compresser les images
    if (!empty($_POST['optimize']) && in_array($ext, ['jpg','jpeg','png','webp'])) {
        sc_optimize_image($dest);
    }

    $url = 'scotch-data/' . $slug . '/files/' . $safe;
    return ['ok' => true, 'url' => $url, 'name' => $safe, 'original' => $file['name']];
}

// ── Helpers ───────────────────────────────────────────────

function sc_valid_slug($s) {
    return $s !== '' && preg_match('/^[a-z0-9][a-z0-9_-]*$/', $s);
}

function sc_rmdir($dir) {
    foreach (array_diff(scandir($dir), ['.','..']) as $f) {
        $p = $dir . '/' . $f;
        is_dir($p) ? sc_rmdir($p) : unlink($p);
    }
    rmdir($dir);
}

// ── Page de démarrage (premier lancement) ─────────────────

// Sur une installation vide (aucune page), crée la page "index" à partir
// de scotch-sys/starter/page.json. Ne s'exécute qu'une fois : le marqueur
// empêche de la recréer si l'auteur la supprime plus tard.
function sc_seed_starter() {
    $marker = SCOTCH_DATA . '_starter.done';
    if (file_exists($marker)) return;
    foreach (glob(SCOTCH_DATA . '*', GLOB_ONLYDIR) ?: [] as $d) {
        if (file_exists($d . '/page.json')) return;
    }
    $src = SCOTCH_SYS . 'starter/page.json';
    if (!file_exists($src)) return;
    $dir = SCOTCH_DATA . 'index';
    if (!is_dir($dir . '/files')) @mkdir($dir . '/files', 0775, true);
    if (@copy($src, $dir . '/page.json')) @file_put_contents($marker, '1');
}
