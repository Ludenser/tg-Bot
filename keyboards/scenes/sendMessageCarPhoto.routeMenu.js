
module.exports = async (ctx) => {
    const msg = "Жду, пока загрузишь машину. Потом не забудь ее сфоткать с 4х сторон, прислать мне и подождать сообщения об успешной загрузке."
    await ctx.reply(msg)
}