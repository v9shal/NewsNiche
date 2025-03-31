const request = require("supertest");
const app = require("../server");

describe("Search History API Tests", () => {
  const testUsername = `testuser_${Date.now()}`;
  const testKeyword = "technology";

  test("POST /search should save search term", async () => {
    const res = await request(app)
      .post("/api/bookmark/search")
      .send({ username: "testuser", keyword: "technology" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Search history updated");
  });

  test("GET /getHistory should return search history", async () => {
    const res = await request(app).get("/api/bookmark/getHistory/testuser");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.history)).toBe(true);
  });

  test("DELETE /deleteHistory should remove specific search history", async () => {
    const res = await request(app)
      .delete(`/api/bookmark/deleteHistory/${testUsername}/${testKeyword}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("history deleted successfully");
  });
});

describe("Authentication API Comprehensive Tests", () => {
  const testUsername = `user_${Date.now()}`;
  const testPassword = "Test@123";
  const testEmail = `${testUsername}@example.com`;

  test("Signup with Complete Details", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ 
        username: testUsername, 
        password: testPassword, 
        email: testEmail, 
        age: "25" 
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User created successfully");
    expect(res.body.user).toHaveProperty("username", testUsername);
  });

  test("Signup with Missing Fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: testUsername, password: testPassword });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Missing required fields");
  });

  test("Signup with Existing Username", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ 
        username: testUsername, 
        password: testPassword, 
        email: testEmail, 
        age: "25" 
      });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("error", "Username already exists");
  });

  test("Login Successful", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: testUsername, password: testPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body.user).toHaveProperty("username", testUsername);
  });

  test("Login with Invalid Credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: testUsername, password: "WrongPassword" });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid username or password");
  });

  test("Token Verification", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: testUsername, password: testPassword });
    
    const verifyRes = await request(app)
      .get("/api/auth/verify")
      .set('Cookie', loginRes.headers['set-cookie']);
    
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body).toHaveProperty("message", "authorized");
  });
});

describe("News and Bookmarks API Tests", () => {
  const testUsername = `user_${Date.now()}`;
  const testArticle = {
    title: "Test Article",
    author: "Test Author",
    articleId: "test123",
    description: "Test description",
    url: "http://example.com/test"
  };

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ 
        username: testUsername, 
        password: "Test@123", 
        email: `${testUsername}@example.com`, 
        age: "25" 
      });
  });

  test("Fetch News by Category", async () => {
    const res = await request(app)
      .get("/api/news/fetchLiveNewsByCategory")
      .query({ category: "technology" });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.articles)).toBe(true);
  });

  test("Fetch News by Parameter", async () => {
    const res = await request(app)
      .get("/api/news/fetchLiveNewsByParameter")
      .query({ q: "world", language: "en" });
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.articles)).toBe(true);
  });

  test("Save and Retrieve Bookmarks", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ username: testUsername, password: "Test@123" });

    const saveRes = await request(app)
      .post("/api/news/bookmarks")
      .set('Cookie', loginRes.headers['set-cookie'])
      .send(testArticle);
    expect(saveRes.statusCode).toBe(201);
    expect(saveRes.body).toHaveProperty("message", "Your news article has been saved");

    const bookmarkRes = await request(app)
      .get("/api/news/bookmarks/fetchbookmark")
      .set('Cookie', loginRes.headers['set-cookie']);
    expect(bookmarkRes.statusCode).toBe(200);
    expect(Array.isArray(bookmarkRes.body.bookmarks)).toBe(true);
  });
});

describe("Security and Edge Case Tests", () => {
  test("Prevent SQL Injection in Login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "'; DROP TABLE users;--", password: "password" });
    expect(res.statusCode).toBe(401);
  });

  test("Rate Limiting and Brute Force Protection", async () => {
    const username = `user_${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ username, password: "WrongPassword" });
      expect([401, 429]).toContain(res.statusCode);
    }
  });

  test("Input Validation for Age", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ 
        username: `user_${Date.now()}`, 
        password: "Test@123", 
        email: "test@example.com", 
        age: "-5"  
      });
    expect([400, 422]).toContain(res.statusCode);
  });
});