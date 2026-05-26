import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://interview-handbook.co.kr';

async function generateSitemap() {
  try {
    // 1. Read questions.json to extract length
    const questionsJsonPath = path.resolve(__dirname, '../../backend/src/main/resources/questions.json');
    if (!fs.existsSync(questionsJsonPath)) {
      console.error(`Error: questions.json not found at ${questionsJsonPath}`);
      process.exit(1);
    }
    
    const questionsRaw = fs.readFileSync(questionsJsonPath, 'utf8');
    const questions = JSON.parse(questionsRaw);
    
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
    questions.forEach((_, index) => {
      const qId = index + 1; // Auto-increment matching rule in DB Seeding
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${DOMAIN}/?questionId=${qId}</loc>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.6</priority>\n`;
      sitemap += `  </url>\n`;
    });
    
    sitemap += '</urlset>\n';
    
    // 3. Write to public directory
    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    
    // Ensure public folder exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, sitemap, 'utf8');
    console.log(`Successfully generated sitemap.xml with ${questions.length + 2} URLs.`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
