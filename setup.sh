#!/bin/bash
bower install
npm install
./node_modules/.bin/bower-requirejs -c src/config.js -e requirejs
# patch up incorrect bower.json from pixi
sed -i "" -e 's/bin\/pixi\.min/dist\/pixi\.min/g' src/config.js 
