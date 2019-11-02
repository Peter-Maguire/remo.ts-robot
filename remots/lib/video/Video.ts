import * as ffmpeg from 'fluent-ffmpeg';
import Remo from "../remo/Remo";
import Channel from "../remo/Channel";
import {exec} from "child_process";
export default class Video {

    config: any = {
        input: "/dev/video0",
        fps: 25,
        inputFormat: "v4l2",
        resolution: "768x432",
        filters: [],
        audioDevice: "1,0",
        audioChannels: "1",
        audioCodec: "mp2",
        audioFormat: "S16_LE",
        audioSampleRate: "44100",
        audioBitrate: "32k",
    };

    videoStream: any;
    audioStream: any;
    retries: number = 0;

    start(channel: Channel){
        this.startAudioStream(channel);
        this.startVideoStream(channel);
    }

    stop(){
        this.stopAudioStream();
        this.stopVideoStream();
    }

    startAv(channel: Channel){
        this.startAudioStream(channel);
        this.startVideoStream(channel);
    }

    startVideoStream(channel: Channel){
        if(this.videoStream)
            this.videoStream.kill();
        this.videoStream = this.createVideoStream(channel);
        this.videoStream.run();
        this.videoStream.on("start", function(){
            console.log("Starting");
        });
        this.videoStream.on("stderr", function(msg){
            console.error(msg);
        });
        this.videoStream.on("end", (err)=>{
            console.error("Video stream died!");
            console.log(err);
            setTimeout(()=>this.startVideoStream(channel), this.retries++*1000, channel);
        })
    }

    stopVideoStream(){
        if(this.videoStream)
            this.videoStream.kill();
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


    stopAudioStream(){
        if(this.audioStream)
            this.audioStream.kill();
    }

    startAudioStream(channel: Channel) {
        this.audioStream = this.createAudioStream(channel);
        this.audioStream.stdout.on('data', function(data){
            console.log(data.toString());
        });
        this.audioStream.stderr.on('data', function(data){
            console.error(data.toString());
        });

        this.audioStream.on('close', (data)=>{
            console.error("Closed with code ",data);
            setTimeout(()=>this.startAudioStream(channel), this.retries++*1000, channel, );
        });
    }

    createAudioStream(channel: Channel){
        return exec(["arecord",
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
        ].join(" "));
    }
}


