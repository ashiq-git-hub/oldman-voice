export type PostAspectRatio = "4:5" | "1:1" | "9:16";
export type PostImageFormat = "image/png" | "image/jpeg";
export type PostCardType = "response" | "question" | "outro";

export interface PostRenderOptions {
  text: string;
  dateStr: string;
  aspectRatio: PostAspectRatio;
  cardType?: PostCardType;
  customHeader?: string;
  format?: PostImageFormat;
}

export interface PostDimensions {
  width: number;
  height: number;
  bgUrl: string;
  topY: number;
  topRuleY: number;
  botRuleY: number;
  botY: number;
  marginX: number;
}

export const DEFAULT_OUTRO_TEXT = `That’s today’s.

If you want to leave *one*, the link’s in my bio.
Nobody sees your name.

I’ll be here tomorrow too.

@theoldman.keeps`;

export function getPostDimensions(aspectRatio: PostAspectRatio): PostDimensions {
  switch (aspectRatio) {
    case "1:1":
      return {
        width: 1080,
        height: 1080,
        bgUrl: "/post-bg-1-1.jpg",
        topY: 160,
        topRuleY: 195,
        botRuleY: 885,
        botY: 960,
        marginX: 115,
      };
    case "9:16":
      return {
        width: 1080,
        height: 1920,
        bgUrl: "/post-bg-9-16.jpg",
        topY: 380,
        topRuleY: 430,
        botRuleY: 1490,
        botY: 1610,
        marginX: 115,
      };
    case "4:5":
    default:
      return {
        width: 1080,
        height: 1350,
        bgUrl: "/post-bg-4-5.jpg",
        topY: 250,
        topRuleY: 292,
        botRuleY: 1041,
        botY: 1158,
        marginX: 115,
      };
  }
}

/**
 * Ensures Cormorant Garamond and Playfair Display fonts are loaded into the browser document.
 */
export async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === "undefined") return;

  // 1. Try document.fonts check
  try {
    if ("fonts" in document) {
      await Promise.all([
        document.fonts.load('36px "Cormorant Garamond"'),
        document.fonts.load('italic 36px "Cormorant Garamond"'),
        document.fonts.load('bold 60px "Playfair Display"'),
      ]);
    }
  } catch {
    // Continue to fallback
  }

  // 2. Load via FontFace API fallback if needed
  try {
    if (typeof FontFace !== "undefined") {
      if (!document.fonts.check('bold 60px "Playfair Display"')) {
        const pfFont = new FontFace(
          "Playfair Display",
          "url(/fonts/PlayfairDisplay-Bold.ttf)",
          { weight: "700", style: "normal" }
        );
        const loadedPf = await pfFont.load();
        document.fonts.add(loadedPf);
      }
      if (!document.fonts.check('36px "Cormorant Garamond"')) {
        const cgFont = new FontFace(
          "Cormorant Garamond",
          "url(/fonts/CormorantGaramond-Regular.ttf)",
          { weight: "400", style: "normal" }
        );
        const loadedCg = await cgFont.load();
        document.fonts.add(loadedCg);
      }
      if (!document.fonts.check('italic 36px "Cormorant Garamond"')) {
        const cgItalicFont = new FontFace(
          "Cormorant Garamond",
          "url(/fonts/CormorantGaramond-Italic.ttf)",
          { weight: "400", style: "italic" }
        );
        const loadedCgItalic = await cgItalicFont.load();
        document.fonts.add(loadedCgItalic);
      }
    }
  } catch (err) {
    console.warn("Could not load local font face:", err);
  }
}

/**
 * Loads an image from URL into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws tracked text on canvas with cross-browser character spacing.
 */
function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackingPx: number,
  align: "left" | "right" = "left"
): number {
  if (align === "right") {
    let totalW = 0;
    for (let i = 0; i < text.length; i++) {
      totalW += ctx.measureText(text[i]).width;
      if (i < text.length - 1) totalW += trackingPx;
    }
    let curX = x - totalW;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], curX, y);
      curX += ctx.measureText(text[i]).width + trackingPx;
    }
    return totalW;
  } else {
    let curX = x;
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], curX, y);
      curX += ctx.measureText(text[i]).width + trackingPx;
    }
    return curX - x;
  }
}

