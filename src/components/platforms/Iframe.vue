<template>
  <iframe
    allowfullscreen=""
    frameborder="0"
    height="100%"
    name="player"
    :src="video.link"
    width="100%"
  ></iframe>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PlayerInterface, VideoState, Video } from "../VideoStruct";
import { SettingStorage } from "../Settings";


@Component
export default class IframeVue extends Vue implements PlayerInterface {
  @Prop({ default: new Video("") }) private video!: Video;
  settings = new SettingStorage();
  videoId = "";

  mounted() {
    this.video.getVideoId().then(id => {
      this.videoId = id;
      this.$emit("statechange", VideoState.BUFFERING);
      const iframe = this.$refs["funplayer"] as HTMLIFrameElement;
      iframe.addEventListener("load", () => {
        this.$emit("statechange", VideoState.PLAYING);
      });
    });
  }
  play(): void {
    console.log("play");
  }
  pause(): void {
    console.log("pause");
  }
  seek(t: number): void {
    console.log("seek");
  }
  setVolume(volume: number) {
    console.log("volume");
  }
}
</script>
