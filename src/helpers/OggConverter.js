import axios from "axios";
import {createWriteStream} from "fs";
import path from "path";
import {fileURLToPath} from "url";
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'
import {unlink} from "fs/promises";
const __dirname = path.dirname(fileURLToPath(import.meta.url))
class OggConverter {
    constructor() {
        ffmpeg.setFfmpegPath(installer.path)
    }
    toMp3(oggPath, userId){
        try {
            const outputPath = path.resolve(path.dirname(oggPath), `${userId}.mp3`)
            return new Promise((resolve, reject) => {
                ffmpeg(oggPath).inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        this.removeLocalFile(oggPath)
                        resolve(outputPath)
                })
                    .on('error', (e) => {
                        reject(e.message)
                    }).run()
            })
        } catch (e) {
            console.log('Error while creating mp3', e)
        }
    }
    async saveOggToLocalFile(url, fileName){
        try {
            const oggPath = path.resolve(__dirname, '../../voices', `${fileName}.ogg`)
            const res = await axios.get(url, {responseType: 'stream'})
            return new Promise((resolve) => {
                const stream = createWriteStream(oggPath)
                res.data.pipe(stream)
                stream.on('finish', () => {
                    resolve(oggPath)
                })
            })
        } catch (e) {
            console.log('Error while getting voice message')
        }
    }
    async removeLocalFile(path) {
        try {
          await unlink(path)
        } catch (e) {
            console.log('Error while removing file', e)
        }
    }
}
export const oggConverter = new OggConverter()
