const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const {
  PAGE_SIZE,
  getCategories,
  getItems,
  getAboutShowcaseItems,
  paginateItems,
  getItemByPath,
  isCategoryPath,
  isDetailPath,
  getAdjacentItems,
} = require('./lib/portfolio');
const { renderGridItems, renderListingPage, renderDetailPage, renderContactPage, renderAboutPage, SITE } = require('./lib/render');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

function getEngagementFile() {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'adfinity-engagement.json');
  }
  return path.join(ROOT, 'data', 'engagement.json');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

let engagement = loadEngagement();

function loadEngagement() {
  const engagementFile = getEngagementFile();

  try {
    if (fs.existsSync(engagementFile)) {
      return JSON.parse(fs.readFileSync(engagementFile, 'utf8'));
    }
  } catch {
    // ignore
  }

  const seedFile = path.join(ROOT, 'data', 'engagement.json');
  try {
    if (fs.existsSync(seedFile)) {
      return JSON.parse(fs.readFileSync(seedFile, 'utf8'));
    }
  } catch {
    // ignore
  }

  return {};
}

function saveEngagement() {
  try {
    fs.writeFileSync(getEngagementFile(), JSON.stringify(engagement, null, 2));
  } catch {
    // Vercel only allows writes to /tmp; keep in-memory stats if save fails.
  }
}

const LIKED_COOKIE = 'adf_liked';
const LIKED_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function parseCookieHeader(header) {
  const cookies = {};
  if (!header) return cookies;

  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    cookies[key] = decodeURIComponent(value);
  }

  return cookies;
}

