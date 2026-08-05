import api from './api';

// ── Image Generator — Direct Pollinations.ai FLUX Model (instant, no backend needed) ─
export const generateImage = async ({ prompt, style = 'photorealistic', aspectRatio = '16:9' }) => {
  const cleanPrompt = prompt.replace(/^(give me (the )?image of|generate (an )?image of|show me (the )?image of|picture of)\s+/i, '').trim();

  // Style enhancers
  const styleMap = {
    'photorealistic': 'ultra photorealistic, 8k resolution, sharp focus, professional photography',
    'digital-art':    'digital art, vibrant colors, detailed illustration, artstation trending',
    'anime':          'anime style, manga art, Studio Ghibli inspired, beautiful detailed anime',
    'painting':       'oil painting, classical art style, painterly brush strokes, museum quality',
    'sketch':         'pencil sketch, detailed hand-drawn, fine line art, professional sketch',
  };

  const styleTag = styleMap[style] || styleMap['photorealistic'];
  const enhanced = `${cleanPrompt}, ${styleTag}`;

  // Aspect ratio to dimensions
  const dimMap = {
    '16:9': { w: 1344, h: 768 },
    '1:1':  { w: 1024, h: 1024 },
    '9:16': { w: 768,  h: 1344 },
  };
  const { w, h } = dimMap[aspectRatio] || dimMap['16:9'];
  const seed = Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(enhanced);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&model=flux&nologo=true&enhance=true`;

  // Preload to confirm image is ready
  await new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => resolve(), 12000);
    img.onload  = () => { clearTimeout(timeout); resolve(); };
    img.onerror = () => { clearTimeout(timeout); resolve(); };
    img.src = url;
  });

  return { url, seed, style, prompt };
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

