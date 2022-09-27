import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import cron from 'node-cron'
import day from 'dayjs'
// import Moment from 'moment'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
  }

  public async boot () {
    // IoC container is ready

    // #feature: verify database here
  }

  public async ready () {
    // App is ready

    // const XmlContr = (await import('App/Controllers/Http/XmlsController')).default
    // cron.schedule("*/10 * * * * *", async () => {
    //   await new XmlContr().BuildXmlSingleRequest()
    //   await new XmlContr().BuildXmlSingleRequestItens()
    // });

    // cron.schedule("*/3 * * * * *", async () => {
    //   await new XmlContr().send()
    // });

    // const SurveyController = (await import('App/Controllers/Http/SurveyController')).default
    // cron.schedule("*/1 * * * *", async () => {
    //   await new SurveyController().index()
    // });

    // cron.schedule("*/30 * * * * *", async () => {
    //   await new SurveyController().expiration()
    // });

    // const CheckExpirationController = (await import('App/Controllers/Http/CheckExpirationController')).default
    // cron.schedule("*/30 * * * * *", async () => {
    //   console.log(`[${day().format('DD-MM-YYYY HH:mm')}] - Init Check Expiration...`)
    //   await new CheckExpirationController().index()
    // });

  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
