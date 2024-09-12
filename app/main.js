const net = require("net");
const path = require("path");

// create a tcp serverx
const server = net.createServer((socket) => {
    socket.on('data', (data) => {

        // 1. Convert data into string (it comes as a buffer)
        data = data.toString();

        // 2. Split data based on http parts, (1st part is request line, 2nd one is headers and 3rd is optional request body) all seperated by CRLF (\r\n)
        data = data.split('\r\n');

        // Index 0 -> contains request line, Index n-1 -> contains req body , Index n-2 contains '', rest all are headers
        const requestLine = data[0];
        const reqBody = data[data.length -1];
        const headers = data.slice(1, data.length-2);

        // 3. request line consists of http method at index 0, path at 1, http vetrsion at 2nd index. 
        const reqMethod = requestLine.split(' ')[0];
        let path = requestLine.split(' ')[1];

        // 4. If the path is / pass the req, else fail 
        if (path == '/') {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        }
        else if(path.includes('/echo')){

            path = path.split('/');

            if(path.length >= 3){
                const str = path[2];
                // 4. Write this in response body
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`);
            }
            else
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        }
        else if(path.includes('/user-agent')){
            for(const header of headers){

                const headerKey = header.split(':')[0];
                const headerValue = header.split(' ')[1];

                if(headerKey == "User-Agent"){
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${headerValue.length}\r\n\r\n${headerValue}`);
                }
            
            }
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
