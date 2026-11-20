/**
 * Compresses mobile camera / gallery question paper photos to crisp, readable JPEG data URLs
 * while keeping total Firestore document payload well beneath Firestore's 1 MiB document limit.
 */

export const MAX_QUESTION_PAGES = 4;
export const MAX_TOTAL_PAYLOAD_BYTES = 750_000;

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('ছবিটি পড়া সম্ভব হয়নি। সঠিক JPG বা PNG ছবি নির্বাচন করুন।'));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে।'));
    reader.readAsDataURL(file);
  });
}

function renderScaledJpeg(
  img: HTMLImageElement,
  maxDimension: number,
  quality: number
): string {
  const srcWidth = img.naturalWidth || img.width || 1200;
  const srcHeight = img.naturalHeight || img.height || 1600;
  const longest = Math.max(srcWidth, srcHeight);
  const scale = longest > maxDimension ? maxDimension / longest : 1;

  const targetWidth = Math.max(1, Math.round(srcWidth * scale));
  const targetHeight = Math.max(1, Math.round(srcHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('ব্রাউজারে ছবি প্রসেস করা সম্ভব হয়নি।');
  }

  // White background avoids dark/black transparency halos if user uploads PNG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/jpeg', quality);
}

export async function compressQuestionPaperImage(
  file: File,
  targetMaxBytes: number = 210_000
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP) আপলোড করা যাবে।');
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error('ছবির মূল সাইজ ২০ মেগাবাইটের বেশি হওয়া যাবে না।');
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const img = await loadImageElement(rawDataUrl);

  // Preserve crisp text legibility on exam papers: start high-res, step down only if above budget
  const attempts: Array<{ maxDim: number; quality: number }> = [
    { maxDim: 1600, quality: 0.82 },
    { maxDim: 1450, quality: 0.76 },
    { maxDim: 1300, quality: 0.7 },
    { maxDim: 1150, quality: 0.64 },
    { maxDim: 1000, quality: 0.56 },
  ];

  let lastResult = '';
  for (const attempt of attempts) {
    lastResult = renderScaledJpeg(img, attempt.maxDim, attempt.quality);
    if (lastResult.length <= targetMaxBytes) {
      return lastResult;
    }
  }

  return lastResult;
}

export async function recompressDataUrlsToBudget(
  dataUrls: string[],
  maxTotalBytes: number = MAX_TOTAL_PAYLOAD_BYTES
): Promise<string[]> {
  const totalBytes = dataUrls.reduce((acc, item) => acc + item.length, 0);
  if (totalBytes <= maxTotalBytes) {
    return dataUrls;
  }

  const perPageBudget = Math.max(90_000, Math.floor((maxTotalBytes - 20_000) / Math.max(1, dataUrls.length)));
  const results: string[] = [];

  for (const dataUrl of dataUrls) {
    if (dataUrl.length <= perPageBudget) {
      results.push(dataUrl);
      continue;
    }
    const img = await loadImageElement(dataUrl);
    const attempts = [
      { maxDim: 1250, quality: 0.68 },
      { maxDim: 1100, quality: 0.6 },
      { maxDim: 960, quality: 0.52 },
    ];
    let compressed = dataUrl;
    for (const attempt of attempts) {
      compressed = renderScaledJpeg(img, attempt.maxDim, attempt.quality);
      if (compressed.length <= perPageBudget) break;
    }
    results.push(compressed);
  }

  return results;
}
