const { Composer, Markup } = require('telegraf');
const { Task, Time, Users } = require('../api/clickUpApi.service');
const postAttachmentsFeature = require('../features/postAttachments.feature');
const sendMessageDriverMenu = require('../keyboards/mainMenu/sendMessageDriverMenu');
const sendMessagePhotoCheck = require('../keyboards/scenes/sendMessagePhotoCheck.routeMenu');
const deleteMessagePrev = require('../utils/deleteMessagePrev');
const sendMessageError = require('../utils/sendMessageError');
const postCommentFeature = require('../features/postComment.feature');
const setAssigneeFeature = require('../features/setAssignee.feature');
const sendMessageRouteEnter = require('../keyboards/scenes/sendMessageRouteEnter');
// const sendMessageRouteEnterEx = require('../keyboards/scenes/sendMessageRouteEnterEx');
const { sendError } = require('../utils/sendLoadings');

module.exports = (arr) => {

    console.log('Последний таск', arr.at(-1).name)
    const newArr = arr.map((task) => {

        const point_scene = new Composer()

        point_scene.action('enter', async (ctx) => {
            try {
                // if (task.name === arr.at(-1).name) {
                //     await ctx.deleteMessage()
                //     // await Task.setStatus(task.id, 'in progress')
                //     // await setAssigneeFeature(task.id)
                //     // await Time.startEntry(ctx.team_id, task.id)
                //     await sendMessageRouteEnterEx(ctx, task.name)
                // } else {
                await ctx.deleteMessage()
                // await Task.setStatus(task.id, 'in progress')
                // await setAssigneeFeature(task.id)
                // await Time.startEntry(ctx.team_id, task.id)
                await sendMessageRouteEnter(ctx, task.name)


            } catch (e) {
                await sendError(ctx, e)
                await sendMessageRouteEnter(ctx, task.name)
            }
            console.log(task.name, task.id)
        })

        point_scene.action('enter_more', async (ctx) => {
            try {
                await ctx.deleteMessage()
                await sendMessageRouteEnter(ctx, task.name)
            } catch (e) {
                await sendError(ctx, e)
                await sendMessageRouteEnter(ctx, task.name)
            }

        })

        point_scene.hears('Подтвердить загрузку фото✅', async (ctx) => {
            try {
                await ctx.deleteMessage()
                await deleteMessagePrev(ctx, 1)
                await sendMessagePhotoCheck('point', ctx)
            } catch (e) {
                await sendError(ctx, e)
                await sendMessageRouteEnter(ctx, task.name)
            }

        })

        point_scene.action('upl_photo', async (ctx) => {

            try {
                await ctx.deleteMessage()
                await ctx.reply('Прикрепи и отправь фотки',
                    Markup.keyboard([
                        Markup.button.callback('Подтвердить загрузку фото✅')
                    ]).resize(true).oneTime(true)
                )
                point_scene.on('photo', async (ctx) => {
                    await postAttachmentsFeature(ctx, task.id)
                })
            } catch (e) {
                await sendError(ctx, e)
                await sendMessageRouteEnter(ctx, task.name)
            }
        })

        point_scene.action('upl_comment', async (ctx) => {
            try {
                await ctx.deleteMessage()
                await ctx.reply('Напиши комментарий к таску, если нужно кого-то тегнуть, добавь в конце комментария "@имя фамилия"',
                    Markup

                        .inlineKeyboard([
                            Markup.button.callback('Вернуться в меню осблуживания комплекса', 'enter_more'),
                        ]))
                point_scene.on('text', async (ctx) => {
                    if (ctx.update.message.text !== undefined) {
                        await ctx.deleteMessage()
                        await postCommentFeature(ctx, task.id)
                    } else {
                        console.log('Опять')
                    }
                })
            } catch (e) {
                await sendError(ctx, e)
                await sendMessageRouteEnter(ctx, task.name)
            }
        })

        point_scene.action('next_step', async (ctx) => {
            try {
                // await Task.setStatus(task.id, 'done')
                // await Time.stopEntry(ctx.team_id, task.id)
                await ctx.deleteMessage()
                await ctx.reply(`Заканчиваем ${task.name}`, Markup
                    .inlineKeyboard([
                        Markup.button.callback('Едем дальше', 'enter'),
                    ]))
                await ctx.wizard.next()
            } catch (e) {
                await sendError(ctx, e)
                await sendMessageRouteEnter(ctx, task.name)
            }
        })

        point_scene.action('leaveScene', async (ctx) => {
            try {
                // await Time.stopEntry(ctx.team_id, task.id)
                // await Task.setStatus(task.id, 'to do')
                await ctx.deleteMessage()
                await sendMessageDriverMenu(ctx)
                await ctx.scene.leave()
            } catch (e) {
                await sendError(ctx, e)
                await sendMessageDriverMenu(ctx)
                await ctx.scene.leave()
            }

        })
        console.log(task.name)
        return point_scene
    })
    console.log(newArr)
    return newArr
}