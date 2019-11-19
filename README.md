[![Build Status](https://travis-ci.com/acrylplatform/AcrylGUI.svg?branch=master)](https://travis-ci.com/acrylplatform/AcrylGUI)
# Acryl Client

[**Website**](https://acrylplatform.com/) | [**Support**](https://support.acrylplatform.com/) | [**Documentation**](https://docs.acrylplatform.com/)

Acryl Client is the official wallet software designed with mass adoption in mind. It allows to access your Acryl account, handle financial operations, issue tokens, and trade on DEX.

## Installation and usage

The web version is available at [https://client.acrylplatform.com](https://client.acrylplatform.com) and needs no installation.

The desktop client can be downloaded from [https://acrylplatform.com/product](https://acrylplatform.com/product).

## For developers

You will need Node.js 10.7.0 (or higher) and npm v5 (or higher).

```
npm i
npm run data-service
npm run server
```

The server will be launched at [https://localhost:8080](https://localhost:8080).

## Blockchain for the people

Keep up with the latest news and articles, and find out all about events happening on the [Acryl Platform](https://acrylplatform.com/).

* [Acryl Docs](https://docs.acrylplatform.com/)
* [Acryl Blog](https://blog.acrylplatform.com/)
* [Support](https://support.acrylplatform.com/)

##

_Please see the [issues](https://github.com/acrylplatform/AcrylGUI/issues) section to report any bugs or feature requests and to see the list of known issues._

[<img src="src/img/ico/android-chrome-512x512.png" width="70px" alt="Acryl Logo" />](https://acrylplatform.com/)

## Install mobile client

To install the mobile version of the client, you will need to install globally CORDOVA, and then use the build script of the mobile application.

```
npm install -g cordova
npm run cordova-install
```
To run the application on an android emulator or smartphone, you need to go to the directory of the assembly you need and then run the CORDOVA launch command on the android platform.

```
cd mobile/mainnet
```
or

```
cd mobile/testnet
```

```
cordova run android
```

