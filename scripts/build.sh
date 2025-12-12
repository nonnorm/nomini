rm ./dist/*

./scripts/devour.sh > ./dist/nomini.min.js

./scripts/devour.sh template form fetch morph helpers events > ./dist/nomini.core.min.js
