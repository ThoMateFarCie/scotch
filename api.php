<?php
require_once __DIR__ . '/settings.php';
require_once SCOTCH_SYS . 'auth.php';
require_once SCOTCH_SYS . 'funcs.php';

if (SCOTCH_DEBUG) { error_reporting(E_ALL); ini_set('display_errors','1'); }

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$logged = sc_is_logged();

/* ── Envoi plus gros que post_max_size : PHP vide tout, on le dit clairement ── */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_FILES) && empty($_POST)
    && (int)($_SERVER['CONTENT_LENGTH'] ?? 0) > sc_upload_max()) {
    echo json_encode(['ok'=>false,'error'=>'Fichier trop lourd : le serveur accepte au maximum '
        . round(sc_upload_max() / 1048576, 1) . ' Mo']);
    exit;
}

/* ── Upload fichier (multipart) ─────────────────────────── */
if (!empty($_FILES['file'])) {
    if (!$logged) { echo json_encode(['ok'=>false,'error'=>'Non autorisé']); exit; }

    if (($_POST['upload_kind'] ?? '') === 'font') {
        echo json_encode(sc_handle_font_upload());
        exit;
    }

    $slug = sc_slug($_POST['page_slug'] ?? '');
    echo json_encode(sc_handle_upload($slug));
    exit;
}

/* ── API JSON ────────────────────────────────────────────── */
$raw = file_get_contents('php://input');
$req = json_decode($raw, true);
if (!is_array($req)) { echo json_encode(['ok'=>false,'error'=>'JSON invalide']); exit; }

$action = $req['action'] ?? '';

if (!$logged && $action !== 'login') {
    echo json_encode(['ok'=>false,'error'=>'Non autorisé']);
    exit;
}

switch ($action) {

    case 'login':
        $ok = sc_login($req['user'] ?? '', $req['pass'] ?? '');
        echo json_encode(['ok' => $ok, 'error' => $ok ? null : 'Identifiants incorrects']);
        break;

    case 'logout':
        sc_logout();
        echo json_encode(['ok' => true]);
        break;

    case 'save_page':
        $data = $req['page'] ?? null;
        if (!$data || empty($data['page'])) {
            echo json_encode(['ok'=>false,'error'=>'Données manquantes']); break;
        }
        echo json_encode(['ok' => sc_save_page($data)]);
        break;

    case 'create_page':
        $slug = sc_create_page($req['slug'] ?? '');
        if ($slug) echo json_encode(['ok'=>true,'slug'=>$slug]);
        else       echo json_encode(['ok'=>false,'error'=>'Slug invalide ou page déjà existante']);
        break;

    case 'delete_page':
        $slug = sc_slug($req['slug'] ?? '');
        echo json_encode(['ok' => sc_delete_page($slug)]);
        break;

    case 'get_pages':
        echo json_encode(['ok'=>true,'pages'=>sc_list_pages()]);
        break;

    case 'list_fonts':
        echo json_encode(['ok'=>true,'fonts'=>sc_list_uploaded_fonts()]);
        break;

    case 'save_site':
        // préserver les polices existantes (gérées via add_site_font)
        $cur = sc_load_site();
        $in  = $req['site'] ?? [];
        $in['fonts'] = $cur['fonts'];
        echo json_encode(['ok' => sc_save_site($in)]);
        break;

    case 'add_site_font':
        $site = sc_load_site();
        $f = $req['font'] ?? [];
        $fam = trim($f['family'] ?? '');
        if (!$fam) { echo json_encode(['ok'=>false,'error'=>'Police invalide']); break; }
        foreach ($site['fonts'] as $x) {
            if ($x['family'] === $fam) { echo json_encode(['ok'=>true]); break 2; }
        }
        $site['fonts'][] = $f;
        echo json_encode(['ok' => sc_save_site($site)]);
        break;

    case 'remove_site_font':
        // retire la police de la liste du site (le fichier reste dans _fonts/)
        $site = sc_load_site();
        $fam  = (string)($req['family'] ?? '');
        $site['fonts'] = array_values(array_filter($site['fonts'], fn($x) => ($x['family'] ?? '') !== $fam));
        if (($site['font'] ?? '') === $fam) $site['font'] = '';
        echo json_encode(['ok' => sc_save_site($site)]);
        break;

    case 'get_site':
        echo json_encode(['ok'=>true,'site'=>sc_load_site(),'themes'=>sc_list_themes()]);
        break;

    default:
        echo json_encode(['ok'=>false,'error'=>'Action inconnue : '.$action]);
}
