
import { GoogleGenAI } from "@google/genai";
import { ClothingCategory } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const processOutfitSwap = async (
  baseImageBase64: string,
  clothingImageBase64: string | null,
  prompt: string,
  category: ClothingCategory = ClothingCategory.FULL
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const basePart = {
    inlineData: {
      data: baseImageBase64.split(',')[1],
      mimeType: 'image/png'
    }
  };

  const categoryContext = {
    [ClothingCategory.TOP]: "Replace ONLY the top garment. CRITICAL: Observe the waistline of the original subject in Reference Image 1. If the original top was tucked in, ensure the new garment is also TUCKED IN to the original pants/skirt. If it was untucked, keep it untucked. Maintain all characteristics of the original bottom clothing perfectly.",
    [ClothingCategory.BOTTOM]: "Replace ONLY the bottom garment. CRITICAL: Maintain the original top exactly. If the original top was tucked into the old pants, ensure it is now seamlessly TUCKED INTO the new pants. Preserve the tucked/untucked orientation exactly as it appears in Image 1.",
    [ClothingCategory.FULL]: "Replace the entire clothing set while matching the body shape and pose of the subject in Image 1.",
    [ClothingCategory.SHOES]: "Replace ONLY the shoes. Keep the entire clothing set, including its styling and tucked/untucked state, exactly as it appears in Reference Image 1."
  };

  const instructions = `
    SYSTEM_DIRECTIVE: VOLUMETRIC_CLOTHING_SYNTHESIS
    CORE_LOGIC: ANATOMICAL_BODY_CONTOUR_MAPPING
    STYLING_STABILITY: PRESERVE_EXISTING_GARMENT_ORIENTATION
    
    REFERENCE_IMAGE_1 (IDENTITY_TARGET): 
    Primary human subject. You MUST preserve their face, hair, body shape, skin tone, skeletal pose, and background 100%. 
    ${categoryContext[category]}
    
    REFERENCE_IMAGE_2 (GARMENT_SOURCE): 
    Extract the fabric texture, pattern, and style. 
    ACTION: Isolate fabric texture from Image 2 to use as the source for the new garment.
    
    ANATOMICAL_FITTING_ENGINE (ACTIVE):
    - Map extracted garment geometry to the SUBJECT'S specific body volume.
    - ORIENTATION SYNC: Strictly respect the "tucked-in" vs "untucked" styling of Reference Image 1 for any non-swapped or overlapping garments.
    - BOUNDARY INTEGRATION: The meeting point between new and old garments (waistline, ankles, wrists) must be photorealistic and anatomically correct.
    - DRAUPE: Clothing MUST drape realistically based on pose (folds at joints, tension points).
    - Match global lighting and shadows from Reference Image 1 for perfect blending.
    
    USER_STYLE_OVERRIDE: ${prompt}
    
    OUTPUT: A high-resolution, photorealistic re-rendering showing the subject in the new outfit with original styling orientation preserved.
  `;

  const parts: any[] = [basePart];
  
  if (clothingImageBase64) {
    parts.push({
      inlineData: {
        data: clothingImageBase64.split(',')[1],
        mimeType: 'image/png'
      }
    });
  }

  parts.push({ text: instructions });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { parts },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("EMPTY_RESPONSE_FROM_MODEL");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("UNABLE_TO_EXTRACT_SYNTHETIC_IMAGE");
};
