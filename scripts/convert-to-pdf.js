#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { getDisplayPath, getDisplayDir } = require('./path-utils');

async function convertToPDF(htmlFile, outputFile, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the HTML file first
    const htmlPath = path.resolve(htmlFile);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Wait for fonts and content to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get the actual content dimensions
    const dimensions = await page.evaluate(() => {
      const container = document.querySelector('.slide-container');
      if (!container) {
        return { width: 1280, height: 720 };
      }
      
      // Get the actual rendered dimensions
      const rect = container.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(container);
      
      // Use the larger of content height or min-height
      const minHeight = parseInt(computedStyle.minHeight) || 720;
      const actualHeight = Math.max(rect.height, minHeight);
      
      return {
        width: rect.width || 1280,
        height: actualHeight
      };
    });
    
    console.log(`📐 Content dimensions: ${dimensions.width}x${dimensions.height}px`);
    
    // Set viewport to match content dimensions
    await page.setViewport({ 
      width: Math.round(dimensions.width), 
      height: Math.round(dimensions.height) 
    });
    
    // Generate PDF with dynamic dimensions
    await page.pdf({
      path: outputFile,
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      printBackground: true,
      margin: { 
        top: 0, 
        bottom: 0, 
        left: 0, 
        right: 0 
      },
      preferCSSPageSize: false,
      ...options
    });
    
    console.log(`✅ Generated: ${getDisplayPath(outputFile)} (${dimensions.width}x${dimensions.height}px)`);
  } catch (error) {
    console.error(`❌ Error converting ${htmlFile}:`, error.message);
  } finally {
    await browser.close();
  }
}

async function convertTemplate(templateDir, outputDir) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Dynamically find all HTML files in the template directory
  const allFiles = fs.readdirSync(templateDir);
  const htmlFiles = allFiles.filter(file => file.endsWith('.html')).sort();
  
  if (htmlFiles.length === 0) {
    console.log(`⚠️  No HTML files found in ${templateDir}`);
    return;
  }
  
  console.log(`🚀 Converting ${htmlFiles.length} slides from ${getDisplayDir(templateDir)}...`);
  console.log(`📄 Found files: ${htmlFiles.join(', ')}`);
  
  const pdfFiles = [];
  
  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(templateDir, htmlFile);
    const pdfFile = path.join(outputDir, htmlFile.replace('.html', '.pdf'));
    
    if (fs.existsSync(htmlPath)) {
      await convertToPDF(htmlPath, pdfFile);
      pdfFiles.push(pdfFile);
    } else {
      console.log(`⚠️  Skipping ${htmlFile} - file not found`);
    }
  }
  
  // Create combined PDF
  if (pdfFiles.length > 1) {
    const templateName = path.basename(templateDir);
    const combinedPdf = path.join(outputDir, `${templateName}-combined.pdf`);
    
    try {
      const { execSync } = require('child_process');
      const pdfFilesStr = pdfFiles.map(f => `"${f}"`).join(' ');
      execSync(`pdfunite ${pdfFilesStr} "${combinedPdf}"`);
      console.log(`📋 Combined PDF created: ${getDisplayPath(combinedPdf)}`);
    } catch (error) {
      console.log(`⚠️  Could not create combined PDF: ${error.message}`);
      console.log(`💡 Install poppler for combined PDF support:`);
      console.log(`   macOS: brew install poppler`);
      console.log(`   Linux: apt-get install poppler-utils`);
      console.log(`   Windows: Download from https://poppler.freedesktop.org/`);
    }
  }
  
  const templateName = path.basename(templateDir);
  console.log(`📁 Template "${templateName}" conversion complete!`);
  console.log(`📁 PDFs saved to: ${getDisplayDir(outputDir)}`);
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📄 Brillnt Slide PDF Converter (Dynamic Sizing)

Usage:
  node scripts/convert-to-pdf.js <template-dir> [output-dir]
  
Examples:
  # Convert discovery-planning-agreement template with dynamic sizing
  node scripts/convert-to-pdf.js templates/discovery-planning-agreement exports/discovery-planning-agreement
  
  # Convert single slide
  node scripts/convert-to-pdf.js templates/discovery-planning-agreement/00-cover.html cover.pdf
    `);
    process.exit(1);
  }
  
  const [input, output] = args;
  
  if (input.endsWith('.html')) {
    // Single file conversion
    const outputFile = output || input.replace('.html', '.pdf');
    convertToPDF(input, outputFile);
  } else {
    // Template directory conversion
    const outputDir = output || `exports/${path.basename(input)}`;
    convertTemplate(input, outputDir);
  }
}

module.exports = { convertToPDF, convertTemplate };

