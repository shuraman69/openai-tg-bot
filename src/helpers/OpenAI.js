import {Configuration, OpenAIApi} from "openai";
import config from "config";
import {createReadStream} from "fs";

class OpenAI {
    openai
    constructor(apiKey) {
        const configuration = new Configuration({apiKey})
        this.openai = new OpenAIApi(configuration)
    }

    async chat(messages){
        const res = await this.openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages
        })
        return res.data.choices[0].message
    }

    async transcription(filePath){
        try {
            const res = await this.openai.createTranscription(createReadStream(filePath), 'whisper-1')
            console.log(res)
            return res.data.text
        } catch (e) {
            console.log('Error while transcription', e.message)
        }
    }
}

export const openAI = new OpenAI(config.get('OPENAI_KEY'))
