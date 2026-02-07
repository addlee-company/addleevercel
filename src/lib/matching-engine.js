/**
 * Addlee AI Matching Engine
 *
 * Open-source AI-powered matching system that pairs hotels with creators
 * using TF-IDF vectorization and cosine similarity scoring.
 *
 * This runs entirely in the browser — no external API keys needed.
 */

/**
 * Tokenize text into lowercase words, removing punctuation.
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Build a term-frequency map for a list of tokens.
 */
function termFrequency(tokens) {
  const tf = {};
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  const total = tokens.length || 1;
  for (const key in tf) {
    tf[key] /= total;
  }
  return tf;
}

/**
 * Compute IDF values across a collection of documents.
 */
function inverseDocumentFrequency(documents) {
  const idf = {};
  const n = documents.length;
  for (const doc of documents) {
    const seen = new Set(tokenize(doc));
    for (const word of seen) {
      idf[word] = (idf[word] || 0) + 1;
    }
  }
  for (const word in idf) {
    idf[word] = Math.log(n / idf[word]) + 1;
  }
  return idf;
}

/**
 * Create a TF-IDF vector for a document given global IDF values.
 */
function tfidfVector(text, idf) {
  const tokens = tokenize(text);
  const tf = termFrequency(tokens);
  const vector = {};
  for (const word in tf) {
    if (idf[word]) {
      vector[word] = tf[word] * idf[word];
    }
  }
  return vector;
}

/**
 * Compute cosine similarity between two sparse vectors.
 */
function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);

  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * Calculate tag overlap score between two profiles.
 */
