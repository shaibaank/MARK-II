'use client';

import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaSpinner, FaCheck, FaBook, FaBrain, FaQuestion, FaBalanceScale, FaLightbulb, FaCopy, FaDownload, FaRocket } from 'react-icons/fa';
import { HiDocument, HiLightBulb, HiExclamation, HiEye, HiBeaker } from 'react-icons/hi';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [summary, setSummary] = useState('');
  const [formattedSummary, setFormattedSummary] = useState<{
    overview: string;
    coreInsights: Array<{ text: string }>;
    gaps: Array<{ text: string }>;
    viewpoints: Array<{ text: string }>;
    ideas: Array<{ text: string }>;
  }>({
    overview: '',
    coreInsights: [],
    gaps: [],
    viewpoints: [],
    ideas: []
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0: start, 1: searching, 2: results & summarizing, 3: summary
  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Core Insights, 2: Gaps, 3: Viewpoints, 4: Ideas
  const [useCustomContent, setUseCustomContent] = useState(false);
  const [customContent, setCustomContent] = useState('');
  const [progressStep, setProgressStep] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const insightsRef = useRef<HTMLDivElement>(null);
  const gapsRef = useRef<HTMLDivElement>(null);
  const viewpointsRef = useRef<HTMLDivElement>(null);
  const ideasRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);

  const sectionRefs = [overviewRef, insightsRef, gapsRef, viewpointsRef, ideasRef];
  
  // Track last scroll position to determine scroll direction
  const lastScrollY = useRef(0);
  
  // Handle header scroll effect with disappearing
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only show header when at the top of the page
      if (currentScrollY <= 10) {
        setHeaderVisible(true);
        setHeaderScrolled(false);
      } else {
        setHeaderVisible(false);
        setHeaderScrolled(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !useCustomContent) return;
    
    setError('');
    setStep(1);
    setIsSearching(true);
    setProgressStep(1);
    
    // Scroll to the loading container
    window.scrollTo({
      top: window.innerHeight * 0.2,
      behavior: 'smooth'
    });
    
    try {
      // Simulate a delay to show the first step
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgressStep(2);
      
      // Fetch search results from SerpAPI
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }
      
      const searchData = await searchResponse.json();
      setSearchResults(searchData.results);
      setStep(2);
      
      // Simulate a delay for the searching step
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgressStep(3);
      
      // Now, summarize the results using Gemini
      setIsSummarizing(true);
      
      // Scroll to the sources found section
      if (sourcesRef.current) {
        setTimeout(() => {
          sourcesRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
      
      // Alternate "thinking" messages for better UX
      const thinkingMessages = [
        "Analyzing key concepts...",
        "Identifying research gaps...",
        "Comparing different viewpoints...",
        "Formulating project ideas...",
        "Structuring summary content..."
      ];
      
      let messageCounter = 0;
      const messageInterval = setInterval(() => {
        if (messageCounter < thinkingMessages.length) {
          setProgressStep(prevStep => Math.min(prevStep + 1, 6));
          messageCounter++;
        } else {
          clearInterval(messageInterval);
        }
      }, 1500);
      
      const summarizeResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          searchResults: searchData.results,
          query,
          useCustomContent,
          customContent
        })
      });
      
      clearInterval(messageInterval);
      
      if (!summarizeResponse.ok) {
        throw new Error('Summarization failed');
      }
      
      const summarizeData = await summarizeResponse.json();
      setSummary(summarizeData.summary);
      
      // Format the summary into sections
      formatSummary(summarizeData.summary);
      
      setProgressStep(7);
      
      setStep(3);
      setActiveTab(0); // Reset to Overview tab
      
      // Scroll to results
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error("Error:", err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSearching(false);
      setIsSummarizing(false);
    }
  };

  const formatSummary = (rawSummary: string) => {
    // This is a simplified formatter - in production you would use a more robust parser
    // Extracts sections based on markdown headers (## SECTION)
    const sections = rawSummary.split(/(?=## )/g);
    
    const formatted = {
      overview: '',
      coreInsights: [] as Array<{ text: string }>,
      gaps: [] as Array<{ text: string }>,
      viewpoints: [] as Array<{ text: string }>,
      ideas: [] as Array<{ text: string }>
    };
    
    // Helper to process text with proper formatting
    const processBoldText = (text: string) => {
      // Replace **text** pattern with proper HTML strong tags
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Also handle any * patterns that might be used for emphasis
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };
    
    sections.forEach(section => {
      if (section.includes('OVERVIEW')) {
        const cleanText = section.replace('## OVERVIEW', '').trim();
        formatted.overview = processBoldText(cleanText);
      }
      else if (section.includes('CORE INSIGHTS')) {
        // Extract bullet points
        const insights = section.replace('## CORE INSIGHTS', '').trim();
        const bulletPoints = insights.split(/\n\*|\n-/).filter(Boolean);
        
        formatted.coreInsights = bulletPoints.map(point => {
          // Remove any asterisks used for bold formatting and replace with proper HTML
          let text = point.trim().replace(/^\*|\s*\*\s*$/, '');
          
          // Process text to replace "**text**" with proper bold titles
          text = processBoldText(text);
          
          return { text };
        });
      }
      else if (section.includes('GAPS & CHALLENGES')) {
        const gaps = section.replace('## GAPS & CHALLENGES', '').trim();
        const bulletPoints = gaps.split(/\n\*|\n-/).filter(Boolean);
        
        formatted.gaps = bulletPoints.map(point => {
          let text = point.trim().replace(/^\*|\s*\*\s*$/, '');
          text = processBoldText(text);
          return { text };
        });
      }
      else if (section.includes('VIEWPOINTS')) {
        const viewpoints = section.replace('## VIEWPOINTS', '').trim();
        const bulletPoints = viewpoints.split(/\n\*|\n-/).filter(Boolean);
        
        formatted.viewpoints = bulletPoints.map(point => {
          let text = point.trim().replace(/^\*|\s*\*\s*$/, '');
          text = processBoldText(text);
          return { text };
        });
      }
      else if (section.includes('PROJECT IDEAS')) {
        const ideas = section.replace('## PROJECT IDEAS', '').trim();
        const bulletPoints = ideas.split(/\n\*|\n-/).filter(Boolean);
        
        formatted.ideas = bulletPoints.map(point => {
          let text = point.trim().replace(/^\*|\s*\*\s*$/, '');
          text = processBoldText(text);
          return { text };
        });
      }
    });
    
    setFormattedSummary(formatted);
  };

  // Auto-scroll to results when summary is complete
  useEffect(() => {
    if (step === 3 && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [step]);

  const scrollToSection = (index: number) => {
    setActiveTab(index);
    if (sectionRefs[index].current) {
      sectionRefs[index].current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a production app, you would add a success toast notification here
  };

  const resetResearch = () => {
    setStep(0);
    setQuery('');
    setCustomContent('');
    setSearchResults([]);
    setSummary('');
    setProgressStep(0);
  };

  return (
    <div className="app">
      {/* Hero Section */}
      <section 
        ref={headerRef} 
        className={`hero sticky-header ${headerScrolled ? 'scrolled' : ''} ${headerVisible ? 'visible' : 'hidden'}`}
      >
        <h1>Research Summary AI</h1>
        <p>Generate comprehensive research summaries on any topic using AI</p>
      </section>

      {/* Research Form */}
      <div className="research-form-container">
        <form onSubmit={handleSearch} className="research-form">
          <div className="form-group">
            <label htmlFor="search-query">Research Topic</label>
            <div className="relative">
              <input
                id="search-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Graph Neural Networks in Traffic Optimization"
                className="input-field"
                disabled={isSearching || isSummarizing}
              />
            </div>
          </div>
          
          <div className="form-group custom-content-toggle">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={useCustomContent}
                onChange={() => setUseCustomContent(!useCustomContent)}
                disabled={isSearching || isSummarizing}
              />
              <span>Use custom content instead</span>
            </label>
          </div>

          {useCustomContent && (
            <div className="form-group">
              <label htmlFor="custom-content">Custom Content</label>
              <textarea 
                id="custom-content"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Paste your research content here..."
                className="textarea-field"
                rows={6}
                disabled={isSearching || isSummarizing}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSearching || isSummarizing || (!query.trim() && !customContent.trim())}
            className="submit-button"
          >
            {isSearching || isSummarizing ? 'Generating...' : 'Generate Research Summary'}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {(isSearching || isSummarizing) && (
        <div className="loading-container">
          <div className="loading-animation">
            <div className="pulse-circle"></div>
          </div>
          
          <h3>Generating Research Summary</h3>
          <p className="loading-message">
            {progressStep === 1 && "Starting research process..."}
            {progressStep === 2 && "Searching for relevant sources..."}
            {progressStep === 3 && "Finding credible sources..."}
            {progressStep === 4 && "Extracting content from sources..."}
            {progressStep === 5 && "Processing extracted data..."}
            {progressStep === 6 && "Performing AI analysis..."}
            {progressStep === 7 && "Finalizing research summary..."}
          </p>
          
          <div className="progress-steps">
            {[
              { name: 'Starting', icon: '🚀' },
              { name: 'Searching', icon: '🔍' },
              { name: 'Finding Sources', icon: '📚' },
              { name: 'Extracting Content', icon: '📝' },
              { name: 'Processing Data', icon: '⚙️' },
              { name: 'AI Analysis', icon: '🧠' },
              { name: 'Finalizing', icon: '✨' }
            ].map((s, i) => (
              <div 
                key={i} 
                className={`step ${progressStep > i ? 'completed' : ''} ${progressStep === i ? 'active' : ''}`}
              >
                <div className="step-icon">{s.icon}</div>
                <div className="step-name">{s.name}</div>
              </div>
            ))}
          </div>
          
          {step === 2 && searchResults.length > 0 && (
            <div className="sources-found" ref={sourcesRef}>
              <h4>Sources found:</h4>
              <ul className="sources-list">
                {searchResults.map((result, index) => (
                  <li key={index} className="source-item animate-in">
                    <a href={result.link} target="_blank" rel="noopener noreferrer">
                      {result.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Research Summary */}
      <div ref={resultsRef}>
        {step === 3 && (
          <div className="research-summary animate-fade-in">
            <h2>Research Summary</h2>
            
            <div className="tabs-container">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 0 ? 'active' : ''}`}
                  onClick={() => scrollToSection(0)}
                >
                  Overview
                </button>
                <button 
                  className={`tab ${activeTab === 1 ? 'active' : ''}`}
                  onClick={() => scrollToSection(1)}
                >
                  Core Insights
                </button>
                <button 
                  className={`tab ${activeTab === 2 ? 'active' : ''}`}
                  onClick={() => scrollToSection(2)}
                >
                  Gaps & Challenges
                </button>
                <button 
                  className={`tab ${activeTab === 3 ? 'active' : ''}`}
                  onClick={() => scrollToSection(3)}
                >
                  Viewpoints
                </button>
                <button 
                  className={`tab ${activeTab === 4 ? 'active' : ''}`}
                  onClick={() => scrollToSection(4)}
                >
                  Project Ideas
                </button>
              </div>
            </div>
            
            <div className="tab-content">
              {/* Overview Section */}
              <div className="tab-panel animate-slide-up" ref={overviewRef}>
                <h3>Overview</h3>
                <div className="content">
                  <p>{formattedSummary.overview}</p>
                </div>
              </div>
              
              {/* Core Insights Section */}
              <div className="tab-panel animate-slide-up" ref={insightsRef}>
                <h3>Core Insights</h3>
                <ul className="content-list">
                  {formattedSummary.coreInsights.map((insight, index) => (
                    <li key={index} className="animate-item" style={{ '--index': index } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: insight.text }} />
                  ))}
                </ul>
              </div>
              
              {/* Gaps & Challenges Section */}
              <div className="tab-panel animate-slide-up" ref={gapsRef}>
                <h3>Gaps & Challenges</h3>
                <ul className="warning-list">
                  {formattedSummary.gaps.map((gap, index) => (
                    <li key={index} className="animate-item" style={{ '--index': index } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: gap.text }} />
                  ))}
                </ul>
              </div>
              
              {/* Viewpoints Section */}
              <div className="tab-panel animate-slide-up" ref={viewpointsRef}>
                <h3>Viewpoints</h3>
                <div className="viewpoints-grid">
                  {formattedSummary.viewpoints.map((viewpoint, index) => (
                    <div key={index} className="viewpoint-card animate-item" style={{ '--index': index } as React.CSSProperties}>
                      <p dangerouslySetInnerHTML={{ __html: viewpoint.text }} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Project Ideas Section */}
              <div className="tab-panel animate-slide-up" ref={ideasRef}>
                <h3>Project Ideas</h3>
                <div className="ideas-grid">
                  {formattedSummary.ideas.map((idea, index) => (
                    <div key={index} className="idea-card animate-item" style={{ '--index': index } as React.CSSProperties}>
                      <h4 className="idea-title">Project {index + 1}</h4>
                      <p dangerouslySetInnerHTML={{ __html: idea.text }} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* References Section */}
              <div className="tab-panel references-panel">
                <h3>References</h3>
                <ul className="references-list">
                  {searchResults.map((result, index) => (
                    <li key={index} className="reference-item">
                      <a href={result.link} target="_blank" rel="noopener noreferrer">
                        {result.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="summary-actions">
              <button className="action-button" onClick={() => copyToClipboard(summary)}>
                <span className="icon">📋</span> Copy to Clipboard
              </button>
              <button className="action-button">
                <span className="icon">📥</span> Download as PDF
              </button>
              <button className="action-button" onClick={resetResearch}>
                <span className="icon">🔄</span> Start New Research
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
