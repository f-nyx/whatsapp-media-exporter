import * as fs from 'fs'
import * as path from 'path'
import { Contact } from '@exporter/src/domain/model/Contact'

const EXPORTER_DB_FILE = 'exporter.db'

export class AppConfig {
  private static instance: AppConfig

  static initFromFile(jsonFile: string): AppConfig {
    const jsonConfig = JSON.parse(fs.readFileSync(jsonFile).toString())
    AppConfig.instance = new AppConfig(
      AppConfig.requireNotNull('dataDir', jsonConfig.dataDir),
      AppConfig.requireNotNull('messagesDb', jsonConfig.messagesDb),
      AppConfig.requireNotNull('outputDir', jsonConfig.outputDir),
      AppConfig.requireNotNull('contactsFile', jsonConfig.contactsFile),
      jsonConfig.contacts.map(Contact.restore),
      jsonConfig.logLevel || 'info',
      jsonConfig.groupsNames ?? []
    )

    return AppConfig.get()
  }

  static requireNotNull(name: string, value?: string) {
    const resolvedValue = value ?? process.env[name]
    if (!resolvedValue) {
      throw new Error(`required variable ${name} not defined`)
    }
    return resolvedValue
  }

  static get(): AppConfig {
    return AppConfig.instance
  }

  private constructor(
    /** Whatsapp Data Directory. */
    readonly dataDir: string,
    /** Whatsapp sqlite file. */
    readonly messagesDbFile: string,
    /** Extractor output directory. */
    readonly outputDir: string,
    /** Path to the contacts file in VCF format. */
    readonly contactsFile: string,
    /** Contacts to extract. */
    readonly contacts: Contact[],
    /** Application log level, default is INFO. */
    readonly logLevel: string,
    /** Names of the groups to export. */
    readonly groupsNames: string[]
  ) {}

  get exporterDbFile(): string {
    return path.resolve(this.outputDir, EXPORTER_DB_FILE)
  }
}
