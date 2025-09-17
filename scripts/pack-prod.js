const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..');
const outputPath = path.join(outputDir, 'juiceit-beta.zip');

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`✅ Production package created: juiceit-beta.zip (${archive.pointer()} total bytes)`);
  console.log('\nIncluded files:');
  console.log('- app/ (all route files)');
  console.log('- components/ (UI components)');
  console.log('- hooks/ (React hooks)');
  console.log('- lib/ (utilities)');
  console.log('- styles/ (design system)');
  console.log('- types/ (TypeScript definitions)');
  console.log('- utils/ (helper functions)');
  console.log('- data/ (constants)');
  console.log('- supabase/ (database & functions)');
  console.log('- assets/ (images & icons)');
  console.log('- Configuration files');
});

// Handle warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err.message);
  } else {
    throw err;
  }
});

// Handle errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add directories and files
const filesToInclude = [
  'app/',
  'components/',
  'hooks/',
  'lib/',
  'styles/',
  'types/',
  'utils/',
  'data/',
  'supabase/',
  'assets/',
  'app.json',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  '.prettierrc'
];

filesToInclude.forEach(item => {
  const fullPath = path.join(__dirname, '..', item);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      archive.directory(fullPath, item);
    } else {
      archive.file(fullPath, { name: item });
    }
  } else {
    console.warn(`⚠️  File/directory not found: ${item}`);
  }
});

// Finalize the archive
archive.finalize();