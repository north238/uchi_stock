# ベースイメージの指定
FROM node:lts-alpine3.20

EXPOSE 3001

# 作業ディレクトリの指定
WORKDIR /usr/src/app

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .

CMD ["npm", "start"]
