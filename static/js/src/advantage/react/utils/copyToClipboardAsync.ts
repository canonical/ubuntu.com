function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to the bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");

      if (successful) {
        resolve();
      } else {
        reject(new Error("Failed to copy text"));
      }
    } catch {
      reject(new Error("Exception during copying text"));
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

export function copyToClipboardAsync(text: string) {
  if (!navigator.clipboard) {
    return fallbackCopyToClipboard(text);
  }

  return navigator.clipboard.writeText(text);
}
