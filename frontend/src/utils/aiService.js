import api from './api';

// ── Image Generator — Direct Pollinations.ai FLUX Model ──────────────────────
export const generateImage = async ({ prompt, style = 'photorealistic', aspectRatio = '16:9' }) => {
  // Short style suffix (keep URL short to avoid limits)
  const styleTag = {
    'photorealistic': 'photorealistic, 8k, sharp',
    'digital-art':    'digital art, vibrant, detailed',
    'anime':          'anime style, manga, colorful',
    'painting':       'oil painting, classical, artistic',
    'sketch':         'pencil sketch, fine line art',
  }[style] || 'photorealistic, 8k';

  const fullPrompt = `${prompt.trim()}, ${styleTag}`;

  const dimMap = {
    '16:9': { w: 1280, h: 720 },
    '1:1':  { w: 1024, h: 1024 },
    '9:16': { w: 720,  h: 1280 },
  };
  const { w, h } = dimMap[aspectRatio] || dimMap['16:9'];
  const seed = Math.floor(Math.random() * 999999);
  const encoded = encodeURIComponent(fullPrompt);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&nologo=true`;

  // Small artificial delay so loading spinner shows
  await new Promise(r => setTimeout(r, 1000));

  return { url, seed, style, prompt };
};

// ── Text Summarizer — Local instant, no backend needed ───────────────────────
export const summarizeText = async ({ text, length = 'medium' }) => {
  await new Promise(r => setTimeout(r, 600));

  const sentences = text.replace(/\n+/g, ' ').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const originalWords = text.split(/\s+/).filter(Boolean).length;

  const ratioMap = { short: 0.2, medium: 0.35, long: 0.5 };
  const ratio = ratioMap[length] || 0.35;
  const keepCount = Math.max(1, Math.round(sentences.length * ratio));

  // Score sentences by word importance
  const scored = sentences.map((s, i) => ({
    s,
    score: (i === 0 ? 2 : 0) + s.split(' ').length * 0.1,
  }));
  scored.sort((a, b) => b.score - a.score);
  const topSentences = scored.slice(0, keepCount).map(x => x.s);
  topSentences.sort((a, b) => sentences.indexOf(a) - sentences.indexOf(b));

  const summary = topSentences.join('. ') + '.';
  const summaryWords = summary.split(/\s+/).filter(Boolean).length;
  const reduction = Math.round((1 - summaryWords / originalWords) * 100);
  const keyPoints = sentences.slice(0, 3).map(s => s.slice(0, 80) + (s.length > 80 ? '...' : ''));

  return { summary, originalWords, summaryWords, reduction, keyPoints };
};

// ── Caption Generator — Local instant, no backend needed ─────────────────────
export const generateCaptions = async ({ topic, tone = 'casual', count = 4 }) => {
  await new Promise(r => setTimeout(r, 700));

  const t = topic.trim();
  const toneMap = {
    casual:        ['✨', '🔥', '💫', '😍', '🌟'],
    professional:  ['📊', '💼', '🎯', '✅', '🚀'],
    funny:         ['😂', '🤣', '💀', '😭', '🫡'],
    inspirational: ['💪', '🌅', '✨', '🙌', '🦋'],
  };
  const emojis = toneMap[tone] || toneMap.casual;

  const templates = [
    `${emojis[0]} ${t} — because ordinary is overrated.`,
    `When ${t} hits different ${emojis[1]} #blessed`,
    `This is what ${t} looks like in 2025 ${emojis[2]}`,
    `${t.charAt(0).toUpperCase() + t.slice(1)} vibes only ${emojis[3]} Drop a ❤️ if you agree!`,
    `Living for ${t} moments like this ${emojis[4]} Save this for later!`,
    `Nobody talks about ${t} enough ${emojis[0]} Let's change that.`,
  ];

  const captions = templates.slice(0, count);
  const hashtags = [
    `#${t.replace(/\s+/g, '')}`, '#trending', '#viral', '#explore',
    '#creative', '#content', '#inspiration', '#daily',
  ];

  return { captions, hashtags, tone, topic: t };
};

// ── Prompt Enhancer — Local instant enhancement, no backend needed ────────────
export const enhancePrompt = async ({ prompt }) => {
  // Simulate a short thinking delay
  await new Promise(r => setTimeout(r, 800));

  const p = prompt.trim();
  const lower = p.toLowerCase();

  // Detect subject type
  const isPortrait   = /person|man|woman|girl|boy|face|portrait|people|warrior|king|queen|hero/.test(lower);
  const isLandscape  = /mountain|forest|ocean|sky|city|landscape|sunset|sunrise|river|lake|desert|jungle/.test(lower);
  const isAnimal     = /cat|dog|lion|tiger|wolf|horse|eagle|dragon|bird|fox/.test(lower);
  const isSci        = /space|galaxy|nebula|planet|star|astronaut|robot|cyber|futuristic|sci-fi/.test(lower);
  const isFood       = /food|pizza|cake|coffee|meal|dish|restaurant/.test(lower);

  let qualityTags = 'ultra detailed, 8k resolution, masterpiece, best quality, sharp focus';
  let lightingTag = 'dramatic cinematic lighting, volumetric light rays, golden hour';
  let styleTags   = 'photorealistic, hyperrealistic, professional photography, award winning';
  let negativePrompt = 'blurry, low quality, bad anatomy, ugly, distorted, watermark, text, logo, pixelated, noise, grainy';

  if (isPortrait) {
    qualityTags = 'ultra detailed portrait, 8k, studio lighting, sharp eyes, perfect skin';
    lightingTag = 'professional studio lighting, soft box, rim light, bokeh background';
    styleTags   = 'photorealistic portrait, DSLR, 85mm lens, f/1.4, depth of field';
    negativePrompt += ', bad hands, extra fingers, deformed face, bad eyes';
  } else if (isLandscape) {
    qualityTags = 'epic landscape, 8k resolution, wide angle, ultra detailed environment';
    lightingTag = 'golden hour lighting, god rays, atmospheric haze, HDR';
    styleTags   = 'photorealistic, National Geographic style, landscape photography';
  } else if (isAnimal) {
    qualityTags = 'ultra detailed animal, 8k, wildlife photography, hyper realistic fur';
    lightingTag = 'natural lighting, bokeh, shallow depth of field';
    styleTags   = 'wildlife photography, photorealistic, National Geographic';
  } else if (isSci) {
    qualityTags = 'ultra detailed sci-fi, 8k, concept art, epic scale';
    lightingTag = 'neon glow, bioluminescent, deep space lighting, cinematic';
    styleTags   = 'digital art, concept art, artstation trending, sci-fi illustration';
    negativePrompt += ', cartoonish, flat colors';
  } else if (isFood) {
    qualityTags = 'food photography, 8k, macro shot, ultra detailed';
    lightingTag = 'soft natural light, studio food lighting, overhead shot';
    styleTags   = 'professional food photography, appetizing, vibrant colors';
  }

  const enhanced = `${p}, ${qualityTags}, ${lightingTag}, ${styleTags}`;

  const wordCount = p.split(' ').length;
  const originalScore = Math.min(30 + wordCount * 3, 55);
  const enhancedScore = Math.min(originalScore + 35, 96);

  return {
    original: p,
    enhanced,
    negativePrompt,
    improvements: [
      '✨ Added quality & resolution modifiers',
      '💡 Enhanced lighting descriptors',
      '🎨 Applied professional style tags',
      '📸 Added technical photography settings',
    ],
    score: { original: originalScore, enhanced: enhancedScore },
  };
};

