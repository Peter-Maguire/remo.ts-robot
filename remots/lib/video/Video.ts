import * as ffmpeg from 'fluent-ffmpeg';
import Remo from "../remo/Remo";
import Channel from "../remo/Channel";
import {spawn} from "child_process";
export default class Video {

    config: any = {
        input: "/dev/video0",
        fps: 25,
        inputFormat: "v4l2",
        resolution: "1280x720",
        filters: [],
        audioDevice: "1,0",
        audioChannels: "1",
        audioCodec: "mp2",
        audioSampleRate: "44100",
        audioBitrate: "32k",
    };

    videoStream: any;
    audioStream: any;
    retries: number = 0;


    startVideoStream(channel: Channel){
        if(!this.videoStream)
            this.videoStream = this.createVideoStream(channel);
        this.videoStream.kill();
        this.videoStream.run();
        this.videoStream.on("start", function(){
            console.log("Starting");
        });
        this.videoStream.on("stderr", function(msg){
            console.error(msg);
        });
        this.videoStream.on("end", ()=>{
            console.error("Video stream died!");
            console.log(arguments);
            setTimeout(this.startVideoStream, this.retries++*1000, channel);
        })
    }

    createVideoStream(channel: Channel): ffmpeg{
            return ffmpeg(this.config.input)
                    .noAudio()
                    .inputOptions('-r',this.config.fps)
                    .fps(this.config.fps)
                    .inputFormat(this.config.inputFormat)
                    .format("mpegts")
                    .videoFilters(this.config.filters)
                    .size(this.config.resolution)
                    .videoBitrate("350k")
                    .videoCodec("mpeg1video")
                    .outputOptions('-bf', '0','-muxdelay','0.001', '-nostats', '-threads', '2')
                    .output(`http://${Remo.HOST}:1567/transmit?name=${channel.id}-video`);
    }


    startAudioStream(channel: Channel) {
        this.audioStream = this.createAudioStream(channel);
    }


    createAudioStream(channel: Channel){
        return spawn("/bin/sh",
            ["arecord",
            `-D hw:${this.config.audioDevice}`,
            `-c ${this.config.audioChannels}`,
            `-f ${this.config.audioFormat}`,
            `-r ${this.config.audioSampleRate}`,
            `| ffmpeg -i - -ar ${this.config.audioSampleRate}`,
            `-f mpegts`,
            `-codec:a ${this.config.audioCodec}`,
            `-b:a ${this.config.audioBitrate}`,
            `-bufsize 8192k`,
            `-muxdelay 0.001`,
            "-nostats",
            `http://remo.tv:1567/transmit?name=${channel.id}-audio`
        ]);
    }
}


