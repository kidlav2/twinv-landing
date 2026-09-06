"use client";

import { useEffect, useState } from "react";

export type PhotoMat = {
  hex: string;
  light: boolean;
};

/**
 * Average of the top strip — that is the page ground a screenshot sits on,
 * and the colour a frame has to continue if it is not to read as a second
 * surface. Corners alone would pick a logo tile or a status pip.
 */
function matFromImage(img: HTMLImageElement): PhotoMat | null {
  const ctx = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });
  if (!ctx) return null;

  const tw = 48;
  const th = 8;
  ctx.canvas.width = tw;
  ctx.canvas.height = th;
  const slice = Math.max(1, Math.round(img.naturalHeight * 0.04));
  ctx.drawImage(img, 0, 0, img.naturalWidth, slice, 0, 0, tw, th);

  const { data } = ctx.getImageData(0, 0, tw, th);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  }
  if (!n) return null;

  r = Math.round(r / n);
  g = Math.round(g / n);
  b = Math.round(b / n);
  const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return { hex, light: lum > 0.55 };
}

export function usePhotoMat(src: string) {
  const [mat, setMat] = useState<PhotoMat | null>(null);

  useEffect(() => {
    if (!src) {
      setMat(null);
      return;
    }

    let gone = false;
    const img = new window.Image();
    img.onload = () => {
      if (gone) return;
      setMat(matFromImage(img));
    };
    img.onerror = () => {
      if (!gone) setMat(null);
    };
    img.src = src;

    return () => {
      gone = true;
    };
  }, [src]);

  return mat;
}
