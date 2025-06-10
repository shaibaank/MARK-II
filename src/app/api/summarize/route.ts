import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { searchResults, query } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    if (!searchResults || !Array.isArray(searchResults) || !query) {
      return NextResponse.json({ error: 'Search results and query are required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format search results for the prompt
    const formattedResults = searchResults.map((result, index) => 
      `Source ${index + 1}: ${result.title}\nURL: ${result.link}\nSummary: ${result.snippet}\n`
    ).join('\n');

    const prompt = `You are an expert research assistant that creates comprehensive, structured summaries from search results.
    
Here is a query: "${query}"

Here are the top 5 search results:

${formattedResults}

Create a well-structured research summary organized into the following distinct sections:

## OVERVIEW
- Provide a brief, clear introduction to the topic
- Explain why this topic is significant
- Outline the key areas that will be covered in the summary

## CORE INSIGHTS
- Identify and summarize key concepts, methods, and applications related to the topic
- Condense detailed information into digestible insights
- Highlight the most important findings from the sources
- Use bullet points for clarity when appropriate

## GAPS & CHALLENGES
- Analyze the collected data to identify what's missing or unresolved in the field
- Highlight ongoing debates or research challenges that remain open
- Discuss limitations in current understanding or methodologies

## VIEWPOINTS
- Compare different perspectives from the sources
- Identify any contradictions, overlaps, or consensus between them
- Present balanced information that shows the full spectrum of opinions
- Note any evolving perspectives or changing consensus

## PROJECT IDEAS
- Offer 3-5 feasible, actionable project proposals related to the topic
- Suggest further questions or research directions that could lead to new discoveries
- Provide specific starting points or methodological approaches for each idea

Format each section with clear headings, concise paragraphs, and use bullet points where appropriate. Write in a formal, academic tone.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error('Summarize API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}