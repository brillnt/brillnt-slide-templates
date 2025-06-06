#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function convertToPDF(htmlFile, outputFile, options = {}) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to the HTML file
    const htmlPath = path.resolve(htmlFile);
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    // Wait a bit for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate PDF with optimized settings for slides
    await page.pdf({
      path: outputFile,
      format: 'A4',
      landscape: true,
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
    
    console.log(`✅ Generated: ${outputFile}`);
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
  
  const slides = [
    'cover.html',
    'title_overview.html', 
    'what_you_get.html',
    'agreement_next_steps.html'
  ];
  
  console.log(`🚀 Converting slides from ${templateDir}...`);
  
  for (const slide of slides) {
    const htmlFile = path.join(templateDir, slide);
    const pdfFile = path.join(outputDir, slide.replace('.html', '.pdf'));
    
    if (fs.existsSync(htmlFile)) {
      await convertToPDF(htmlFile, pdfFile);
    } else {
      console.log(`⚠️  Skipping ${slide} - file not found`);
    }
  }
  
  // Also create a combined PDF name
  const templateName = path.basename(templateDir);
  console.log(`📋 Template "${templateName}" conversion complete!`);
  console.log(`📁 PDFs saved to: ${outputDir}`);
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📄 Brillnt Slide PDF Converter

Usage:
  node scripts/convert-to-pdf.js <template-dir> [output-dir]
  
Examples:
  # Convert discovery-planning template
  node scripts/convert-to-pdf.js templates/discovery-planning pdfs/discovery-planning
  
  # Convert single slide
  node scripts/convert-to-pdf.js templates/discovery-planning/cover.html cover.pdf
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
    const outputDir = output || `pdfs/${path.basename(input)}`;
    convertTemplate(input, outputDir);
  }
}

module.exports = { convertToPDF, convertTemplate };

