<div id="sc-login-wrap">
  <div id="sc-login-box">
    <div id="sc-login-logo">✂ scotch</div>
    <form method="post" action="" id="sc-login-form">
      <input type="hidden" name="sc_login" value="1">
      <input type="hidden" name="sc_redirect_slug" value="<?= htmlspecialchars($slug, ENT_QUOTES) ?>">
      <div class="sc-login-field">
        <label for="sc_user">Identifiant</label>
        <input type="text" id="sc_user" name="sc_user" autocomplete="username" autofocus>
      </div>
      <div class="sc-login-field">
        <label for="sc_pass">Mot de passe</label>
        <input type="password" id="sc_pass" name="sc_pass" autocomplete="current-password">
      </div>
      <?php if (!empty($login_error)): ?>
      <p class="sc-login-error">Identifiants incorrects.</p>
      <?php endif ?>
      <button type="submit" class="sc-login-btn">Connexion</button>
    </form>
  </div>
</div>
<style>
#sc-login-wrap{display:flex;align-items:center;justify-content:center;min-height:80vh}
#sc-login-box{background:#fff;border:1px solid #e0e0e0;border-radius:12px;padding:2.5rem 2rem;width:300px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
#sc-login-logo{font-size:1.6rem;font-weight:600;letter-spacing:-.02em;margin-bottom:1.8rem;color:#1a1a2e}
.sc-login-field{margin-bottom:1rem}
.sc-login-field label{display:block;font-size:12px;font-weight:500;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
.sc-login-field input{width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box;outline:none;transition:border-color .15s}
.sc-login-field input:focus{border-color:#378ADD}
.sc-login-error{color:#993C1D;font-size:13px;margin:.5rem 0}
.sc-login-btn{width:100%;padding:10px;background:#1a1a2e;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;margin-top:.5rem;transition:background .15s}
.sc-login-btn:hover{background:#2d2d4e}
</style>
