const assert = require("node:assert/strict");
const test = require("node:test");
const {
  findRelevantPassages,
  getGeminiErrorMessage,
} = require("../src/services/courseQuestionService");

test("retrieves matching passages and returns the most relevant lessons first", () => {
  const passages = findRelevantPassages([
    {
      id: 1,
      title: "Course introduction",
      content: "This lesson welcomes learners and describes the course outline.",
    },
    {
      id: 2,
      title: "HTTP requests",
      content: "A browser sends an HTTP request with headers to a web server.",
    },
    {
      id: 3,
      title: "HTTP response",
      content: "The server returns an HTTP response with a status code and headers.",
    },
  ], "How do HTTP requests include headers?");

  assert.equal(passages.length, 2);
  assert.equal(passages[0].lessonId, 2);
  assert.equal(passages[1].lessonId, 3);
});

test("returns no passage when the course text does not match the question", () => {
  const passages = findRelevantPassages([
    { id: 1, title: "Course introduction", content: "Welcome to the course." },
  ], "Explain database replication");

  assert.deepEqual(passages, []);
});

test("explains common Gemini configuration and quota errors", () => {
  assert.match(getGeminiErrorMessage(403, "PERMISSION_DENIED"), /GEMINI_API_KEY/);
  assert.match(getGeminiErrorMessage(429, "RESOURCE_EXHAUSTED"), /quota|rate limit/i);
  assert.match(getGeminiErrorMessage(404, "NOT_FOUND"), /GEMINI_MODEL/);
  assert.match(getGeminiErrorMessage(400, "INVALID_ARGUMENT"), /GEMINI_MODEL/);
  assert.match(getGeminiErrorMessage(503, "UNAVAILABLE"), /temporarily unavailable/i);
  assert.match(getGeminiErrorMessage(500), /could not answer/);
});
