// $ deno run --allow-net index.ts
import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";

const io = new Server({
  cors: {
    origin: "*",
  },
  pingTimeout: 30000,
  pingInterval: 5000,
});

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  socket.emit("message", {
    userId: "server",
    userName: "server",
    message: "welcome",
  });

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });

  socket.on("message", (message) => {
    console.log(`socket ${socket.id} sent message ${message.message}`);
    socket.emit("message", message);
  });
});

await serve(io.handler(), {
  port: 3000,
});
