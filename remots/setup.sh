#!/bin/sh

sudo apt-get update
sudo apt-get upgrade
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs git espeak nscd
sudo npm install -g pm2
cd ~
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-armel-32bit-static.tar.xz
tar xf ffmpeg-release-armel-32bit-static.tar.xz
sudo cp ffmpeg-4.0.1-armel-32bit-static/{ffmpeg,ffprobe} /usr/local/bin
rm -rf ffmpeg-4.0.1-armel-32bit-static/
rm ffmpeg-release-armel-32bit-static.tar.xz
cd ~
git clone --depth 1 https://github.com/UnacceptableUse/letsrobot-node.git
cd letsrobot-node/letsrobot
npm install
sudo apt-get autoremove;
