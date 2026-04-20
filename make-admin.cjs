'use strict';

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ugrabuilders';
const EMAIL = process.argv[2] || 'svinkinka@ya.ru';

async function makeAdmin() {
  await mongoose.connect(MONGODB_URI);
  console.log('[MongoDB] Connected');

  const usersCol = mongoose.connection.collection('users');
  const profilesCol = mongoose.connection.collection('user_profiles');

  const user = await usersCol.findOne({ email: EMAIL });
  if (!user) {
    console.error('User not found:', EMAIL);
    process.exit(1);
  }

  await usersCol.updateOne({ email: EMAIL }, { $set: { role: 'admin' } });
  await profilesCol.updateOne({ id: user.id }, { $set: { role: 'admin' } });

  console.log('Done! User', EMAIL, 'is now admin (id:', user.id + ')');
  process.exit(0);
}

makeAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
