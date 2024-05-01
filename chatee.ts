import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";
import { getFirstMessages, getOffset, initMessageTable ,addMessage} from "./src/ChatDao.ts";

await initMessageTable();
const io = new Server({
  cors: {
    // TODO 適切なクロスオリジンポリシーを設定する
    origin: "*",
  },
  pingTimeout: 30000,
  pingInterval: 5000,
});

// offset = 最新のメッセージのID, messagesテーブルのid
let offset = await getOffset();
if (offset < 0) throw new Error("cannot get offset");

io.on("connection", async (socket) => {
  console.log(`socket ${socket.id} connected`);
  // 接続時にユーザーにメッセージを送信
  const messages = await getFirstMessages();
  offset = await getOffset();
  socket.emit("messages", messages, offset);
  console.log(
    `socket ${socket.id} sent first messages, and offset ${offset}`,
  );

  socket.on("disconnect", (reason) => {
    console.log(`socket ${socket.id} disconnected due to ${reason}`);
  });

  socket.on("message", async (message) => {
    console.log(`socket ${socket.id} sent message ${message.message}`);
    const result = await addMessage(message);
    if (result) {
      offset++;
      socket.emit("message", message, offset);
      socket.broadcast.emit("message", message, offset);
    } else {
      console.log(`socket ${socket.id} failed to send message ${message}`);
      socket.emit("error", "failed to send message");
    }
  });
});

await serve(io.handler(), {
  port: 3000,
});
