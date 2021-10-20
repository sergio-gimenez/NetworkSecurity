# Root Certification Authority with OpenSSL

## Test a TLS webserver with a web browser

We have installed the CA’s (Certificate Authority) certificate on the web browser. Then, we add to this browser the `cacert.pem` file. Once this is done, we can test the certificate by trying to access the node server we just run previously.

![2-lab/img/add_cert_firefox.png](2-lab/img/add_cert_firefox.png)

We can see that the certificate is valid, however we can see that the issuer is not trusted by the browser:

![2-lab/img/issuer_unknown.png](2-lab/img/issuer_unknown.png)

If we revoke the webserver's certificate by running:

```source 
kali@ca:$ openssl ca -config openssl.cnf revoke certs/webserver.crt.pem
```

As the certificate has been revoked, when we go to the browser, it should display an error
message with the code `SEC_ERROR_REVOKED_CERTIFICATE`.

## Authenticate the webserver using a client interface

Let's force the node server to ask for client authentication. We can do this by changing the `htppsOptions` in the code we already had:

```javascript
const httpsOptions = {
    key: tlsServerKey,
    cert: tlsServerCrt
    cert: tlsServerCrt,
    requestCert: true,
    ca: caCert
};

const caCert = fs.readFleSync('./tls/cacert.pem')
```

Then, issue a new certificate for the webserver, as we revoked the one we had before:

```source
kali@webserver:$ openssl req -new -addext 'subjectAltName = IP:10.0.2.15' -nodes -keyout tls/webserver.key.pem -out webserver.csr.pem  
```

Generate a certificate for the client in the root CA, making sure it has the `usr_cert` extensions:

```source
kali@ca:$ openssl req -new -keyout private/testtlsserver.key.pem -out requests/testtlsserver.csr.pem
kali@ca:% openssl ca -config openssl.cnf -extensions usr_cert -in requests/testtlsserver.csr.pem -out certs/testtlsserver.crt.pem
```

After, we generate a PKCS #12 file containing the client certificate and private key using the `openssl pkcs12` command:

```source
openssl pkcs12 -export -inkey private/testtlsserver.key.pem -in certs/testtlsserver.crt.pem -out private/testtlsserver.pfx
```

Now, we import the PKCS #12 file into the browser certificates selecting `clients.pfx`. Then, we can test the certificate by trying to access the node server we just run previously.