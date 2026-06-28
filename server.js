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
const ENGAGEMENT_FILE = path.join(ROOT, 'data', 'engagement.json');

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
  try {
    fs.mkdirSync(path.dirname(ENGAGEMENT_FILE), { recursive: true });
    if (fs.existsSync(ENGAGEMENT_FILE)) {
      return JSON.parse(fs.readFileSync(ENGAGEMENT_FILE, 'utf8'));
    }
  } catch {
    // ignore
  }
  return {};
}

function saveEngagement() {
  fs.mkdirSync(path.dirname(ENGAGEMENT_FILE), { recursive: true });
  fs.writeFileSync(ENGAGEMENT_FILE, JSON.stringify(engagement, null, 2));
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

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=UTF-8' });
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
    const localPath = path.join(ROOT, pathname);
    if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
      serveFile(res, localPath);
      return;
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
    const stats = incrementLike(itemPath);
    sendJson(res, 200, { success: true, count: stats.likes });
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
