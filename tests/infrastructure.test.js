/**
 * Basic Test Runner - Simple test to verify infrastructure works
 */

import { createTempDir, cleanupTempDir, assertEqual, assertTrue } from './test-utils.js';

async function testBasicInfrastructure() {
    console.log('🧪 Testing basic infrastructure...');
    
    // Test temp directory creation
    const tempDir = createTempDir('infrastructure-test-');
    assertTrue(tempDir.includes('infrastructure-test-'), 'Temp directory should contain prefix');
    
    // Test cleanup
    cleanupTempDir(tempDir);
    
    // Test assertions
    assertEqual('hello', 'hello', 'Basic string equality');
    assertTrue(true, 'Basic boolean assertion');
    
    console.log('✅ Basic infrastructure test passed');
}

// Run the test
try {
    await testBasicInfrastructure();
    console.log('🎉 All infrastructure tests passed!');
    process.exit(0);
} catch (error) {
    console.error('❌ Infrastructure test failed:', error.message);
    process.exit(1);
}

