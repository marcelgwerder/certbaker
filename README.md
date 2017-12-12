*WORK IN PROGRESS*

# Certbaker

Certbaker is a command line utility that was created out of the need to easily manage fully trusted ssl certificates for development environments with many vhosts and domains. Some browser features only work with trusted certificates and thus the simplest approach is to create a root certificate base all the subsequent certificates on the root. The root can then be added to the trusted authorities. Certbaker acts as an OpenSSL wrapper and simplifies that process.

## Installation

Certbaker depends on [OpenSSL](https://www.openssl.org). It needs to be in the PATH and accessible by certbaker.  

```
npm install -g certbaker
```

