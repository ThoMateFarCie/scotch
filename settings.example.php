<?php
// ============================================================
//  Scotch CMS — Configuration
//  Copie ce fichier en settings.php et modifie ces valeurs
// ============================================================

// Identifiants de connexion
define('SCOTCH_LOGIN', 'admin');
define('SCOTCH_PASS',  'changeme');   // ← CHANGE IMPÉRATIVEMENT

// Version (ne pas modifier)
define('SCOTCH_VERSION', '0.1.0');

// Chemins absolus (auto-détectés, ne pas modifier sauf cas particulier)
define('SCOTCH_DATA', __DIR__ . '/scotch-data/');
define('SCOTCH_SYS',  __DIR__ . '/scotch-sys/');

// Activer l'affichage des erreurs PHP (mettre false en production)
define('SCOTCH_DEBUG', true);
