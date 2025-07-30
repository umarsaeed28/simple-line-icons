FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src ./src
CMD ["npx", "ts-node", "src/index.ts"]