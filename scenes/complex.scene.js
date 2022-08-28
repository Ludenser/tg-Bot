const { Composer, Markup } = require('telegraf');
const _ = require('lodash');
const sendMessageDriverMenu = require('../keyboards/mainMenu/sendMessageDriverMenu');
const postCommentFeature = require('../features/postComment.feature');
const setAssigneeFeature = require('../features/setAssignee.feature');
const sendMessageRouteEnter = require('../keyboards/scenes/sendMessageRouteEnter');
const sendMessageRouteEnterEx = require('../keyboards/scenes/sendMessageRouteEnterEx');
const { sendError, sendProses } = require('../utils/sendLoadings');
const { resolveAllCheckListsAndItems, } = require('../features/resolveCheckList.feature');
const { postAttachments } = require('../features/postAttachments.feature');
const Clickup = require('../api/index');
const sendMessageComment = require('../keyboards/scenes/sendMessageComment.scene');
const sendMessageNextStep = require('../keyboards/scenes/sendMessageNextStep.scene');
const getAttentionFeature = require('../features/getAttention.feature');

/**
 * Сцена обслуживания комплекса.
 * Динамически создается на основании массива тасков из API
 * @param {[Object]} arr - массив с обьектами тасков без главного таска водителя-оператора
 * @param {[Object]} list - массив с обьектами тасков текущего таск-листа
 */

module.exports = (arr, list) => {
  const complexSceneArray = _(arr).map((task, i) => {
    const complex_scene = new Composer();

    complex_scene.action('enter', async (ctx) => {

      const ClickAPI = new Clickup(ctx.session.user.CU_Token);

      try {
        await ctx.deleteMessage();
        await ClickAPI.Tasks.setStatus(task.id, 'in progress');
        await ClickAPI.TimeTracking.startEntry(task.id);
        await setAssigneeFeature(ctx.session.userName, task.id, ctx.session.user.CU_Token);
        await sendMessageRouteEnter(ctx, task.name, task.id);
        await getAttentionFeature(ctx, task.custom_fields);
      } catch (e) {
        await sendError(ctx, e);
        await sendMessageRouteEnter(ctx, task.name, task.id);
      }
    });

    complex_scene.action('reenter', async (ctx) => {
      
      try {
        await ctx.deleteMessage();
        await sendMessageRouteEnter(ctx, task.name, task.id);
      } catch (e) {
        await sendError(ctx, e);
        await sendMessageRouteEnter(ctx, task.name, task.id);
      }
    });

    complex_scene.action('upl_photo', async (ctx) => {
      try {

        await ctx.deleteMessage();
        await ctx.reply(`Фото к ${task.name} `)
        await ctx.reply('Отправь фотки и нажми кнопку под этим сообщением.',
          Markup.inlineKeyboard([
            Markup.button.callback(`Загрузил.`, 'reenter'),
          ])
        );

        complex_scene.on('photo', async (ctx) => {
          await postAttachments(ctx, task.id);
        });
      } catch (e) {
        await sendError(ctx, e);
        await sendMessageRouteEnter(ctx, task.name, task.id);
      }
    });

    complex_scene.action('upl_comment', async (ctx) => {

      await ctx.deleteMessage();
      await sendMessageComment(ctx);
      complex_scene.on('text', async (ctx) => {

        await ctx.deleteMessage();
        await postCommentFeature(ctx, task.id);

      })
    });

    complex_scene.action('next_step', async (ctx) => {
      const ClickAPI = new Clickup(ctx.session.user.CU_Token);

      try {
        await ClickAPI.Tasks.setStatus(task.id, 'done');
        await ClickAPI.TimeTracking.stopEntry(task.id);
        await resolveAllCheckListsAndItems(task.checklists, 'true', ctx.session.user.CU_Token);
        await ClickAPI.TimeTracking.startEntry(list.mainTask[0].id);

        await ctx.deleteMessage();
        await sendMessageNextStep(ctx, task.name, arr[i + 1].name);
        await ctx.wizard.next();
      } catch (e) {
        await sendError(ctx, e);
        await sendMessageRouteEnter(ctx, task.name, task.id);
      }
    });

    complex_scene.action('exit', async (ctx) => {
      const ClickAPI = new Clickup(ctx.session.user.CU_Token);
      try {
        await ClickAPI.Tasks.setStatus(task.id, 'done');
        await ClickAPI.TimeTracking.stopEntry(task.id);
        await ClickAPI.TimeTracking.startEntry(list.mainTask[0].id);
        await resolveAllCheckListsAndItems(task.checklists, 'true', ctx.session.user.CU_Token);

        await ctx.deleteMessage();
        await sendMessageRouteEnterEx(ctx);
        await ctx.scene.enter('INITIAL_WIZARD_ID');
      } catch (e) {
        await sendError(ctx, e);
        await sendMessageRouteEnterEx(ctx);
        await ctx.scene.enter('INITIAL_WIZARD_ID');
      }
    });

    complex_scene.action('leaveScene', async (ctx) => {
      const ClickAPI = new Clickup(ctx.session.user.CU_Token);
      try {
        await ClickAPI.TimeTracking.stopEntry(task.id);
        await ClickAPI.Tasks.setStatus(task.id, 'to do');
        await ClickAPI.Tasks.setStatus(list.mainTask[0].id, 'to do');
        await resolveAllCheckListsAndItems(task.checklists, 'false', ctx.session.user.CU_Token);
        await resolveAllCheckListsAndItems(list.mainTask[0].checklists, 'false', ctx.session.user.CU_Token);

        await ctx.deleteMessage();
        ctx.session.currentRouteNumber = null;
        await sendMessageDriverMenu(ctx);
        await ctx.scene.leave();
      } catch (e) {
        await sendError(ctx, e);
        await sendMessageDriverMenu(ctx);
        await ctx.scene.leave();
      }
    });

    return complex_scene;
  });

  return complexSceneArray;
};
