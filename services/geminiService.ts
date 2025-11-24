import { GoogleGenAI, Type } from "@google/genai";
import { Grid, TileType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION_GENERATOR = `
You are a Sokoban level designer. 
Create a valid, solvable Sokoban level.
Use standard characters:
'#' for wall
'@' for player
'$' for box
'.' for target
' ' for empty floor
'*' for box on target
'+' for player on target

Rules:
1. The level must be enclosed by walls '#'.
2. The number of boxes '$' must equal the number of targets '.'.
3. The level should be solvable.
4. Keep the size reasonable (e.g., between 6x6 and 10x10).
5. Output purely the JSON structure requested.
`;

const SYSTEM_INSTRUCTION_HINT = `
You are an expert Sokoban solver.
Analyze the provided game board state and give a helpful, concise hint to the player.
Focus on the immediate next logical step or a strategic observation.
Do not just say "move right", explain *why* briefly (e.g., "Move the box on the left to clear a path to the top target").
`;

export const generateLevelWithGemini = async (difficulty: 'easy' | 'medium' | 'hard'): Promise<string[]> => {
  try {
    const prompt = `Generate a ${difficulty} Sokoban level map.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_GENERATOR,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            map: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The rows of the Sokoban level map"
            },
            name: {
              type: Type.STRING,
              description: "A creative name for this level"
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    if (data.map && Array.isArray(data.map)) {
      return data.map;
    }
    throw new Error("Invalid format returned by AI");

  } catch (error) {
    console.error("Gemini Level Generation Error:", error);
    // Fallback simple level if AI fails
    return [
      "#####",
      "#@$.#",
      "#####"
    ];
  }
};

export const getHintFromGemini = async (grid: Grid): Promise<string> => {
  try {
    // Convert grid back to string representation
    const mapString = grid.map(row => row.join('')).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is the current Sokoban board:\n\`\`\`\n${mapString}\n\`\`\`\nWhat should I do next?`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_HINT,
        maxOutputTokens: 150, // Keep hints concise
      }
    });

    return response.text || "Try moving a box to a target.";
  } catch (error) {
    console.error("Gemini Hint Error:", error);
    return "The AI is currently pondering other universes. Try moving a box!";
  }
};