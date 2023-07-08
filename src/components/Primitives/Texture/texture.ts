import { CleanableCanvas, loadImg, createNewCanvas } from "@utils";

export class Texture {
    data: ImageBitmap | null = null;
    private loaded = false;
    private offCanvas: CleanableCanvas = new CleanableCanvas(1, 1);
    get width() {
        return this.data?.width || 0;
    }
    get height() {
        return this.data?.height || 0;
    }

    url: string = "";

    private cachedCrops = new Map<
        string,
        { data: ImageBitmap; width: number; height: number }
    >();

    constructor();
    constructor(data: ImageBitmap, width: number, height: number);
    constructor(url: string);
    constructor(urlOrData?: string | ImageBitmap, w?: number, h?: number) {
        const ctx = this.offCanvas.getContext("2d");
        if (!ctx) throw "Error getting canvas context!";
        if (
            typeof urlOrData == "undefined" &&
            typeof w === "undefined" &&
            typeof h === "undefined"
        ) {
            return;
        }
        if (typeof urlOrData === "string" && urlOrData.length > 0)
            this.url = urlOrData;
        else if (
            urlOrData instanceof ImageBitmap &&
            typeof w !== "undefined" &&
            typeof h !== "undefined"
        ) {
            this.data = urlOrData;
            this.offCanvas.clearCanvas(w, h);
            this.offCanvas.getContext("2d")?.drawImage(urlOrData, 0, 0);
            this.loaded = true;
        } else {
            console.trace();
            throw (
                "Incorrect constructor parameters!" +
                urlOrData +
                "/" +
                w +
                "/" +
                h
            );
        }
    }
    get isLoaded() {
        return this.loaded;
    }
    private resizeCanvas(w: number, h: number) {
        this.offCanvas.clearCanvas(w, h);
    }
    unload() {
        this.data = null;
        this.resizeCanvas(1, 1);
    }
    async load(url: string) {
        if (this.loaded) return;
        const imgUrl = this.url || url;
        if (!imgUrl) throw "URL not provided!";
        const img = await loadImg(url);
        this.resizeCanvas(img.naturalWidth, img.naturalHeight);
        const ctx = this.offCanvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        const iData = ctx.getImageData(
            0,
            0,
            this.offCanvas.width,
            this.offCanvas.height,
            {
                colorSpace: "srgb",
            }
        );
        this.data = await createImageBitmap(iData);
        this.loaded = true;
    }

    cacheImageCrop(
        sourcePointID: string,
        data: ImageBitmap,
        width: number,
        height: number
    ) {
        if (!this.data || !this.loaded) {
            console.trace();
            throw "Image not loaded in!";
        }
        this.cachedCrops.set(sourcePointID, { data, width, height });
    }

    async toImage(
        x: number,
        y: number,
        w: number,
        h: number
    ): Promise<ImageBitmap> {
        if (!this.data || !this.loaded) {
            console.trace();
            throw "Image not loaded in!";
        }
        const cacheID = [x, y, w, h].join(",");
        const cached = this.cachedCrops.get(cacheID);
        if (cached) {
            return cached.data;
        } else {
            const { e: cnv, ctx } = createNewCanvas();
            cnv.width = this.data.width;
            cnv.height = this.data.height;
            ctx.drawImage(this.data, 0, 0);
            const croppedImageData = ctx.getImageData(x, y, w, h);
            const croppedImage = await createImageBitmap(croppedImageData);
            this.cacheImageCrop(cacheID, croppedImage, w, h);
            return croppedImage;
        }
    }
}
