import { DataSource } from '@exporter/src/utils/DataSource'
import { MediaFile } from '@exporter/src/domain/model/MediaFile'

export class MediaFileRepository {
  constructor(
    /** Data source to store and read files. */
    private readonly exporterDb: DataSource
  ) {}

  async getAll(): Promise<MediaFile[]> {
    const records: any[] = await this.exporterDb.find('select * from media_files')
    return records.map((record: any) => MediaFile.restore(record))
  }

  async create(mediaFile: MediaFile): Promise<MediaFile> {
    await this.exporterDb.write('insert or ignore into media_files (path, last_modified, processed) values (?, ?, ?)', [
      mediaFile.path,
      mediaFile.lastModified,
      mediaFile.processed,
    ])

    return mediaFile
  }

  async update(mediaFile: MediaFile): Promise<MediaFile> {
    await this.exporterDb.write('update media_files set last_modified = ?, processed = ? where path = ?', [
      mediaFile.lastModified,
      mediaFile.processed,
      mediaFile.path,
    ])

    return mediaFile
  }

  async createTablesIfRequired() {
    await this.exporterDb.exec(`
        create table if not exists media_files (
          path text not null,
          last_modified text not null,
          processed integer not null,
          primary key (path)
        )
    `)
  }
}
