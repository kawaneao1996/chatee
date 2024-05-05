import * as postgres from "https://deno.land/x/postgres@v0.14.2/mod.ts";
import { load } from "https://deno.land/std@0.220.0/dotenv/mod.ts";
const env = await load();
const databaseUrl = env["DATABASE_URL"];
const pool = new postgres.Pool(databaseUrl, 5, true);

const connection = await pool.connect();

export type Question = {
    sentence: string;
    answers: string[];
    values: string[];
};
// データベースの1行を表す型
export type QuestionsRow = {
    // nameは質問の集合につけたタイトル
    // つまり心理テスト１回分のタイトル
    name: string;
    questions: Question[];
};

export type Answers = {
    index: number;
    answer: number;
}[];

export type Result = {
    personality_test_result: string;
    compatible_person_description: string;
};

export async function initQuestionTable() {
    try {
        await connection.queryObject`
            CREATE TABLE IF NOT EXISTS questions (
                name TEXT PRIMARY KEY,
                questions JSONB NOT NULL,
            )
        `;
    } finally {
        connection.release();
    }
}

export async function getQuestionsNames(): Promise<string[]> {
    const result = await connection.queryObject<string>`
        SELECT name FROM questions
    `;
    return result.rows;
}

export async function getQuestions(name: string): Promise<QuestionsRow> {
    const result = await connection.queryObject<QuestionsRow>`
        SELECT * FROM questions WHERE name = ${name}
    `;
    return result.rows[0] as QuestionsRow;
}

export async function answerQuestion(name: string, answers: Answers): Promise<Result> {
    // TODO あとで実装
    console.log(name, answers);
    return (
        {
            personality_test_result: "INTJ",
            compatible_person_description: "INTJはINTJと相性がいいです"
        }
    );
}
