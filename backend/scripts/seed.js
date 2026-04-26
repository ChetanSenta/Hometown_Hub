require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('🌱 Seeding database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Drop and recreate tables
    await client.query(`
      DROP TABLE IF EXISTS notifications, event_attendees, events, post_likes, posts, memberships, communities, users CASCADE;
    `);

    await client.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) DEFAULT '',
        bio TEXT,
        hometown VARCHAR(100),
        current_city VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_verified BOOLEAN DEFAULT FALSE,
        is_banned BOOLEAN DEFAULT FALSE,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE communities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        village VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'India',
        cover_image VARCHAR(255) DEFAULT '',
        emoji VARCHAR(10) DEFAULT '🏘️',
        category VARCHAR(50) DEFAULT 'city',
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        member_count INTEGER DEFAULT 0,
        is_private BOOLEAN DEFAULT FALSE,
        requires_approval BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE memberships (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned')),
        role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, community_id)
      );
    `);

    await client.query(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        type VARCHAR(20) DEFAULT 'post',
        title VARCHAR(200),
        content TEXT NOT NULL,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        is_flagged BOOLEAN DEFAULT FALSE,
        visibility VARCHAR(20) DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'moderators')),
        tags JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE post_likes (
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) DEFAULT 'social',
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        location_address TEXT,
        location_city VARCHAR(100),
        is_online BOOLEAN DEFAULT FALSE,
        online_link VARCHAR(255),
        cover_image VARCHAR(255) DEFAULT '',
        max_attendees INTEGER DEFAULT 0,
        attendee_count INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE event_attendees (
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (event_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
        post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
        event_id UUID REFERENCES events(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`CREATE INDEX idx_users_email ON users(email);`);
    await client.query(`CREATE INDEX idx_communities_slug ON communities(slug);`);
    await client.query(`CREATE INDEX idx_posts_community_created ON posts(community_id, created_at DESC);`);
    await client.query(`CREATE INDEX idx_notifications_recipient_unread ON notifications(recipient_id) WHERE is_read = FALSE;`);

    console.log('✅ Tables created');

    // ── Seed Users ──────────────────────────────────────────────
    const hash = await bcrypt.hash('password123', 12);
    const adminHash = await bcrypt.hash('admin123', 12);

    const insertUser = async (name, email, password, role, hometown, current_city, bio) => {
      const { rows } = await client.query(
        `INSERT INTO users (name, email, password, role, hometown, current_city, bio, is_verified)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING id`,
        [name, email, password, role, hometown, current_city, bio]
      );
      return rows[0].id;
    };

    const admin  = await insertUser('Admin User',   'admin@hometownhub.com', adminHash, 'admin', 'Delhi',     'Mumbai',    'Platform administrator');
    const priya  = await insertUser('Priya Sharma', 'priya@example.com',     hash,      'user',  'Jaipur',    'Bangalore', 'Love my roots in Jaipur 🌸');
    const rahul  = await insertUser('Rahul Mehta',  'rahul@example.com',     hash,      'user',  'Ahmedabad', 'Pune',      'Proud Gujarati living in Pune');
    const anita  = await insertUser('Anita Patel',  'anita@example.com',     hash,      'user',  'Surat',     'Mumbai',    'Connecting with my Surat community');
    const vikram = await insertUser('Vikram Singh', 'vikram@example.com',    hash,      'user',  'Lucknow',   'Delhi',     'Nawabi culture forever ❤️');
    const deepa  = await insertUser('Deepa Nair',   'deepa@example.com',     hash,      'user',  'Kochi',     'Hyderabad', 'Kerala girl in Hyderabad');
    const arjun  = await insertUser('Arjun Kumar',  'arjun@example.com',     hash,      'user',  'Chennai',   'Bangalore', 'Tech + Chennai vibes');

    console.log('✅ Users seeded');

    // ── Seed Communities ─────────────────────────────────────────
    const insertCommunity = async (name, slug, description, city, state, category, emoji, creatorId) => {
      const { rows } = await client.query(
        `INSERT INTO communities (name, slug, description, city, state, country, category, emoji, creator_id, member_count, status)
         VALUES ($1,$2,$3,$4,$5,'India',$6,$7,$8,1,'active') RETURNING id`,
        [name, slug, description, city, state, category, emoji, creatorId]
      );
      return rows[0].id;
    };

    const jaipurC  = await insertCommunity('Jaipur Connect',        'jaipur-connect',        'A vibrant community for people from the Pink City. Share culture, events, and updates!', 'Jaipur',    'Rajasthan',     'city',         '🏯', priya);
    const ahmC     = await insertCommunity('Ahmedabad Diaspora',    'ahmedabad-diaspora',    'For all Amdavadis living across India and abroad. Stay connected with your roots.',      'Ahmedabad', 'Gujarat',       'city',         '🪁', rahul);
    const suratC   = await insertCommunity('Surat Business Network','surat-business-network','Connecting Surat-origin entrepreneurs and professionals worldwide.',                      'Surat',     'Gujarat',       'professional', '💎', anita);
    const lucknowC = await insertCommunity('Lucknow Cultural Hub',  'lucknow-cultural-hub',  'Celebrating the Nawabi tehzeeb and culture of Lucknow city.',                            'Lucknow',   'Uttar Pradesh', 'cultural',     '🕌', vikram);
    const keralaC  = await insertCommunity('Kerala Global',         'kerala-global',         "Connecting Keralites around the world. God's Own People!",                              'Kochi',     'Kerala',        'city',         '🌴', deepa);
    const chennaiC = await insertCommunity('Chennai Tech Circle',   'chennai-tech-circle',   'Where Chennaiites in tech come together to network and grow.',                           'Chennai',   'Tamil Nadu',    'professional', '💻', arjun);

    console.log('✅ Communities seeded');

    // ── Seed Memberships ─────────────────────────────────────────
    const addMember = async (userId, communityId, role = 'member') => {
      await client.query(
        `INSERT INTO memberships (user_id, community_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [userId, communityId, role]
      );
    };

    // Creators as moderators
    await addMember(priya,  jaipurC,  'moderator');
    await addMember(rahul,  ahmC,     'moderator');
    await addMember(anita,  suratC,   'moderator');
    await addMember(vikram, lucknowC, 'moderator');
    await addMember(deepa,  keralaC,  'moderator');
    await addMember(arjun,  chennaiC, 'moderator');

    // Extra members
    await addMember(rahul,  jaipurC);
    await addMember(anita,  jaipurC);
    await addMember(vikram, jaipurC);
    await addMember(admin,  ahmC);
    await addMember(anita,  ahmC);
    await addMember(admin,  suratC);
    await addMember(priya,  suratC);
    await addMember(deepa,  lucknowC);
    await addMember(admin,  keralaC);
    await addMember(arjun,  keralaC);
    await addMember(vikram, chennaiC);

    // Update member counts
    await client.query(`UPDATE communities SET member_count = (SELECT COUNT(*) FROM memberships WHERE community_id = communities.id)`);

    console.log('✅ Memberships seeded');

    // ── Seed Posts ───────────────────────────────────────────────
    const insertPost = async (authorId, communityId, type, title, content, likeCount, isPinned, visibility) => {
      const { rows } = await client.query(
        `INSERT INTO posts (author_id, community_id, type, title, content, like_count, is_pinned, visibility)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [authorId, communityId, type, title, content, likeCount, isPinned, visibility]
      );
      return rows[0].id;
    };

    await insertPost(priya,  jaipurC,  'announcement', 'Welcome to Jaipur Connect! 🏯',       'Namaste everyone! Welcome to our official community for Jaipurites. Share your stories, events, and memories from the Pink City!', 15, true,  'public');
    await insertPost(rahul,  jaipurC,  'post',         'Missing Daal Baati Churma 😭',         'Living in Bangalore for 3 years now, and nothing hits like Maa ki Daal Baati. Anyone knows a good Rajasthani restaurant here?',   32, false, 'members');
    await insertPost(anita,  ahmC,     'announcement', 'Uttarayan Celebration Planning 🪁',    "Fellow Amdavadis! Let's organize Uttarayan this year in Pune. Who is interested? Drop your city in comments!",                    28, true,  'public');
    await insertPost(vikram, suratC,   'post',         'Surat Diamond Industry Updates',       'Great news for Surat business community — diamond exports have seen a 12% growth this quarter. Proud of our city!',               19, false, 'members');
    await insertPost(deepa,  lucknowC, 'post',         'Kebabs and Memories 🕌',               'Visiting Lucknow after 2 years. The Tunday Kababi is still magical. Some things never change — and that is beautiful.',           41, false, 'members');
    await insertPost(arjun,  keralaC,  'announcement', 'Onam Festival Potluck 🌴',             'Dear Keralites in Hyderabad, we are organizing an Onam Sadya potluck. Everyone brings one dish. RSVP by next Sunday!',           37, true,  'public');

    console.log('✅ Posts seeded');

    // ── Seed Events ──────────────────────────────────────────────
    const insertEvent = async (title, description, communityId, organizerId, category, daysFromNow, durationHours, locationAddress, locationCity, attendeeCount) => {
      await client.query(
        `INSERT INTO events (title, description, community_id, organizer_id, category, start_date, end_date, location_address, location_city, is_public, attendee_count)
         VALUES ($1,$2,$3,$4,$5, NOW() + ($6 || ' days')::interval, NOW() + ($6 || ' days')::interval + ($7 || ' hours')::interval, $8,$9,true,$10)`,
        [title, description, communityId, organizerId, category, daysFromNow, durationHours, locationAddress, locationCity, attendeeCount]
      );
    };

    await insertEvent('Jaipur Night Food Walk',       'Explore the best street food of Jaipur virtually — share your local favorites!',         jaipurC,  priya,  'cultural',     7,  3, 'Johri Bazaar, Jaipur',           'Jaipur',    12);
    await insertEvent('Uttarayan Kite Festival 2025', 'Annual kite flying celebration for Amdavadis in Pune. Bring your patang!',               ahmC,     rahul,  'cultural',    14,  6, 'Aundh Ground, Pune',             'Pune',      45);
    await insertEvent('Kerala Onam Sadya 2025',       'Traditional Onam feast with all 26 dishes! Community potluck event.',                    keralaC,  deepa,  'cultural',    21,  4, 'Community Hall, Banjara Hills',  'Hyderabad', 67);
    await insertEvent('Chennai Tech Networking Night','Monthly networking for Chennai-origin tech professionals in Bangalore.',                  chennaiC, arjun,  'professional', 5,  2, 'Koramangala, Bangalore',         'Bangalore', 23);
    await insertEvent('Lucknow Literature Festival',  "Online celebration of Urdu poetry and Lucknow's literary heritage.",                     lucknowC, vikram, 'cultural',    10,  3, null,                             null,        18);

    console.log('✅ Events seeded');

    await client.query('COMMIT');
    console.log('');
    console.log('🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:  admin@hometownhub.com / admin123');
    console.log('👤 User:   priya@example.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

seed();
