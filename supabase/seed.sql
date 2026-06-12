-- ============================================================================
-- Flicknest — Seed Data
-- ============================================================================

-- ============================================================================
-- Genre Lookup Table
-- ============================================================================
insert into public.genres (name, emoji, color_hex) values
  ('Drama',       '🎭', '#8B4513'),
  ('Thriller',    '🔪', '#2F4F4F'),
  ('Sci-Fi',      '🚀', '#4682B4'),
  ('Romance',     '💕', '#DC143C'),
  ('Action',      '💥', '#FF4500'),
  ('Horror',      '👻', '#2E0854'),
  ('Documentary', '📽️', '#556B2F'),
  ('Animation',   '🐭', '#FF69B4'),
  ('Comedy',      '😂', '#FFD700'),
  ('World Cinema','🌍', '#20B2AA')
on conflict (name) do nothing;

-- ============================================================================
-- Movies Catalog — 17 community-curated films across all genres
-- ============================================================================
insert into public.movies (title, genre, description, what_it_means, submitted_by, poster_url, trailer_url, release_year, upvotes, is_featured) values
-- Featured films
(
  'The Parallax Effect',
  'Sci-Fi',
  'A quantum physicist discovers that every choice she makes spawns a parallel universe — and someone is hunting her across all of them.',
  'At its core, this film asks: if infinite versions of you exist, are any of your choices truly meaningful? It''s a meditation on regret, identity, and the choices that define us across all possible selves.',
  'Alice Chen',
  '/movie-thumbnails/the-parallax-effect.png',
  'https://www.youtube.com/watch?v=example1',
  2024, 42, true
),
(
  'Embers of Empire',
  'Drama',
  'In the crumbling final days of a dynasty, a young scribe must decide between preserving the truth or protecting the royal family she serves.',
  'This is a timeless story about who gets to write history. The film argues that power is temporary but stories endure — and the most dangerous act in any regime is bearing witness.',
  'Marcus Webb',
  '/movie-thumbnails/embers-of-empire.png',
  'https://www.youtube.com/watch?v=example2',
  2023, 37, true
),
(
  'Where the Lotus Blooms',
  'Romance',
  'Two strangers meet at a meditation retreat in rural Japan and discover they''ve been dreaming the same dream for years.',
  'A beautiful exploration of how timing shapes love. Not about finding the right person, but about being the right version of yourself when they arrive. The lotus metaphor is earned.',
  'Yuki Tanaka',
  '/movie-thumbnails/where-the-lotus-blooms.png',
  'https://www.youtube.com/watch?v=example5',
  2025, 53, true
),
(
  'Midnight in Paradise',
  'Drama, Thriller, Neo-Noir',
  'A retired detective is pulled back into the underbelly of a neon-lit metropolis when a ghost from his past resurfaces with a cryptic warning.',
  'This is a story about how we can never truly escape our past. The neon-lit city becomes a character itself — reflecting the duality of human nature, where light and shadow coexist in everyone.',
  'Elena Vasquez',
  '/movie-thumbnails/midnight-in-paradise.png',
  'https://www.youtube.com/watch?v=example6',
  2024, 89, true
),

-- Sci-Fi & Mystery
(
  'Echoes of Tomorrow',
  'Sci-Fi, Mystery, Drama',
  'When a quantum physicist discovers she can receive messages from her future self, she must race against time to prevent a catastrophe.',
  'Time travel stories often focus on changing the past. This one is different — it''s about whether knowing your future robs you of the freedom to choose. The real tragedy isn''t the catastrophe, but the loss of uncertainty.',
  'Sarah Kim',
  '/movie-thumbnails/echoes-of-tomorrow.png',
  'https://www.youtube.com/watch?v=example8',
  2023, 64, false
),
(
  'The Carbon Harvest',
  'Sci-Fi',
  'In 2157, Earth''s last forest is a sealed bioluminescent garden guarded by an AI that has begun dreaming of extinction.',
  'A haunting allegory for climate grief. The AI isn''t the villain — it''s a mirror reflecting our own ambivalence about survival. The film asks whether we deserve to be saved from ourselves.',
  'Dr. Amara Okafor',
  '',
  'https://www.youtube.com/watch?v=example9',
  2025, 47, false
),

