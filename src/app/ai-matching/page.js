'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  computeMatches,
  sampleCreators,
  sampleHotels,
} from '../../lib/matching-engine';

export default function AIMatchingPage() {
  const [matches, setMatches] = useState([]);
  const [isComputing, setIsComputing] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [filter, setFilter] = useState('all');
  const [minScore, setMinScore] = useState(0);

  // Simulated delay so users see the AI "processing" animation (UX only)
  const PROCESSING_DELAY_MS = 1500;

  const runMatching = useCallback(() => {
    setIsComputing(true);
    setHasRun(false);

    setTimeout(() => {
      const results = computeMatches(sampleCreators, sampleHotels);
      setMatches(results);
      setIsComputing(false);
      setHasRun(true);
    }, PROCESSING_DELAY_MS);
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (m.score < minScore) return false;
    if (filter === 'top') return m.score >= 80;
    if (filter === 'good') return m.score >= 65 && m.score < 80;
    return true;
  });

  return (
    <>
      <style>{pageStyles}</style>
      <div className="ai-page">
        {/* Sidebar */}
        <aside className="ai-sidebar">
          <a href="/index.html" className="sidebar-logo">
            <img
              src="https://raw.githubusercontent.com/addlee-company/Images-/main/nobackgroundlogo.png"
              alt="Addlee Logo"
            />
            <span>Addlee</span>
          </a>
          <nav className="sidebar-nav">
            <a href="/index.html" className="sidebar-link">← Back to Home</a>
            <a href="/creator-portal.html" className="sidebar-link">🎨 Creator Portal</a>
            <a href="/hotel-portal.html" className="sidebar-link">🏨 Hotel Portal</a>
            <a href="/ai-matching" className="sidebar-link active">🤖 AI Matching</a>
          </nav>
          <div className="sidebar-footer">
            <div className="ai-badge">
              <span>⚡</span> Powered by Open-Source AI
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="ai-main">
          <header className="ai-header">
            <div className="header-label">
              <span>🤖</span> AI Matching Engine
            </div>
            <div style={{ flex: 1 }} />
            <a href="/creator-portal.html" className="header-link">Creator Portal</a>
            <a href="/hotel-portal.html" className="header-link">Hotel Portal</a>
          </header>

          <div className="ai-content">
            {/* Hero Section */}
            <div className="ai-hero">
              <h1>AI-Powered Creator × Hotel Matching</h1>
              <p>
                Our open-source AI engine analyzes creator profiles and hotel
                needs using TF-IDF vectorization and cosine similarity to find
                the best partnerships — all running in your browser.
              </p>
              <button
                className="run-btn"
                onClick={runMatching}
                disabled={isComputing}
              >
                {isComputing
                  ? '⏳ AI is analyzing profiles...'
                  : hasRun
                    ? '🔄 Re-run AI Matching'
                    : '🚀 Run AI Matching Engine'}
              </button>
            </div>

            {/* How it Works */}
            <div className="how-it-works">
              <h2>How the AI Works</h2>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-icon">📊</div>
                  <h3>1. Profile Analysis</h3>
                  <p>
                    TF-IDF vectorization converts creator and hotel profiles
                    into numerical representations, capturing their unique
                    characteristics.
                  </p>
                </div>
                <div className="step-card">
                  <div className="step-icon">🧮</div>
                  <h3>2. Similarity Scoring</h3>
                  <p>
                    Cosine similarity measures how closely aligned each
                    creator-hotel pair is across multiple dimensions of their
                    profiles.
                  </p>
                </div>
                <div className="step-card">
                  <div className="step-icon">🏷️</div>
                  <h3>3. Tag Matching</h3>
                  <p>
                    Jaccard similarity on profile tags identifies shared
                    interests and overlapping niches between creators and
                    hotels.
                  </p>
                </div>
                <div className="step-card">
                  <div className="step-icon">🎯</div>
                  <h3>4. Smart Ranking</h3>
                  <p>
                    A weighted combination (60% text + 40% tags) produces a
                    final compatibility score, ranking the best matches first.
                  </p>
                </div>
              </div>
            </div>

            {/* Computing Animation */}
            {isComputing && (
              <div className="computing-overlay">
                <div className="computing-spinner" />
                <p>Analyzing {sampleCreators.length} creators × {sampleHotels.length} hotels...</p>
                <p className="computing-sub">Running TF-IDF vectorization and cosine similarity</p>
              </div>
            )}

            {/* Results */}
            {hasRun && !isComputing && (
              <div className="results-section">
                <div className="results-header">
                  <h2>Match Results</h2>
                  <p>{filteredMatches.length} matches found from {matches.length} total pairs</p>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                  <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All Matches
                  </button>
                  <button
                    className={`filter-btn ${filter === 'top' ? 'active' : ''}`}
                    onClick={() => setFilter('top')}
                  >
                    🌟 Top Matches (80%+)
                  </button>
                  <button
                    className={`filter-btn ${filter === 'good' ? 'active' : ''}`}
                    onClick={() => setFilter('good')}
                  >
                    ✅ Good Matches (65-79%)
                  </button>
                  <div className="score-filter">
                    <label>Min Score: {minScore}%</label>
                    <input
                      type="range"
                      min="0"
                      max="95"
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Match Cards */}
                <div className="matches-list">
                  {filteredMatches.map((match, i) => (
                    <div key={`${match.creator.id}-${match.hotel.id}`} className="match-card">
                      <div className="match-rank">#{i + 1}</div>
                      <div className="match-pair">
                        <div className="match-profile">
                          <div
                            className="match-avatar"
                            style={{ background: match.creator.color }}
                          >
                            {match.creator.avatar}
                          </div>
                          <div className="match-info">
                            <div className="match-name">{match.creator.name}</div>
                            <div className="match-type">🎨 Creator</div>
                            <div className="match-meta">
                              {match.creator.followers} followers · {match.creator.engagement} eng.
                            </div>
                            <div className="match-tags">
                              {match.creator.tags.map((tag) => (
                                <span key={tag} className="tag creator-tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="match-connector">
                          <div
                            className={`match-score ${
                              match.score >= 80
                                ? 'score-high'
                                : match.score >= 65
                                  ? 'score-good'
                                  : 'score-fair'
                            }`}
                          >
                            {match.score}%
                          </div>
                          <div className="match-label">AI Match</div>
                          <div className="score-breakdown">
                            <span>Text: {match.textSimilarity}%</span>
                            <span>Tags: {match.tagOverlap}%</span>
                          </div>
                        </div>

                        <div className="match-profile">
                          <div
                            className="match-avatar"
                            style={{ background: match.hotel.color }}
                          >
                            {match.hotel.avatar}
                          </div>
                          <div className="match-info">
                            <div className="match-name">{match.hotel.name}</div>
                            <div className="match-type">🏨 Hotel</div>
                            <div className="match-meta">
                              ⭐ {match.hotel.rating} rating · {match.hotel.collabs} collabs
                            </div>
                            <div className="match-tags">
                              {match.hotel.tags.map((tag) => (
                                <span key={tag} className="tag hotel-tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="match-explanation">
                        <strong>🤖 AI Insight:</strong> {match.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profiles Section */}
            <div className="profiles-section">
              <h2>Available Profiles</h2>
              <div className="profiles-grid">
                <div>
                  <h3 className="profiles-heading creator-heading">🎨 Creators ({sampleCreators.length})</h3>
                  {sampleCreators.map((creator) => (
                    <div key={creator.id} className="profile-card">
                      <div className="profile-avatar" style={{ background: creator.color }}>
                        {creator.avatar}
                      </div>
                      <div className="profile-info">
                        <div className="profile-name">{creator.name}</div>
                        <div className="profile-desc">{creator.description}</div>
                        <div className="profile-stats">
                          {creator.followers} followers · {creator.engagement} eng.
                        </div>
                        <div className="match-tags">
                          {creator.tags.map((tag) => (
                            <span key={tag} className="tag creator-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="profiles-heading hotel-heading">🏨 Hotels ({sampleHotels.length})</h3>
                  {sampleHotels.map((hotel) => (
                    <div key={hotel.id} className="profile-card">
                      <div className="profile-avatar" style={{ background: hotel.color }}>
                        {hotel.avatar}
                      </div>
                      <div className="profile-info">
                        <div className="profile-name">{hotel.name}</div>
                        <div className="profile-desc">{hotel.description}</div>
                        <div className="profile-stats">
                          ⭐ {hotel.rating} rating · {hotel.collabs} collabs
                        </div>
                        <div className="match-tags">
                          {hotel.tags.map((tag) => (
                            <span key={tag} className="tag hotel-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const pageStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f5f7fa;
    color: #333;
  }

  .ai-page {
    display: flex;
    min-height: 100vh;
  }

  /* Sidebar */
  .ai-sidebar {
    width: 260px;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 100;
  }

  .sidebar-logo {
    padding: 1.75rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    text-decoration: none;
  }

  .sidebar-logo img {
    height: 40px;
    width: auto;
    filter: brightness(0) invert(1);
  }

  .sidebar-logo span {
    font-size: 1.4rem;
    font-weight: 700;
    color: white;
  }

  .sidebar-nav {
    flex: 1;
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sidebar-link {
    display: block;
    padding: 0.9rem 1.5rem;
    color: rgba(255,255,255,0.65);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
  }

  .sidebar-link:hover {
    background: rgba(255,255,255,0.08);
    color: white;
  }

  .sidebar-link.active {
    background: rgba(255,255,255,0.12);
    color: #a78bfa;
    font-weight: 600;
    border-left-color: #a78bfa;
  }

  .sidebar-footer {
    padding: 1.25rem 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .ai-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #a78bfa;
    font-size: 0.8rem;
    font-weight: 600;
  }

  /* Main Content */
  .ai-main {
    flex: 1;
    margin-left: 260px;
  }

  .ai-header {
    background: white;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    position: sticky;
    top: 0;
    z-index: 50;
    gap: 1rem;
  }

  .header-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #7C3AED;
    background: #F3E8FF;
    padding: 0.4rem 1rem;
    border-radius: 50px;
  }

  .header-link {
    color: #4D6DFF;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .header-link:hover {
    background: #f0f4ff;
  }

  .ai-content {
    padding: 2rem;
    max-width: 1200px;
  }

  /* Hero */
  .ai-hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border-radius: 20px;
    padding: 3rem;
    color: white;
    text-align: center;
    margin-bottom: 2rem;
  }

  .ai-hero h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ai-hero p {
    color: rgba(255,255,255,0.8);
    font-size: 1.05rem;
    line-height: 1.7;
    max-width: 700px;
    margin: 0 auto 2rem;
  }

  .run-btn {
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, #a78bfa, #7c3aed);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
  }

  .run-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(124, 58, 237, 0.5);
  }

  .run-btn:disabled {
    opacity: 0.8;
    cursor: wait;
  }

  /* How it Works */
  .how-it-works {
    margin-bottom: 2rem;
  }

  .how-it-works h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 1.25rem;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .step-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    text-align: center;
  }

  .step-icon {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }

  .step-card h3 {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 0.5rem;
  }

  .step-card p {
    font-size: 0.85rem;
    color: #666;
    line-height: 1.5;
  }

  /* Computing Animation */
  .computing-overlay {
    text-align: center;
    padding: 3rem;
    margin: 2rem 0;
  }

  .computing-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #e5e7eb;
    border-top-color: #7c3aed;
    border-radius: 50%;
    margin: 0 auto 1.5rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .computing-overlay p {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a2e;
  }

  .computing-sub {
    font-size: 0.9rem !important;
    color: #888 !important;
    font-weight: 400 !important;
    margin-top: 0.5rem;
  }

  /* Results */
  .results-section {
    margin-bottom: 2rem;
  }

  .results-header {
    margin-bottom: 1rem;
  }

  .results-header h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a2e;
  }

  .results-header p {
    color: #888;
    font-size: 0.9rem;
  }

  .filters-bar {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    background: #f5f5f5;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
  }

  .filter-btn.active {
    background: #7c3aed;
    color: white;
    border-color: #7c3aed;
  }

  .score-filter {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #666;
  }

  .score-filter input[type="range"] {
    width: 120px;
    accent-color: #7c3aed;
  }

  /* Match Cards */
  .matches-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .match-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .match-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  .match-rank {
    font-size: 0.8rem;
    font-weight: 700;
    color: #7c3aed;
    margin-bottom: 0.75rem;
  }

  .match-pair {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .match-profile {
    flex: 1;
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .match-avatar {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .match-info {
    flex: 1;
    min-width: 0;
  }

  .match-name {
    font-weight: 700;
    font-size: 1rem;
    color: #1a1a2e;
  }

  .match-type {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.15rem;
  }

  .match-meta {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
  }

  .match-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.5rem;
  }

  .tag {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .creator-tag {
    background: #FFF5EB;
    color: #E67A1E;
  }

  .hotel-tag {
    background: #EEF2FF;
    color: #4D6DFF;
  }

  .match-connector {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0 1rem;
    flex-shrink: 0;
  }

  .match-score {
    font-size: 1.5rem;
    font-weight: 800;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .score-high {
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #059669;
  }

  .score-good {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #2563eb;
  }

  .score-fair {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #d97706;
  }

  .match-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .score-breakdown {
    display: flex;
    gap: 0.5rem;
    font-size: 0.65rem;
    color: #aaa;
  }

  .match-explanation {
    margin-top: 1rem;
    padding: 0.85rem 1rem;
    background: #faf5ff;
    border-radius: 10px;
    font-size: 0.85rem;
    color: #555;
    line-height: 1.5;
    border-left: 3px solid #a78bfa;
  }

  /* Profiles */
  .profiles-section {
    margin-top: 2rem;
  }

  .profiles-section h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 1.25rem;
  }

  .profiles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }

  .profiles-heading {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid;
  }

  .creator-heading {
    color: #E67A1E;
    border-color: #E67A1E;
  }

  .hotel-heading {
    color: #4D6DFF;
    border-color: #4D6DFF;
  }

  .profile-card {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.04);
  }

  .profile-avatar {
    width: 45px;
    height: 45px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .profile-name {
    font-weight: 700;
    font-size: 0.95rem;
    color: #1a1a2e;
  }

  .profile-desc {
    font-size: 0.8rem;
    color: #888;
    margin-top: 0.2rem;
    line-height: 1.4;
  }

  .profile-stats {
    font-size: 0.75rem;
    color: #666;
    margin-top: 0.3rem;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .ai-sidebar {
      display: none;
    }

    .ai-main {
      margin-left: 0;
    }

    .steps-grid {
      grid-template-columns: 1fr 1fr;
    }

    .match-pair {
      flex-direction: column;
      text-align: center;
    }

    .match-profile {
      flex-direction: column;
      align-items: center;
    }

    .match-info {
      text-align: center;
    }

    .match-tags {
      justify-content: center;
    }

    .profiles-grid {
      grid-template-columns: 1fr;
    }

    .filters-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .score-filter {
      margin-left: 0;
      margin-top: 0.5rem;
    }
  }

  @media (max-width: 600px) {
    .steps-grid {
      grid-template-columns: 1fr;
    }

    .ai-hero h1 {
      font-size: 1.5rem;
    }

    .ai-content {
      padding: 1rem;
    }
  }
`;
