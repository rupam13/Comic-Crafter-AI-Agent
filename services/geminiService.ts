import { GoogleGenAI, Type } from "@google/genai";
import type { Character, StoryPanel, GeneratedPanel, DialogueEntry } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

type GeneratedStoryPanel = Omit<StoryPanel, 'id'> & {
    dialogues: Omit<DialogueEntry, 'id'>[]
};

export async function generateStoryFromPrompt(character: Character, prompt: string, numPanels: number): Promise<GeneratedStoryPanel[]> {
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                scene: {
                    type: Type.STRING,
                    description: "A detailed description of the background, setting, and what is happening in the panel. Should be from a visual perspective."
                },
                expression: {
                    type: Type.STRING,
                    description: `A short description of the character ${character.name}'s facial expression and physical action or pose.`
                },
                dialogues: {
                    type: Type.ARRAY,
                    description: "A list of dialogues or captions for the panel. Can be empty.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            speaker: {
                                type: Type.STRING,
                                description: "The name of the character speaking. If it's narration, leave this empty. If it's a thought, include the word 'thought'."
                            },
                            dialogue: {
                                type: Type.STRING,
                                description: "The line of dialogue or the caption text."
                            }
                        },
                        required: ['dialogue']
                    }
                }
            },
            required: ['scene', 'expression', 'dialogues']
        }
    };

    const generationPrompt = `
        You are a creative comic book writer.
        Your task is to generate a comic book storyboard based on a user's prompt.
        The main character is ${character.name}, who is described as: "${character.description}". Keep this description consistent.

        The user's story idea is: "${prompt}".

        Create a compelling story arc that spans exactly ${numPanels} panels.
        For each panel, provide a scene description, the character's expression/action, and any dialogues or captions.
        - The scene should describe the setting and action visually.
        - The expression should focus on the character's emotion and pose.
        - Dialogues can be from the main character, other characters, or be a narrator's caption.
        - For narrator captions, the 'speaker' field should be an empty string.
        - For thought bubbles, the 'speaker' should contain the word 'thought' (e.g., "${character.name} (thought bubble)").

        Generate a JSON array of ${numPanels} panel objects that strictly follows the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText);

        if (!Array.isArray(parsedResult)) {
            throw new Error("AI response was not a JSON array.");
        }
        
        if (parsedResult.length === 0 && numPanels > 0) {
             throw new Error("AI returned an empty story. Try a different prompt.");
        }

        return parsedResult as GeneratedStoryPanel[];

    } catch (error) {
        console.error("Error generating story from prompt:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate story: ${error.message}`);
        }
        throw new Error("An unknown error occurred during story generation.");
    }
}


export async function generateComicPanels(character: Character, panels: StoryPanel[]): Promise<GeneratedPanel[]> {
  try {
    const imageGenerationPromises = panels.map(async (panel) => {
      const prompt = `
        A comic book panel featuring a character named ${character.name}.
        **Consistent Character Description**: "${character.description}".
        **Art Style**: Modern digital comic art, vibrant colors, clean lines, dynamic shading, cinematic composition.
        **Scene**: ${panel.scene}
        **Character Expression/Action**: ${panel.expression}
        Do not include any text, speech bubbles, or captions in the image.
      `;

      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });
      
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
      
      return {
        ...panel,
        imageUrl,
      };
    });

    const generatedPanels = await Promise.all(imageGenerationPromises);
    return generatedPanels;

  } catch (error) {
    console.error("Error generating comic panels:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate comic panels: ${error.message}`);
    }
    throw new Error("An unknown error occurred during comic generation.");
  }
}