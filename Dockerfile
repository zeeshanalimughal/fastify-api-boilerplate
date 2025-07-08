FROM node:20-alpine

RUN apk add --no-cache python3 make g++ postgresql-client

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ENV NODE_ENV=development

EXPOSE 3000

CMD ["npm", "run", "dev"]
