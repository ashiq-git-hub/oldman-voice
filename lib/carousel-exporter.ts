import JSZip from "jszip";
import {
  PostAspectRatio,
  PostImageFormat,
  renderPostToBlob,
  DEFAULT_OUTRO_TEXT,
} from "./post-card-renderer";
import { ResponseItem } from "@/types/database";

export interface CarouselExportParams {
  questionText: string;
  dateStr: string;
  responses: ResponseItem[];
  aspectRatio?: PostAspectRatio;
  format?: PostImageFormat;
  outroText?: string;
  onProgress?: (current: number, total: number, status: string) => void;
}

export async function exportFullCarouselZip({
  questionText,
  dateStr,
  responses,
  aspectRatio = "4:5",
  format = "image/png",
  outroText = DEFAULT_OUTRO_TEXT,
  onProgress,
}: CarouselExportParams): Promise<void> {
  const zip = new JSZip();
  const totalSlides = 1 + responses.length + 1; // 1 Cover + N Responses + 1 Outro
  const ext = format === "image/png" ? "png" : "jpg";

  let currentStep = 0;

  // 1. Cover Slide (Slide 01)
  currentStep++;
  onProgress?.(currentStep, totalSlides, "Rendering Slide 01: Question Cover...");
  const coverBlob = await renderPostToBlob({
    text: questionText,
    dateStr,
    aspectRatio,
    cardType: "question",
    format,
  });
  zip.file(`01-theoldman-asks.${ext}`, coverBlob);

  // 2. Response Slides (Slides 02 .. N)
  for (let i = 0; i < responses.length; i++) {
    currentStep++;
    const slideNumber = String(i + 2).padStart(2, "0");
    onProgress?.(
      currentStep,
      totalSlides,
      `Rendering Slide ${slideNumber}: Response ${i + 1} of ${responses.length}...`
    );

    const respBlob = await renderPostToBlob({
      text: responses[i].response,
      dateStr,
      aspectRatio,
      cardType: "response",
      format,
    });
    zip.file(`${slideNumber}-response-${i + 1}.${ext}`, respBlob);
  }

  // 3. Outro Slide (Slide End)
  currentStep++;
  const outroSlideNumber = String(totalSlides).padStart(2, "0");
  onProgress?.(
    currentStep,
    totalSlides,
    `Rendering Slide ${outroSlideNumber}: Outro CTA...`
  );

  const outroBlob = await renderPostToBlob({
    text: outroText,
    dateStr,
    aspectRatio,
    cardType: "outro",
    format,
  });
  zip.file(`${outroSlideNumber}-outro-follow.${ext}`, outroBlob);

  // 4. Generate Zip and trigger download
  onProgress?.(totalSlides, totalSlides, "Packaging carousel into Zip...");
  const zipBlob = await zip.generateAsync({ type: "blob" });

  const cleanDate = dateStr.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const zipFilename = `theoldman-keeps-${cleanDate}-carousel-${aspectRatio.replace(":", "x")}.zip`;

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
