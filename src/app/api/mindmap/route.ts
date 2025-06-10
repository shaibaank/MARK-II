import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Define a type for mind map nodes at the top level
export interface MindMapNode {
  id: string;
  label: string;
  children: string[];
}

export async function POST(req: Request) {
  try {    const { summary } = await req.json();
    
    // Extract topic from summary
    const topic = summary.overview ? summary.overview.split('.')[0] : 'Research Topic';
    
    const prompt = `Generate a mind map as a JSON object with the following structure. Follow these rules exactly:

1. Return ONLY a valid JSON object
2. No text before or after the JSON
3. No comments or explanations
4. Use double quotes for strings
5. All IDs must be strings like "1", "2", etc.
6. Every node ID referenced in children must exist
7. Keep labels short and clear

Convert this research summary into a mind map:
${JSON.stringify({
  topic: topic,
  overview: summary.overview,
  coreInsights: summary.coreInsights,
  gaps: summary.gaps,
  viewpoints: summary.viewpoints,
  ideas: summary.ideas
})}

Respond with ONLY this exact JSON structure:
{
  "nodes": [
    {"id": "1", "label": "Main Topic", "children": ["2", "3"]},
    {"id": "2", "label": "Key Finding 1", "children": []},
    {"id": "3", "label": "Key Finding 2", "children": ["4"]},
    {"id": "4", "label": "Subtopic", "children": []}
  ]
}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();    try {
      // Clean the response text to ensure it's valid JSON
      const cleanText = text.trim()
        .replace(/^```json\s*/, '')  // Remove JSON code block start if present
        .replace(/\s*```$/, '')      // Remove code block end if present
        .trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Validate the parsed JSON structure
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid mind map structure: missing nodes array');
      }
      
      // Validate each node has required properties
      (parsed.nodes as MindMapNode[]).forEach((node: MindMapNode) => {
        if (!node.id || !node.label || !Array.isArray(node.children)) {
          throw new Error('Invalid node structure');
        }
      });
      
      return NextResponse.json(parsed);
    } catch (err) {
      console.error('Failed to parse Gemini response:', text);
      console.error('Parse error:', err);
      return NextResponse.json({ 
        error: 'Failed to parse mind map JSON',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 400 });
    }
  } catch (err) {
    console.error('Mind map generation error:', err);
    return NextResponse.json({ 
      error: 'Failed to generate mind map',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
