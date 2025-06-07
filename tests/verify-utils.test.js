/**
 * Test Utils Verification - Verify all test utilities work correctly
 */

import { 
    createTempDir, 
    cleanupTempDir, 
    assertEqual, 
    assertTrue, 
    assertFileExists,
    assertDirectoryExists,
    fileExists,
    getFixturesDir,
    getFixturePath
} from './test-utils.js';
import fs from 'fs';
import path from 'path';

async function testUtilities() {
    console.log('🧪 Testing all utility functions...');
    
    // Test temp directory functions
    const tempDir = createTempDir('utils-test-');
    assertTrue(fs.existsSync(tempDir), 'Temp directory should exist');
    assertTrue(tempDir.includes('utils-test-'), 'Temp directory should contain prefix');
    
    // Test file operations
    const testFile = path.join(tempDir, 'test.txt');
    fs.writeFileSync(testFile, 'test content');
    assertTrue(fileExists(testFile), 'Test file should exist');
    assertFileExists(testFile, 'Test file assertion should pass');
    
    // Test directory assertions
    assertDirectoryExists(tempDir, 'Temp directory assertion should pass');
    
    // Test fixtures path functions
    const fixturesDir = getFixturesDir();
    assertTrue(fixturesDir.includes('tests/fixtures'), 'Fixtures dir should contain correct path');
    assertDirectoryExists(fixturesDir, 'Fixtures directory should exist');
    
    const configsPath = getFixturePath('configs');
    assertTrue(configsPath.includes('fixtures/configs'), 'Fixture path should be correct');
    
    // Test assertions
    assertEqual('test', 'test', 'String equality should work');
    assertTrue(true, 'Boolean assertion should work');
    
    // Cleanup
    cleanupTempDir(tempDir);
    assertTrue(!fs.existsSync(tempDir), 'Temp directory should be cleaned up');
    
    console.log('✅ All utility functions work correctly');
}

// Run the test
try {
    await testUtilities();
    console.log('🎉 All utility tests passed!');
} catch (error) {
    console.error('❌ Utility test failed:', error.message);
    process.exit(1);
}

