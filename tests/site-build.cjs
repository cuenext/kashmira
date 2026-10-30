const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Catch a domain cutover that leaves Arabic, crawlers or nested 404s on the old host/base.
const root = path.resolve(__dirname, '..');
for (const [url, base] of [
  ['https://cuenext.github.io/kashmira/', '/kashmira/'],
  ['https://www.drkashmira.com/', '/']
]) {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'kashmira-build-'));
  try {
    for (const folder of ['scripts', 'data']) fs.mkdirSync(path.join(fixture, folder));
    fs.copyFileSync(path.join(root, 'scripts/build.mjs'), path.join(fixture, 'scripts/build.mjs'));
    if (fs.existsSync(path.join(root, 'scripts/templates'))) {
      fs.cpSync(path.join(root, 'scripts/templates'), path.join(fixture, 'scripts/templates'), { recursive: true });
    }
    for (const file of ['practices.json', 'cases.json', 'case-categories.json']) {
      fs.copyFileSync(path.join(root, 'data', file), path.join(fixture, 'data', file));
    }
    fs.writeFileSync(path.join(fixture, 'data/site.json'), JSON.stringify({
      url, confirmedDomain: 'www.drkashmira.com', contactEmail: 'contact@drkashmira.com', updated: '2026-10-30'
    }));
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: fixture, stdio: 'pipe' });
    const read = file => fs.readFileSync(path.join(fixture, file), 'utf8');
    for (const file of ['index.html', 'about.html', 'cases.html', 'contact.html', 'arabic.html']) {
      const html = read(file);
      const canonical = url + (file === 'index.html' ? '' : file);
      assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), file + ' canonical');
      assert.ok(html.includes('mailto:contact@drkashmira.com'), file + ' contact link');
      assert.doesNotMatch(html, /[\w.+-]+@gmail\.com/i, file + ' obsolete Gmail');
      assert.ok(html.includes(`content="${canonical}"`), file + ' social URL');
      const graphs = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
      assert.ok(graphs.some(graph => graph['@graph'].some(node => node.email === 'contact@drkashmira.com')), file + ' doctor schema');
      if (url.includes('drkashmira.com')) assert.doesNotMatch(html, /cuenext\.github\.io\/kashmira/);
    }
    const home = read('index.html');
    for (const [language, target] of [['en', url], ['ar', url + 'arabic.html']]) {
      const alternate = `<link rel="alternate" hreflang="${language}" href="${target}">`;
      assert.ok(home.includes(alternate), 'Home alternate ' + language);
      assert.ok(read('arabic.html').includes(alternate), 'Arabic alternate ' + language);
    }
    for (const file of ['', 'about.html', 'cases.html', 'contact.html', 'arabic.html']) {
      assert.ok(read('sitemap.xml').includes(`<loc>${url + file}</loc>`));
    }
    assert.ok(read('robots.txt').includes(`Sitemap: ${url}sitemap.xml`));
    assert.ok(read('404.html').includes(`<base href="${base}">`));
    assert.ok(read('contact.html').includes('data-contact-email="contact@drkashmira.com"'));
    const firstBuild = ['index.html', 'arabic.html', 'robots.txt', 'sitemap.xml'].map(read);
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: fixture, stdio: 'pipe' });
    assert.deepEqual(['index.html', 'arabic.html', 'robots.txt', 'sitemap.xml'].map(read), firstBuild, 'Rebuild is deterministic');
    console.log('PASS generated contact/schema/canonical/alternates/crawlers/404 and rebuild: ' + url);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
}
