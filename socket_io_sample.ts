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
function getFirstMessages(): Message[] {
  return [
    { userId: "server", userName: "server", message: "ようこそ" },
    {
      userId: "server",
      userName: "server",
      message: "チャットが機能してるかな？",
    },
    {
      userId: "server",
      userName: "server",
      message: "これからデータベースを組み込むよ！",
    },
    {
      userId: "server",
      userName: "server",
      message: "そうするとメッセージが永続化されるようになるね！",
    },
  ];
}

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);
  // 接続時にユーザーにメッセージを送信
  const messages = getFirstMessages();
  socket.emit("messages", messages);
  console.log(`socket ${socket.id} sent messages ${messages}`);

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });

  socket.on("message", (message) => {
    console.log(`socket ${socket.id} sent message ${message.message}`);
    socket.emit("message", message);
    socket.broadcast.emit("message", message);
  });
});

await serve(io.handler(), {
  port: 3000,
});
