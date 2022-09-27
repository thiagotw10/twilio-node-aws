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

    // #region cron build xml single request
    const XmlContr = (await import('App/Controllers/Http/XmlsController')).default
      cron.schedule("*/10 * * * * *", async () => { //*/10 * * * * *
        //console.log(`[${Moment().format('H:mm')}] - Search requests for integration...`)
        // await new XmlContr().BuildXmlSingleRequest()
        // await new XmlContr().BuildXmlSingleRequestItens()
      });
    // #endregion cron build xml single request

    // #region cron send xml single request and build single request itens
      cron.schedule("*/3 * * * * *", async () => {
        // await new XmlContr().send()
      });
    // #endregion cron send xml single request and build single request itens

    // #region cron send survey
    const SurveyController = (await import('App/Controllers/Http/SurveyController')).default
    cron.schedule("*/1 * * * *", async () => {
      // console.log(`[${Moment().format('H:mm')}] - Init survey contact...`)
      // await new SurveyController().index()
    });
  // #endregion cron send survey

    // #region cron survey expired
      cron.schedule("*/30 * * * * *", async () => {
        // console.log(`[${Moment().format('H:mm')}] - Init survey expires...`)
        // await new SurveyController().expiration()
      });
    // #endregion cron send survey

    const CheckExpirationController = (await import('App/Controllers/Http/CheckExpirationController')).default
    cron.schedule("*/30 * * * * *", async () => {
      console.log(`[${day().format('DD-MM-YYYY HH:mm')}] - Init Check Expiration...`)
      await new CheckExpirationController().index()
    });


  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
