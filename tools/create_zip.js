const fs = require('fs');
const path = require('path');
const archiver = require('archiver');


const TOP_FOLDER_LOCATION = path.join(__dirname, '../');
const SERVER_CONFIG_FILE_LOCATION = path.join(
    TOP_FOLDER_LOCATION, 'src/configs/servers.mjs');
const OUTPUT_ZIP_FILE_LOCATION = path.join(
    TOP_FOLDER_LOCATION, 'dist/upload_to_chrome_store.zip');

const FILES_TO_BE_ZIPPED = [
  'manifest.json',
  'src',
  'icons',
  '_locales',
  'COPYING.txt',
];
const EXCLUDED_FILE_PATTERNS = [
  // Using regex
  /.*_test\.js/i,
  /.*\.zip/i,
  /.*\.tar/i,
  /.*\.gz/i,
  /.*node_modules.*/i,
  /.*\.DS_Store/i,
  /.*~/i,
  /.*\.swp/i,
  /.*\.pyc/i,
  /.*\.bak/i,
  /.*\.log/i,
];


// Do some sanity checks before we start
const serverConfig = fs.readFileSync(SERVER_CONFIG_FILE_LOCATION, 'utf8');
if (serverConfig.includes('localhost') || serverConfig.includes('127.0.0.1')) {
  console.error('ERROR: Remove 127.0.0.1 / localhost from servers.mjs and try again');
  process.exit(-1);
}

// Make sure the output folder exists
fs.mkdirSync(path.dirname(OUTPUT_ZIP_FILE_LOCATION), {recursive: true});
// Create output stream
const output = fs.createWriteStream(OUTPUT_ZIP_FILE_LOCATION);
const archive = archiver('zip', {
  zlib: {level: 9}, // Set the compression level
});


// Listen for all archive data to be written
output.on('close', function() {
  console.log('\nSuccessfully created zip file: ' + OUTPUT_ZIP_FILE_LOCATION);
  console.log('The zip file has ' + archive.pointer() + ' total bytes\n');
});

// Exit on errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);


// Recursively create a full list of all files to be zipped
function shouldBeZipped(filePath) {
  for (const pattern of EXCLUDED_FILE_PATTERNS) {
    if (pattern.test(filePath)) {
      return false;
    }
  }
  return true;
}

function getAllFilesFromList(folder, fileList) {
  const result = [];
  fileList.forEach((file) => {
    const filePath = path.join(folder, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.isFile()) {
      if (shouldBeZipped(filePath)) {
        result.push(filePath);
      } else {
        console.log('Excluding file: ' + filePath);
      }
    } else {
      result.push(...getAllFilesFromList(filePath, fs.readdirSync(filePath)));
    }
  });
  return result;
}

const allFilesToBeZipped = getAllFilesFromList(TOP_FOLDER_LOCATION, FILES_TO_BE_ZIPPED);


// Add all files to the archive
allFilesToBeZipped.forEach((file) => {
  archive.file(file, {name: path.relative(TOP_FOLDER_LOCATION, file)});
});

archive.finalize();
