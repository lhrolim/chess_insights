## Running the application

### First time
1. Generate an .env file copying from the .envexample
2. Generate a .server.cert file

#### SSL

When running the server locally, HTTPS needs to be setup due to the use of Secure=true on cookies (due to SameSite="none"). The server will look for `server.cert` and `server.key` in the current working directory to use for SSL. When first setting up the server, do the following:

1. Generate `server.cert` and `server.key` by execute `openssl req -nodes -new -x509 -keyout server.key -out server.cert` in the root directory.
2. Start the server by executing `npm run dev` in the root directory.
3. Go to `https://localhost:5000/` and click "Advanced" -> "Proceed to localhost (unsafe)", this solves ERR_CERT_AUTHORITY_INVALID for development.
