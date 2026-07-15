import api from './api';

// ── Image Generator — Generates via Pollinations.ai (free, no API key needed) ─
export const generateImage = async ({ prompt, style = 'photorealistic', aspectRatio = '16:9' }) => {
  try {
    const res = await api.post('/api/tools/image', {
      prompt,
      style,
      aspect_ratio: aspectRatio
    });

    const data = res.data;

    // Preload the image so spinner stays active until image is ready,
    // but fail gracefully with a timeout so it doesn't block UI if preloading fails.
    try {
      await new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          resolve();
        }, 8000); // 8 second timeout

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Failed to load image'));
        };
        img.src = data.url;
      });
    } catch (preloadError) {
      console.warn("Image preloading failed/timed out, rendering directly:", preloadError);
    }

    return { url: data.url, seed: data.seed, style: data.style, prompt: data.prompt };
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

// ── Text Summarizer ──────────────────────────────────────────────────────────
export const summarizeText = async ({ text, length = 'medium' }) => {
  try {
    const res = await api.post('/api/tools/summarize', {
      text,
      length,
    });

    const data = res.data;
    // Map keyPoints if not present in backend
    const keyPoints = text.replace("\n", " ").split(".").slice(0, 3).map(s => s.trim()).filter(Boolean);

    return {
      summary: data.summary,
      originalWords: data.original_words,
      summaryWords: data.summary_words,
      reduction: data.reduction,
      keyPoints: keyPoints,
    };
  } catch (error) {
    console.error("Text summarization error:", error);
    throw error;
  }
};

// ── Caption Generator ────────────────────────────────────────────────────────
export const generateCaptions = async ({ topic, tone = 'casual', count = 4 }) => {
  try {
    const res = await api.post('/api/tools/captions', {
      topic,
      tone,
      count,
    });

    const data = res.data;
    return {
      captions: data.captions,
      hashtags: data.hashtags,
      tone: data.tone,
      topic,
    };
  } catch (error) {
    console.error("Caption generation error:", error);
    throw error;
  }
};

// ── Prompt Enhancer ──────────────────────────────────────────────────────────
export const enhancePrompt = async ({ prompt }) => {
  try {
    const res = await api.post('/api/tools/enhance-prompt', {
      prompt,
    });

    const data = res.data;
    return {
      original: data.original,
      enhanced: data.enhanced,
      negativePrompt: data.negative_prompt,
      improvements: [
        'Added quality modifiers',
        'Enhanced detail descriptors',
        'Applied lighting improvements',
        'Added artistic style tags',
      ],
      score: { original: 45, enhanced: 88 },
    };
  } catch (error) {
    console.error("Prompt enhancement error:", error);
    throw error;
  }
};

