<template>
  <iframe
    allowfullscreen=""
    frameborder="0"
    height="100%"
    name="player"
    ref="funplayer"
    :src="'https://www.funimation.com/player/' + videoId + '/?bdub=0&amp;qid='"
    width="100%"
  ></iframe>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { PlayerInterface, VideoState, Video } from "../VideoStruct";
import { SettingStorage } from "../Settings";

interface FunimationPlayer {
  play: () => void;
  pause: () => void;
  currentTime: (t?: number) => number;
  on: (ev: string, listener: () => void) => void;
}

interface FunimationWindow extends Window {
  fp:
    | {
        player: FunimationPlayer;
      }
    | undefined;
}

@Component
export default class Funimation extends Vue implements PlayerInterface {
  @Prop({ default: new Video("") }) private video!: Video;
  settings = new SettingStorage();
  videoId = "";
  player: FunimationPlayer | null = null;

  mounted() {
    this.video.getVideoId().then(id => {
      this.videoId = id;
      this.$emit("statechange", VideoState.BUFFERING);
      const iframe = this.$refs["funplayer"] as HTMLIFrameElement;
      iframe.addEventListener("load", () => {
        this.$emit("statechange", VideoState.PAUSED);
      });
    });
  }
  play(): void {
    if (this.player !== null) {
      this.player.play();
    }
  }
  pause(): void {
    if (this.player !== null) {
      this.player.pause();
    }
  }
  seek(t: number): void {
    if (this.player !== null) {
      this.player.pause();
      this.player.currentTime(t);
    }
  }
}
</script>
