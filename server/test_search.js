
const mongoose = require('mongoose');
console.log('Mongoose Version:', mongoose.version);

const Book = require('./models/Book');
const searchService = require('./services/SearchService');

// Connect (optional for this test if models don't need conn to instantiate query)
// actually model needs connection for some things but finding returns query even without conn

console.log('--- TEST 1: With Query String ---');
try {
    const query = searchService.searchBooks('Harry', { genre: 'Fantasy' });
    console.log('Query type:', query.constructor.name);
    console.log('typeof getFilter:', typeof query.getFilter);
    console.log('typeof getQuery:', typeof query.getQuery);

    if (typeof query.getFilter === 'function') {
        console.log('Calling getFilter()...');
        console.log('Result:', query.getFilter());
    } else if (typeof query.getQuery === 'function') {
        console.log('Calling getQuery()...');
        console.log('Result:', query.getQuery());
    }
} catch (e) {
    console.error('Error in Test 1:', e);
}

console.log('--- TEST 2: No Query String ---');
try {
    const query = searchService.searchBooks(undefined, {}); // Default case
    console.log('Query type:', query.constructor.name);
    console.log('typeof getFilter:', typeof query.getFilter);
    console.log('typeof getQuery:', typeof query.getQuery);
} catch (e) {
    console.error('Error in Test 2:', e);
}
