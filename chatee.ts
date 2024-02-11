import { serve } from "https://deno.land/std@0.150.0/http/server.ts";
import { Server } from "https://deno.land/x/socket_io@0.1.1/mod.ts";
import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";

// Get the connection string from the environment variable "DATABASE_URL"
const databaseUrl = Deno.env.get("DATABASE_URL")!;

// Create a database pool with three connections that are lazily established
const pool = new postgres.Pool(databaseUrl, 5, true);

// Connect to the database
const connection = await pool.connect();
try {
  // Create the table
  await connection.queryObject`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      message TEXT NOT NULL
    )
  `;
} finally {
  // Release the connection back into the pool
  connection.release();
}

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
async function getFirstMessages(): Promise<Message[]> {
    // データベースからメッセージを取得する
    const result = await connection.queryObject`
        SELECT * FROM messages
    `;
    console.log(result.rows);

    // Encode the result as JSON
    // const messages : Message[]  = await JSON.stringify(result.rows, null, 2);

    return [] as Message[];
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

  socket.on("message", async (message) => {
    console.log(`socket ${socket.id} sent message ${message.message}`);
    let result;
    try{
        result = await connection.queryObject`
            INSERT INTO messages (user_name, user_id, message) VALUES (${message.userName}, ${message.userId} , ${message.message})
        `;
    }catch(e){
        console.log(e);
        return;
    }
    // 送信されたメッセージを送信者に返信する。またメッセージのIDを返信する
    console.log(result);
    socket.emit("message", message);
    socket.broadcast.emit("message", message);
  });
});

await serve(io.handler(), {
  port: 3000,
});
