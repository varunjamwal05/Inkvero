
const fs = require('fs');
try {
    fs.writeFileSync('test_fs.log', 'File system is working');
    console.log('File written successfully');
} catch (e) {
    console.error('File write failed:', e);
}
