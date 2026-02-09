
const fs = require('fs');
const path = require('path');

// 1. Load Translations
const translationsContent = fs.readFileSync('translations.js', 'utf8');
const getTranslations = new Function(translationsContent + '; return translations;');
const translations = getTranslations();

const languages = Object.keys(translations);
console.log(`Loaded languages: ${languages.join(', ')}`);

const enKeys = new Set(Object.keys(translations['en']));
const uaKeys = new Set(Object.keys(translations['ua']));

// Check for consistency between languages
const missingInUa = [...enKeys].filter(k => !uaKeys.has(k));
const missingInEn = [...uaKeys].filter(k => !enKeys.has(k));

if (missingInUa.length > 0) console.log('Keys missing in UA:', missingInUa);
if (missingInEn.length > 0) console.log('Keys missing in EN:', missingInEn);

// 2. Scan HTML files recursively
function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.html')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const htmlFiles = getAllFiles(__dirname);
const usedKeys = new Set();
const brokenLinks = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  // Regex for data-i18n attributes
  const regexes = [
    /data-i18n="([^"]+)"/g,
    /data-i18n-tooltip="([^"]+)"/g,
    /data-i18n-placeholder="([^"]+)"/g,
    /data-i18n-title="([^"]+)"/g
  ];

  regexes.forEach(regex => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      usedKeys.add(match[1]);
    }
  });

  // Check links
  const linkRegex = /href="([^"]+)"/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(content)) !== null) {
    const link = linkMatch[1];
    if (link.startsWith('#') || link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('javascript:')) continue;
    
    // Construct absolute path
    let targetPath = path.resolve(dir, link);
    
    // Remove query params or anchors
    targetPath = targetPath.split('#')[0].split('?')[0];

    if (!fs.existsSync(targetPath)) {
         brokenLinks.push({ file: path.relative(__dirname, file), link });
    }
  }
});

// 3. Report Missing Keys
const missingKeys = [...usedKeys].filter(k => !enKeys.has(k));
if (missingKeys.length > 0) {
  console.log('Missing translation keys (used in HTML but not in translations.js):');
  missingKeys.forEach(k => console.log(` - ${k}`));
} else {
  console.log('All used translation keys are present.');
}

if (brokenLinks.length > 0) {
    console.log('Broken internal links:');
    brokenLinks.forEach(item => console.log(` - In ${item.file}: ${item.link}`));
} else {
    console.log('No broken internal links found.');
}
