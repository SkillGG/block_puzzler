import { Texture } from "./texture";

export class LoadedTexture {
    private tex: Texture;
    readonly id: string;
    get fullTextureData() {
        return this.tex.data;
    }

    async toImage(sx: number, sy: number, sw: number, sh: number) {
        return await this.tex.toImage(sx, sy, sw, sh);
    }

    get width() {
        return this.tex.width;
    }
    get height() {
        return this.tex.height;
    }
    constructor(lt: LoadedTexture, id: string);
    constructor(tex: Texture, id: string);
    constructor(tex: Texture | LoadedTexture, id: string) {
        if (tex instanceof Texture) {
            if (!tex.data || !tex.isLoaded) {
                console.trace();
                throw "Image not loaded in!";
            }
            this.tex = tex;
        } else {
            this.tex = tex.tex;
        }
        this.id = id;
    }
}
