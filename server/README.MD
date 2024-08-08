## Running the application

### First time
1. Generate an .env file copying from the .envexample
2. Generate a .server.cert file

#### SSL

When running the server locally, HTTPS needs to be setup due to the use of Secure=true on cookies (due to SameSite="none"). The server will look for `server.cert` and `server.key` in the current working directory to use for SSL. When first setting up the server, do the following:

1. Generate `server.cert` and `server.key` by execute `openssl req -nodes -new -x509 -keyout server.key -out server.cert` in the root directory.
2. Start the server by executing `npm run dev` in the root directory.
3. Go to `https://localhost:5000/` and click "Advanced" -> "Proceed to localhost (unsafe)", this solves ERR_CERT_AUTHORITY_INVALID for development.

## Running

1. run at server/docker docker-compose up
2. npm run dev to run the server (or via vscode)
3. npm run dev-worker

## Troubleshooting

If you encounter any issues while running the application, here are some troubleshooting steps you can follow:

1. Make sure you have generated the `.env` file by copying from the `.envexample` file. This file contains important configuration settings for the application.

2. Ensure that you have generated the `server.cert` and `server.key` files for SSL setup. You can do this by executing the command `openssl req -nodes -new -x509 -keyout server.key -out server.cert` in the root directory of the project.

3. Start the server by executing the command `npm run dev` in the root directory. This will launch the server and make it accessible at `https://localhost:5000/`.

4. If you encounter an SSL certificate error in your browser, click on "Advanced" and then "Proceed to localhost (unsafe)" to bypass the error. This is necessary for development purposes.

5. If you are running the application using Docker, use the command `docker-compose up` to start the server.

6. Additionally, you can run the server using the command `npm run dev` or via Visual Studio Code.

7. If you need to run any background worker processes, execute `npm run dev-worker`.

If you are still experiencing issues, please refer to the project documentation or reach out to the project maintainers for further assistance.

### Localstack
To check queues created
```
docker exec -it $(docker ps -qf "name=localstack") awslocal sqs list-queues
```
To check how many messages are in queue
```
docker exec -it $(docker ps -qf "name=localstack") awslocal sqs get-queue-attributes --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/cw_pgn_queue --attribute-names All
```


### Recommended Tools

1. Warp (command line tool)
2. Mongo DB Compass GUI
3.

### Docker

Building the image
```
docker build -f docker/Dockerfile -t chesswiz . 
```

running the image locally

```
docker run -d -p 5000:5000 --name chesswiz --env-file ./docker/.env chesswiz
```
