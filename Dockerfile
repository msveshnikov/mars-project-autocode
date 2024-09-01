FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]