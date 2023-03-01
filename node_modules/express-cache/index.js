module.exports = function(options) {
    options = options || {};
    options.redis = options.redis || {};

    var redis = require('redis').createClient(options.redis.port, options.redishost, options.redis.options);

    if (options.redis.password) {
        redis.auth(redis.options.password);
    }

    return function(req, res, next) {
        if (options.testMode) {
            res.cache = function() {
                return this;
            }
            return next();
        }

        var end = res.end,
            write = res.write,
            cache = [],
            key = req.originalUrl;

        redis.get(key, function(error, reply) {
            if (error) {
                return next();
            } else if (reply) {
                res.set('Content-Type', 'application/json');
                res.end(reply);
            } else {
                res.cache = function(timeout) {

                    if (!timeout) {
                        return this;
                    }

                    res.write = function(chunk, encoding) {
                        cache.push(chunk)
                        write.call(res, chunk, encoding);
                    }

                    res.end = function(chunk, encoding) {
                        if (chunk) this.write(chunk, encoding);

                        redis.setex(key, timeout, cache.join(''));

                        end.call(res);
                    };
                    return this;
                };
                return next();
            }
        });
    }
}