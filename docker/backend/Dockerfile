FROM node:lts-alpine3.20

EXPOSE 3001

WORKDIR /usr/src/app

COPY ./backend/package*.json ./

RUN npm install

COPY ./backend .

CMD ["npx", "nodemon", "app.js"]