-- Action & Heist
(
  'Velvet Thunder',
  'Action, Heist, Crime',
  'An elite squad of international thieves plots the most audacious heist in history — stealing a legendary diamond from a floating casino.',
  'Beyond the thrill of the heist, this film explores the chemistry of trust between people who have every reason to betray each other. It asks: what makes a team greater than the sum of its individuals?',
  'Marcus Chen',
  '/movie-thumbnails/velvet-thunder.png',
  'https://www.youtube.com/watch?v=example7',
  2024, 76, false
),
(
  'Steel Horizon',
  'Action',
  'A disgraced pilot takes command of a mothballed warship to defend a remote colony from an advancing armada.',
  'War films often celebrate heroism. This one mourns it. Every victory comes with a cost that isn''t counted in medals — and the pilot''s redemption isn''t found in winning, but in choosing who to become.',
  'James Kowalski',
  '',
  'https://www.youtube.com/watch?v=example10',
  2024, 31, false
),

-- Thriller & Horror
(
  'Beneath the Neon',
  'Thriller',
  'A hacker uncovers a conspiracy buried in the city''s smart infrastructure — control of the subway, the power grid, and the water supply.',
  'The scariest part is how believable it is. This film reflects our growing dependence on systems we don''t understand and the few people who actually know how they work. It''s a love letter to critical thinking.',
  'Jamal Harrison',
  '',
  'https://www.youtube.com/watch?v=example4',
  2024, 19, false
),
(
  'The Whispering Dark',
  'Horror',
  'A family moves into a Victorian home with a tragic history, only to discover the house remembers every sorrow it has ever held.',
  'The real horror isn''t ghosts — it''s unprocessed grief. The house is a metaphor for how trauma embeds itself in places and people, echoing through generations until someone finally listens.',
  'Lydia Crane',
  '',
  'https://www.youtube.com/watch?v=example11',
  2025, 58, false
),
(
  'Crimson Tide Rising',
  'Thriller, Drama',
  'A submarine captain faces an impossible choice when a cryptic signal from the deep threatens to trigger global conflict.',
  'This is a masterclass in moral philosophy under pressure. It strips away the luxury of time and asks: when you have seconds to decide, what principles do you carry with you into the abyss?',
  'Thomas Grey',
  '',
  'https://www.youtube.com/watch?v=example12',
  2023, 44, false
),

-- Comedy
(
  'Laughing in the Dark',
  'Comedy',
  'A stand-up comedian unexpectedly goes blind and must rebuild her life and career without her most relied-upon sense.',
  'This isn''t really a movie about disability — it''s about how we convince ourselves we need things we don''t. The comedian discovers that her best material was always what she couldn''t see coming.',
  'Priya Kapoor',
  '',
  'https://www.youtube.com/watch?v=example3',
  2025, 28, false
),
(
  'The Last Honest Man',
  'Comedy, Drama',
  'A failed politician reinvents himself as a professional truth-teller, charging people to hear the brutal facts they avoid.',
  'A sharp satire on the modern aversion to honesty. It suggests that we don''t really want the truth — we want confirmation. The laugh line is that the truth-teller is the most lonely person in the room.',
  'Diana Reyes',
  '',
  'https://www.youtube.com/watch?v=example13',
  2024, 22, false
),

-- Animation
(
  'The Star-Catcher''s Daughter',
  'Animation',
  'A young girl living in a lighthouse befriends a fallen star and must return it to the sky before the Sun claims its light forever.',
  'Childhood is the only time we believe we can touch the stars. This film is a bittersweet farewell to that belief — not cynical, but tender. It reminds us that wonder is a choice we can carry into adulthood.',
  'Studio Ghibli Tribute',
  '',
  'https://www.youtube.com/watch?v=example14',
  2025, 71, false
),
(
  'Clockwork Forest',
  'Animation, Fantasy',
  'In a forest where every creature is a mechanical marvel, one tiny gear-daemon dreams of becoming a butterfly.',
  'A stunning meditation on purpose and transformation. The film argues that being designed for a specific function doesn''t limit your potential — every part, no matter how small, is essential to the whole.',
  'Yuki Tanaka',
  '',
  'https://www.youtube.com/watch?v=example15',
  2024, 35, false
),

-- Documentary & World Cinema
(
  'Fragments of Fire',
  'Documentary',
  'A decade-long chronicle of three generations of a family rebuilding their lives after a volcanic eruption destroys their island home.',
  'Disaster documentaries often focus on the event. This one focuses on the silence after. It''s a profound meditation on resilience — not the Hollywood kind, but the quiet, exhausting, daily act of continuing.',
  'Maria Santos',
  '',
  'https://www.youtube.com/watch?v=example16',
  2024, 16, false
),
(
  'The Silk Road Diaries',
  'World Cinema, Documentary',
  'A blind musician travels the ancient trade routes of Central Asia, collecting songs that have been passed down for centuries.',
  'This film redefines what it means to see. The musician experiences the world through melody, and in doing so, reveals that cultural memory is carried not in artifacts but in the songs we sing to one another.',
  'Rashid Karimov',
  '',
  'https://www.youtube.com/watch?v=example17',
  2023, 24, false
);      