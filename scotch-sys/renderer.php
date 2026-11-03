<?php
/**
 * Rendu visiteur — JSON → HTML
 * Contexte : $page_data, $base_url
 */

$elements = $page_data['elements'] ?? [];
// Blocs globaux masqués sur cette page uniquement
$hidden_globals = $page_data['meta']['hiddenGlobals'] ?? [];
$elements = array_values(array_filter($elements, fn($e) =>
    empty($e['global']) || !in_array($e['id'] ?? '', $hidden_globals, true)));

// Trier par z-index pour le rendu desktop
$desktop = $elements;
usort($desktop, fn($a,$b) => ($a['z']??0) <=> ($b['z']??0));

// Ordre mobile : mobileOrder explicite, sinon position Y croissante
$mobile_order = $elements;
usort($mobile_order, function($a,$b) {
    $oa = $a['mobileOrder'] ?? ($a['pos']['y'] ?? 0);
    $ob = $b['mobileOrder'] ?? ($b['pos']['y'] ?? 0);
    return $oa <=> $ob;
});
$mobile_ranks = [];
foreach ($mobile_order as $rank => $el) {
    $mobile_ranks[$el['id']] = $rank;
}

foreach ($desktop as $el):
    if (!empty($el['hidden'])) continue;

    $id   = htmlspecialchars($el['id'] ?? '', ENT_QUOTES);
    $x    = intval($el['pos']['x'] ?? 0);
    $y    = intval($el['pos']['y'] ?? 0);
    $w    = isset($el['size']['w']) && $el['size']['w'] ? intval($el['size']['w']) : null;
    $h    = isset($el['size']['h']) && $el['size']['h'] ? intval($el['size']['h']) : null;
    $z    = intval($el['z'] ?? 1);
    $s    = $el['style'] ?? [];
    $type = $el['type'] ?? 'bloc';
    $mob_rank = $mobile_ranks[$el['id']] ?? 0;

    $isMedia = in_array($type, ['image','iframe']);

    // Style desktop
    $st = "position:absolute;left:{$x}px;top:{$y}px;z-index:{$z};";
    $st .= $w ? "width:{$w}px;"  : ($isMedia ? "width:300px;"  : "width:160px;");
    $st .= $h ? "height:{$h}px;" : ($isMedia ? "height:200px;" : "min-height:60px;");

    if (!$isMedia) {
        $st .= "padding:10px 12px;";
        // Alignement du texte
        $av = ['top'=>'flex-start','middle'=>'center','bottom'=>'flex-end'][$s['alignV'] ?? 'top'] ?? 'flex-start';
        $ah = in_array($s['alignH'] ?? '', ['left','center','right']) ? $s['alignH'] : 'left';
        $st .= "display:flex;flex-direction:column;justify-content:{$av};text-align:{$ah};";
        if (!empty($s['bgImage'])) {
            $bgUrl = htmlspecialchars(
                str_starts_with($s['bgImage'],'http') ? $s['bgImage'] : $base_url.ltrim($s['bgImage'],'/'),
                ENT_QUOTES
            );
            $st .= "background-image:url('{$bgUrl}');";
            $bgr = $s['bgRepeat'] ?? 'repeat';
            if (in_array($bgr,['cover','contain']))
                $st .= "background-size:{$bgr};background-repeat:no-repeat;background-position:center;";
            else
                $st .= "background-repeat:repeat;";
            if (!empty($s['bg']) && empty($s['bgTransparent'])) $st .= "background-color:".htmlspecialchars($s['bg']).";";
        } elseif (!empty($s['bgTransparent'])) {
            $st .= "background:transparent;";
        } else {
            $st .= "background:".(!empty($s['bg']) ? htmlspecialchars($s['bg']) : '#ddd').";";
        }
    } else {
        $st .= "overflow:hidden;padding:0;";
        // Mobile : proportions du cadre (bureau) pour garder le média en grand
        $st .= "--mr:" . ($w ?: 300) . " / " . ($h ?: 200) . ";";
    }

    if (!empty($s['color']))      $st .= "color:".htmlspecialchars($s['color']).";";
    if (!empty($s['fontSize']))   $st .= "font-size:".intval($s['fontSize'])."px;";
    if (!empty($s['fontFamily'])) $st .= "font-family:'".htmlspecialchars($s['fontFamily'])."',sans-serif;";
    if (isset($s['opacity']) && $s['opacity'] != 1) $st .= "opacity:".floatval($s['opacity']).";";
    if (!empty($s['mirrorH']) && !empty($s['mirrorV'])) $st .= "transform:scale(-1,-1);";
    elseif (!empty($s['mirrorH'])) $st .= "transform:scaleX(-1);";
    elseif (!empty($s['mirrorV'])) $st .= "transform:scaleY(-1);";

    // ordre mobile via CSS order (flexbox en mobile)
    $st .= "order:{$mob_rank};";

    $mobile_json = htmlspecialchars(json_encode(['x'=>$x,'y'=>$y]), ENT_QUOTES);
    $anchor_attr = !empty($el['anchor']) ? ' id="'.htmlspecialchars($el['anchor'],ENT_QUOTES).'"' : '';

    // Contenu
    $content_html = '';
    $cropped = false;
    switch ($type) {
        case 'image':
            if (!empty($el['content'])) {
                $src = htmlspecialchars(
                    str_starts_with($el['content'],'http') ? $el['content'] : $base_url.ltrim($el['content'],'/'),
                    ENT_QUOTES
                );
                $alt = htmlspecialchars($el['alt'] ?? '', ENT_QUOTES);
                // dimensions réelles : le navigateur réserve la place avant le chargement (mobile « image entière »)
                $dim = '';
                if (!str_starts_with($el['content'], 'http')) {
                    $sz = @getimagesize(__DIR__ . '/../' . ltrim($el['content'], '/'));
                    if ($sz && $sz[0] && $sz[1]) $dim = " width=\"{$sz[0]}\" height=\"{$sz[1]}\"";
                }
                $content_html = "<img src=\"{$src}\" alt=\"{$alt}\"{$dim} style=\"width:100%;height:100%;object-fit:cover;display:block\" loading=\"lazy\">";
            }
            break;
        case 'file':
            if (!empty($el['content'])) {
                $src  = htmlspecialchars(
                    str_starts_with($el['content'],'http') ? $el['content'] : $base_url.ltrim($el['content'],'/'),
                    ENT_QUOTES
                );
                $name = htmlspecialchars($el['filename'] ?? basename($el['content']), ENT_QUOTES);
                $content_html = "<span style=\"display:flex;align-items:center;gap:8px\">📎 {$name}</span>";
            }
            break;
        case 'iframe':
            if (!empty($el['content'])) {
                $src  = htmlspecialchars($el['content'], ENT_QUOTES);
                $crop = $el['crop'] ?? null;
                if (is_array($crop) && floatval($crop['s'] ?? 0) > 0) {
                    // Recadrage : la page source est affichée dans une fenêtre vw×vh,
                    // décalée de (x,y) et zoomée de s. --k = mise à l'échelle mobile.
                    $cropped = true; $has_crop = true;
                    $cs  = floatval($crop['s']);
                    $cvw = intval($crop['vw'] ?? 1280) ?: 1280;
                    $cvh = intval($crop['vh'] ?? 800)  ?: 800;
                    $tx  = round(-floatval($crop['x'] ?? 0) * $cs, 2);
                    $ty  = round(-floatval($crop['y'] ?? 0) * $cs, 2);
                    $cw  = $w ?: 300; $ch = $h ?: 200;
                    $st .= "--cw:{$cw};--ch:{$ch};";
                    $content_html = "<div class=\"sc-crop-box\" data-cw=\"{$cw}\" style=\"position:relative;width:100%;height:100%;overflow:hidden\">"
                        . "<iframe src=\"{$src}\" frameborder=\"0\" allowfullscreen loading=\"lazy\" style=\"position:absolute;left:0;top:0;width:{$cvw}px;height:{$cvh}px;max-width:none;border:none;display:block;"
                        . "transform-origin:0 0;transform:translate(calc(var(--k,1) * {$tx}px),calc(var(--k,1) * {$ty}px)) scale(calc(var(--k,1) * {$cs}))\"></iframe></div>";
                } else {
                    $content_html = "<iframe src=\"{$src}\" frameborder=\"0\" allowfullscreen style=\"width:100%;height:100%;border:none;display:block\" loading=\"lazy\"></iframe>";
                }
            }
            break;
        default:
            // Enveloppe unique (comme dans l'éditeur) : sinon chaque morceau de texte
            // (gras, italique…) devient un élément flex séparé et casse le centrage
            $content_html = '<div class="sc-bloc-content">' . ($el['content'] ?? '') . '</div>';
    }

    // Lien sortant — supporte "page", "page#ancre", et URLs externes
    $link   = $el['link'] ?? '';
    $target = ($el['linkTarget'] ?? '') === '_blank' ? ' target="_blank" rel="noopener"' : '';
    if ($link && !str_starts_with($link, 'http')) {
        $parts = explode('#', $link, 2);
        $link  = '?url=' . urlencode($parts[0]);
        if (!empty($parts[1])) $link .= '#' . htmlspecialchars($parts[1], ENT_QUOTES);
    }
    $cls = 'sc-el sc-' . htmlspecialchars($type, ENT_QUOTES);
    if (($el['mobileRole'] ?? '') === 'hidden')     $cls .= ' sc-mob-hidden';
    if (($el['mobileRole'] ?? '') === 'background') $cls .= ' sc-mob-bg';
    if (!empty($el['hover']) && preg_match('/^[a-z]+$/', $el['hover']))
        $cls .= ' sc-hover-' . $el['hover'];
    if ($cropped) $cls .= ' sc-cropped';
    if ($isMedia) $cls .= ' sc-fit-' . (in_array($el['mobileFit'] ?? '', ['full','band']) ? $el['mobileFit'] : 'ratio');

    if ($link):
?>
<a href="<?= htmlspecialchars($link,ENT_QUOTES) ?>"<?= $target ?><?= $anchor_attr ?>
   class="<?= $cls ?>" style="text-decoration:none;color:inherit;display:block;<?= $st ?>">
  <?= $content_html ?>
</a>
<?php else: ?>
<div class="<?= $cls ?>" id="dom-<?= $id ?>"<?= $anchor_attr ?> style="<?= $st ?>">
  <?= $content_html ?>
</div>
<?php endif; endforeach; ?>
<?php if (!empty($has_crop)): ?>
<script>
/* Iframes recadrées : quand le bloc change de largeur (mobile), le recadrage suit */
(function(){
  var mq = window.matchMedia('(max-width:768px)');
  function fit(){
    document.querySelectorAll('.sc-crop-box').forEach(function(b){
      var k = mq.matches ? b.clientWidth / (+b.dataset.cw || b.clientWidth) : 1;
      b.style.setProperty('--k', k || 1);
    });
  }
  fit(); window.addEventListener('resize', fit);
})();
</script>
<?php endif ?>
