#!/bin/bash
bower install
npm install
./node_modules/.bin/bower-requirejs -c src/config.js -e requirejs
