#!/usr/bin/env bash
if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
fi

node --version
npm --version

echo "installing build environment dependencies"
nvm install 6
npm install bower -g
npm install electron-builder@next # force install next version to test electron-builder
echo "installing app dependencies"
npm install
npm prune

echo "succes setting up the environment"

echo "testing the app"
npm test

echo "building & deploying release"
npm run release
