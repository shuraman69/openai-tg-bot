import {Telegraf} from "telegraf";
import {message} from "telegraf/filters";
import config from 'config'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
bot.on(message('text'), async (ctx) => {
    await ctx.reply([...ctx.message.text].reverse().join(''))
})
bot.command('start', async (ctx) => {
    await ctx.reply('Привет, Оля! Я тебя люблю!😍😍😍')
})
bot.launch()
