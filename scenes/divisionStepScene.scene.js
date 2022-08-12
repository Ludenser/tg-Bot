const { Composer } = require('telegraf');
_ = require('lodash');
const sendMessageDriverMenu = require('../keyboards/mainMenu/sendMessageDriverMenu');
const sendMessageCarPhoto = require('../keyboards/scenes/sendMessageCarPhoto.routeMenu');
const setAssigneeFeature = require('../features/setAssignee.feature');
const { sendError } = require('../utils/sendLoadings');
const { resolveAllCheckListsAndItems } = require('../features/resolveCheckList.feature');
const Clickup = require('../api');

/**
 * Сцена распределения роутов.
 *
 * Запуск таймера главного чек/листа, получение его id
 */

module.exports = (ctx) => {
  const divisionStep = new Composer();

  const division = _(ctx.session.all_lists).map((el, i) => {

    divisionStep.action(`openRoute${i}`, async (ctx) => {

      const ClickAPI = new Clickup(ctx.session.user.CU_Token);
      try {
        await ctx.deleteMessage();

        await ClickAPI.Tasks.setStatus(el.mainTask[0].id, 'in progress');
        await setAssigneeFeature(ctx.session.userName, el.mainTask[0].id, ctx.session.user.CU_Token);
        await ClickAPI.TimeTracking.startEntry(el.mainTask[0].id);

        // const response = await Time.startEntry(ctx.session.all_lists[i].mainTask[0].id)
        // ctx.main_timer_id = response.data.data.id

        await sendMessageCarPhoto(ctx);
        return await ctx.wizard.selectStep(ctx.session.currentRouteNumber + ctx.session.all_lists.length);
      } catch (e) {
        console.log(e);
        await sendError(ctx, e);
      }
    });

    divisionStep.action('closeRoute', async (ctx) => {
      const ClickAPI = new Clickup(ctx.session.user.CU_Token);
      try {
        await ctx.deleteMessage();
        await sendMessageDriverMenu(ctx);

        await ClickAPI.Tasks.setStatus(el.mainTask[0].id, 'done');
        await resolveAllCheckListsAndItems(el.mainTask[0].checklists, 'true', ctx.session.user.CU_Token);
        await ClickAPI.TimeTracking.stopEntry(el.mainTask[0].id);

        await ctx.scene.leave();
      } catch (e) {
        await sendError(ctx, e);
      }
    });

    divisionStep.action('leaveScene', async (ctx) => {
      try {
        await ctx.deleteMessage();
        await sendMessageDriverMenu(ctx);
        ctx.session.currentRouteNumber = null;
        await ctx.scene.leave();
      } catch (e) {
        await sendError(ctx, e);
        await ctx.scene.leave();
      }
    });
    return divisionStep;
  });

  return division;
};
