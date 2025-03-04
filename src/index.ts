import { program } from 'commander'
import { AppConfig } from '@exporter/src/AppConfig'
import { createLogger } from '@exporter/src/utils/log'
import { createContext } from '@exporter/src/bootstrap'

const logger = createLogger('init')

async function run(configFile: string) {
  logger.info('loading configuration')
  const config = AppConfig.initFromFile(configFile)
  const context = await createContext(config)

  await context.initialize()
  await context.mediaIndexManager.updateIndex()

  let contacts = config.contacts

  if (contacts.length === 0) {
    // By default, it exports all contacts.
    contacts = context.contactService.contacts
  }

  await context.exportService.export(contacts, config.groupsNames)

  await context.close()
}

const options = program
  .requiredOption('--config-file <file>', 'Extractor configuration file.')
  .parse()
  .opts()

run(options.configFile)
  .then(() => logger.info('bye'))
  .catch((err) => logger.error(err))
