rm ./dist/*

./scripts/devour.sh > ./dist/nomini.min.js

./scripts/devour.sh template form fetch morph helpers evtmods > ./dist/nomini.core.min.js
