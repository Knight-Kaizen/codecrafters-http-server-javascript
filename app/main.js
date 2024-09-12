const net = require("net");

// create a tcp serverx
const server = net.createServer((socket) => {
    socket.on('data', (data) => {

        // 1. Convert data into string (it comes as a buffer)
        data = data.toString();

        // 2. Split data based on http parts, (1st part is request line, 2nd one is headers and 3rd is optional request body) all seperated by CRLF (\r\n)
        data = data.split('\r\n')[0];

        // 3. request line consists of http method at index 0, path at 1, http vetrsion at 2nd index. 
        method = data.split(' ')[0];
        path = data.split(' ')[1];

        // 4. If the path is / pass the req, else fail 
        if (path == '/') {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        }
        else
            socket.write("HTTP/1.1 404 Not Found\r\n\r\n")

        socket.end()
    })

    socket.on("close", () => {
        socket.end();
    });
});

// Listen on tcp server started on port 4221
server.listen(4221, "localhost");
