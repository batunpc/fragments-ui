# Fragments UI

> Simple but functional web app to test back-end fragments microservice and manage authentication with AWS User Pool


## Instructions on running the app

1. `npm install` to install all the dependencies along with node modules folder.

2. After installing all the dependencies, you can run `npm run start` to boot the server on port `1234`.:

3. You can also run `npm run clean` to clean the `dist` and `.parcel-cache` folders.

> **Note**: You first need to make sure [back-end fragments](https://github.com/batunpc/fragments) running properly on `localhost:8080` and configured env variables for AWS user pool authentication.

Fragments UI has a Dockerfile that uses 3 stages (dependency, build and production) to build the image. The final stage is based on `nginx:alpine` and the final image size is around 139MB.


## Images

After creating fragment of type `text/markdown` you can view the metadata.

<img width="450" alt="CleanShot 2022-11-24 at 23 52 20@2x" src="https://user-images.githubusercontent.com/71259399/203903798-c0bcb996-4cbc-4581-8fa4-33f628c53af7.png">

Viewing the `data` that has been entered to create this fragment metadata.

<img width="500" alt="CleanShot 2022-11-24 at 23 53 29@2x" src="https://user-images.githubusercontent.com/71259399/203904056-724f9edf-db87-4382-aef4-aec940faf26b.png">

You can view fragment data in different content types. In this case we are viewing in `text/html`

<img width="500" alt="CleanShot 2022-11-24 at 23 58 34@2x" src="https://user-images.githubusercontent.com/71259399/203904508-dcc2be38-94b7-40f3-b9f4-641de7b32c0d.png">


