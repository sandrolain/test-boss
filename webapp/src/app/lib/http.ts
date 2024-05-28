export function encodeUrlParams(params: Record<string, any>): string {
  const res = new URLSearchParams();
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      let val = params[key];
      const t = typeof val;
      if (t === 'undefined' || val === null) {
        continue;
      }
      if (typeof val !== 'string') {
        if (Array.isArray(val)) {
          val = val.join(',');
        } else {
          val = JSON.stringify(val);
        }
      }
      res.append(key, val);
    }
  }
  const query = res.toString();
  return query ? `?${query}` : '';
}

export function fileToBase64(
  file: File | Blob
): Promise<{ type: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      const parts = dataUri.split(';base64,');
      const type = parts[0].split(':')[1];
      const data = parts[1];
      resolve({ type, data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function enc(str: string): string {
  return encodeURIComponent(str);
}
