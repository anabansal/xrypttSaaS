import { Router } from 'express';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';

const router = Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
        res.header('Content-Type', 'application/xml');
        res.header('Content-Encoding', 'gzip');

        const smStream = new SitemapStream({ hostname: 'https://www.xryptt.com' });
        const pipeline = smStream.pipe(createGzip());

        // Add pages to sitemap
        smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
        smStream.write({ url: '/pricing', changefreq: 'weekly', priority: 0.8 });
        smStream.write({ url: '/wallet-tracker', changefreq: 'weekly', priority: 0.7 });
        smStream.write({ url: '/token-analyzer', changefreq: 'weekly', priority: 0.7 });
        smStream.write({ url: '/portfolio-viewer', changefreq: 'weekly', priority: 0.7 });
        smStream.write({ url: '/about-us', changefreq: 'monthly', priority: 0.5 });

        smStream.end();

        streamToPromise(pipeline).then((sm) => res.send(sm)).catch((err) => console.error(err));
    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

export default router;
