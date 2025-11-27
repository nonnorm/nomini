#!/bin/sh

file="nomini.js"
sed_script=""

for block in "$@"; do
    sed_script="$sed_script;/--- BEGIN $block/,/--- END $block/d"
done

sed_script="$sed_script;/--- BEGIN/d;/--- END/d"

sed "$sed_script" "$file" | minify --type js
