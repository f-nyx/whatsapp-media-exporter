import { WhatsAppRepository } from '@exporter/src/domain/WhatsAppRepository'
import { MediaFileRepository } from '@exporter/src/domain/MediaFileRepository'
import { MediaIndexManager } from '@exporter/src/domain/MediaIndexManager'
import { DataSource } from '@exporter/src/utils/DataSource'
import { ExportService } from '@exporter/src/domain/ExportService'
import { createLogger } from '@exporter/src/utils/log'
import { ContactService } from '@exporter/src/domain/ContactService'

const logger = createLogger('ApplicationContext')

export class ApplicationContext {
  constructor(
    readonly whatsAppRepository: WhatsAppRepository,
    readonly mediaFileRepository: MediaFileRepository,
    readonly mediaIndexManager: MediaIndexManager,
    readonly exportService: ExportService,
    readonly contactService: ContactService,
    readonly messagesDb: DataSource,
    readonly exporterDb: DataSource
  ) {}

  async initialize() {
    logger.info('initializing application context')
    await this.mediaFileRepository.createTablesIfRequired()
    await this.contactService.loadContacts()
  }

  async close() {
    logger.info('closing application context')
    await this.messagesDb.close()
    await this.exporterDb.close()
  }
}
