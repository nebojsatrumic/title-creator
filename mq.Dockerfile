FROM node:14.17-alpine3.14

WORKDIR /home/node/title_creator

COPY package*.json ./

# https://stackoverflow.com/questions/52196518/could-not-get-uid-gid-when-building-node-docker
RUN npm config set unsafe-perm true
RUN npm ci



# Copy app
COPY app/ /home/node/title_creator/app/
COPY ./tsconfig.json /home/node/title_creator/


EXPOSE 4200

CMD ["npm", "run", "start-mq"]
