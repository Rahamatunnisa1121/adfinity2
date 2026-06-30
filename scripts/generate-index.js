const fs = require('fs');
const path = require('path');
const { getCategories, getPortfolio } = require('../lib/portfolio');
const { renderListingPage } = require('../lib/render');

const ROOT = path.join(__dirname, '..');
const categories = getCategories();
const total = getPortfolio().length;

const html = renderListingPage({
  categories,
  activeHome: true,
  total,
  page: 0,
});

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`index.html generated with ${total} portfolio items`);
