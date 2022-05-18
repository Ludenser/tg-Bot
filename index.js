const
    { Telegraf, session, Scenes } = require('telegraf'),
    TelegrafI18n = require('telegraf-i18n'),
    updateLogger = require('telegraf-update-logger'),
    chalk = require('chalk'),
    path = require('path'),
    startComposer = require('./composers/start.composer'),
    mainMenuComposer = require('./composers/mainMenu.composer'),
    routesInfoComposer = require('./composers/routesInfo.composer'),
    getTasks = require('./api/clickupApiTasks.service'),
    { getTaskIdArrFromApi } = require('./features/getRoute.feature'),
    fs = require('fs'),
    setting = JSON.parse(fs.readFileSync('./lib/setting.json')),
    {
        listIdSupply,
        listIdCleaning
    } = setting,
    selectRouteComposer = require('./composers/selectRoute.composer');

require('dotenv').config();

const i18n = new TelegrafI18n({
    defaultLanguage: 'ru',
    allowMissing: false, // Default true
    directory: path.resolve(__dirname, 'locales')
})
const token = process.env.TOKEN;

const bot = new Telegraf(token)
bot.context.all_tasks = undefined
bot.context.routeNumber = undefined
bot.context.supplyArr_id = undefined
bot.context.cleanArr_id = undefined




/* Log Function */
bot.use(
    updateLogger({
        colors: {
            id: chalk.red,
            chat: chalk.yellow,
            user: chalk.green,
            type: chalk.bold,
        },
    }),
);

/* Command */
// bot.command('axiosxmpl', async (ctx) => {
//     let input = ctx.message.text
//     let inputArray = input.split(" ")
//     let message = "";

//     if (inputArray.length == 1) {
//         message = "Пожалуйста, введите текст, например: /axiosxmpl fxgncghnmhgj"
//         ctx.reply(message)
//     } else {
//         sendProses(ctx, bot)
//         inputArray.shift();
//         messager = inputArray.join(" ")
//         try {
//             const link = await axios.get(`http://hhh.fff.com/api/axiosxmpl?apikey=${key}&query=${messager}`)
//             const { result } = link.data
//             const axiObj = result.slice(0, 3)
//             axiObj.forEach(async (res) => {
//                 ctx.replyWithPhoto({ url: res.thumbnail }, {
//                     caption: `──────✿ 𝐒𝐞𝐚𝐫𝐜𝐡 ✿──────

// ❖ Title: ${res.title}
// ❖ Link: https://www.youtube.com/watch?v=${res.videoId}
// ❖ Published: ${res.published}
// ❖ Viewrs: ${res.views}

// `})

//             })
//         } catch (e) {
//             messageError(ctx)
//         }
//     }
// })

bot.use(i18n.middleware())

bot.use(async (ctx, next) => {
    const all_tasksSupply = await getTasks.getAllTasks(listIdSupply)
    const supplyArr_id = await getTaskIdArrFromApi(listIdSupply)
    const cleanArr_id = await getTaskIdArrFromApi(listIdCleaning)
    ctx.supplyArr_id = supplyArr_id
    ctx.cleanArr_id = cleanArr_id
    ctx.all_tasks = all_tasksSupply.data.tasks
    bot.use(selectRouteComposer(ctx))
    await next()
})
bot.use(startComposer)
bot.use(mainMenuComposer)
bot.use(routesInfoComposer)

// bot.use(selectRouteComposer)
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
