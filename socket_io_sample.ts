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

type Message = { userId: string; userName: string; message?: string };

/**
 * 接続したユーザーに最初に送るメッセージを取得する
 * @returns {Message[]} - welcome messages
 */
function getFirstMessages(): Message[]{
  return [
    { userId: "server", userName: "server", message: "welcome" },
  ];
}

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  // ユーザーの初期画面に表示するメッセージを送信
  socket.emit("messages", getFirstMessages());

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
