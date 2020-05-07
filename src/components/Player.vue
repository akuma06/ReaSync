<template>
  <div
    class="videos"
    @keypress.space="handleSpace"
    @keyup.enter="enterFullscreen"
    v-if="!loading"
  >
    <div class="controls">
      <a
        @click.prevent="handleSettings"
        class="button is-rounded is-outlined is-primary"
        ><span class="icon is-large"><font-awesome-icon icon="cog"/></span
        ><span>Paramètres</span></a
      >
      <a
        @click.prevent="handleHelp"
        class="button is-rounded is-outlined is-primary"
      >
        <span class="icon is-large">
          <font-awesome-icon icon="question-circle" />
        </span>
      </a>
    </div>
    <div
      class="reaction"
      :class="{
        mainvideo: swapPip === 0,
        pipvideo: swapPip === 1,
        topleft: swapPip === 1 && pipPosition === 0,
        topcenter: swapPip === 1 && pipPosition === 1,
        topright: swapPip === 1 && pipPosition === 2,
        bottomleft: swapPip === 1 && pipPosition === 3,
        bottomcenter: swapPip === 1 && pipPosition === 4,
        bottomright: swapPip === 1 && pipPosition === 5
      }"
      :style="{
        height: reactionHeight + 'px',
        width: reactionWidth + 'px',
        left:
          swapPip === 1 && (pipPosition === 4 || pipPosition === 1)
            ? centerPip + 'px'
            : ''
      }"
    >
      <funimation
        ref="reactionplayer"
        @durationchange="handleDurationChange"
        @statechange="
          state => {
            handleStateChange('reaction', state);
          }
        "
        :video="reaction"
        v-if="reaction.type === 3"
      >
      </funimation>
      <vue-plyr
        ref="reactionplayer"
        @durationchange="handleDurationChange"
        @statechange="
          state => {
            handleStateChange('reaction', state);
          }
        "
        :videoId="videoId.reaction"
        :video="reaction"
        :volume="reactionVolume"
        v-else
      >
      </vue-plyr>
    </div>
    <div
      class="source"
      :class="{
        mainvideo: swapPip === 1,
        pipvideo: swapPip === 0,
        topleft: swapPip === 0 && pipPosition === 0,
        topcenter: swapPip === 0 && pipPosition === 1,
        topright: swapPip === 0 && pipPosition === 2,
        bottomleft: swapPip === 0 && pipPosition === 3,
        bottomcenter: swapPip === 0 && pipPosition === 4,
        bottomright: swapPip === 0 && pipPosition === 5
      }"
      :style="{
        height: sourceHeight + 'px',
        width: sourceWidth + 'px',
        left:
          swapPip === 0 && (pipPosition === 4 || pipPosition === 1)
            ? centerPip + 'px'
            : ''
      }"
    >
      <funimation
        v-if="source.type === 3"
        ref="sourceplayer"
        @durationchange="handleDurationChange"
        @statechange="
          state => {
            handleStateChange('source', state);
          }
        "
        :video="source"
      >
      </funimation>
      <vue-plyr
        v-else
        ref="sourceplayer"
        @statechange="
          state => {
            handleStateChange('source', state);
          }
        "
        :volume="sourceVolume"
        :videoId="videoId.source"
        :video="source"
      >
      </vue-plyr>
      <div
        class="overlay"
        v-if="showOverlay"
        :style="{ 'z-index': swapPip === 0 ? 3 : 2 }"
      >
        <p>
          Starts in {{ timeRemaining }}<br />
          <a class="button is-danger is-rounded" @click.prevent="cancelSync"
            >Cancel</a
          >
        </p>
      </div>
    </div>
    <Settings
      v-show="showSettings"
      :sync="syncTime"
      :reaction="reaction"
      :source="source"
      @close="handleCloseSettings"
      @pipchange="handlePipChange"
      @pippositionchange="handlePipPositionChange"
      @reactionvolume="handleReactionVolumeChange"
      @sourcevolume="handleSourceVolumeChange"
      @pipsizechange="handlePipSizeChange"
      @syncchange="handleSyncChange"
      @syncplaypause="handleSyncPlayPauseChange"
    />
    <help-vue
      :reaction="reaction"
      :source="source"
      @close="handleCloseHelp"
      @needchange="handleNeedChange"
      v-show="showHelp"
    />
  </div>
  <div class="loading" v-else>
    <font-awesome-icon icon="spinner" size="6x" color="#8034eb" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Video, VideoState, PlayerInterface } from "@/components/VideoStruct";
