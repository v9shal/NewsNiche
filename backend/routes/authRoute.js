const express = require('express');
const AuthController=require("../controllers/authcontroller")
const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/verify', AuthController.verify);
router.post('/logout', AuthController.logout);

module.exports = router;