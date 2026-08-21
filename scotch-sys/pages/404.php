<div id="sc-404">
  <div class="sc-404-code">404</div>
  <p>La page <strong><?= htmlspecialchars($slug) ?></strong> n'existe pas.</p>
  <a href="<?= htmlspecialchars($base_url) ?>">← Accueil</a>
</div>
<style>
#sc-404{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;font-family:sans-serif;color:#888}
.sc-404-code{font-size:5rem;font-weight:700;color:#ddd;line-height:1}
#sc-404 p{margin:.5rem 0 1.2rem}
#sc-404 a{color:#378ADD;text-decoration:none}
</style>
