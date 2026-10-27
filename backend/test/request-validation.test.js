const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const express = require("express");
const {
  validateBody,
  validateIdParam,
} = require("../src/middleware/requestValidation");
const { parseCourseCatalogQuery } = require("../src/utils/courseCatalogQuery");

const app = express();
app.use(express.json());
app.get("/items/:id", validateIdParam(), (_req, res) => res.sendStatus(204));
app.post("/courses", validateBody({
  price: { type: "number", required: true, min: 0 },
  isPublished: { type: "boolean", required: true },
}), (req, res) => res.status(200).json(req.body));
app.post("/lesson-content", validateBody({
  content: { type: "string", maxLength: 50000 },
}), (req, res) => res.status(200).json(req.body));

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

test("rejects malformed and unsafe numeric route IDs", async () => {
  for (const id of ["0", "-1", "1.2", "9007199254740992", "nope"]) {
    const response = await fetch(`${baseUrl}/items/${id}`);
    assert.equal(response.status, 400, `expected ${id} to be rejected`);
    const body = await response.json();
    assert.match(body.message, /positive integer/);
  }

  assert.equal((await fetch(`${baseUrl}/items/12`)).status, 204);
});

test("normalizes valid number and boolean request fields", async () => {
  const response = await fetch(`${baseUrl}/courses`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ price: "12.5", isPublished: "false" }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { price: 12.5, isPublished: false });
});

test("returns field errors for invalid request fields", async () => {
  const response = await fetch(`${baseUrl}/courses`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ price: -1, isPublished: "sometimes" }),
  });
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.message, "Request validation failed");
  assert.equal(body.errors.length, 2);
});

test("accepts lesson content up to 50,000 characters and rejects longer text", async () => {
  const url = `${baseUrl}/lesson-content`;
  const headers = { "content-type": "application/json" };
  const validContent = "x".repeat(50000);

  const accepted = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: validContent }),
  });
  assert.equal(accepted.status, 200);
  assert.equal((await accepted.json()).content.length, 50000);

  const rejected = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: `${validContent} ` }),
  });
  assert.equal(rejected.status, 400);
});

test("parses bounded course-catalog pagination and search parameters", () => {
  assert.deepEqual(parseCourseCatalogQuery({}), {
    page: 1,
    limit: 20,
    search: "",
  });
  assert.deepEqual(parseCourseCatalogQuery({
    page: "3",
    limit: "12",
    search: "  angular  ",
  }), {
    page: 3,
    limit: 12,
    search: "angular",
  });

  for (const query of [
    { page: "0" },
    { page: "1.5" },
    { page: "9007199254740992" },
    { page: "9007199254740991", limit: "50" },
    { limit: "51" },
    { search: "x".repeat(101) },
    { search: ["angular"] },
  ]) {
    assert.throws(() => parseCourseCatalogQuery(query));
  }
});
