FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY database ./database
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "src/index.js"]
