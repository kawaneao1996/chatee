import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { load } from "https://deno.land/std@0.220.0/dotenv/mod.ts";
const env = await load();
const databaseUrl = env["DATABASE_URL"];
const pool = new postgres.Pool(databaseUrl, 5, true);

const connection = await pool.connect();

// データベースの1行を表す型
export type MessagesRow = {
  id: number;
  user_id: string;
  user_name: string;
  message: string;
};
type Message = { userId: string; userName: string; message?: string };

/**
 * メッセージテーブルを初期化する
 * テーブルが存在しない場合は作成する
 * @returns {Promise<void>}
 */
export async function initMessageTable() {
  try {
    // TODO タイムスタンプを追加する
    await connection.queryObject`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        message TEXT NOT NULL
      )
    `;
  } finally {
    connection.release();
  }
}

/**
 * offsetを取得する
 * @returns {number} - offset
 */
export async function getOffset(): Promise<number> {
  const result = await connection.queryObject`
          SELECT MAX(id) FROM messages
      `;
  return (result.rows[0] as { max: number }).max || -1;
}

/**
 * 最新の30件のメッセージとoffsetを取得する
 * @returns {Message[], offset} - welcome messages
 */
export async function getFirstMessages(): Promise<
  { messages: Message[]; offset: number }
> {
  // データベースから最新のメッセージ30件を取得する
  const result = await connection.queryObject`
      SELECT * FROM messages ORDER BY id DESC LIMIT 30
  `;
  const first_messages = (result.rows as MessagesRow[]).map((message) => {
    return {
      userId: message.user_id,
      userName: message.user_name,
      message: message.message,
    };
  });
  return { messages: first_messages, offset: await getOffset() };
}

/**
 * メッセージを追加する
 * @param {Message} message - 追加するメッセージ
 * @returns {Promise<boolean>} - 追加に成功したかどうか
 */
export async function addMessage(message: Message): Promise<boolean> {
  try {
    await connection.queryObject`
            INSERT INTO messages (user_name, user_id, message) VALUES ($(message.userName), $(message.userId), $(message.message))
        `;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
