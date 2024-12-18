#!/bin/sh

[ -d "./cert" ] && echo 'certificates already exist.' && exit 0

mkdir -p cert
mkdir -p key
mkdir -p root

openssl req -x509 -sha256 \
-nodes -newkey rsa:2048 -subj "/CN=localhost/C=UA" \
-keyout ./root/rootca.key -out ./root/rootca.crt

openssl genrsa -out ./key/localhost.key 2048

openssl req -new -key ./key/localhost.key \
-config ./conf/localhost.csr.conf -out ./cert/localhost.csr

openssl x509 -req -sha256 \
-in ./cert/localhost.csr -days 730 \
-extfile ./conf/localhost.cert.conf \
-CA ./root/rootca.crt -CAkey ./root/rootca.key \
-CAcreateserial -out ./cert/localhost.crt

echo 'certificates created.'
