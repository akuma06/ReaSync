<template>
  <div
    class="plyr__video-embed plyrplayer"
    ref="plyrplayer"
    v-if="video.type === 1 || video.type === 2"
  >
    <iframe
      v-if="video.type === 1"
      frameborder="0"
      allowfullscreen="1"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      title="YouTube video player"
      width="100%"
      height="100%"
      :src="
        'https://www.youtube.com/embed/' +
          videoId +
          '?origin=' +
          host +
          '&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1&amp;autoplay=0'
      "
    ></iframe>
    <iframe
      :src="'https://player.vimeo.com/video/' +
          videoId +
          '?loop=false&amp;autoplay=false&amp;muted=false&amp;gesture=media&amp;playsinline=true&amp;byline=false&amp;portrait=false&amp;title=false&amp;speed=true&amp;transparent=false'
      "
      allowfullscreen="1"
      allow="autoplay,fullscreen,picture-in-picture"
      referrerpolicy="no-referrer"
      title="Vimeo Video Player"
      data-ready="true"
      width="100%"
      height="100%"
    ></iframe>
  </div>
  <video
    :src="video.link"
    v-else
    class="plyrplayer"
    playsinline
    controls
    ref="plyrplayer"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Plyr from "plyr";
import { PlayerInterface, VideoState, Video } from "./VideoStruct";
import { SettingStorage } from "./Settings";

@Component
export default class VuePlyr extends Vue implements PlayerInterface {
  /** Options object for plyr config. **/
  @Prop() options: Plyr.Options | undefined;
  /** Array of events to emit from the plyr object **/
  @Prop() emit:
    | Array<Plyr.StandardEvent | Plyr.Html5Event | Plyr.YoutubeEvent>
    | undefined;
  @Prop({ default: true, required: false }) hideYouTubeDOMError!: boolean;
  @Prop({ default: new Video("") }) private video!: Video;

  settings = new SettingStorage();
  player: Plyr | null = null;
  _options: Plyr.Options = Object.assign({ autopause: false }, this.options);
  videoId = "";

  mounted() {
    this.$emit("statechange", VideoState.BUFFERING);
    this.video.getVideoId().then(id => {
      this.videoId = id;
      this.$emit("statechange", VideoState.PAUSED);
      const player = this.$refs["plyrplayer"] as HTMLElement;
      if (player !== undefined) {
        console.log();
        this.player = new Plyr(player, this._options);
        if (this.emit !== undefined)
          this.emit.forEach(element => {
            if (this.player !== null)
              this.player.on(element, this.emitPlayerEvent);
          });
        this.player.on("waiting", () => {
          this.$emit("statechange", VideoState.BUFFERING);
        });
        this.player.on("pause", () => {
          this.$emit("statechange", VideoState.PAUSED);
        });
        this.player.on("playing", () => {
          this.$emit("statechange", VideoState.PLAYING);
        });
        this.player.on("ended", () => {
          this.$emit("statechange", VideoState.ENDED);
        });
        this.player.on("timeupdate", () => {
          if (this.player !== null)
            this.$emit("durationchange", this.player.currentTime);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.player.on("statechange", (e: any) => {
          if (
            e.detail.code !== null &&
            e.detail.code !== -1 &&
            e.detail.code !== 5
          )
            this.$emit("statechange", e.detail.code);
        });
        if (!player.classList.contains("plyrplayer")) {
          player.classList.add("plyrplayer");
        }
      }
    });
  }

  beforeDestroy() {
    try {
      if (this.player !== null) this.player.destroy();
    } catch (e) {
      if (
        !(
          this.hideYouTubeDOMError &&
          e.message === "The YouTube player is not attached to the DOM."
        )
      ) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }
  emitPlayerEvent(event: Plyr.PlyrEvent) {
    this.$emit(event.type, event);
  }
  play(): void {
    if (this.player !== null) this.player.play();
  }
  pause(): void {
    if (this.player !== null) this.player.pause();
  }
  seek(t: number): void {
    if (this.player !== null) {
      this.player.pause();
      this.player.currentTime = t;
    }
  }
  get host(): string {
    return encodeURIComponent(this.settings.host);
  }
}
</script>

<style lang="scss">
@import "~plyr/dist/plyr";
.plyrplayer {
  height: 100%;
  width: 100%;
}
</style>
