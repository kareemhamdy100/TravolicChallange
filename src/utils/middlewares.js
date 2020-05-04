function requestLogger(request, response, next) {
    console.log('Method:', request.method);
    console.log('Host:', request.hostname);
    console.log('Body:', request.body);
    console.log('======');
    next();
}





function unknownEndpoint(request, response) {
    response.status(404).json({
        error: 'unknown endpoint',
    });
}


function errorHandler(error, request, response, next) {
    console.error(`[!] ${error.name}: ${error.message}`);

    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
    }

    next(error);
}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
};