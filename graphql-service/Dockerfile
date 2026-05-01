FROM node:20-alpine AS builder
WORKDIR /graphql
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /graphql
COPY --from=builder /graphql/node_modules ./node_modules
COPY --from=builder /graphql/dist ./dist
CMD ["node", "dist/main"]