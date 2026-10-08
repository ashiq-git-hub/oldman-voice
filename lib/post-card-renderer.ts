export type PostAspectRatio = "4:5" | "1:1" | "9:16";
export type PostImageFormat = "image/png" | "image/jpeg";

export interface PostRenderOptions {
  text: string;
  dateStr: string;
  aspectRatio: PostAspectRatio;
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
        botRuleY: 1042,
        botY: 1158,
        marginX: 115,
      };
  }
}

/**
 * Ensures Cormorant Garamond font is loaded into the browser document.
 */
export async function ensureFontsLoaded(): Promise<void> {
  if (typeof document === "undefined") return;

  // Try document.fonts check
  try {
    if ("fonts" in document) {
      await document.fonts.load('36px "Cormorant Garamond"');
      if (document.fonts.check('36px "Cormorant Garamond"')) {
        return;
      }
    }
  } catch {
    // Continue to fallback
  }

  // Load via FontFace API fallback if needed
  try {
    if (typeof FontFace !== "undefined") {
      const font = new FontFace(
        "Cormorant Garamond",
        "url(/fonts/CormorantGaramond-Regular.ttf)"
      );
      const loaded = await font.load();
      document.fonts.add(loaded);
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

  // Colors
  const colorMeta = "#7D756A"; // warm vintage muted ink
  const colorRule = "#D5CCB8"; // fine paper rule line
  const colorInk = "#1E1A17";  // rich dark body ink

  // 2. Top Header ("ANONYMOUS RESPONSE" & Date)
  ctx.fillStyle = colorMeta;
  ctx.textBaseline = "top";
  ctx.font = '21px "Cormorant Garamond", Georgia, serif';

  const headerLeft = "ANONYMOUS RESPONSE";
  const headerRight = (options.dateStr || "TODAY").toUpperCase();

  drawTrackedText(ctx, headerLeft, dims.marginX, dims.topY, 3.5, "left");
  drawTrackedText(ctx, headerRight, dims.width - dims.marginX, dims.topY, 3.0, "right");

  // 3. Horizontal Rules
  ctx.strokeStyle = colorRule;
  ctx.lineWidth = 1.25;

  ctx.beginPath();
  ctx.moveTo(dims.marginX, dims.topRuleY);
  ctx.lineTo(dims.width - dims.marginX, dims.topRuleY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(dims.marginX, dims.botRuleY);
  ctx.lineTo(dims.width - dims.marginX, dims.botRuleY);
  ctx.stroke();

  // 4. Footer ("theoldman.voice")
  ctx.fillStyle = colorMeta;
  ctx.font = '22px "Cormorant Garamond", Georgia, serif';
  drawTrackedText(ctx, "theoldman.voice", dims.marginX, dims.botY, 3.2, "left");

  // 5. Quote Body - dynamic sizing and wrapping
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

  // Wrap lines
  const lines: string[] = [];
  let curLine = "";

  for (const word of words) {
    const testLine = curLine ? `${curLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth <= contentW) {
      curLine = testLine;
    } else {
      if (curLine) lines.push(curLine);
      curLine = word;
    }
  }
  if (curLine) lines.push(curLine);

  // Vertical centering between rules
  const availableH = dims.botRuleY - dims.topRuleY;
  const totalTextH = lines.length * lineHeight;
  let startY = dims.topRuleY + Math.floor((availableH - totalTextH) / 2);

  // Protect against overlapping with top rule
  if (startY < dims.topRuleY + 36) {
    startY = dims.topRuleY + 36;
  }

  ctx.fillStyle = colorInk;
  ctx.textBaseline = "top";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], dims.marginX, startY + i * lineHeight);
  }
}
