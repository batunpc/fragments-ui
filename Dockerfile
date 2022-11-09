
FROM node:16.15.1-bullseye AS dependencies

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./src ./

RUN npm ci 

#########################################################
FROM node:16.15.1-bullseye AS build

WORKDIR /app

COPY . .
COPY --from=dependencies /app /app/

RUN npm run build
#########################################################

FROM nginx:1.22.1 AS deploy

COPY --from=build /app/dist/. /usr/share/nginx/html/

EXPOSE 1234

ENV PORT=1234

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:${PORT} || exit 1
