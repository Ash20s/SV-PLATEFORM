const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/supervise').then(async () => {
  const phoenix = await User.findOneAndUpdate(
    { username: 'Phoenix' },
    {
      $set: {
        'profile.avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=Phoenix',
        'profile.banner': 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1200',
        'profile.bio': 'Phoenix Rising - Pro player and team captain. Always looking for the next challenge!',
        'profile.pronouns': 'he/him',
        'profile.favoriteHunter': 'The Wraith',
        'profile.socials.twitter': '@Phoenix_SV',
        'profile.socials.discord': 'Phoenix#1337',
        'profile.socials.twitch': 'phoenix_rising',
        'stats.matchesPlayed': 156,
        'stats.wins': 89,
        'stats.kills': 1247,
        'stats.deaths': 623
      }
    },
    { new: true }
  );

  console.log('=== PHOENIX PROFILE UPDATED ===');
  console.log('Username:', phoenix.username);
  console.log('Avatar:', phoenix.profile.avatar);
  console.log('Bio:', phoenix.profile.bio);
  console.log('Pronouns:', phoenix.profile.pronouns);
  console.log('Favorite Hunter:', phoenix.profile.favoriteHunter);
  console.log('Stats:', phoenix.stats);
  console.log('\n✅ Profile updated successfully!');
  
  await mongoose.disconnect();
  process.exit(0);
});
