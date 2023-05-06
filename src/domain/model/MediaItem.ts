export class MediaItem {

  static restore(mediaItem: any): MediaItem {
    return new MediaItem(
      mediaItem.chat_row_id,
      mediaItem.message_row_id,
      mediaItem.media_name,
      mediaItem.file_path,
      mediaItem.file_size,
      mediaItem.mime_type,
      mediaItem.file_hash,
    )
  }

  constructor(
    readonly chatId: number,
    readonly messageId: number,
    readonly name: string,
    readonly path: string,
    readonly size: number,
    readonly mimeType: string,
    readonly hash: string
  ) {}
}
