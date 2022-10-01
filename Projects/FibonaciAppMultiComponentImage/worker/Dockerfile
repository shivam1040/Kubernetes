#production version
FROM node:alpine
WORKDIR "/app"
COPY ./package.json ./
RUN npm install
COPY . .
#important
CMD ["npm", "run", "start"]