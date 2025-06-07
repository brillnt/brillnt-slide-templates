/**
 * Modern Build Script - Combines customize and PDF generation
 */

import { customizeTemplate } from './customize.js';
import { generatePDF } from './generate-pdf.js';

/**
 * Build complete client package (customize + PDF)
 */
async function buildClient(templateName, configFile) {
    try {
        console.log('🚀 Complete Build Starting...');
        console.log('');
        
        // Step 1: Customize templates
        console.log('📋 Step 1: Customizing templates...');
        const customizeResult = await customizeTemplate(templateName, configFile);
        
        if (!customizeResult.success) {
            throw new Error(`Customization failed: ${customizeResult.error}`);
        }
        
        console.log('');
        console.log('📄 Step 2: Generating PDFs...');
        
        // Step 2: Generate PDFs
        const pdfResult = await generatePDF(configFile);
        
        if (!pdfResult.success) {
            throw new Error(`PDF generation failed: ${pdfResult.error}`);
        }
        
        console.log('');
        console.log('🎉 Complete Build Finished!');
        console.log(`📊 Templates processed: ${customizeResult.results.processed}`);
        console.log(`📁 Client package: exports/${customizeResult.clientSlug}/`);
        
        return {
            success: true,
            clientSlug: customizeResult.clientSlug,
            customizeResult,
            pdfResult
        };
        
    } catch (error) {
        console.error('❌ Build failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Command line usage
function showUsage() {
    console.log('Usage: node build.js <template> <config>');
    console.log('');
    console.log('Examples:');
    console.log('  node build.js discovery john-boros');
    console.log('  node build.js discovery-planning-agreement configs/maria.json');
    console.log('');
    console.log('This command runs customize + PDF generation in sequence');
}

// Main execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
    const templateName = process.argv[2];
    const configFile = process.argv[3];
    
    if (!templateName || !configFile) {
        showUsage();
        process.exit(1);
    }
    
    buildClient(templateName, configFile)
        .then(result => {
            if (!result.success) {
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Unexpected error:', error.message);
            process.exit(1);
        });
}

export { buildClient };

