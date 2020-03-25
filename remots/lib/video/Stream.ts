import * as ffmpeg from 'fluent-ffmpeg';
import Remo from "../remo/Remo";
import Channel from "../remo/Channel";
import {exec} from "child_process";
import 'process';
import Config from "../Config";
import Video from './Video';
export default class Stream extends Video{

    config: any = {
        input: "rtsp://user:pass@192.168.1.20:6667/blinkhd",
        fps: 25,
        resolution: "1920x1080",
        filters: [],
        audioChannels: "1",
        audioCodec: "mp2",
        audioSampleRate: "44100",
        audioBitrate: "32k",
        audioBuffer: "8192k",
        videoFormat: "mpegts",
        videoCodec: "mpeg1video",
        videoBitrate: "350k"
    };

    videoStream: any;
    audioStream: any;
    videoData: any;
    audioData: any;
    retries: number = 0;
    lastVideoDeath: Date;
    lastAudioDeath: Date;

    static getId(): string{
        return "stream";
    }

    createVideoStream(channel: Channel): ffmpeg{
        return ffmpeg(this.config.input)
            .noAudio()
            .inputOptions('-r',this.config.fps)
            .fps(this.config.fps)
            //.inputFormat(this.config.inputFormat)
            .format(this.config.videoFormat)
            //.videoFilters(this.config.filters)
            .size(this.config.resolution)
            .videoBitrate(this.config.videoBitrate)
            .videoCodec(this.config.videoCodec)
            .outputOptions('-bf', '0','-muxdelay','0.001', '-threads', '2')
            .output(`http://${Remo.HOST}:1567/transmit?name=${channel.id}-video`);
    }


    stopAudioStream(){
        if(this.audioStream)
            this.audioStream.kill('SIGTERM');
    }
    startAudioStream(channel: Channel){
        if(this.audioStream)
            this.audioStream.kill('SIGTERM');
        console.log("Starting audio stream");
        this.audioStream = this.createAudioStream(channel);
        this.audioStream.run();
        this.audioStream.on("start", function(){
            console.log("Starting");
        });
        this.audioStream.on("stderr", function(msg){
            //console.error(msg);
        });
        this.audioStream.on("progress", (progress)=>{
            this.audioData = progress;
        });
        this.audioStream.on("error", function(error){
            console.error(error);
        });
        this.audioStream.on("end", (err)=>{
            console.error("Audio stream died!");
            const now = new Date();
            if(err || this.lastAudioDeath && now.getTime()-this.lastAudioDeath.getTime() < 10000){
                console.error("Audio didn't stay up for 10 seconds ", this.lastAudioDeath, this.lastAudioDeath.getTime()-now.getTime());
                setTimeout(() => this.startAudioStream(channel), 1000*this.retries++, channel);
            }else {
                setTimeout(() => this.startAudioStream(channel), 500, channel);
            }
            this.lastAudioDeath = now;
        })
    }

    createAudioStream(channel: Channel) {
        return ffmpeg(this.config.input)
            .noVideo()
            .inputOptions('-re')
            .format("mpegts")
            .audioCodec(this.config.audioCodec)
            .audioBitrate(this.config.audioBitrate)
            .outputOptions('-muxdelay', '0.001')
            .output(`http://${Remo.HOST}:1567/transmit?name=${channel.id}-audio`);
    }
}


