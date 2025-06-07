/**
 * Development Server - Serve templates locally for development
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { processConfig } from './lib/config.js';
import { processTemplate } from './token-replacement/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Simple HTTP server to serve static files
 */
function createServer(rootDir, port = 3000) {
    const projectRoot = path.resolve(__dirname, '..');
    
    const server = http.createServer((req, res) => {
        let filePath;
        
        // Handle asset requests - serve from project root assets directory
        if (req.url.includes('/assets/')) {
            // Extract the asset path (e.g., from "../../assets/brillnt-logo.png" or "/assets/brillnt-logo.png")
            const assetPath = req.url.split('/assets/')[1];
            filePath = path.join(projectRoot, 'assets', assetPath);
        } else {
            // Serve template files from temp directory
            filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
        }
        
        // Security check - prevent directory traversal for template files
        if (!req.url.includes('/assets/') && !filePath.startsWith(rootDir)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        
        // Determine content type
        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        };
        
        const contentType = contentTypes[ext] || 'text/plain';
        
        // Serve file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Internal Server Error');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
    
    return server;
}

/**
 * Generate index.html with links to all slides
 */
function generateIndex(slides, templateName) {
    const slideLinks = slides.map(slide => 
        `<li><a href="${slide}" target="_blank">${slide}</a></li>`
    ).join('\n        ');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName} - Development Server</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; }
        a { display: block; padding: 10px; background: #f5f5f5; text-decoration: none; color: #333; border-radius: 5px; }
        a:hover { background: #e5e5e5; }
        .info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>${templateName} - Development Server</h1>
    <div class="info">
        <strong>Development Mode:</strong> Templates are served with development configuration and asset paths.
    </div>
    <h2>Available Slides:</h2>
    <ul>
        ${slideLinks}
    </ul>
</body>
</html>`;
}

/**
 * Main serve function
 */
async function serveTemplate(templateName) {
    try {
        console.log(`🚀 Development Server Starting...`);
        console.log(`📋 Template: ${templateName}`);
        
        // Check if template exists
        const templateDir = path.join(__dirname, '..', 'templates', templateName);
        if (!fs.existsSync(templateDir)) {
            console.error(`❌ Template directory not found: templates/${templateName}/`);
            console.error(`Available templates:`);
            const templatesDir = path.join(__dirname, '..', 'templates');
            if (fs.existsSync(templatesDir)) {
                const templates = fs.readdirSync(templatesDir, { withFileTypes: true })
                    .filter(entry => entry.isDirectory())
                    .map(entry => entry.name);
                templates.forEach(name => console.error(`  - ${name}`));
            }
            process.exit(1);
        }
        
        // Load development config
        const configPath = path.join(__dirname, '..', 'configs', 'dev', `${templateName}.json`);
        if (!fs.existsSync(configPath)) {
            console.error(`❌ Development config not found: configs/dev/${templateName}.json`);
            process.exit(1);
        }
        
        const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const config = processConfig(rawConfig);
        
        // Add system tokens for development context
        config.asset_path = '../../assets';
        console.log(`📖 Config: configs/dev/${templateName}.json`);
        console.log(`👤 Client: ${config.client_name}`);
        
        // Create temp directory for this template
        const tempDir = path.join(__dirname, '..', 'temp', templateName);
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });
        
        // Process all HTML files in template directory
        const templateFiles = fs.readdirSync(templateDir)
            .filter(file => file.endsWith('.html'))
            .sort();
        
        console.log(`🔍 Found ${templateFiles.length} template files`);
        
        const processedSlides = [];
        
        for (const file of templateFiles) {
            const templatePath = path.join(templateDir, file);
            const outputPath = path.join(tempDir, file);
            
            console.log(`✅ Processing: ${file}`);
            
            // Process template with token replacement
            const result = await processTemplate(templatePath, config);
            
            if (!result.success) {
                console.error(`❌ Failed to process ${file}:`, result.error);
                continue;
            }
            
            // Apply asset_path replacement (development context) - should already be handled by token replacement
            let finalContent = result.content;
            
            // Write processed file
            fs.writeFileSync(outputPath, finalContent);
            processedSlides.push(file);
        }
        
        // Generate index.html
        const indexContent = generateIndex(processedSlides, templateName);
        fs.writeFileSync(path.join(tempDir, 'index.html'), indexContent);
        
        // Start HTTP server
        const port = 3000;
        const server = createServer(tempDir, port);
        
        server.listen(port, () => {
            console.log(`📁 Temp directory: temp/${templateName}/`);
            console.log(`🌐 Server running at: http://localhost:${port}`);
            console.log(`📊 Processed: ${processedSlides.length} slides`);
            console.log(`✅ Development server ready!`);
            console.log(`\nPress Ctrl+C to stop the server`);
        });
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log(`\n🛑 Shutting down development server...`);
            server.close(() => {
                console.log(`✅ Server stopped`);
                process.exit(0);
            });
        });
        
    } catch (error) {
        console.error('❌ Development server failed:', error.message);
        process.exit(1);
    }
}

// Command line usage
if (process.argv.length < 3) {
    console.error('Usage: npm run serve -- <template-name>');
    console.error('Example: npm run serve -- discovery-agreement');
    process.exit(1);
}

const templateName = process.argv[2];
serveTemplate(templateName);

