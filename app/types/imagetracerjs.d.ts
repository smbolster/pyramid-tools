// Type declarations for imagetracerjs
declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    layering?: number;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    lcpr?: number;
    qcpr?: number;
    blurradius?: number;
    blurdelta?: number;
  }

  interface ImageTracer {
    imageToSVG(
      input: string | HTMLImageElement | HTMLCanvasElement,
      options?: ImageTracerOptions,
      callback?: (svgString: string) => void
    ): string;

    imagedataToSVG(
      imagedata: ImageData,
      options?: ImageTracerOptions
    ): string;
  }

  const imagetracer: ImageTracer;
  export default imagetracer;
}
