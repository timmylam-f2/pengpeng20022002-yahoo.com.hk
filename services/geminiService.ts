
import { GoogleGenAI, Type } from "@google/genai";

export async function verifyAnswer(
  expression: string,
  userAnswer: string,
  expectedAnswer: string
): Promise<{ correct: boolean; explanation: string }> {
  try {
    // Initialize GoogleGenAI within the function call to ensure it uses the most up-to-date API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Task: Mathematical Equivalence Verification
      Context: A student is factoring an algebraic expression.
      Initial Expression: ${expression}
      Student Answer: ${userAnswer}
      Standard Answer: ${expectedAnswer}

      Compare the student's answer to the initial expression. 
      Check if multiplying out (expanding) the student's answer results in the initial expression.
      Also check if the student's answer is in a fully factored form.
      
      Return a JSON object with:
      - "correct": boolean
      - "explanation": a short friendly message in Chinese (Taiwan) explaining why it's correct or incorrect.
    `;

    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex math and STEM reasoning tasks
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
          },
          required: ["correct", "explanation"]
        }
      }
    });

    // Correctly accessing the .text property from the response
    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini verification failed:", error);
    // Fallback: Simple check if user input matches standard answer (ignoring spaces)
    const isBasicMatch = userAnswer.replace(/\s+/g, '') === expectedAnswer.replace(/\s+/g, '');
    return {
      correct: isBasicMatch,
      explanation: isBasicMatch ? "答對了！" : "再接再厲，看來答案有些出入。"
    };
  }
}
