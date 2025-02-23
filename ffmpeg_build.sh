#!/bin/bash
# Run this script from your ffmpeg root directory
./configure \
  --disable-everything \
  --enable-protocol=file \
  --enable-demuxer=mov,mp4,mkv,avi,mpegts,matroska,webm \
  --enable-muxer=mov,mp4,mkv,avi,mpegts,matroska,webm \
  --enable-decoder=h264,hevc,mpeg2video \
  --enable-encoder=libx264,libx265,aac \
  --enable-filter=scale,format \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libmp3lame \
  --enable-libvpx \
  --enable-gpl \

make -j $(nproc)