interface RenderLine {
  text: string;
  isParagraphGap?: boolean;
}

/**
 * Convert straight quotes and apostrophes to typography quotation marks
 */
function toSmartQuotes(text: string): string {
  let s = text.trim();
  // Curly apostrophe
  s = s.replace(/(\w)'(\w)/g, "$1’$2");
  s = s.replace(/'s\b/gi, "’s");
  s = s.replace(/'t\b/gi, "’t");
  s = s.replace(/'d\b/gi, "’d");
  s = s.replace(/'ll\b/gi, "’ll");
  s = s.replace(/'ve\b/gi, "’ve");
  s = s.replace(/'re\b/gi, "’re");

  // Leading and trailing double quotes
  if (s.startsWith('"') || s.startsWith('“')) {
    s = s.substring(1).trim();
  }
  if (s.endsWith('"') || s.endsWith('”')) {
    s = s.substring(0, s.length - 1).trim();
  }

  // Prepend opening quote and append closing quote
  return `“${s}”`;
}

/**
 * Renders the high-quality post onto a canvas element.
 */
export async function renderPostToCanvas(
  canvas: HTMLCanvasElement,
  options: PostRenderOptions
): Promise<void> {
  await ensureFontsLoaded();

  const dims = getPostDimensions(options.aspectRatio);
  canvas.width = dims.width;
  canvas.height = dims.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D canvas context");

  // 1. Draw paper texture background
  try {
    const bgImg = await loadImage(dims.bgUrl);
    ctx.drawImage(bgImg, 0, 0, dims.width, dims.height);
  } catch (err) {
    console.warn("Failed to load background texture, falling back to parchment color:", err);
    ctx.fillStyle = "#F3EFE7";
    ctx.fillRect(0, 0, dims.width, dims.height);
  }

  const contentW = dims.width - 2 * dims.marginX;

  // Colors matching vintage_ink_02_original_ref_match
  const colorMeta = "#A39B8E"; // delicate muted taupe/sand ink (RGB 163, 155, 142)
  const colorRule = "#D7D0C3"; // soft thin parchment rule (RGB 215, 208, 195)
  
  // Exact vintage ink tone for Question Cover from reference (RGB 72, 68, 59)
  const colorQuestionInk = "#48443B";
  // Classic response ink
  const colorResponseInk = "#1E1A17";

  // 2. Top Header
  ctx.fillStyle = colorMeta;
  ctx.textBaseline = "top";
  ctx.font = '21px "Cormorant Garamond", Georgia, serif';

  let headerLeft = "ANONYMOUS RESPONSE";
  if (options.customHeader) {
    headerLeft = options.customHeader;
  } else if (options.cardType === "question") {
    headerLeft = "THE OLD MAN ASKS";
  } else if (options.cardType === "outro") {
    headerLeft = "THE OLD MAN KEEPS";
  }

  const headerRight = (options.dateStr || "TODAY").toUpperCase();

  drawTrackedText(ctx, headerLeft, dims.marginX, dims.topY, 3.5, "left");
  drawTrackedText(ctx, headerRight, dims.width - dims.marginX, dims.topY, 3.0, "right");

  // 3. Horizontal Rules
  ctx.strokeStyle = colorRule;
  ctx.lineWidth = 1.0;

  ctx.beginPath();
  ctx.moveTo(dims.marginX, dims.topRuleY);
  ctx.lineTo(dims.width - dims.marginX, dims.topRuleY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(dims.marginX, dims.botRuleY);
  ctx.lineTo(dims.width - dims.marginX, dims.botRuleY);
  ctx.stroke();

  // 4. Footer ("theoldman.keeps")
  ctx.fillStyle = colorMeta;
  ctx.font = '22px "Cormorant Garamond", Georgia, serif';
  drawTrackedText(ctx, "theoldman.keeps", dims.marginX, dims.botY, 3.2, "left");

  // 5. Main Content Rendering
  if (options.cardType === "question") {
    // --- QUESTION COVER SLIDE (matches vintage_ink_02_original_ref_match.jpg) ---
    const formattedQuestion = toSmartQuotes(options.text);
    const words = formattedQuestion.split(/\s+/);
    const wordCount = words.length;

    // Font size and line height
    let fontSize = 74;
    let lineHeightMultiplier = 1.34;

    if (options.aspectRatio === "1:1") {
      fontSize = wordCount <= 12 ? 64 : 56;
      lineHeightMultiplier = 1.28;
    } else if (options.aspectRatio === "9:16") {
      fontSize = wordCount <= 12 ? 76 : 68;
      lineHeightMultiplier = 1.36;
    } else {
      // 4:5 Portrait
      if (wordCount <= 12) fontSize = 74;
      else if (wordCount <= 18) fontSize = 68;
      else if (wordCount <= 26) fontSize = 58;
      else fontSize = 50;
    }

    ctx.font = `bold ${fontSize}px "Playfair Display", Georgia, serif`;
    const lineHeight = Math.round(fontSize * lineHeightMultiplier);

    // Line wrapping: respect existing newlines or break cleanly
    const renderLines: string[] = [];
    const rawParagraphs = formattedQuestion.split("\n");

    for (const paragraph of rawParagraphs) {
      const pWords = paragraph.trim().split(/\s+/);
      let curLine = "";
      for (const w of pWords) {
        const testLine = curLine ? `${curLine} ${w}` : w;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth <= contentW) {
          curLine = testLine;
        } else {
          if (curLine) renderLines.push(curLine);
          curLine = w;
        }
      }
      if (curLine) renderLines.push(curLine);
    }

    // Vertical positioning: centered between top rule and bottom rule
    const availableH = dims.botRuleY - dims.topRuleY;
    const totalTextH = (renderLines.length - 1) * lineHeight + fontSize;
    let startY = dims.topRuleY + Math.floor((availableH - totalTextH) / 2);

    // Slight optical adjustment to match reference Y ≈ 560
    if (options.aspectRatio === "4:5" && renderLines.length === 3) {
      startY = Math.max(startY, 545);
    }

    ctx.fillStyle = colorQuestionInk;
    ctx.textBaseline = "top";

    // Left aligned at dims.marginX
    for (let i = 0; i < renderLines.length; i++) {
      ctx.fillText(renderLines[i], dims.marginX, startY + i * lineHeight);
    }

  } else if (options.cardType === "outro") {
    // --- OUTRO CTA SLIDE ---
    // Typography specs:
    // 1. "That's today's." -> Playfair Display Bold (exact same ink #48443B as Slide 1)
    // 2. "@theoldman.keeps" -> Cormorant Garamond with softer lowered opacity ink
    // 3. "If you want to leave one, the link's in my bio." -> Cormorant Garamond with 'one' in italic!
    const baseBodyFontSize = options.aspectRatio === "1:1" ? 33 : options.aspectRatio === "9:16" ? 36 : 35;
    const headlineFontSize = options.aspectRatio === "1:1" ? 44 : options.aspectRatio === "9:16" ? 50 : 48;
    const handleFontSize = options.aspectRatio === "1:1" ? 31 : 33;

    const bodyLineHeight = Math.round(baseBodyFontSize * 1.54);
    const headlineLineHeight = Math.round(headlineFontSize * 1.35);
    const handleLineHeight = Math.round(handleFontSize * 1.45);
    const paragraphGap = Math.round(baseBodyFontSize * 1.0);

    const isHeadline = (line: string): boolean => {
      const norm = line.trim().toLowerCase().replace(/[’']/g, "'");
      return (
        norm.startsWith("that's today's") ||
        norm.startsWith("thats todays") ||
        norm === "that's today's." ||
        norm === "that's today's"
      );
    };

    const isHandle = (line: string): boolean => {
      return line.trim().startsWith("@");
    };

    // Helper to format contractions to typographic curly apostrophes
    const curlyApostrophes = (str: string): string => {
      return str
        .replace(/(\w)'(\w)/g, "$1’$2")
        .replace(/'s\b/gi, "’s")
        .replace(/'t\b/gi, "’t")
        .replace(/'ll\b/gi, "’ll")
        .replace(/'ve\b/gi, "’ve")
        .replace(/'re\b/gi, "’re")
        .replace(/'d\b/gi, "’d");
    };

    interface OutroToken {
      text: string;
      isItalic: boolean;
      isSpace: boolean;
    }

    const tokenizeBodyParagraph = (text: string): OutroToken[] => {
      let cleaned = curlyApostrophes(text.trim());

      // If no asterisks present, automatically italicize 'one' in 'leave one'
      if (!cleaned.includes("*")) {
        cleaned = cleaned.replace(/(\bleave\s+)(one)(,?\b)/gi, "$1*$2*$3");
      }

      const parts = cleaned.split(/(\*[^*]+\*)/g);
      const tokens: OutroToken[] = [];

      for (const part of parts) {
        if (!part) continue;
        const isItalic = part.startsWith("*") && part.endsWith("*");
        const content = isItalic ? part.slice(1, -1) : part;

        // Split preserving spaces and punctuation
        const rawTokens = content.split(/(\s+)/);
        for (const t of rawTokens) {
          if (!t) continue;
          tokens.push({
            text: t,
            isItalic,
            isSpace: /^\s+$/.test(t),
          });
        }
      }

      return tokens;
    };

    interface OutroBlock {
      type: "headline" | "body" | "handle" | "gap";
      height: number;
      text?: string;
      segments?: Array<{ text: string; isItalic: boolean }>;
    }

    const blocks: OutroBlock[] = [];
    const rawParagraphs = options.text.trim().split("\n");

    for (const p of rawParagraphs) {
      const trimmed = p.trim();
      if (!trimmed) {
        if (blocks.length > 0 && blocks[blocks.length - 1].type !== "gap") {
          blocks.push({ type: "gap", height: paragraphGap });
        }
        continue;
      }

      if (isHeadline(trimmed)) {
        const headlineText = curlyApostrophes(trimmed);
        blocks.push({
          type: "headline",
          text: headlineText,
          height: headlineLineHeight,
        });
      } else if (isHandle(trimmed)) {
        blocks.push({
          type: "handle",
          text: trimmed,
          height: handleLineHeight,
        });
      } else {
        // Body paragraph with potential wrapping and inline italic
        const tokens = tokenizeBodyParagraph(trimmed);

        const lines: Array<Array<{ text: string; isItalic: boolean }>> = [];
        let currentLineSegments: Array<{ text: string; isItalic: boolean }> = [];
        let currentLineWidth = 0;

        for (const token of tokens) {
          ctx.font = token.isItalic
            ? `italic ${baseBodyFontSize}px "Cormorant Garamond", Georgia, serif`
            : `${baseBodyFontSize}px "Cormorant Garamond", Georgia, serif`;
          const tokenWidth = ctx.measureText(token.text).width;

          if (!token.isSpace && currentLineWidth + tokenWidth > contentW && currentLineSegments.length > 0) {
            lines.push(currentLineSegments);
            currentLineSegments = [];
            currentLineWidth = 0;
          }

          if (token.isSpace && currentLineSegments.length === 0) {
            continue; // Skip leading space on wrapped line
          }

          const lastSeg = currentLineSegments[currentLineSegments.length - 1];
          if (lastSeg && lastSeg.isItalic === token.isItalic) {
            lastSeg.text += token.text;
          } else {
            currentLineSegments.push({ text: token.text, isItalic: token.isItalic });
          }
          currentLineWidth += tokenWidth;
        }

        if (currentLineSegments.length > 0) {
          lines.push(currentLineSegments);
        }

        for (const lineSegments of lines) {
          blocks.push({
            type: "body",
            height: bodyLineHeight,
            segments: lineSegments,
          });
        }
      }
    }

    // Remove any trailing gap
    while (blocks.length > 0 && blocks[blocks.length - 1].type === "gap") {
      blocks.pop();
    }

    const totalTextH = blocks.reduce((sum, b) => sum + b.height, 0);
    const availableH = dims.botRuleY - dims.topRuleY;
    let startY = dims.topRuleY + Math.floor((availableH - totalTextH) / 2);

    // Soft lowered opacity ink for handle @theoldman.keeps
    const colorHandleInk = "rgba(72, 68, 59, 0.65)";

    ctx.textBaseline = "top";
    let curY = startY;

    for (const block of blocks) {
      if (block.type === "gap") {
        curY += block.height;
      } else if (block.type === "headline" && block.text) {
        ctx.font = `bold ${headlineFontSize}px "Playfair Display", Georgia, serif`;
        ctx.fillStyle = colorQuestionInk; // exact same color #48443B as Slide 1!
        ctx.fillText(block.text, dims.marginX, curY);
        curY += block.height;
      } else if (block.type === "handle" && block.text) {
        ctx.font = `${handleFontSize}px "Cormorant Garamond", Georgia, serif`;
        ctx.fillStyle = colorHandleInk; // lower opacity soft ink
        ctx.fillText(block.text, dims.marginX, curY);
        curY += block.height;
      } else if (block.type === "body" && block.segments) {
        let curX = dims.marginX;
        ctx.fillStyle = colorResponseInk;
        for (const seg of block.segments) {
          ctx.font = seg.isItalic
            ? `italic ${baseBodyFontSize}px "Cormorant Garamond", Georgia, serif`
            : `${baseBodyFontSize}px "Cormorant Garamond", Georgia, serif`;
          ctx.fillText(seg.text, curX, curY);
          curX += ctx.measureText(seg.text).width;
        }
        curY += block.height;
      }
    }

  } else {
    // --- ANONYMOUS RESPONSE SLIDE ---
    const cleanText = options.text.trim();
    const words = cleanText.split(/\s+/);
    const wordCount = words.length;

    let fontSize = 38;
    if (options.aspectRatio === "1:1") {
      if (wordCount > 110) fontSize = 29;
      else if (wordCount > 75) fontSize = 33;
      else if (wordCount > 40) fontSize = 36;
      else if (wordCount < 25) fontSize = 44;
    } else if (options.aspectRatio === "9:16") {
      if (wordCount > 130) fontSize = 32;
      else if (wordCount > 80) fontSize = 36;
      else if (wordCount < 30) fontSize = 44;
    } else {
      // 4:5 Portrait
      if (wordCount > 130) fontSize = 32;
      else if (wordCount > 85) fontSize = 35;
      else if (wordCount < 30) fontSize = 44;
    }

    ctx.font = `${fontSize}px "Cormorant Garamond", Georgia, serif`;
    const lineHeight = Math.round(fontSize * 1.56);
    const paragraphGap = Math.round(fontSize * 0.85);

    const rawParagraphs = cleanText.split("\n");
    const renderLines: RenderLine[] = [];

    for (const p of rawParagraphs) {
      const trimmed = p.trim();
      if (!trimmed) {
        renderLines.push({ text: "", isParagraphGap: true });
        continue;
      }

      const pWords = trimmed.split(/\s+/);
      let curLine = "";
      for (const w of pWords) {
        const testLine = curLine ? `${curLine} ${w}` : w;
        if (ctx.measureText(testLine).width <= contentW) {
          curLine = testLine;
        } else {
          if (curLine) renderLines.push({ text: curLine });
          curLine = w;
        }
      }
      if (curLine) renderLines.push({ text: curLine });
    }

    let totalTextH = 0;
    for (const item of renderLines) {
      if (item.isParagraphGap) totalTextH += paragraphGap;
      else totalTextH += lineHeight;
    }

    const availableH = dims.botRuleY - dims.topRuleY;
    let startY = dims.topRuleY + Math.floor((availableH - totalTextH) / 2);
    if (startY < dims.topRuleY + 36) startY = dims.topRuleY + 36;

    ctx.fillStyle = colorResponseInk;
    ctx.textBaseline = "top";

    let curY = startY;
    for (const item of renderLines) {
      if (item.isParagraphGap) {
        curY += paragraphGap;
      } else {
        ctx.fillText(item.text, dims.marginX, curY);
        curY += lineHeight;
      }
    }
  }
}

/**
 * Renders a post to a Blob (useful for downloading or creating Zip bundles)
 */
export async function renderPostToBlob(
  options: PostRenderOptions
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  await renderPostToCanvas(canvas, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob from canvas"));
      },
      options.format || "image/png",
      options.format === "image/jpeg" ? 0.95 : undefined
    );
  });
}
