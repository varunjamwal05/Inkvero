const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Book = require('./models/Book');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const debugCovers = async () => {
    try {
        console.log('🔍 Analyzing covers...');
        const books = await Book.find({});

        let output = `Found ${books.length} books.\n\n`;
        output += 'TITLE'.padEnd(40) + ' | ' + 'GENRE'.padEnd(15) + ' | ' + 'COVER URL\n';
        output += '-'.repeat(100) + '\n';

        const genreCounts = {};
        const urlCounts = {};

        books.forEach(b => {
            const cover = b.files?.cover || 'MISSING';
            output += `${b.title.substring(0, 38).padEnd(40)} | ${b.genre.padEnd(15)} | ${cover}\n`;

            // Count
            genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
            urlCounts[cover] = (urlCounts[cover] || 0) + 1;
        });

        output += '\n\nGENRE DISTRIBUTION:\n';
        for (const [g, c] of Object.entries(genreCounts)) {
            output += `${g}: ${c}\n`;
        }

        output += '\n\nDUPLICATE COVERS (Verification of Variety):\n';
        let dups = 0;
        for (const [url, c] of Object.entries(urlCounts)) {
            if (c > 1) {
                output += `URL repeated ${c} times: ${url}\n`;
                dups++;
            }
        }
        if (dups === 0) output += "No duplicate covers found!\n";
        else output += `${dups} unique covers are used more than once.\n`;

        fs.writeFileSync('covers_report.txt', output);
        console.log('✅ Report written to covers_report.txt');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugCovers();
