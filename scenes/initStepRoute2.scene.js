const { Composer } = require('telegraf'),
    GetTimeService = require('../api/clickupApiTime.service'),
    sendMessageDriverMenu = require('../keyboards/mainMenu/sendMessageDriverMenu'),
    deleteMessagePrev = require('../utils/deleteMessagePrev');

const initStepRoute2 = new Composer()

initStepRoute2.action('leaveScene', async (ctx) => {
    // await GetTimeService.stopTimeEntry(24409308)
    await ctx.deleteMessage()
    await deleteMessagePrev(ctx, 1)
    await sendMessageDriverMenu(ctx)
    ctx.state = {}
    return await ctx.scene.leave()
})

module.exports = initStepRoute2