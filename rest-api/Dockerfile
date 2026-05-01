FROM node:20-alpine AS builder
WORKDIR /rest
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /rest
COPY --from=builder /rest/node_modules ./node_modules
COPY --from=builder /rest/dist ./dist
CMD ["node", "dist/main"]