import { MediaIndexManager } from '@exporter/src/domain/MediaIndexManager'
import { WhatsAppRepository } from '@exporter/src/domain/WhatsAppRepository'
import { MediaFileRepository } from '@exporter/src/domain/MediaFileRepository'
import { Contact } from '@exporter/src/domain/model/Contact'
import { Chat } from '@exporter/src/domain/model/Chat'
import { createLogger } from '@exporter/src/utils/log'
import * as os from 'os'
import { MediaIndex } from '@exporter/src/domain/model/MediaIndex'
import { MediaItem } from '@exporter/src/domain/model/MediaItem'
import * as path from 'path'
import * as fs from 'node:fs/promises'
import { MediaFile } from '@exporter/src/domain/model/MediaFile'

const logger = createLogger('ExportService')

export class ExportService {
  constructor(
    private readonly mediaIndexManager: MediaIndexManager,
    private readonly whatsAppRepository: WhatsAppRepository,
    private readonly mediaFileRepository: MediaFileRepository,
    private readonly dataDir: string,
    private readonly outputDir: string
  ) {}

  async export(
    contacts: Contact[],
    groupsNames: string[]
  ) {
    logger.info(`exporting content for ${contacts.length} contacts`)
    const mediaIndex = await this.mediaIndexManager.loadIndex()
    const chats = await this.whatsAppRepository.findChats(contacts, groupsNames)
    const jobCount = os.availableParallelism()

    logger.info(`using ${jobCount} jobs`)

    for (const chat of chats) {
      const mediaItems = await this.whatsAppRepository.findMediaItems(chat)
      let jobItems

      logger.info(`total media items for ${chat.displayName}: ${mediaItems.length}`)

      do {
        jobItems = mediaItems.splice(0, jobCount)
        await Promise.all(jobItems.map(async (mediaItem) => await this.processFile(mediaIndex, chat, mediaItem)))
      } while (jobItems.length)
    }

    logger.info('export process finished successfully')
  }

  private async processFile(mediaIndex: MediaIndex, chat: Chat, mediaItem: MediaItem) {
    if (!mediaIndex.has(mediaItem.path)) {
      logger.info(`media file not found, skipping: ${mediaItem.path}`)
      return
    }
    const mediaFile = mediaIndex.get(mediaItem.path) as MediaFile

    if (mediaFile.processed) {
      logger.info(`file already exported: ${mediaFile.path}`)
      return
    }

    logger.info(`exporting: ${mediaFile.path}`)
    const targetDir = path.join(
      this.outputDir,
      chat.displayName,
      path.dirname(mediaFile.path).substring('Media/'.length)
    )

    // ensures target directory exists
    await fs.mkdir(targetDir, { recursive: true })

    // Copies the file
    const sourceFile = path.join(this.dataDir, mediaFile.path)
    const targetFile = path.join(targetDir, path.basename(mediaFile.path))
    await fs.copyFile(sourceFile, targetFile)

    // Marks the media file as processed
    await this.mediaFileRepository.update(mediaFile.exported())
  }
}
