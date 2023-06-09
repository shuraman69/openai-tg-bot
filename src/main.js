import {Telegraf, session} from "telegraf";
import {message} from "telegraf/filters";
import {code} from "telegraf/format";
import config from 'config'
import {oggConverter} from "./helpers/OggConverter.js";
import {openAI} from "./helpers/OpenAI.js";
const INITIAL_SESSION = {
    messages: []
}
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
bot.use(session())
bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply(`Привет! Это кефтеме-бот, пришли мне голосовое или текстовое сообщение, чтобы начать диалог\nКонтекст беседы сохраняется - для создания нового контекста используйте команду "/new"`)
})
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx.reply('Жду вашего голосового или текстового сообщения')
})
bot.on(message('voice'), async (ctx) => {
    //@ts-ignore
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Подождите, кефтемекаю...'))
        const userId = String(ctx.message.from.id)
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const oggPath = await oggConverter.saveOggToLocalFile(link.href, userId)
        const mp3Path = await oggConverter.toMp3(oggPath, userId)
        const text = await openAI.transcription(mp3Path)
        if(!text) {
            return await ctx.reply('Что-то пошло не так :(')
        }
        //@ts-ignore
        ctx.session.messages.push({role: 'user', content: text})
        //@ts-ignore
        const response = await openAI.chat(ctx.session.messages)
        //@ts-ignore
        ctx.session.messages.push({role: 'assistant', content: response.content})
        await ctx.reply(code(`Ваш запрос: ${text}`))
        if(!response) {
            return await ctx.reply('Чат не смог ответить на ваш запрос :(')
        }
        await ctx.reply(response.content)
    } catch (e) {
        console.log('Error voice message', e.message)
    }
})

bot.on(message('text'), async (ctx) => {
    //@ts-ignore
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Подождите, кефтемекаю...'))
        //@ts-ignore
        ctx.session.messages.push({role: 'user', content: ctx.message.text})
        //@ts-ignore
        const response = await openAI.chat(ctx.session.messages)
        //@ts-ignore
        ctx.session.messages.push({role: 'assistant', content: response.content})
        await ctx.reply(code(`Ваш запрос: ${ctx.message.text}`))
        if(!response) {
            return await ctx.reply('Чат не смог ответить на ваш запрос :(')
        }
        await ctx.reply(response.content)
    } catch (e) {
        console.log('Error voice message', e.message)
    }
})
bot.launch()
