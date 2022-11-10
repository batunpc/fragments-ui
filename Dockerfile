# https://github.com/humphd/cloud-computing-for-programmers-fall-2022/discussions/324

###################################################################
# Stage 0.0 - DEPENDENCY                                          #
# - Base image as alpine and                                      #
# Few configurations for parcel's configurations on alpine.       #
################################################################### 
FROM node:16.18.1-alpine@sha256:868e2b6c8923d87a4bbfb157d757898061c9000aaaedf64472074fa7b62d0e72 AS dependencies

LABEL maintainer="Batuhan Ipci" \
      description="Fragments microservice web app" \
      version="0.7.0"

# > pin the versions so hadolint doesn't complain
# See the relative versions from : 
#https://pkgs.alpinelinux.org/packages?name=python3&branch=v3.16&repo=main&arch=&maintainer=
RUN apk add --update --no-cache g++=11.2.1_git20220219-r2 \
    && apk add make=4.3-r0 python3=3.10.5-r0 \
    && ln -sf python3 /usr/bin/python

WORKDIR /app

# Copy the ts files from src so tsconfig.json will not complain
COPY package.json package-lock.json tsconfig.json ./src ./

RUN npm ci 

###################################################################
# Stage 1.0 - BUILD                                               #
# - Build the dependencies that are not bundled with parcel       #
###################################################################
FROM node:16.18.1-alpine@sha256:868e2b6c8923d87a4bbfb157d757898061c9000aaaedf64472074fa7b62d0e72 AS build

WORKDIR /app

COPY . .
# Copy the dependencies from the previous stage
COPY --from=dependencies /app /app/
# Build the dependencies here
RUN npm run build

###################################################################
# Stage 2.0 DEPLOY                                                #
# - Last layer running on nginx                                   #
###################################################################
FROM nginx:1.22.1@sha256:fdf01cd582b3ef270f1efde2de57a3eb1e9694668f18c1e53183bc2ea2643574 AS deploy

COPY --from=build /app/dist/. /usr/share/nginx/html/

EXPOSE 1234 

ENV PORT=1234

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:${PORT} || exit 1
