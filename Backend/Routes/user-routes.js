const express = require('express');
const { signup, userlogin } = require('../Controllers/user-controller.js');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', userlogin);

module.exports = router;
