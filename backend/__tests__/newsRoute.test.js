const request = require("supertest");
const app = require("../server");
const axios = require("axios");
const axiosMock = new (require("axios-mock-adapter"))(axios);
const jwt = require("jsonwebtoken");

jest.mock("../models/bookmark");
jest.mock("../services/sentimentService"); 
const BookMark = require("../models/bookmark");
const sentimentService = require("../services/sentimentService");

describe("News Route Tests", () => {
  const mockUser = { username: "testuser", id: 1 };
  const secretKey = "fallback_secret"; 
  const token = jwt.sign(mockUser, secretKey);

  beforeEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
  });
  const generateToken = (user) => {
    return jwt.sign(user, secretKey);
  };

  test("GET /fetchLiveNewsByCategory - Successfully fetches news articles for a given category", async () => {
    axiosMock
      .onGet(/https:\/\/newsapi\.org\/v2\/top-headlines.*/)
      .reply(200, { articles: [{ title: "Test Article" }] });

    const res = await request(app).get("/api/news/fetchLiveNewsByCategory?category=business");

    expect(res.status).toBe(200);
    expect(res.body.articles.length).toBeGreaterThan(0);
  });

  test("GET /fetchLiveNewsByCategory - No articles found for the specified category", async () => {
    axiosMock.onGet(/https:\/\/newsapi\.org\/v2\/top-headlines.*/).reply(200, { articles: [] });

    const res = await request(app).get("/api/news/fetchLiveNewsByCategory?category=business");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No news articles found");
  });

  test("POST /bookmarks - Successfully saves a news article as a bookmark", async () => {
    BookMark.isBookmarked.mockResolvedValue(false);
    BookMark.createBookmark.mockResolvedValue({ insertId: 123 });
    sentimentService.analyzeArticle.mockReturnValue({ score: 0.5, sentiment: "positive" }); // Mock sentiment analysis

    const res = await request(app)
      .post("/api/news/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Article", author: "John Doe", articleId: "123", url: "http://example.com", description: "test description" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    expect(BookMark.createBookmark).toHaveBeenCalledWith(
      mockUser.username,
      "Test Article",
      "John Doe",
      "123",
      "http://example.com",
      0.5,
      "positive"
    );
  });

  test("POST /bookmarks - Returns an error if article is already bookmarked", async () => {
    BookMark.isBookmarked.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/news/bookmarks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Article" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Article already bookmarked");
  });

  test("GET /bookmarks/fetchbookmark - Successfully fetches user bookmarks", async () => {
    BookMark.getBookmarksByUserId.mockResolvedValue([
      { title: "Saved Article", url: "http://example.com" },
    ]);

    const res = await request(app)
      .get("/api/news/bookmarks/fetchbookmark")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookmarks.length).toBeGreaterThan(0);
  });

  test("GET /bookmarks/fetchbookmark - Returns empty array when no bookmarks are found for user", async () => {
    BookMark.getBookmarksByUserId.mockResolvedValue([]);

    const res = await request(app)
      .get("/api/news/bookmarks/fetchbookmark")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.bookmarks.length).toBe(0);
  });

  test("DELETE /bookmarks/:bookmarkId - Successfully deletes a bookmark", async () => {
    BookMark.deleteBookmark.mockResolvedValue({ affectedRows: 1 });

    const res = await request(app)
      .delete(`/api/bookmark/removeBookmark/${mockUser.username}/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Bookmark deleted successfully");
  });

  test("DELETE /bookmarks/:bookmarkId - Returns an error if bookmark is not found", async () => {
    BookMark.deleteBookmark.mockResolvedValue({ affectedRows: 0 });

    const res = await request(app)
      .delete(`/api/bookmark/removeBookmark/${mockUser.username}/1`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Bookmark not found");
  });

  test("GET /moodInsights - Successfully retrieves user mood insights", async () => {
    BookMark.getMoodInsights.mockResolvedValue([
      { sentiment: "positive", count: 5, average_score: 0.6 },
      { sentiment: "neutral", count: 3, average_score: 0.1 },
    ]);

    const res = await request(app)
      .get(`/api/bookmark/moodInsights/${mockUser.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.insights.length).toBe(2);
    expect(res.body.overall.mood).toBe("positive");
  });

  test("GET /moodInsights - Returns a message if no mood insights are available", async () => {
    BookMark.getMoodInsights.mockResolvedValue([]);

    const res = await request(app)
      .get(`/api/bookmark/moodInsights/${mockUser.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("No mood insights available yet");
  });

  test("GET /moodInsights - Returns an error if fail to get mood insights", async () => {
    BookMark.getMoodInsights.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get(`/api/bookmark/moodInsights/${mockUser.username}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Failed to retrieve mood insights");
  });
});