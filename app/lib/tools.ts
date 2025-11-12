export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  category?: string;
}

export const tools: Tool[] = [
  {
    id: "heic-to-jpeg",
    name: "HEIC to JPEG",
    description: "Convert HEIC images to JPEG format",
    icon: "ImageIcon",
    href: "/tools/heic-to-jpeg",
    category: "Image Conversion",
  },
  {
    id: "pdf-merger",
    name: "PDF Merger",
    description: "Combine multiple PDF files into one",
    icon: "FileText",
    href: "/tools/pdf-merger",
    category: "PDF Tools",
  },
  {
    id: "pdf-splitter",
    name: "PDF Splitter",
    description: "Split PDF documents into separate files",
    icon: "Scissors",
    href: "/tools/pdf-splitter",
    category: "PDF Tools",
  },
  {
    id: "image-resizer",
    name: "Image Resizer",
    description: "Resize images to custom dimensions",
    icon: "Maximize2",
    href: "/tools/image-resizer",
    category: "Image Editing",
  },
  {
    id: "qr-generator",
    name: "QR Code Generator",
    description: "Create QR codes from text or URLs",
    icon: "QrCode",
    href: "/tools/qr-code-generator",
    category: "Utilities",
  },
  {
    id: "color-picker",
    name: "Color Picker",
    description: "Pick and convert colors between formats",
    icon: "Palette",
    href: "/tools/color-picker",
    category: "Design Tools",
  },
  {
    id: "screenshot-annotator",
    name: "Screenshot Annotator",
    description: "Mark up and download screenshots instantly",
    icon: "PenTool",
    href: "/tools/screenshot-annotator",
    category: "Image Editing",
  },
  {
    id: "image-to-svg",
    name: "Image to SVG",
    description: "Convert raster images to scalable vector graphics",
    icon: "Sparkles",
    href: "/tools/image-to-svg",
    category: "Image Conversion",
  },
];
