
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Book = require('../models/Book');
const User = require('../models/User');
const connectDB = require('../config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const sampleBooks = {
    Fantasy: [
        { title: "The Crystal Kingdom", author: "Aries Thorne", description: "A young mage discovers the lost secrets of the crystal kingdom." },
        { title: "Dragon's Oath", author: "Elara Vance", description: "A knight binds her soul to the last dragon to save her people." },
        { title: "Shadows of Eldoria", author: "Malik Zane", description: "Darkness rises from the ancient ruins of Eldoria." },
        { title: "The Sorcerer's Legacy", author: "Livia Sterling", description: "An apprentice inherits a power too great to control." },
        { title: "Crown of Starlight", author: "Seren Nightingale", description: "A battle for the throne written in the stars." },
        { title: "Whispers of the Fae", author: "Rowan Ash", description: "The fae do not lie, but they do not tell the truth." },
        { title: "The Gilded Spire", author: "Kaelen Dawn", description: "A tower that reaches the heavens hides a dark secret." },
        { title: "Blade of the Moon", author: "Selene Vesper", description: "An assassin trained by moonlight seeks redemption." }
    ],
    Romance: [
        { title: "Love in Paris", author: "Sophie Rose", description: "A chance encounter under the Eiffel Tower changes everything." },
        { title: "The Heart's Choice", author: "Liam Harper", description: "Torn between duty and desire, she must choose." },
        { title: "Summer at the Lake", author: "Emma Blue", description: "Old flames reignite during a summer retreat." },
        { title: "Forever Yours", author: "Noah Gray", description: "A promise made in childhood withstands the test of time." },
        { title: "Secret Admirer", author: "Ava White", description: "Letters from a stranger capture her heart." },
        { title: "Wedding of the Season", author: "Charlotte Green", description: "The most anticipated wedding faces unexpected chaos." },
        { title: "Midnight Kisses", author: "Julian Black", description: "New Year's Eve brings a surprise romance." }
    ],
    Horror: [
        { title: "The Haunted Manor", author: "Edgar Shade", description: "No one stays in the manor overnight and lives." },
        { title: "Whispers in the Dark", author: "Raven Gloom", description: "The shadows assume shapes when you are alone." },
        { title: "The Cursed Doll", author: "Bella Fear", description: "A porcelain doll that moves when you look away." },
        { title: "Nightmare Alley", author: "Victor Grave", description: "Dreams spill into reality with deadly consequences." },
        { title: "The Silent Woods", author: "Silas Grimm", description: "Something watches from the trees." },
        { title: "Blood Moon Ritual", author: "Damien Cross", description: "The village hides a terrifying secret." }
    ],
    'Self-Help': [
        { title: "Atomic Habits", author: "James Clear", description: "Build good habits and break bad ones." },
        { title: "The Power of Now", author: "Eckhart Tolle", description: "A guide to spiritual enlightenment." },
        { title: "Mindset Shift", author: "Carol Dweck", description: "Changing the way you think to fulfil your potential." },
        { title: "Deep Work", author: "Cal Newport", description: "Rules for focused success in a distracted world." },
        { title: "The 5 AM Club", author: "Robin Sharma", description: "Own your morning, elevate your life." },
        { title: "Limitless", author: "Jim Kwik", description: "Upgrade your brain, learn anything faster." }
    ],
    // Mapping 'Programming' requirement to 'Non-Fiction' or strict enum if not present.
    // Book model has: 'Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Sci-Fi', 'Biography', 'History', 'Romance', 'Horror', 'Self-Help', 'Philosophy', 'Poetry', 'Classic'
    // User requested 'Programming'. I will put them in 'Non-Fiction' or 'Sci-Fi' to respect enum? 
    // Actually, I should probably stick to the ENUM values. 
    // Let's use 'Non-Fiction' for Programming/Business if strictly following schema.
    // Wait, user asked to "generate meaningful titles... Programming -> clean code".
    // I entered 'Non-Fiction' for Programming books to avoid validation errors.
    'Non-Fiction': [
        { title: "Clean Code", author: "Robert C. Martin", description: "A handbook of agile software craftsmanship. (Programming)" },
        { title: "The Pragmatic Programmer", author: "Andrew Hunt", description: "From journeyman to master. (Programming)" },
        { title: "Zero to One", author: "Peter Thiel", description: "Notes on startups, or how to build the future. (Business)" },
        { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", description: "What the rich teach their kids about money. (Business)" },
        { title: "Sapiens", author: "Yuval Noah Harari", description: "A brief history of humankind." },
        { title: "Educated", author: "Tara Westover", description: "A memoir of a family and the struggle for education." }
    ],
    'Sci-Fi': [
        { title: "Dune", author: "Frank Herbert", description: "A mythic and emotionally charged hero's journey." },
        { title: "Neuromancer", author: "William Gibson", description: "The sky above the port was the color of television, tuned to a dead channel." },
        { title: "The Martian", author: "Andy Weir", description: "Stranded on Mars, one man fights to survive." },
        { title: "Project Hail Mary", author: "Andy Weir", description: "A lone astronaut must save the earth from disaster." },
        { title: "Foundation", author: "Isaac Asimov", description: "The story of our future begins with the past." },
        { title: "Snow Crash", author: "Neal Stephenson", description: "In reality, Hiro Protagonist delivers pizza." }
    ]
};

const seedBooks = async () => {
    try {
        console.log('🌱 Starting database seed...');

        // 1. Get a user to assign as uploader (Admin or first user)
        let uploader = await User.findOne({ role: 'admin' });
        if (!uploader) {
            uploader = await User.findOne();
        }

        if (!uploader) {
            console.error('❌ No user found. Please create a user/admin first.');
            process.exit(1);
        }

        console.log(`👤 Assigning books to user: ${uploader.username}`);

        // Clear existing books to ensure fresh seed with new PDFs
        console.log('🧹 Clearing existing books...');
        await Book.deleteMany({});
        console.log('✔ Old books cleared.');

        // 2. Iterate genres
        const genres = Object.keys(sampleBooks);

        // PDF Map for better realism (using stable public URLs)
        const genrePdfMap = {
            'Non-Fiction': 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf', // Tech paper
            'Programming': 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf', // Tech paper
            'Sci-Fi': 'https://pdfobject.com/pdf/sample.pdf', // Generic Sample
            'Fantasy': 'https://pdfobject.com/pdf/sample.pdf',
            'History': 'https://constitutioncenter.org/media/files/constitution.pdf', // US Constitution
            'Biography': 'https://constitutioncenter.org/media/files/constitution.pdf',
            'default': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Fallback
        };

        for (const genreName of genres) {
            // Check existing count
            const count = await Book.countDocuments({ genre: genreName });

            if (count >= 5) {
                console.log(`⏩ Skipped ${genreName} (already has ${count} books)`);
                continue;
            }

            console.log(`📚 Seeding ${genreName}...`);

            const booksToInsert = sampleBooks[genreName].map(book => ({
                ...book,
                genre: genreName,
                uploadedBy: uploader._id,
                files: {
                    cover: `https://source.unsplash.com/random/300x450?book,${genreName},${book.title.split(' ')[0]}`,
                    pdf: genrePdfMap[genreName] || genrePdfMap['default']
                },
                stats: {
                    avgRating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 - 5.0
                    ratingCount: Math.floor(Math.random() * 100),
                    readCount: Math.floor(Math.random() * 500)
                },
                createdAt: new Date()
            }));

            await Book.insertMany(booksToInsert);
            console.log(`✔ Added ${booksToInsert.length} ${genreName} books`);
        }

        console.log('✅ Seeding complete!');
        process.exit();
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seedBooks();
