
FROM nginx:1.22.1

# setup node.js
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - &&\
  apt-get update && apt-get install -y \
    build-essential \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy source code to the container
WORKDIR /usr/local/src/fragments-ui
COPY . .

# Build our site
RUN npm ci
# Copy the build to the dir that nginx expects for static sites
RUN npm run build &&\
  cp -a ./dist/. /usr/share/nginx/html/

EXPOSE 80
