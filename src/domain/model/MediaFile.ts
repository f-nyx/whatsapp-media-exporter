export class MediaFile {
  static create(path: string, lastModified: Date): MediaFile {
    return new MediaFile(path, lastModified, false)
  }

  static restore(mediaFile: any): MediaFile {
    return new MediaFile(
      mediaFile.path,
      new Date(parseInt(mediaFile.last_modified, 10)),
      Boolean(mediaFile.processed)
    )
  }

  constructor(
    /** Path relative to the WhatsApp data directory. */
    readonly path: string,
    /** File last modified date. */
    readonly lastModified: Date,
    /** true if already exported, false otherwise. */
    readonly processed: boolean
  ) {}

  touch(lastModified: Date): MediaFile {
    return new MediaFile(this.path, lastModified, false)
  }

  exported(): MediaFile {
    return new MediaFile(this.path, this.lastModified, true)
  }
}
