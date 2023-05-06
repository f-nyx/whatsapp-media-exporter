import * as fs from 'node:fs/promises'
import { existsSync } from 'fs'
import { MediaFileRepository } from '@extractor/src/domain/MediaFileRepository'
import * as path from 'path'
import { createLogger } from '@extractor/src/utils/log'
import { MediaFile } from '@extractor/src/domain/model/MediaFile'
import { MediaIndex } from '@extractor/src/domain/model/MediaIndex'

const logger = createLogger('MediaIndex')

export class MediaIndexManager {
  constructor(
    /** Repository to store and read media files. */
    private readonly mediaFileRepository: MediaFileRepository,
    /** WhatsApp data directory. */
    private readonly dataDir: string
  ) {
    if (!existsSync(dataDir)) {
      throw new Error(`data directory does not exist: ${dataDir}`)
    }
  }

  async loadIndex(): Promise<MediaIndex> {
    logger.info('loading media files index')
    const mediaFiles = await this.mediaFileRepository.getAll()
    return mediaFiles.reduce((index, mediaFile) => index.set(mediaFile.path, mediaFile), new Map())
  }

  async updateIndex() {
    logger.info('updating media files index')
    const index: MediaIndex = await this.loadIndex()

    // traverse the directory tree using a queue to avoid recursion.
    const queue: string[] = (await fs.readdir(path.join(this.dataDir, 'Media'))).map((file) => `Media/${file}`)

    while (queue.length) {
      const current = queue.shift() as string
      const absolutePath = path.join(this.dataDir, current)
      const stats = await fs.stat(absolutePath)

      if (stats.isDirectory()) {
        const nextFiles = (await fs.readdir(absolutePath)).map((file) => `${current}/${file}`)
        queue.push(...nextFiles)
      } else {
        if (index.has(current)) {
          const mediaFile = index.get(current) as MediaFile
          if (stats.mtime > mediaFile.lastModified) {
            logger.info(`updating: ${current}`)
            index.set(current, await this.mediaFileRepository.update(mediaFile.touch(stats.mtime)))
          }
        } else {
          logger.info(`indexing: ${current}`)
          const mediaFile = await this.mediaFileRepository.create(MediaFile.create(current, stats.mtime))
          index.set(current, mediaFile)
        }
      }
    }
  }
}
