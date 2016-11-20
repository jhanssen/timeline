#!/bin/bash
bower install
npm install
patch -p1 < patches/pixi.patch
./node_modules/.bin/bower-requirejs -c src/config.js -e requirejs
