#!/usr/bin/env bash
rm -rf mobile
mkdir mobile
cd mobile
cordova create mainnet
cordova create testnet
cd mainnet
cordova plugin add phonegap-plugin-barcodescanner
rm config.xml && rm -R www
cp -a ../../cordova/cordova_mobile/mainnet/* ./
cordova platform add android
cd ../testnet
cordova plugin add phonegap-plugin-barcodescanner
rm config.xml && rm -R www
cp -a ../../cordova/cordova_mobile/testnet/* ./
cordova platform add android