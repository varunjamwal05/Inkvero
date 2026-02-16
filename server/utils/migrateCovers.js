const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

// Massive library of unsplash images
const coverLibrary = {
    'Fantasy': [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80', // Mystic
        'https://images.unsplash.com/photo-1630327389467-3c35b804c861?auto=format&fit=crop&w=300&q=80', // Dragon
        'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=300&q=80', // Forest
        'https://images.unsplash.com/photo-1462759353907-b2ea5ebd72e7?auto=format&fit=crop&w=300&q=80', // Dark
        'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?auto=format&fit=crop&w=300&q=80', // Castle
        'https://images.unsplash.com/photo-1535581652167-3d6b98c9261d?auto=format&fit=crop&w=300&q=80', // Stars/Magic
        'https://images.unsplash.com/photo-1601323332709-3cb365532581?auto=format&fit=crop&w=300&q=80', // Wizard vibe
        'https://images.unsplash.com/photo-1456428746267-325d277a6132?auto=format&fit=crop&w=300&q=80', // Book/Raven
        'https://images.unsplash.com/photo-1598153346810-860daa0d6cad?auto=format&fit=crop&w=300&q=80', // Sword/Fantasy
        'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?auto=format&fit=crop&w=300&q=80'  // Nebula
    ],
    'Romance': [
        'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=300&q=80', // Flowers
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=300&q=80', // Couple/Love
        'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=300&q=80', // Hearts
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80', // Hug
        'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=300&q=80', // Winter Couple
        'https://images.unsplash.com/photo-1522263883897-58437fb9be47?auto=format&fit=crop&w=300&q=80', // Holding hands
        'https://images.unsplash.com/photo-1516575334481-f85287c2c81d?auto=format&fit=crop&w=300&q=80', // Rose
        'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=300&q=80', // Smile
        'https://images.unsplash.com/photo-1548062831-c277ce914c8d?auto=format&fit=crop&w=300&q=80', // Sunset
        'https://images.unsplash.com/photo-1534125883659-1e3e707e78c8?auto=format&fit=crop&w=300&q=80'  // Vintage
    ],
    'Sci-Fi': [
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80', // Orbit
        'https://images.unsplash.com/photo-1614730341194-75c60740a070?auto=format&fit=crop&w=300&q=80', // Planet
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80', // Cyber
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=300&q=80', // Astronaut
        'https://images.unsplash.com/photo-1454789548728-85d2696cfb9e?auto=format&fit=crop&w=300&q=80', // Stars
        'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?auto=format&fit=crop&w=300&q=80', // Matrix
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=300&q=80', // Tech
        'https://images.unsplash.com/photo-1614728853975-69c960c72cbc?auto=format&fit=crop&w=300&q=80', // Alien
        'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=300&q=80', // Fractal
        'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=300&q=80'  // Robot
    ],
    'Self-Help': [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', // Book spine
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80', // Yoga
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=300&q=80', // Plant
        'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=300&q=80', // Coffee
        'https://images.unsplash.com/photo-1494178270175-e96de2971df9?auto=format&fit=crop&w=300&q=80', // Nature
        'https://images.unsplash.com/photo-1515696955266-4f67e13219e8?auto=format&fit=crop&w=300&q=80', // Meditate
        'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=300&q=80', // Mountains
        'https://images.unsplash.com/photo-1515023115689-589c33041697?auto=format&fit=crop&w=300&q=80', // Sunrise
        'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?auto=format&fit=crop&w=300&q=80', // Stone balance
        'https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&w=300&q=80'  // Calm water
    ],
    'Horror': [
        'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1481018085669-2bc6e4f00eed?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=300&q=80', // Dark forest
        'https://images.unsplash.com/photo-1472552944129-b035e9ea514e?auto=format&fit=crop&w=300&q=80', // Skull/Dark
        'https://images.unsplash.com/photo-1518331483807-f6adc0e14d31?auto=format&fit=crop&w=300&q=80', // Shadow
        'https://images.unsplash.com/photo-1513226418863-691a67232247?auto=format&fit=crop&w=300&q=80', // Crow
        'https://images.unsplash.com/photo-1543862475-eb136770b9b0?auto=format&fit=crop&w=300&q=80', // Spooky House
        'https://images.unsplash.com/photo-1508216317269-e744e4e94285?auto=format&fit=crop&w=300&q=80', // Fog
        'https://images.unsplash.com/photo-1618609571731-5079a49931b7?auto=format&fit=crop&w=300&q=80'  // Grunge
    ],
    'Mystery': [
        'https://images.unsplash.com/photo-1585044433842-51000b0c96c4?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1485846234645-a2644f84728?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=300&q=80', // Magnifying glass? No, just dark coffee
        'https://images.unsplash.com/photo-1455577380025-43228eb95eb0?auto=format&fit=crop&w=300&q=80', // Typewriter
        'https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?auto=format&fit=crop&w=300&q=80', // Old paper
        'https://images.unsplash.com/photo-1433162653888-a571db5ccccf?auto=format&fit=crop&w=300&q=80', // Footsteps/Path
        'https://images.unsplash.com/photo-1550100136-e074f01d8cc3?auto=format&fit=crop&w=300&q=80', // Neon mystery
        'https://images.unsplash.com/photo-1504626835252-f67fcece289c?auto=format&fit=crop&w=300&q=80', // Detective style
        'https://images.unsplash.com/photo-1587613990444-23961b782b6b?auto=format&fit=crop&w=300&q=80'  // Shadows
    ],
    'General': [
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=300&q=80'
    ]
};

// Simple keyword map to specific images for better relevance
const keywordMap = {
    'paris': 'https://images.unsplash.com/photo-1499856871940-a09e32823645?auto=format&fit=crop&w=300&q=80',
    'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=300&q=80',
    'mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80',
    'sea': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    'summer': 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=300&q=80',
    'winter': 'https://images.unsplash.com/photo-1483921020237-60f3e504cb60?auto=format&fit=crop&w=300&q=80',
    'king': 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=300&q=80',
    'queen': 'https://images.unsplash.com/photo-1629814494192-d6ff043064d3?auto=format&fit=crop&w=300&q=80',
    'murder': 'https://images.unsplash.com/photo-1534260164206-2a3a4a728913?auto=format&fit=crop&w=300&q=80',
    'lake': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=300&q=80'
};

const migrateCovers = async () => {
    try {
        console.log('🔄 Starting SUPER cover diversification migration...');

        const books = await Book.find({});
        console.log(`Found ${books.length} books to check.`);

        let updatedCount = 0;

        // Counter to ensure rotation (Round Robin) instead of pure random to minimize collisions
        const genreCounters = {};

        for (const book of books) {
            // Check keyword match first
            let selectedCover = null;
            const titleLower = book.title.toLowerCase();

            for (const [key, url] of Object.entries(keywordMap)) {
                if (titleLower.includes(key)) {
                    selectedCover = url;
                    break;
                }
            }

            if (!selectedCover) {
                // Use Round Robin from Genre pool
                const genre = book.genre;
                const pool = coverLibrary[genre] || coverLibrary['General'];

                if (!genreCounters[genre]) genreCounters[genre] = 0;

                selectedCover = pool[genreCounters[genre] % pool.length];

                // Increment counter
                genreCounters[genre]++;
            }

            // Keep existing object structure
            if (!book.files) book.files = {};
            book.files.cover = selectedCover;

            await book.save();
            updatedCount++;
        }

        console.log(`✅ Super Diversification complete! Updated ${updatedCount} books.`);
        process.exit();
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrateCovers();
