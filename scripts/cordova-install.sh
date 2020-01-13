#!/usr/bin/env bash
#for Android
buildAndroid() {
    echo '--------------------------'
    echo 'Create project for android'
    echo '--------------------------'
    mkdir android
    cd android
    cordova create mainnet
    cd mainnet
    cordova plugin add phonegap-plugin-barcodescanner
    rm config.xml && rm -R www
    cp -a ../../../cordova/cordova_mobile/android/mainnet/* ./
    cordova platform add android
    cd ../
    cordova create testnet
    cd testnet
    cordova plugin add phonegap-plugin-barcodescanner
    rm config.xml && rm -R www
    cp -a ../../../cordova/cordova_mobile/android/testnet/* ./
    cordova platform add android
}
#for ios
buildIos() {
    echo '----------------------'
    echo 'Create project for ios'
    echo '----------------------'
    mkdir ios
    cd ios
    cordova create mainnet
    cd mainnet
    cordova plugin add phonegap-plugin-barcodescanner
    rm config.xml && rm -R www
    cp -a ../../../cordova/cordova_mobile/ios/mainnet/* ./
    cordova platform add ios
    cd ../
    cordova create testnet
    cd testnet
    cordova plugin add phonegap-plugin-barcodescanner
    rm config.xml && rm -R www
    cp -a ../../../cordova/cordova_mobile/ios/testnet/* ./
    cordova platform add ios
}
if [[ $1 == 'android' ]];
then
    cd mobile
    rm -rf android
    buildAndroid
elif [[ $1 == 'ios' ]];
then
    cd mobile
    rm -rf ios
    buildIos
elif [ -z $1 ];
then
    rm -rf mobile
    mkdir mobile
    cd mobile
    buildAndroid
    cd ../../
    buildIos
fi