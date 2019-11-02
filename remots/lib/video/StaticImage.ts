import Video from "./Video";
import Channel from "../remo/Channel";
import Remo from "../remo/Remo";
import * as ffmpeg from 'fluent-ffmpeg';
export default class StaticImage extends Video {


    config: any = {
        input: "/home/pi/letsrobot-node/remots/images/lrtestcard.png",
        resolution: "768x432",
        filters: [],
        audioDevice: "1,0",
        audioChannels: "1",
        audioCodec: "mp2",
        audioFormat: "S16_LE",
        audioSampleRate: "44100",
        audioBitrate: "32k",
    };


    start(channel: Channel){
        this.createVideoStream(channel);
    }

    startAv(channel: Channel){
        this.startVideoStream(channel);
    }

    createVideoStream(channel: Channel): ffmpeg{
        return ffmpeg(this.config.input)
            .noAudio()
            .inputOptions('-r',25)
            .fps(25)
            .loop(1)
            .format("mpegts")
            .videoFilters(this.config.filters)
            .size(this.config.resolution)
            .videoBitrate("350k")
            .videoCodec("mpeg1video")
            .outputOptions('-bf', '0','-muxdelay','0.001', '-nostats', '-threads', '2')
            .output(`http://${Remo.HOST}:1567/transmit?name=${channel.id}-video`);
    }

}