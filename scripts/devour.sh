#!/bin/sh

# Nomini Devourer: removes code you don't need
# Current available blocks to remove (as of v0.3.0):
# data, bind, ref, fetch, morph, form, template
# Ex: ./scripts/devour.sh template form > nomini-custom.js

file="nomini.js"
sed_script=""

for block in "$@"; do
    sed_script="$sed_script;/--- BEGIN $block/,/--- END $block/d"
done

sed_script="$sed_script;/--- BEGIN/d;/--- END/d"

sed "$sed_script" "$file" | (command -v minify >/dev/null && minify --type js || cat)
