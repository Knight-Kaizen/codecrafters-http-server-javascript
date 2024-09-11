const net = require("net");

// create a tcp serverx
const server = net.createServer((socket) => {
  socket.write("HTTP/1.1 200 OK\r\n\r\n")
  socket.on("close", () => {
    socket.end();
  });
});

// Listen on tcp server started on port 4221
server.listen(4221, "localhost");
