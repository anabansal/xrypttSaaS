const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const express = require('express');
const router = express.Router();

const links = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/pricing', changefreq: 'monthly', priority: 0.8 },
    { url: '/wallet-tracker', changefreq: 'weekly', priority: 0.9 },
    { url: '/token-analyzer', changefreq: 'weekly', priority: 0.9 },
    { url: '/portfolio-viewer', changefreq: 'weekly', priority: 0.9 },
    { url: '/about-us', changefreq: 'yearly', priority: 0.5 },
    { url: '/privacy-policy', changefreq: 'yearly', priority: 0.3 }
];

router.get('/sitemap.xml', async (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    const smStream = new SitemapStream({ hostname: 'https://www.xryptt.com' });
    const pipeline = smStream.pipe(createGzip());

    links.forEach((link) => smStream.write(link));
    smStream.end();

    streamToPromise(pipeline).then((sm) => res.send(sm));
});

module.exports = router;
