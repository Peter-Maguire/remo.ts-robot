##Node.js Letsrobot Client

This is a client for [letsrobot.tv](https://letsrobot.tv). It's designed to run on a raspberry pi but should run on basically any linux distro. 

Kind of early stages, it has the following limitations:
 - Only supports serial controllers and requires tweaking if yours doesn't register on /tty/ACM0 or /tty/ACM1 (See [control.js#143](https://github.com/UnacceptableUse/letsrobot-node/blob/master/letsrobot/control.js#L143))
 - Won't take wifi settings from letsrobot
 - Authorised commands are hardcoded as only for "unacceptableuse", you'll have to change this to your own username
 - The "stop" command is changed to "S" before transmitting over serial
 - Stop is automatically sent every 500ms when turning (L/R)
 - Assumes it's being run from inside something like `pm2` or `forever`
 - Assumes the build of ffmpeg you're using supports overlays 
 
Has the following capabilities:
 - Audio input, MP3 or Microphone
 - Video input, RTSP Stream, Webcam or Static image 
 - Chat commands
 - FFMPEG text overlays
 - Set espeak voice to any voice pack
 - Set camera settings light brightness/contrast/hue
 - Custom sound effects when someone says a certain phrase
 
 
Contains the following commands:
 - .setvideo [image/stream/camera]: Sets the video type 
 - .setimage [name]: Sets the image to one of the predefined URLs 
 - .setstream [URL]: Sets the RTSP stream URL
 - .restartnode: Restarts the video process
 - .restartvideo: Restarts the ffmpeg process
 - .setstatus [text]: Sets an overlay in the top left corner containing `text`
 - .tdon: "Technical Difficulies" mode
 - .tdoff: The opposite
 - .endon: "End" mode
 - .shutdown: Shuts the pi down
 