function getLikedPaths(req) {
  const raw = parseCookieHeader(req.headers.cookie)[LIKED_COOKIE];
  if (!raw) return new Set();

  try {
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function appendSetCookie(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) {
    res.setHeader('Set-Cookie', cookie);
    return;
  }

  res.setHeader('Set-Cookie', Array.isArray(existing) ? [...existing, cookie] : [existing, cookie]);
}

function rememberLikedPath(res, likedPaths, itemPath) {
  likedPaths.add(itemPath);
  appendSetCookie(
    res,
    `${LIKED_COOKIE}=${encodeURIComponent(JSON.stringify([...likedPaths]))}; Path=/; Max-Age=${LIKED_COOKIE_MAX_AGE}; SameSite=Lax`,
  );
}

function getStats(itemPath) {
  return engagement[itemPath] || { views: 0, likes: 0 };
}

function incrementView(itemPath) {
  const stats = getStats(itemPath);
  stats.views += 1;
  engagement[itemPath] = stats;
  saveEngagement();
  return stats;
}

function incrementLike(itemPath) {
  const stats = getStats(itemPath);
  stats.likes += 1;
  engagement[itemPath] = stats;
  saveEngagement();
  return stats;
}

function resetEngagement() {
  engagement = {};
  saveEngagement();
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end(html);
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function resolveListingContext(pathname, query) {
  const categories = getCategories();
  const category = isCategoryPath(pathname);
  const searchQuery = pathname === '/search' ? query.get('q') : null;
  const categoryId = category ? category.id : null;
  const items = getItems({
    categoryId,
    query: searchQuery,
    mixedHomepage: pathname === '/',
  });

  return {
    categories,
    category,
    categoryId,
    searchQuery,
    items,
    total: items.length,
  };
}

function handleAjaxListing(req, res, pathname, query) {
  const page = Number(query.get('page') || 0);
  const context = resolveListingContext(pathname, query);
  const slice = paginateItems(context.items, page);
  const html = renderGridItems(slice, getStats);

  sendHtml(res, 200, html);
}

function handleListingPage(req, res, pathname, query) {
  const context = resolveListingContext(pathname, query);
  const sharePath = pathname === '/search' ? `${pathname}?q=${encodeURIComponent(context.searchQuery || '')}` : pathname;
  const html = renderListingPage({
    categories: context.categories,
    activeCategory: context.categoryId,
    total: context.total,
    page: 0,
    activeHome: pathname === '/',
    shareUrl: `${SITE.url}${sharePath === '/' ? '' : sharePath}`,
    searchTags: context.searchQuery ? [context.searchQuery] : [],
  });

  sendHtml(res, 200, html);
}

function handleDetailPage(req, res, pathname) {
  const item = isDetailPath(pathname);
  if (!item) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
    res.end('Not found');
    return;
  }

  const stats = incrementView(pathname);
  const { prev, next } = getAdjacentItems(item);
  const html = renderDetailPage(item, {
    categories: getCategories(),
    stats,
    prev,
    next,
  });

  sendHtml(res, 200, html);
}

const LEGACY_PREFIXES = [
  ['identity-designs', 'business-cards'],
  ['brochure-catalogue-designs', 'brochure-designs'],
  ['book-title-designs', 'book-titles'],
  ['shop-branding-designs', 'hoardings'],
];

function resolveLegacyRedirect(pathname) {
  for (const [oldPrefix, newPrefix] of LEGACY_PREFIXES) {
    const oldPath = `/${oldPrefix}`;
    if (pathname === oldPath || pathname.startsWith(`${oldPath}/`)) {
      return pathname.replace(oldPath, `/${newPrefix}`);
    }
  }
  return null;
}

function handleContactPage(req, res) {
  const html = renderContactPage({ categories: getCategories() });
  sendHtml(res, 200, html);
}

function handleAboutPage(req, res) {
  const categories = getCategories();
  const showcase = getAboutShowcaseItems();
  const html = renderAboutPage({ categories, showcase });
  sendHtml(res, 200, html);
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(parsed.pathname);

  const legacyRedirect = resolveLegacyRedirect(pathname);
  if (legacyRedirect && (req.method === 'GET' || req.method === 'HEAD')) {
    res.writeHead(301, { Location: `${legacyRedirect}${parsed.search}` });
    res.end();
    return;
  }

  if (pathname.startsWith('/uploads/') || pathname.startsWith('/resources/')) {
    const candidates = [
      path.join(ROOT, 'public', pathname),
      path.join(ROOT, pathname),
    ];
    for (const localPath of candidates) {
      if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
        serveFile(res, localPath);
        return;
      }
    }
  }

  if (pathname === '/__reset-engagement' && req.method === 'POST') {
    resetEngagement();
    sendJson(res, 200, { success: true, message: 'All views and likes reset to 0.' });
    return;
  }

  if (req.method === 'POST' && (pathname === '/subscribe' || pathname === '/contact')) {
    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === 'GET' && parsed.searchParams.get('appreciate') === 'true') {
    const itemPath = pathname;
    const likedPaths = getLikedPaths(req);
    const stats = getStats(itemPath);

    if (likedPaths.has(itemPath)) {
      sendJson(res, 200, { success: true, count: stats.likes, already: true });
      return;
    }

    rememberLikedPath(res, likedPaths, itemPath);
    const updated = incrementLike(itemPath);
    sendJson(res, 200, { success: true, count: updated.likes });
    return;
  }

  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
  const hasPage = parsed.searchParams.has('page');

  if (req.method === 'GET' && isDetailPath(pathname) && !parsed.searchParams.get('appreciate')) {
    handleDetailPage(req, res, pathname);
    return;
  }

  if (req.method === 'GET' && pathname === '/about') {
    handleAboutPage(req, res);
    return;
  }

  if (req.method === 'GET' && pathname === '/contact') {
    handleContactPage(req, res);
    return;
  }

  if (req.method === 'GET' && (pathname === '/' || pathname === '/search' || isCategoryPath(pathname))) {
    if (isAjax || hasPage) {
      handleAjaxListing(req, res, pathname, parsed.searchParams);
      return;
    }

    if (pathname === '/') {
      serveFile(res, path.join(ROOT, 'index.html'));
      return;
    }

    handleListingPage(req, res, pathname, parsed.searchParams);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
  res.end('Not found');
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Adfinity website running at http://localhost:${PORT}`);
    console.log('Portfolio served locally from data/portfolio.json');
    console.log('Reset stats: npm run reset-stats');
  });
}

module.exports = server;
