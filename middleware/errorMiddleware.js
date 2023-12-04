

const errorMiddleware = (err, req, res, next) => {
    // Log the error for debugging purposes
    console.error(err);

    // Handle the error and send an appropriate response to the client
    res.status(500).json({ error: 'Internal Server Error' });
};

module.exports = errorMiddleware;
