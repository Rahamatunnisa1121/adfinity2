const server = require('../server');

function resolveRequestUrl(req) {
  const original =
    req.headers['x-vercel-original-url'] ||
    req.headers['x-original-url'] ||
    req.headers['x-invoke-path'];

  if (typeof original === 'string' && original.startsWith('/')) {
    return original;
  }

  return req.url || '/';
}

module.exports = (req, res) => {
  req.url = resolveRequestUrl(req);
  server.emit('request', req, res);
};
