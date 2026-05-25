import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Parses a local PDF file object and extracts all text content page by page.
 * Processes client-side to mitigate backend computing and memory footprint.
 */
export const extractTextFromPdf = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (!event.target || !event.target.result) {
          throw new Error("Failed to read file buffer");
        }
        const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
        const loadingTask = pdfjs.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => {
              if (item && typeof item === "object" && "str" in item) {
                return (item as { str: string }).str;
              }
              return "";
            })
            .join(" ");
          fullText += pageText + "\n";
        }
        resolve(fullText);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
