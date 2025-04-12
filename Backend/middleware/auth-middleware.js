const jwt = require('jsonwebtoken');

const authmiddleware = (req, res, next) => {
    console.log('Auth middleware is called');
    
    const authheader = req.header("authorization"); // Use parentheses instead of brackets for the method call
    console.log(authheader);

    const token = authheader && authheader.split(" ")[1]; // Extract the token from the "Bearer <token>" format

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied, no token provided',
        });
    }

    // Decode the token
    try {
        const decodedtoken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decodedtoken);
        req.userInfo = decodedtoken; // Attach decoded token info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Invalid token',
        });
    }
};

