import JSZip from "jszip";

export interface FileToZip {
  name: string;
  blob: Blob;
}

/**
 * Creates a ZIP archive from multiple files
 */
export async function createZipFromFiles(
  files: FileToZip[]
): Promise<Blob> {
  const zip = new JSZip();

  // Track filenames to handle conflicts
  const usedNames = new Set<string>();

  files.forEach((file) => {
    let finalName = file.name;
    let counter = 1;

    // Handle filename conflicts by appending numbers
    while (usedNames.has(finalName)) {
      const extensionIndex = file.name.lastIndexOf(".");
      if (extensionIndex > 0) {
        const nameWithoutExt = file.name.substring(0, extensionIndex);
        const extension = file.name.substring(extensionIndex);
        finalName = `${nameWithoutExt}_${counter}${extension}`;
      } else {
        finalName = `${file.name}_${counter}`;
      }
      counter++;
    }

    usedNames.add(finalName);
    zip.file(finalName, file.blob);
  });

  // Generate the ZIP file
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6, // Balanced compression
    },
  });

  return zipBlob;
}

/**
 * Triggers a download of a blob with a given filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
