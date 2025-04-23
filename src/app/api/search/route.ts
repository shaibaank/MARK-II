import { NextResponse } from 'next/server';
// Assuming you might create src/interfaces.ts later
// import type { SearchResult } from '@/interfaces'; 

// Define the interface inline for now if src/interfaces.ts doesn't exist
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const serpApiKey = process.env.SERPAPI_KEY;

    if (!serpApiKey) {
      return NextResponse.json({ error: 'SerpAPI key is missing' }, { status: 500 });
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('engine', 'google');
    url.searchParams.append('q', query);
    url.searchParams.append('api_key', serpApiKey);
    url.searchParams.append('num', '5'); // Get top 5 results

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Extract organic results
    // Use 'unknown' first, then check structure before assuming 'any[]'
    const organicResultsData = data.organic_results;
    const organicResults: { title: string; link: string; snippet: string }[] = 
        Array.isArray(organicResultsData) ? organicResultsData : [];
    
    // Format the results
    const formattedResults: SearchResult[] = organicResults
      .slice(0, 5)
      // Explicitly type the 'result' parameter here
      .map((result: { title: string; link: string; snippet: string }): SearchResult => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
      }));

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
} 