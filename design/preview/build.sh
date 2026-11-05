#!/usr/bin/env sh
# Rebuilds the preview pages from their parts.
# Usage: sh design/preview/build.sh [out-dir-for-standalone-copies]
set -e
cd "$(dirname "$0")"
page() { # $1 title, $2 extra css, $3 body, $4 js
  cat <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>$1</title>
<link rel="stylesheet" href="../index.css">
<link rel="stylesheet" href="./$2">
</head>
<body>
HTML
  cat "$3"; echo "<script src=\"./$4\"></script>"; echo "</body>"; echo "</html>"
}
page "Morrow Foundations" preview.css body.html preview.js > index.html
page "Morrow Prototype" app.css app-body.html app.js > app.html

# Standalone single-file copies (all CSS/JS inlined), for sharing.
if [ -n "$1" ]; then
  mkdir -p "$1"
  inline() { # $1 title, $2 css, $3 body, $4 js, $5 link-target-rename
    echo "<title>$1</title>"; echo '<meta name="claude:viewport-fit-sides" content="cover">'
    echo '<style>'; cat ../tokens/primitives.css ../tokens/semantic.css ../base.css ../layout.css "$2"; echo '</style>'
    cat "$3"; echo '<script>'; cat "$4"; echo '</script>'
  }
  inline "Morrow Foundations" preview.css body.html preview.js > "$1/index.html"
  { echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'; inline "Morrow Prototype" app.css app-body.html app.js | sed '0,/<\/style>/s//<\/style><\/head><body>/'; echo '</body></html>'; } > "$1/app.html"
fi
