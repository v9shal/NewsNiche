const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

jest.mock("../models/userModel");
jest.mock("bcrypt");
const bcrypt = require("bcrypt");

describe("Auth API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /*** 1. User Registration ***/
  test("POST /api/auth/register - Successfully registers a new user", async () => {
    // Mock the UserModel's methods
    UserModel.getUserByUsername = jest.fn().mockResolvedValue(null); // User doesn't exist
    UserModel.createUser = jest.fn().mockResolvedValue({ insertId: 1 }); // Successful creation
    bcrypt.hash = jest.fn().mockResolvedValue("hashedpassword123");

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        password: "testpass123",
        email: "testuser@example.com",
        age: 25
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created successfully");
    expect(res.body.user).toHaveProperty("username", "testuser");
    expect(res.body.user).toHaveProperty("role", "user");
    expect(UserModel.createUser).toHaveBeenCalledWith(
      "testuser", 
      "hashedpassword123", 
      "testuser@example.com",
      25
    );
    // Check that a cookie was set
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('authToken');
  });

  test("POST /api/auth/register - Returns error if username already exists", async () => {
    // Mock that user already exists
    UserModel.getUserByUsername = jest.fn().mockResolvedValue({ id: 1, username: "testuser" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        password: "testpass123",
        email: "testuser@example.com",
        age: 25
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Username already exists");
    expect(UserModel.createUser).not.toHaveBeenCalled();
  });

  test("POST /api/auth/register - Returns error if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser"
        // Missing other required fields
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  test("POST /api/auth/register - Returns error if age is less than 12", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        username: "testuser",
        password: "testpass123",
        email: "testuser@example.com",
        age: 10
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Age should be greater than 12");
  });

  /*** 2. User Login ***/
  test("POST /api/auth/login - Successfully logs in a user", async () => {
    // Mock user found with correct password
    UserModel.getUserByUsername = jest.fn().mockResolvedValue({
      id: 1,
      username: "testuser",
      password: "hashedpass123",
      role: "user"
    });
    
    // Mock bcrypt compare to return true (password matches)
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "testuser",
        password: "testpass123"
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.user).toHaveProperty("username", "testuser");
    expect(res.body.user).toHaveProperty("role", "user");
    
    // Check that a cookie was set
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('authToken');
  });

  test("POST /api/auth/login - Returns error for non-existent user", async () => {
    // Mock user not found
    UserModel.getUserByUsername = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "nonexistentuser",
        password: "testpass123"
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid username or password");
  });

  test("POST /api/auth/login - Returns error for incorrect password", async () => {
    // Mock user found
    UserModel.getUserByUsername = jest.fn().mockResolvedValue({
      id: 1,
      username: "testuser",
      password: "hashedpass123" 
    });
    
    // Mock bcrypt compare to return false (password doesn't match)
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "testuser",
        password: "wrongpassword"
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid username or password");
  });

  test("POST /api/auth/login - Returns error if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        username: "testuser"
        // Missing password
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  /*** 3. Token Verification ***/
  test("GET /api/auth/verify - Successfully verifies a valid token", async () => {
    // Create a token and set it in the cookie
    const user = { id: 1, username: "testuser" };
    const token = jwt.sign(
      user, 
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: '24h' }
    );

    // Mock jwt.verify to return the decoded token
    jwt.verify = jest.fn().mockReturnValue(user);
    
    // Mock the user found in database
    UserModel.getUserByUsername = jest.fn().mockResolvedValue({
      id: 1,
      username: "testuser",
      role: "user"
    });

    const res = await request(app)
      .get("/api/auth/verify")
      .set("Cookie", [`authToken=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("authorized");
    expect(res.body.user).toHaveProperty("username", "testuser");
    expect(res.body.user).toHaveProperty("role", "user");
    expect(res.body.user).toHaveProperty("token", token);
  });

  test("GET /api/auth/verify - Returns error when no token cookie is provided", async () => {
    const res = await request(app)
      .get("/api/auth/verify");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("No token present");
  });

  test("GET /api/auth/verify - Returns error for invalid token", async () => {
    // Mock jwt.verify to throw an error
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const res = await request(app)
      .get("/api/auth/verify")
      .set("Cookie", ["authToken=invalidtoken"]);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  test("GET /api/auth/verify - Returns error when user doesn't exist", async () => {
    // Create a token
    const user = { id: 1, username: "testuser" };
    const token = jwt.sign(
      user, 
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: '24h' }
    );

    // Mock jwt.verify to return the decoded token
    jwt.verify = jest.fn().mockReturnValue(user);
    
    // Mock user not found in database
    UserModel.getUserByUsername = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .get("/api/auth/verify")
      .set("Cookie", [`authToken=${token}`]);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("User not found");
  });

  /*** 4. User Logout ***/
  test("POST /api/auth/logout - Successfully logs out a user", async () => {
    const res = await request(app)
      .post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
    
    // Verify that the cookie was cleared
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('authToken=;');
  });
});