import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://interview-prep-handbook-1xr5.vercel.app';

async function generateSitemap() {
  try {
    const questionsJsonPath = path.resolve(__dirname, '../../backend/src/main/resources/questions.json');
    const metadataPath = path.resolve(__dirname, './questions-metadata.json');
    
    let count = 0;
    
    if (fs.existsSync(questionsJsonPath)) {
      // Local development: Read backend questions.json and update local metadata
      const questionsRaw = fs.readFileSync(questionsJsonPath, 'utf8');
      const questions = JSON.parse(questionsRaw);
      count = questions.length;
      
      // Update local metadata file for Vercel builds
      fs.writeFileSync(metadataPath, JSON.stringify({ count }, null, 2), 'utf8');
      console.log(`[Local] Updated questions-metadata.json with count: ${count}`);
    } else if (fs.existsSync(metadataPath)) {
      // Vercel build: Read from the committed questions-metadata.json
      const metadataRaw = fs.readFileSync(metadataPath, 'utf8');
      const metadata = JSON.parse(metadataRaw);
      count = metadata.count || 0;
      console.log(`[Vercel] Loaded question count from metadata: ${count}`);
    } else {
      // Fallback: Default to a safe estimated count so the build never crashes
      count = 443;
      console.warn(`[Fallback] questions.json and questions-metadata.json not found. Defaulting to: ${count}`);
    }
    
    // 2. Build sitemap XML header
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add Main Page (Handbook)
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${DOMAIN}/</loc>\n`;
    sitemap += `    <changefreq>daily</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;
    
    // Add Mock Interview Setup Page
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${DOMAIN}/?mode=interview</loc>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.8</priority>\n`;
    sitemap += `  </url>\n`;
    
    // Add each question detail page
    for (let i = 0; i < count; i++) {
      const qId = i + 1; // Auto-increment matching rule in DB Seeding
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${DOMAIN}/?questionId=${qId}</loc>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.6</priority>\n`;
      sitemap += `  </url>\n`;
    }
    
    sitemap += '</urlset>\n';
    
    // 3. Write to public directory
    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    
    // Ensure public folder exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, sitemap, 'utf8');
    console.log(`Successfully generated sitemap.xml with ${count + 2} URLs.`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
