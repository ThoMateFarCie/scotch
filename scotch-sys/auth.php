<?php
function sc_session_start() {
    if (session_status() === PHP_SESSION_NONE) {
        session_name('scotch_session');
        session_start();
    }
}

function sc_is_logged() {
    sc_session_start();
    return isset($_SESSION['scotch_logged']) && $_SESSION['scotch_logged'] === true;
}

function sc_login($user, $pass) {
    if ($user === SCOTCH_LOGIN && $pass === SCOTCH_PASS) {
        sc_session_start();
        session_regenerate_id(true);
        $_SESSION['scotch_logged'] = true;
        return true;
    }
    return false;
}

function sc_logout() {
    sc_session_start();
    session_unset();
    session_destroy();
}