import Settings from "@/components/Settings.vue";
import VuePlyr from "@/components/VuePlyr.vue";
import HelpVue from "@/components/Help.vue";
import Funimation from "@/components/platforms/Funimation.vue";
import { TimeStruct } from "./time_utils";
import { SettingStorage, PiPMode, PiPPosition } from "./Settings";

@Component({
  components: { Settings, VuePlyr, Funimation, HelpVue }
})
export default class Player extends Vue {
  @Prop({ default: new Video("") }) private reaction!: Video;
  @Prop({ default: new Video("") }) readonly source!: Video;
  @Prop({ default: new TimeStruct() }) private sync!: TimeStruct;

  videoState: {
    reaction: VideoState | null;
    source: VideoState | null;
  } = { reaction: null, source: null };

  currentDuration = 0;
  syncTime = this.sync;
  totalWidth = document.body.offsetWidth;
  totalHeight = document.body.offsetHeight;
  settings = new SettingStorage();
  reactionVolume = this.settings.reactionVolume;
  sourceVolume = this.settings.sourceVolume;
  pipSize = this.settings.pipVideoSize;
  swapPip = this.settings.swapPiP;
  pipPosition = this.settings.pipPosition;
  syncPlayPause = this.settings.syncPlayPause;

  videoId: {
    reaction: string;
    source: string;
  } = { reaction: "", source: "" };
  showSettings = false;
  showHelp = false;
  loading = true;

