import { WhatsAppRepository } from '@extractor/src/domain/WhatsAppRepository'
import { MediaFileRepository } from '@extractor/src/domain/MediaFileRepository'
import { MediaIndexManager } from '@extractor/src/domain/MediaIndexManager'
import { AppConfig } from '@extractor/src/AppConfig'
import { ApplicationContext } from '@extractor/src/ApplicationContext'
import { DataSource } from '@extractor/src/utils/DataSource'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'
import path from 'path'
import { createLogger } from '@extractor/src/utils/log'
import { ExportService } from '@extractor/src/domain/ExportService'

const logger = createLogger('bootstrap')

export async function createContext(config: AppConfig): Promise<ApplicationContext> {
  const { messagesDbFile, exporterDbFile, dataDir, outputDir } = AppConfig.get()

  logger.info(`opening WhatsApp messages database: ${messagesDbFile}`)
  const messagesDb: DataSource = new DataSource(
    await open({
      filename: messagesDbFile,
      driver: sqlite3.cached.Database,
    })
  )

  logger.info(`opening extractor database: ${exporterDbFile}`)
  const exporterDb: DataSource = new DataSource(
    await open({
      filename: exporterDbFile,
      driver: sqlite3.cached.Database,
    })
  )

  logger.info('creating application components')
  const whatsAppRepository = new WhatsAppRepository(messagesDb)
  const mediaFileRepository = new MediaFileRepository(exporterDb)
  await mediaFileRepository.createTablesIfRequired()
  const mediaIndexManager = new MediaIndexManager(mediaFileRepository, path.resolve(dataDir))
  const exportService = new ExportService(
    mediaIndexManager,
    whatsAppRepository,
    mediaFileRepository,
    path.resolve(dataDir),
    path.resolve(outputDir)
  )

  return new ApplicationContext(
    whatsAppRepository,
    mediaFileRepository,
    mediaIndexManager,
    exportService,
    messagesDb,
    exporterDb
  )
}
