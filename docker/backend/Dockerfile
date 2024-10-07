FROM node:18-alpine

EXPOSE 3001

WORKDIR /usr/src/app

COPY ./backend/package*.json ./

RUN npm install

RUN npm install --save-dev nodemon

COPY ./backend .

CMD ["npx", "nodemon", "dist/app.js"]
