# Fragments UI

> Simple but functional web app to test back-end fragments microservice and manage authentication with AWS User Pool


## Instructions on running the app

1. `npm install` to install all the dependencies along with node modules folder.

2. After installing all the dependencies, you can run `npm run start` to boot the server on port `1234`.:

3. You can also run `npm run clean` to clean the `dist` and `.parcel-cache` folders.


Fragments UI has a Dockerfile that uses 3 stages (dependency, build and production) to build the image. The final stage is based on `nginx:alpine` and the final image size is around 139MB.


## Usage

TODO: Write usage instructions

