import * as ffmpeg from 'fluent-ffmpeg';
import Remo from "../remo/Remo";
import Channel from "../remo/Channel";
import {exec} from "child_process";
import 'process';
import Config from "../Config";
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


    async init() {
        //@ts-ignore
        const id = this.constructor.getId();
        let config = await Config.instance().getBulk(Object.keys(this.config).map((val)=>`${id}.${val}`))
        for(let key in config){
            this.config[key.substring(id.length+1)] = config[key];
        }
    }

    static getId(): string{
        return "camera";
    }

    async reloadConfig(channel: Channel){
        await this.init();
        this.start(channel);
    }

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
            this.videoStream.kill('SIGTERM');
        console.log("Starting video stream");
        this.videoStream = this.createVideoStream(channel);
        this.videoStream.run();
        this.videoStream.on("progress", (progress)=>{
            this.videoData = progress;
        });
        this.videoStream.on("start", function(){
            console.log("Starting");
        });
        this.videoStream.on("stderr", function(msg){
            //console.error(msg);
        });
        this.videoStream.on("error", function(error){
            console.error(error);
        });
        this.videoStream.on("end", (err)=>{
            console.error("Video stream died!");
            console.log(err);
            this.lastVideoDeath = new Date();
            if(this.retries < 10){
                setTimeout(()=>this.startVideoStream(channel), this.retries++*1000, channel);
            }else{
                console.error("Tried 10 times to restart video and failed...");
                process.exit(100);
            }
        })
    }

    stopVideoStream(){
        if(this.videoStream)
            this.videoStream.kill('SIGTERM');
    }

    createVideoStream(channel: Channel): ffmpeg{
            return ffmpeg(this.config.input)
                    .noAudio()
                    .inputOptions('-r',this.config.fps)
                    .fps(this.config.fps)
                    .inputFormat(this.config.inputFormat)
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

    startAudioStream(channel: Channel) {
        this.audioStream = this.createAudioStream(channel);
        this.audioStream.stdout.on('data', function(data){
            console.log(data.toString());
        });
        this.audioStream.stderr.on('data', function(data){
            console.error(data.toString());
        });

        this.audioStream.on('close', (data)=>{
            this.lastAudioDeath = new Date();
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
            `-bufsize ${this.config.audioBuffer}`,
            `-muxdelay 0.001`,
            "-nostats",
            `http://${Remo.HOST}:1567/transmit?name=${channel.id}-audio`
        ].join(" "));
    }
}


