import { program } from 'commander'
import { AppConfig } from '@exporter/src/AppConfig'
import { createLogger } from '@exporter/src/utils/log'
import { createContext } from '@exporter/src/bootstrap'

const logger = createLogger('init')

async function run(configFile: string) {
  logger.info('loading configuration')
  AppConfig.initFromFile(configFile)
  const context = await createContext(AppConfig.get())

  await context.initialize()
  await context.mediaIndexManager.updateIndex()
  await context.exportService.export(AppConfig.get().contacts)

  await context.close()
}

const options = program
  .requiredOption('--config-file <file>', 'Extractor configuration file.')
  .parse()
  .opts()

run(options.configFile)
  .then(() => logger.info('bye'))
  .catch((err) => logger.error(err))