  mounted() {
    window.addEventListener("resize", this.handleResize);
    Promise.all([this.reaction.getVideoId(), this.source.getVideoId()]).then(
      result => {
        this.loading = false;
        this.videoId.reaction = result[0];
        this.videoId.source = result[1];
      }
    );
  }

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.totalWidth = document.body.offsetWidth;
    this.totalHeight = document.body.offsetHeight;
  }

  handleStateChange(video: "reaction" | "source", state: VideoState) {
    const otherKeyState = video === "reaction" ? "source" : "reaction";
    this.videoState[video] = state;
    if (state === VideoState.PLAYING) {
      const currentPlayer = (this.$refs[
        `${video}player`
      ] as unknown) as PlayerInterface;
      if (this.videoState[otherKeyState] === VideoState.BUFFERING) {
        currentPlayer.pause();
      } else if (
        this.videoState[otherKeyState] !== VideoState.PLAYING &&
        this.syncPlayPause
      ) {
        if (
          otherKeyState === "reaction" ||
          this.currentDuration >= this.syncTime.toSeconds
        ) {
          const otherPlayer = (this.$refs[
            `${otherKeyState}player`
          ] as unknown) as PlayerInterface;
          otherPlayer.play();
        }
      }
    } else if (state === VideoState.PAUSED || state === VideoState.BUFFERING) {
      if (
        this.videoState[otherKeyState] === VideoState.PLAYING &&
        this.syncPlayPause
      ) {
        const otherPlayer = (this.$refs[
          `${otherKeyState}player`
        ] as unknown) as PlayerInterface;
        otherPlayer.pause();
      }
    } else {
      if (video === "reaction" && state === VideoState.ENDED) {
        const otherPlayer = (this.$refs[
          `${otherKeyState}player`
        ] as unknown) as PlayerInterface;
        otherPlayer.pause();
      }
    }
  }

  handleDurationChange(duration: number) {
    this.currentDuration = Math.round(duration);
    const sourcePlayer = this.$refs["sourceplayer"] as HTMLVideoElement;
    if (
      this.currentDuration === this.syncTime.toSeconds &&
      this.videoState.reaction === VideoState.PLAYING &&
      this.videoState.source !== VideoState.PLAYING
    ) {
      sourcePlayer.play();
    }
  }

  handleSpace() {
    const reactionplayer = (this.$refs[
      "reactionplayer"
    ] as unknown) as PlayerInterface;
    if (this.videoState.reaction === VideoState.PLAYING) {
      reactionplayer.pause();
    } else {
      reactionplayer.play();
    }
  }

  cancelSync() {
    this.syncTime = new TimeStruct();
  }

  enterFullscreen() {
    this.$el.requestFullscreen();
  }

  handleCloseSettings() {
    this.showSettings = false;
  }

  handleCloseHelp() {
    this.showHelp = false;
  }

  handlePipSizeChange(size: number) {
    this.pipSize = size;
  }

  handleReactionVolumeChange(volume: number) {
    this.reactionVolume = volume;
    const player = (this.$refs["reactionplayer"] as unknown) as PlayerInterface;
    player.setVolume(volume);
  }

  handleSourceVolumeChange(volume: number) {
    this.sourceVolume = volume;
    const player = (this.$refs["sourceplayer"] as unknown) as PlayerInterface;
    player.setVolume(volume);
  }

  handlePipChange(swap: PiPMode) {
    this.swapPip = swap;
  }

  handlePipPositionChange(position: PiPPosition) {
    this.pipPosition = position;
  }

  handleSyncChange(t: TimeStruct) {
    this.syncTime = t;
  }

  handleSyncPlayPauseChange(syncPlayPause: boolean) {
    this.syncPlayPause = syncPlayPause;
  }

  handleSettings() {
    this.showSettings = true;
  }

  handleHelp() {
    this.showHelp = true;
  }

  handleNeedChange() {
    this.$emit("needchange");
  }

  get sourceHeight() {
    return this.swapPip === PiPMode.REACTION
      ? this.totalHeight * this.pipSize
      : this.totalHeight;
  }
  get sourceWidth() {
    return this.swapPip === PiPMode.REACTION
      ? this.totalWidth * this.pipSize
      : this.totalWidth;
  }
  get reactionHeight() {
    return this.swapPip === PiPMode.SOURCE
      ? this.totalHeight * this.pipSize
      : this.totalHeight;
  }
  get reactionWidth() {
    return this.swapPip === PiPMode.SOURCE
      ? this.totalWidth * this.pipSize
      : this.totalWidth;
  }

  get centerPip() {
    return (this.totalWidth * (1 - this.pipSize)) / 2;
  }

  get showOverlay() {
    return (
      this.syncTime !== undefined &&
      this.syncTime.toSeconds > 0 &&
      this.currentDuration < this.syncTime.toSeconds
    );
  }

  get timeRemaining() {
    if (this.syncTime !== undefined && this.showOverlay) {
      const time = new TimeStruct();
      time.fromSeconds(this.syncTime.toSeconds - this.currentDuration);
      return time.toNumberFormat();
    } else return "0 seconds";
  }
}
</script>

<style lang="scss">
.videos {
  height: 100%;
  width: 100%;
  background: black;
  overflow: hidden;
  .controls {
    position: absolute;
    z-index: 5;
    top: 10px;
    width: auto;
    right: 10px;
    display: flex;
    flex-direction: row;
    a {
      display: block;
      margin-right: 0.5rem;
    }
  }
  .mainvideo {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
  }

  .pipvideo {
    z-index: 3;
    position: absolute;
    &.bottomleft {
      bottom: 5%;
      left: 2%;
    }
    &.bottomcenter {
      bottom: 5%;
      margin: auto;
    }
    &.bottomright {
      bottom: 5%;
      right: 2%;
    }
    &.topleft {
      top: 5%;
      left: 2%;
    }
    &.topcenter {
      top: 5%;
      margin: auto;
    }
    &.topright {
      top: 5%;
      right: 2%;
    }
  }
  .source {
    .overlay {
      position: relative;
      z-index: 3;
      width: 100%;
      height: 100%;
      top: -100%;
      background: rgba(59, 59, 59, 0.65);
      color: white;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      p {
        text-align: center;
      }
    }
  }
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading {
  background: black;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    animation: spin 1.2s linear infinite;
  }
}
</style>
