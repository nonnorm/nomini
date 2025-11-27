rm -r ./dist
mkdir ./dist

./scripts/devour.sh > ./dist/nomini.min.js

./scripts/devour.sh template form > ./dist/nomini.ajax.min.js

./scripts/devour.sh template form fetch morph > ./dist/nomini.core.min.js
