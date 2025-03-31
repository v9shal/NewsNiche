const request = require("supertest");
const app = require("../server");
const History = require("../models/history"); // Import the History model
const axios = require("axios");

jest.mock("../models/history"); // Mock the History model
jest.mock("axios");

describe("History Route Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /search - Successfully saves a search term", async () => {
    History.createHistory.mockResolvedValue(undefined); 

    const res = await request(app)
      .post("/api/bookmark/search")
      .send({ username: "testuser", keyword: "technology" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Search history updated");
    expect(History.createHistory).toHaveBeenCalledWith("testuser", "technology");
  });

  test("POST /search - Returns an error if saving fails", async () => {
    History.createHistory.mockRejectedValue(new Error("Database error")); // Mock a database error

    const res = await request(app)
      .post("/api/bookmark/search")
      .send({ username: "testuser", keyword: "technology" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to save search history");
  });

  test("GET /getHistory/:username - Successfully retrieves search history", async () => {
    History.getHistoryOfUser.mockResolvedValue(["technology", "science"]); 

    const res = await request(app).get("/api/bookmark/getHistory/testuser");

    expect(res.status).toBe(200);
    expect(res.body.history).toEqual(["technology", "science"]);
    expect(History.getHistoryOfUser).toHaveBeenCalledWith("testuser");
  });

  test("GET /getHistory/:username - Returns an error if retrieval fails", async () => {
    History.getHistoryOfUser.mockRejectedValue(new Error("Database error")); 

    const res = await request(app).get("/api/bookmark/getHistory/testuser");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch search history");
  });

  test("DELETE /deleteHistory/:username/:keyword - Successfully deletes a search term", async () => {
    History.deleteHistory.mockResolvedValue(undefined); 

    const res = await request(app).delete(
      "/api/bookmark/deleteHistory/testuser/technology"
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("history deleted successfully");
    expect(History.deleteHistory).toHaveBeenCalledWith("testuser", "technology");
  });

  test("DELETE /deleteHistory/:username/:keyword - Returns an error if deletion fails", async () => {
    History.deleteHistory.mockRejectedValue(new Error("Database error")); 

    const res = await request(app).delete(
      "/api/bookmark/deleteHistory/testuser/technology"
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("failed to delete Histroy");
  });

  test("GET /recommendations/:username - Successfully fetches recommendations (with history)", async () => {
    History.getHistoryOfUser.mockResolvedValue(["technology"]);
    
    axios.get.mockResolvedValue({
      data: {
        articles: [
          { 
            url: 'https://example.com/article1', 
            title: 'Test Technology Article' 
          }
        ]
      }
    });

    const res = await request(app).get("/api/bookmark/recommendations/testuser");

    expect(res.status).toBe(200);
    expect(res.body.keywords).toEqual(["technology"]);
    expect(res.body.news.length).toBeGreaterThan(0);
    expect(res.body.news[0]).toHaveProperty('article_id');
    expect(res.body.news[0]).toHaveProperty('link');
    expect(res.body.news[0]).toHaveProperty('category', 'technology');
  });

  test("GET /recommendations/:username - Returns empty arrays if no history is found", async () => {
    History.getHistoryOfUser.mockResolvedValue([]); 

    const res = await request(app).get("/api/bookmark/recommendations/testuser");

    expect(res.status).toBe(200);
    expect(res.body.keywords).toEqual([]);
    expect(res.body.news).toEqual([]);
    expect(res.body.message).toBe("No search history found");
  });

  test("GET /recommendations/:username - Handles errors during recommendation retrieval", async () => {
    History.getHistoryOfUser.mockRejectedValue(new Error("Database error")); 

    const res = await request(app).get("/api/bookmark/recommendations/testuser");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Failed to fetch recommendations");
  });

  
});