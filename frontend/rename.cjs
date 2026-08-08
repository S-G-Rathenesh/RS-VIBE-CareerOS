const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'public'),
  __dirname
];

const EXTENSIONS = ['.ts', '.tsx', '.html', '.json', '.md'];
const IGNORE_DIRS = ['node_modules', 'dist', 'build', '.git'];

function walkAndReplace(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        walkAndReplace(fullPath);
      }
    } else {
      if (EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/ExploreMe AI/g, 'RS VIBE CareerOS');
        newContent = newContent.replace(/ExploreMe/g, 'RS VIBE CareerOS');
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

DIRECTORIES.forEach(dir => {
  if (dir === __dirname) {
    ['index.html', 'package.json', 'README.md'].forEach(f => {
      const p = path.join(__dirname, f);
      if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        let newContent = content.replace(/ExploreMe AI/g, 'RS VIBE CareerOS').replace(/ExploreMe/g, 'RS VIBE CareerOS');
        if (content !== newContent) {
          fs.writeFileSync(p, newContent, 'utf8');
          console.log(`Updated: ${p}`);
        }
      }
    });
  } else {
    walkAndReplace(dir);
  }
});

// Fix backend as well
const backendDir = path.join(__dirname, '../backend');
function walkBackend(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['venv', '.git', '__pycache__'].includes(file)) walkBackend(fullPath);
    } else {
      if (fullPath.endsWith('.py') || fullPath.endsWith('.md') || fullPath.endsWith('.yaml')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let newContent = content.replace(/ExploreMe AI/g, 'RS VIBE CareerOS').replace(/ExploreMe/g, 'RS VIBE CareerOS');
        if (content !== newContent) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}
walkBackend(backendDir);
console.log('Rebranding complete.');
