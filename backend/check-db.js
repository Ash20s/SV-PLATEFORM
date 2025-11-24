const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supervive_db';
console.log('🔍 Connecting to:', uri);

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const tournamentSchema = new mongoose.Schema({}, { strict: false });
const Tournament = mongoose.model('Tournament', tournamentSchema);

async function checkDB() {
  try {
    const count = await Tournament.countDocuments();
    console.log(`\n📊 Total tournaments in DB: ${count}\n`);
    
    const tournaments = await Tournament.find().select('name tier startDate status createdAt region').lean();
    
    const now = new Date();
    console.log(`⏰ Current date: ${now}\n`);
    
    tournaments.forEach((t, i) => {
      const startDate = new Date(t.startDate);
      const isUpcoming = startDate >= now;
      console.log(`${i + 1}. ${t.name}`);
      console.log(`   - Tier: ${t.tier || 'N/A'}`);
      console.log(`   - Status: ${t.status}`);
      console.log(`   - Region: ${t.region || 'N/A'}`);
      console.log(`   - Start: ${startDate.toLocaleString()}`);
      console.log(`   - Is Upcoming: ${isUpcoming ? '✅ YES' : '❌ NO (past)'}`);
      console.log(`   - Created: ${new Date(t.createdAt).toLocaleString()}\n`);
    });
    
    // Test the query used by frontend
    console.log('\n🔍 Testing frontend query: status=upcoming...');
    const upcomingQuery = {
      status: 'upcoming',
      startDate: { $gte: now }
    };
    const upcoming = await Tournament.find(upcomingQuery).select('name startDate').lean();
    console.log(`Found ${upcoming.length} tournaments with status=upcoming\n`);
    
    console.log('🔍 Testing registration status...');
    const registrationQuery = {
      status: 'registration',
      startDate: { $gte: now }
    };
    const registration = await Tournament.find(registrationQuery).select('name startDate').lean();
    console.log(`Found ${registration.length} tournaments with status=registration\n`);
    registration.forEach(t => console.log(`   - ${t.name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDB();
