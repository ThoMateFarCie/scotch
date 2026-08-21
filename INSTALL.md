# Scotch CMS — Installation

## XAMPP (rapide, Windows ou Mac)

1. **Copier** le dossier `scotch/` dans `C:\xampp\htdocs\` (Windows)  
   ou `/Applications/XAMPP/htdocs/` (Mac)

2. **Copier** `settings.example.php` en `settings.php`, puis l'ouvrir et changer le mot de passe :
   ```php
   define('SCOTCH_LOGIN', 'admin');
   define('SCOTCH_PASS',  'monmotdepasse');  // ← ici
   ```

3. **Droits d'écriture** sur `scotch-data/` (Mac/Linux seulement) :
   ```bash
   chmod -R 0777 scotch/scotch-data/
   ```
   Sur Windows avec XAMPP, aucun changement nécessaire.

4. **Ouvrir** dans le navigateur :
   ```
   http://localhost/scotch/
   ```

5. **Passer en mode édition** en ajoutant `?edit` à l'URL :
   ```
   http://localhost/scotch/?edit
   ```
   → Se connecter avec les identifiants choisis à l'étape 2.

---

## URLs propres (optionnel)

Par défaut les pages s'accèdent via `?url=nom-de-page`.  
Pour des URLs propres (`/nom-de-page`), activer `mod_rewrite` dans XAMPP :

- Ouvrir `C:\xampp\apache\conf\httpd.conf`
- Décommenter `LoadModule rewrite_module modules/mod_rewrite.so`
- Trouver `<Directory "C:/xampp/htdocs">` et changer `AllowOverride None` en `AllowOverride All`
- Redémarrer Apache

---

## Hébergement mutualisé (OVH, PlanetHoster, etc.)

1. Uploader le dossier `scotch/` via FTP à la racine ou dans un sous-dossier
2. Modifier `settings.php`
3. S'assurer que `scotch-data/` est accessible en écriture (chmod 0755 ou 0775)
4. `mod_rewrite` est généralement activé par défaut

---

## Polices personnalisées

Dans l'éditeur : **⚙ Réglages de la page** → section *Polices de cette page*.

- **Google Fonts** : tape le nom exact de la police (ex. `Poppins`, `Playfair Display`) → ajoutée automatiquement, chargée depuis Google Fonts.
- **Police importée** : bouton « Importer une police » → `.woff2`, `.woff`, `.ttf` ou `.otf`. Stockée dans `scotch-data/_fonts/` (partagée entre toutes les pages).

Une fois ajoutée, la police apparaît dans le menu déroulant **Police** des propriétés de tout élément texte.

---

## Raccourcis clavier (mode édition)

| Touche | Action |
|--------|--------|
| `Ctrl+S` | Sauvegarder |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Rétablir |
| `G` | Grille magnétique |
| `M` | Vue mobile |
| `L` | Panneau calques |
| `Échap` | Désélectionner |
| `Suppr` | Supprimer l'élément sélectionné |
| `↑↓←→` | Déplacer (×1px) |
| `Shift+↑↓←→` | Déplacer (×10px) |
| Double-clic fond | Créer un élément |
| Clic droit élément | Menu contextuel |

---

## Structure des fichiers

```
scotch/
├── settings.php          ← CONFIG (login, mot de passe)
├── index.php             ← Routeur principal
├── api.php               ← API REST (éditeur)
├── .htaccess             ← URLs propres (optionnel)
├── scotch-data/          ← Données (pages + uploads)
│   └── index/
│       ├── page.json     ← Données de la page
│       └── files/        ← Fichiers uploadés
└── scotch-sys/           ← Système (ne pas modifier)
    ├── css/
    ├── js/
    └── pages/
```

---

## Désactiver le mode debug (production)

Dans `settings.php`, passer :
```php
define('SCOTCH_DEBUG', false);
```
