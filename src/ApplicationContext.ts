import { WhatsAppRepository } from '@extractor/src/domain/WhatsAppRepository'
import { MediaFileRepository } from '@extractor/src/domain/MediaFileRepository'
import { MediaIndexManager } from '@extractor/src/domain/MediaIndexManager'
import { DataSource } from '@extractor/src/utils/DataSource'
import { ExportService } from '@extractor/src/domain/ExportService'
import { createLogger } from '@extractor/src/utils/log'

const logger = createLogger('ApplicationContext')

export class ApplicationContext {
  constructor(
    readonly whatsAppRepository: WhatsAppRepository,
    readonly mediaFileRepository: MediaFileRepository,
    readonly mediaIndexManager: MediaIndexManager,
    readonly exportService: ExportService,
    readonly messagesDb: DataSource,
    readonly exporterDb: DataSource
  ) {}

  async initialize() {
    logger.info('initializing application context')
    await this.mediaFileRepository.createTablesIfRequired()
  }

  async close() {
    logger.info('closing application context')
    await this.messagesDb.close()
    await this.exporterDb.close()
  }
}
