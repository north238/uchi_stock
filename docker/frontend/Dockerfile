# ベースイメージの指定
FROM node:18-alpine

EXPOSE 3030

# 作業ディレクトリの指定
WORKDIR /usr/src/app

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend .

CMD ["npm", "start"]
