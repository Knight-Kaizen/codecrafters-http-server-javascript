const net = require("net");
const path = require("path");
const fs = require("fs");
const { dir } = require("console");

// create a tcp serverx
const server = net.createServer((socket) => {
    socket.on('data', (data) => {

        // 1. Convert data into string (it comes as a buffer)
        data = data.toString();

        // 2. Split data based on http parts, (1st part is request line, 2nd one is headers and 3rd is optional request body) all seperated by CRLF (\r\n)
        data = data.split('\r\n');

        // Index 0 -> contains request line, Index n-1 -> contains req body , Index n-2 contains '', rest all are headers
        const requestLine = data[0];
        const reqBody = data[data.length - 1];
        const headers = data.slice(1, data.length - 2);

        // 3. request line consists of http method at index 0, url at 1, http vetrsion at 2nd index. 
        const reqMethod = requestLine.split(' ')[0];
        let url = requestLine.split(' ')[1];

        // 4. If the url is / pass the req, else fail 
        if (url == '/') {
            socket.write("HTTP/1.1 200 OK\r\n\r\n")
        }
        else if (url.includes('/echo')) {

            url = url.split('/');

            if (url.length >= 3) {
                const str = url[2];
                // 4. Write this in response body
                socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${str.length}\r\n\r\n${str}`);
            }
            else
                socket.write("HTTP/1.1 200 OK\r\n\r\n")
        }
        else if (url.includes('/user-agent')) {
            for (const header of headers) {

                const headerKey = header.split(':')[0];
                const headerValue = header.split(' ')[1];

                if (headerKey == "User-Agent") {
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${headerValue.length}\r\n\r\n${headerValue}`);
                }

            }
        }
        else if (url.includes('/files')) {
            if(reqMethod == "GET"){
                const directory = process.argv[3];
                const filename = url.split('/')[2];
    
                const fileurl = path.join(directory, filename);
                if(fs.existsSync(fileurl)){
                    const fileBuffer = fs.readFileSync(fileurl);
                    const content = fileBuffer.toString();
    
                    socket.write(`HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
                }
                else{
                    socket.write("HTTP/1.1 404 Not Found\r\n\r\n")
                }
            }
            else if(reqMethod == "POST"){
                const directory = process.argv[3];
                const filename = url.split('/')[2];
                
                const fileurl = path.join(directory, filename);
                if(!fs.existsSync(directory))
                    fs.mkdirSync(directory)
                
                const content = reqBody;
                fs.writeFileSync(fileurl, content);
                
                socket.write('HTTP/1.1 201 Created\r\n\r\n');
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
