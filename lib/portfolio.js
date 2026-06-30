const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORTFOLIO_FILE = path.join(ROOT, 'data', 'portfolio.json');
const CATEGORIES_FILE = path.join(ROOT, 'data', 'categories.json');
const HOMEPAGE_ORDER_FILE = path.join(ROOT, 'data', 'homepage-order.json');
const PAGE_SIZE = 30;

let portfolio = null;
let categories = null;
let byPath = null;
let homepageOrder = null;
let dataMtime = 0;

function getDataMtime() {
  const files = [PORTFOLIO_FILE, CATEGORIES_FILE, HOMEPAGE_ORDER_FILE];
  return Math.max(
    ...files
      .filter((file) => fs.existsSync(file))
      .map((file) => fs.statSync(file).mtimeMs),
  );
}

function ensureFreshData() {
  const mtime = getDataMtime();
  if (!portfolio || mtime !== dataMtime) {
    portfolio = null;
    categories = null;
    byPath = null;
    homepageOrder = null;
    loadData();
    dataMtime = mtime;
  }
}

function loadData() {
  portfolio = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, 'utf8'));
  categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  byPath = new Map(
    portfolio.map((item) => [`/${item.category}/${item.slug}`, item]),
  );
}

function reloadData() {
  portfolio = null;
  categories = null;
  byPath = null;
  homepageOrder = null;
  dataMtime = 0;
  ensureFreshData();
}

function getPortfolio() {
  ensureFreshData();
  return portfolio;
}

function getCategories() {
  ensureFreshData();
  return categories;
}

function getCategoryById(id) {
  return getCategories().find((cat) => cat.id === id) || null;
}

function getItemByPath(pathname) {
  ensureFreshData();
  return byPath.get(pathname) || null;
}

function getItemPath(item) {
  return `/${item.category}/${item.slug}`;
}

function loadHomepageOrder() {
  if (homepageOrder) return homepageOrder;

  if (fs.existsSync(HOMEPAGE_ORDER_FILE)) {
    homepageOrder = JSON.parse(fs.readFileSync(HOMEPAGE_ORDER_FILE, 'utf8'));
    return homepageOrder;
  }

  const cats = getCategories();
  const order = [];
  const maxLen = Math.max(...cats.map((cat) => cat.itemSlugs.length), 0);

  for (let i = 0; i < maxLen; i += 1) {
    cats.forEach((cat) => {
      const slug = cat.itemSlugs[i];
      if (slug) order.push(`/${cat.id}/${slug}`);
    });
  }

  homepageOrder = order;
  return homepageOrder;
}

function getHomepageItems() {
  ensureFreshData();
  return loadHomepageOrder()
    .map((itemPath) => byPath.get(itemPath))
    .filter(Boolean);
}

function getItems({ categoryId = null, mixedHomepage = false } = {}) {
  if (mixedHomepage && !categoryId) {
    return getHomepageItems();
  }

  let items = getPortfolio();

  if (categoryId) {
    items = items.filter((item) => item.category === categoryId);
  }

  return items;
}

function paginateItems(items, page) {
  const start = Number(page) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

function getAdjacentItems(item) {
  const category = getCategoryById(item.category);
  if (!category) return { prev: null, next: null };

  const slugs = category.itemSlugs;
  const index = slugs.indexOf(item.slug);
  const prevSlug = index > 0 ? slugs[index - 1] : null;
  const nextSlug = index >= 0 && index < slugs.length - 1 ? slugs[index + 1] : null;

  return {
    prev: prevSlug ? getItemByPath(`/${item.category}/${prevSlug}`) : null,
    next: nextSlug ? getItemByPath(`/${item.category}/${nextSlug}`) : null,
  };
}

function isCategoryPath(pathname) {
  const cat = getCategoryById(pathname.slice(1));
  return cat || null;
}

function isDetailPath(pathname) {
  return getItemByPath(pathname) || null;
}

const ABOUT_SHOWCASE_PICKS = [
  { categoryId: 'logo-designs', slug: 'car-craft' },
  { categoryId: 'packaging-designs', slug: 'panthera-feed' },
  { categoryId: 'business-cards', slug: 'aar-consultants' },
  { categoryId: 'brochure-designs', slug: 'film-nagar' },
];

function getAboutShowcaseItems() {
  return ABOUT_SHOWCASE_PICKS.map(({ categoryId, slug }) => {
    const item =
      getItemByPath(`/${categoryId}/${slug}`) ||
      getItems({ categoryId })[0];
    if (!item) return null;
    return {
      href: `/${item.category}/${item.slug}`,
      thumbnail: item.thumbnail,
      title: item.title,
    };
  }).filter(Boolean);
}

module.exports = {
  PAGE_SIZE,
  reloadData,
  getPortfolio,
  getCategories,
  getCategoryById,
  getItemByPath,
  getItemPath,
  getItems,
  getAboutShowcaseItems,
  paginateItems,
  getAdjacentItems,
  isCategoryPath,
  isDetailPath,
};
