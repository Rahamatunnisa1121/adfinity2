const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

function copyDir(name) {
  const src = path.join(ROOT, name);
  const dest = path.join(PUBLIC, name);
  if (!fs.existsSync(src)) {
    console.warn(`Skip missing folder: ${name}`);
    return;
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Copied ${name}/ -> public/${name}/`);
}

fs.mkdirSync(PUBLIC, { recursive: true });
copyDir('resources');
copyDir('uploads');
