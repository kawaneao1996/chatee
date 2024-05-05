import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Question } from "./src/QuestionDao.ts";
import { QuestionsRow } from "./src/QuestionDao.ts";
import { Answers } from "./src/QuestionDao.ts";
import { answerQuestion } from "./src/QuestionDao.ts";


const names = ["test1", "test2", "test3"];

const questions: QuestionsRow[] = [
    { name: "test1", questions: [{ sentence: "test1", answers: ["test1", "test2", "test3"], values: ["1", "2", "3"] }] },
    { name: "test2", questions: [{ sentence: "test2", answers: ["test1", "test2", "test3"], values: ["1", "2", "3"] }] },
    { name: "test3", questions: [{ sentence: "test3", answers: ["test1", "test2", "test3"], values: ["1", "2", "3"] }] },
];

const router = new Router();
router
    .get("/api/v1/Question/names", (ctx) => {
        ctx.response.body = names;
    })
    .get("/api/v1/Question/:name", (ctx) => {
        const targetQuestion = Object.values(questions).find((question) => question.name === ctx.params.name)
        const body = {
            "questions": Object.values(targetQuestion?.questions ?? []).map((q) => {
                return {
                    "sentence": q.sentence,
                    "answers": q.answers,
                }
            })
        }
        ctx.response.body = body;
    })
    .post("/api/v1/Question/:name/answer", async (ctx) => {
        const answers = ctx.request.body;
        const body = await answerQuestion(ctx.params.name, answers as unknown as Answers);
        ctx.response.body = body;
    });

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

// Logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.headers.get("X-Response-Time");
    console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.addEventListener("listen", ({ hostname, port, secure }) => {
    console.log(
        `Listening on: ${secure ? "https://" : "http://"}${hostname ?? "localhost"
        }:${port}`,
    );
});

await app.listen({ port: 8000 });