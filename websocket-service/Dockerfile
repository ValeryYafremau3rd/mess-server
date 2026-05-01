FROM node:20-alpine AS builder
WORKDIR /websocket
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /websocket
COPY --from=builder /websocket/node_modules ./node_modules
COPY --from=builder /websocket/dist ./dist
CMD ["node", "dist/main"]