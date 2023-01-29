
export class Blocks {
  blocks: any[];

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export class Image {
  url: string;
  caption: string;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export class Video {
  url: string;
  duration: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export class Json {
  json_data: object;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export class Text {
  content: string;
  format: "markdown" | "html";

  constructor(data: any) {
    Object.assign(this, data);
  }
}

export class PostMetadata {
  content: Blocks | Image | Video | Json | Text;
  type: "blocks" | "image" | "video" | "json" | "text";
  image_preview: string;
  text_preview: string;
  authorship: {
    signature: string;
    publicKey: string;
  }
  contentDigest: string;
  signatureEncoding: string;
  digestEncoding: string;
  parentDigest: string;

  constructor(data: any) {
    Object.assign(this, data);
    this.validate();
  }

  validate() {
    if (!this.content || !this.type || !this.image_preview || !this.text_preview || !this.authorship || !this.contentDigest || !this.signatureEncoding || !this.digestEncoding || !this.parentDigest) {
      throw new Error("Missing required fields in PostMetadata");
    }

    if (
      typeof this.content !== "object" ||
      typeof this.image_preview !== "string" ||
      typeof this.text_preview !== "string" ||
      typeof this.authorship !== "object" ||
      typeof this.contentDigest !== "string" ||
      typeof this.signatureEncoding !== "string" ||
      typeof this.digestEncoding !== "string" ||
      typeof this.parentDigest !== "string"
    ) throw new Error("Invalid type for fields in PostMetadata");

    if (this.type !== "blocks" && this.type !== "image" && this.type !== "video" && this.type !== "json" && this.type !== "text") {
      throw new Error("Invalid type fields for PostMetadata. Must be one of 'blocks', 'image', 'video', 'json', or 'text'");
    }

    if (this.type === "blocks" && !(new Blocks(this.content) instanceof Blocks)) throw new Error("Invalid content for PostMetadata. Expected type 'blocks'");
    if (this.type === "image" && !(new Image(this.content) instanceof Image)) throw new Error("Invalid content for PostMetadata. Expected type 'image'");
    if (this.type === "video" && !(new Video(this.content) instanceof Video)) throw new Error("Invalid content for PostMetadata. Expected type 'video'");
    if (this.type === "json" && !(new Json(this.content) instanceof Json)) throw new Error("Invalid content for PostMetadata. Expected type 'json'");
    if (this.type === "text" && !(new Text(this.content) instanceof Text)) throw new Error("Invalid content for PostMetadata. Expected type 'text'");

    return true;
  }
}