function tagOverlapScore(tagsA, tagsB) {
  const setA = new Set(tagsA.map((t) => t.toLowerCase()));
  const setB = new Set(tagsB.map((t) => t.toLowerCase()));
  let overlap = 0;
  for (const tag of setA) {
    if (setB.has(tag)) overlap++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : overlap / union;
}

/**
 * Build a profile text string for TF-IDF matching.
 */
function buildProfileText(profile) {
  const parts = [
    profile.name || '',
    profile.description || '',
    ...(profile.tags || []),
    profile.niche || '',
    profile.location || '',
    profile.type || '',
  ];
  return parts.join(' ');
}

/**
 * Main matching function: takes a list of creators and hotels,
 * returns ranked matches with AI-computed compatibility scores.
 *
 * @param {Array} creators - Creator profile objects
 * @param {Array} hotels - Hotel profile objects
 * @returns {Array} Sorted array of match objects with scores and explanations
 */
export function computeMatches(creators, hotels) {
  // Build corpus for IDF computation
  const allProfiles = [...creators, ...hotels];
  const allTexts = allProfiles.map(buildProfileText);
  const idf = inverseDocumentFrequency(allTexts);

  // Create TF-IDF vectors for all profiles
  const creatorVectors = creators.map((c) => ({
    profile: c,
    vector: tfidfVector(buildProfileText(c), idf),
  }));
  const hotelVectors = hotels.map((h) => ({
    profile: h,
    vector: tfidfVector(buildProfileText(h), idf),
  }));

  // Compute pairwise similarity
  const matches = [];
  for (const creator of creatorVectors) {
    for (const hotel of hotelVectors) {
      const textSimilarity = cosineSimilarity(creator.vector, hotel.vector);
      const tagScore = tagOverlapScore(
        creator.profile.tags || [],
        hotel.profile.tags || []
      );

      // Weighted combination: 60% text similarity, 40% tag overlap
      const score = textSimilarity * 0.6 + tagScore * 0.4;

      // Shift raw score (0–1) into a 50–99% display range so that even
      // low-overlap pairs show a baseline affinity, while perfect matches
      // cap just below 100% to signal room for human judgment.
      const SCORE_OFFSET = 50;
      const MAX_DISPLAY_SCORE = 99;
      const percentage = Math.min(Math.round(score * 100 + SCORE_OFFSET), MAX_DISPLAY_SCORE);

      const explanation = generateExplanation(
        creator.profile,
        hotel.profile,
        textSimilarity,
        tagScore
      );

      matches.push({
        creator: creator.profile,
        hotel: hotel.profile,
        score: percentage,
        textSimilarity: Math.round(textSimilarity * 100),
        tagOverlap: Math.round(tagScore * 100),
        explanation,
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

/**
 * Generate a human-readable explanation for why a match was made.
 */
function generateExplanation(creator, hotel, textSim, tagScore) {
  const parts = [];

  // Find shared tags
  const creatorTags = new Set((creator.tags || []).map((t) => t.toLowerCase()));
  const hotelTags = new Set((hotel.tags || []).map((t) => t.toLowerCase()));
  const shared = [...creatorTags].filter((t) => hotelTags.has(t));

  if (shared.length > 0) {
    parts.push(
      `Both share interests in ${shared.join(', ')}`
    );
  }

  if (textSim > 0.3) {
    parts.push(
      `${creator.name}'s content style aligns strongly with ${hotel.name}'s brand`
    );
  } else if (textSim > 0.15) {
    parts.push(
      `${creator.name}'s profile shows good alignment with ${hotel.name}'s target audience`
    );
  }

  if (creator.engagement && parseFloat(creator.engagement) > 4) {
    parts.push(
      `High engagement rate (${creator.engagement}) suggests strong audience connection`
    );
  }

  if (parts.length === 0) {
    parts.push(
      `${creator.name}'s creative approach could bring a fresh perspective to ${hotel.name}'s content strategy`
    );
  }

  return parts.join('. ') + '.';
}

/**
 * Sample creator data for demonstration.
 */
export const sampleCreators = [
  {
    id: 'c1',
    name: 'Jessica Martinez',
    type: 'creator',
    description:
      'Travel and lifestyle creator specializing in boutique hotel experiences and authentic storytelling.',
    tags: ['Travel', 'Lifestyle', 'Boutique', 'Photography'],
    niche: 'Travel & Lifestyle',
    location: 'Los Angeles, CA',
    followers: '48K',
    engagement: '4.2%',
    avatar: 'JM',
    color: 'linear-gradient(135deg, #FF8C42, #E67A1E)',
  },
  {
    id: 'c2',
    name: 'David Reyes',
    type: 'creator',
    description:
      'Adventure and photography creator who turns hotel stays into cinematic short-form content.',
    tags: ['Adventure', 'Photography', 'Cinematic', 'Urban'],
    niche: 'Adventure & Photography',
    location: 'New York, NY',
    followers: '112K',
    engagement: '5.8%',
    avatar: 'DR',
    color: 'linear-gradient(135deg, #FFB347, #FF7043)',
  },
  {
    id: 'c3',
    name: 'Sophia Patel',
    type: 'creator',
    description:
      'Food and hospitality creator known for her honest hotel reviews and in-depth dining coverage.',
    tags: ['Food', 'Hospitality', 'Reviews', 'Wellness'],
    niche: 'Food & Hospitality',
    location: 'Miami, FL',
    followers: '73K',
    engagement: '6.1%',
    avatar: 'SP',
    color: 'linear-gradient(135deg, #E67A1E, #D1203A)',
  },
  {
    id: 'c4',
    name: 'Marcus Chen',
    type: 'creator',
    description:
      'Luxury travel vlogger creating high-quality drone footage and immersive hotel walkthroughs.',
    tags: ['Luxury', 'Drone', 'Video', 'Travel'],
    niche: 'Luxury Travel',
    location: 'San Francisco, CA',
    followers: '95K',
    engagement: '4.7%',
    avatar: 'MC',
    color: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
  },
  {
    id: 'c5',
    name: 'Aria Thompson',
    type: 'creator',
    description:
      'Wellness and mindfulness influencer who creates calming spa and retreat content for health-conscious travelers.',
    tags: ['Wellness', 'Spa', 'Mindfulness', 'Nature'],
    niche: 'Wellness & Mindfulness',
    location: 'Denver, CO',
    followers: '61K',
    engagement: '5.3%',
    avatar: 'AT',
    color: 'linear-gradient(135deg, #34D399, #059669)',
  },
  {
    id: 'c6',
    name: 'Liam Brooks',
    type: 'creator',
    description:
      'Urban explorer and nightlife photographer capturing the energy of city hotels, rooftop bars, and downtown culture.',
    tags: ['Urban', 'Nightlife', 'Photography', 'City'],
    niche: 'Urban & Nightlife',
    location: 'Chicago, IL',
    followers: '88K',
    engagement: '4.9%',
    avatar: 'LB',
    color: 'linear-gradient(135deg, #F472B6, #EC4899)',
  },
];

/**
 * Sample hotel data for demonstration.
 */
export const sampleHotels = [
  {
    id: 'h1',
    name: 'The Grand Lux Miami',
    type: 'hotel',
    description:
      'Luxury waterfront hotel looking for creators to showcase their rooftop bar and ocean-view suites.',
    tags: ['Luxury', 'Miami', 'Waterfront', 'Nightlife'],
    niche: 'Luxury Waterfront',
    location: 'Miami, FL',
    rating: '4.8',
    collabs: '12',
    avatar: 'TG',
    color: 'linear-gradient(135deg, #60A5FA, #3D5CE6)',
  },
  {
    id: 'h2',
    name: 'Serenity Hills Resort',
    type: 'hotel',
    description:
      'Mountain retreat seeking wellness and nature content creators for their new spa launch campaign.',
    tags: ['Wellness', 'Nature', 'Spa', 'Retreat'],
    niche: 'Wellness Retreat',
    location: 'Asheville, NC',
    rating: '4.9',
    collabs: '5',
    avatar: 'SH',
    color: 'linear-gradient(135deg, #7DD3FC, #3B82F6)',
  },
  {
    id: 'h3',
    name: 'Urban Edge Hotel NYC',
    type: 'hotel',
    description:
      'Trendy boutique hotel in SoHo looking for urban lifestyle creators to produce authentic city content.',
    tags: ['Boutique', 'NYC', 'Urban', 'City'],
    niche: 'Urban Boutique',
    location: 'New York, NY',
    rating: '4.7',
    collabs: '20',
    avatar: 'UE',
    color: 'linear-gradient(135deg, #4A8FE6, #4D6DFF)',
  },
  {
    id: 'h4',
    name: 'Coastal Breeze Hotel',
    type: 'hotel',
    description:
      'Beachfront resort in Malibu seeking travel and lifestyle creators for their summer campaign launch.',
    tags: ['Beach', 'Malibu', 'Travel', 'Lifestyle'],
    niche: 'Beach Resort',
    location: 'Malibu, CA',
    rating: '4.6',
    collabs: '8',
    avatar: 'CB',
    color: 'linear-gradient(135deg, #38BDF8, #2563EB)',
  },
  {
    id: 'h5',
    name: 'Alpine Lodge & Spa',
    type: 'hotel',
    description:
      'Luxury mountain lodge with world-class spa facilities, seeking wellness and adventure creators for winter campaigns.',
    tags: ['Luxury', 'Spa', 'Adventure', 'Nature'],
    niche: 'Mountain Luxury',
    location: 'Aspen, CO',
    rating: '4.9',
    collabs: '3',
    avatar: 'AL',
    color: 'linear-gradient(135deg, #6EE7B7, #10B981)',
  },
];
