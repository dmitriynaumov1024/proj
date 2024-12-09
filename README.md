# proj

Project management system

## Copyright 

MIT License

&copy; 2024 Dmitriy Naumov naumov1024@gmail.com


## Tech stack

Languages, tools and frameworks that made this possible:

- postgres
- sqlite
- javascript
- nodejs
- express
- vite
- vue 3 


## Deploy in local environment

Requirements:

- linux
- openssl
- node
- npm

Configure .env:
```
# copy ./back/.env.example to ./back/.env
# edit it with text editor of your choice
```

Prepare:
```
# assume in root directory of the repo
cd ./var/openssl/ && ./create-dev-cert.sh && cd ../../
cd ./@common && npm run ci && cd ..
cd ./front && npm run ci && cd ..
cd ./back && npm run ci && cd ..
```

Run server:
```
cd ./back && npm run serve && cd ..
```


## Deploy with docker compose 

Requirements:

- docker
- docker-compose

Configure .env:
```
# copy ./back/.env.example to ./back/.env
# edit it with text editor of your choice
```

Prepare and Run:
```
# assume in root directory of the repo

# use this command for sqlite or external postgres instance
docker-compose up

# use this for dockerized postgres instance
docker-compose --file compose.yaml --file database/postgres.compose.yaml up
```


## Disclaimer

I, Dmitriy Naumov, developer of Proj, provide this cool software for free, but I would not like you to copy it without giving a proper credit to me, however I can not prevent you from doing so. To further discourage you from stealing this: THIS HAS NOT BEEN TESTED PROPERLY; THIS WAS WRITTEN BY A HUMAN WHO MAKES MISTAKES MORE FREQUENTLY THAN BREATHING, AND MIGHT CONTAIN A HELL TON OF BUGS THAT MIGHT LEAD TO SEVERE DATA LOSS OR CORRUPTION; USE IT AT YOUR OWN RISK.


## Copyright 

MIT License

&copy; 2024 Dmitriy Naumov naumov1024@gmail.com
