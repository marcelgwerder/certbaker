# Certbaker
[![Build Status](https://travis-ci.org/marcelgwerder/certbaker.svg?branch=master)](https://travis-ci.org/marcelgwerder/certbaker)
[![Coverage Status](https://coveralls.io/repos/github/marcelgwerder/certbaker/badge.svg?branch=master)](https://coveralls.io/github/marcelgwerder/certbaker?branch=master)
[![GitHub license](https://img.shields.io/github/license/marcelgwerder/certbaker.svg)](https://github.com/marcelgwerder/certbaker/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/v/certbaker.svg)](https://www.npmjs.com/package/certbaker)

Certbaker is a command line utility that was created out of the need to easily manage fully trusted ssl certificates for development environments with many vhosts and domains. Some browser features only work with trusted certificates and thus the simplest approach is to create a root certificate base all the subsequent certificates on the root. The root can then be added to the trusted authorities. Certbaker acts as an OpenSSL wrapper and simplifies that process.

![](https://user-images.githubusercontent.com/4008557/33887393-edb04d34-df49-11e7-88c9-60d8aece0f7d.png)

## Install

Certbaker depends on [OpenSSL](https://www.openssl.org). It needs to be in the PATH and accessible by certbaker.  

```
npm install -g certbaker
```

## Use

## Create Certificates
1. On the first run of certbaker, a root certificate and key will be stored in `~/.certbaker`. You should add that certificate to the trusted root authorities on your device to make sure all the generated certificates are trusted.
2. Generate a new certificate using the following command:
```
certbaker b dev.example.com
```
3. Copy the provided snippet to your vhost or use the certificate in any way you wish.

## List Certificates
To list the already generated certificates stored in your home directory simply run:
```
certbaker l 
```
