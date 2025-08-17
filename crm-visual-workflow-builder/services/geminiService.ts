
import { GoogleGenAI, Type } from '@google/genai';
import { Node, Edge, NodeType, ActionType, WorkflowNode, WorkflowSuggestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const WORKFLOW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      description: 'An array of node objects for the workflow canvas.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique identifier for the node.' },
          type: { type: Type.STRING, description: 'The type of the node.', enum: Object.values(NodeType) },
          position: {
            type: Type.OBJECT,
            description: 'The x and y coordinates for the node on the canvas.',
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
            },
          },
          data: {
            type: Type.OBJECT,
            description: 'Data associated with the node.',
            properties: {
              label: { type: Type.STRING, description: 'The display label for the node.' },
              actionType: { type: Type.STRING, description: 'Specific action for Action nodes.', enum: Object.values(ActionType), nullable: true },
            },
          },
        },
      },
    },
    edges: {
      type: Type.ARRAY,
      description: 'An array of edge objects connecting the nodes.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique identifier for the edge (e.g., e1-2).' },
          source: { type: Type.STRING, description: 'The ID of the source node.' },
          target: { type: Type.STRING, description: 'The ID of the target node.' },
          label: { type: Type.STRING, description: 'An optional label for the edge (e.g., Yes/No for conditions).', nullable: true },
        },
      },
    },
  },
};

const SUGGESTIONS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of suggestions for the workflow.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['improvement', 'warning', 'info'], description: "The type of suggestion."},
                    suggestion: { type: Type.STRING, description: "The text of the suggestion."}
                }
            }
        }
    }
}

export const generateWorkflowFromPrompt = async (
  prompt: string
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const systemInstruction = `You are a CRM workflow expert. Based on the user's prompt, generate a visual workflow diagram.
- Create a logical sequence of nodes (Triggers, Actions, Conditions, Delays).
- Position nodes on a canvas from left to right. Start the first node at x=50, y=150. Increment x by about 250 for each subsequent step. For branches, adjust y position by about 100-150.
- Connect the nodes with edges.
- Provide clear, concise labels for each node.
- Node IDs must be unique strings. Edge IDs should be in the format 'e[sourceId]-[targetId]'.
- Ensure the output strictly adheres to the provided JSON schema.`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: WORKFLOW_SCHEMA,
        },
    });

    const text = response.text.trim();
    const cleanJson = text.replace(/^```json\s*|```\s*$/g, '');
    const workflowData = JSON.parse(cleanJson);
    
    if (!workflowData.nodes || !workflowData.edges) {
        throw new Error("Invalid workflow data structure received from AI.");
    }

    return workflowData;

  } catch (error) {
    console.error("Error generating workflow with Gemini:", error);
    throw new Error("Failed to generate workflow. Please check the prompt or API configuration.");
  }
};


export const getWorkflowSuggestions = async (
  workflow: { nodes: Node[], edges: Edge[] }
): Promise<WorkflowSuggestion[]> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const systemInstruction = `You are a CRM workflow optimization expert. Analyze the provided workflow JSON, which represents a visual workflow diagram.
- Look for common pitfalls: dead-end branches, missing conditions (e.g., a 'Condition' node should have two outgoing edges like 'Yes'/'No'), infinite loops, or illogical sequences.
- Suggest efficiency improvements: Can steps be combined? Is a delay too long or too short?
- Identify opportunities for better personalization or engagement.
- Provide a list of concise, actionable suggestions in the specified JSON format. The user is a business professional, not a developer.`;
  
  const prompt = `Please analyze this workflow and provide suggestions:\n\n${JSON.stringify(workflow, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: SUGGESTIONS_SCHEMA,
        },
    });

    const text = response.text.trim();
    const cleanJson = text.replace(/^```json\s*|```\s*$/g, '');
    const suggestionData = JSON.parse(cleanJson);

    if (!suggestionData.suggestions) {
       return [];
    }

    return suggestionData.suggestions;

  } catch (error) {
    console.error("Error getting workflow suggestions from Gemini:", error);
    throw new Error("Failed to analyze workflow. The AI model may be temporarily unavailable.");
  }
};