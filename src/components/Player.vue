<template>
  <div class="videos" @keypress.space="handleSpace" @keyup.enter="enterFullscreen" ref="player" v-if="!loading">
    <div class="controls">
      <a @click.prevent="handleSettings" class="button is-rounded is-outlined is-primary">
        <span class="icon is-large">
          <font-awesome-icon icon="cog" />
        </span>
        <span>{{ t('settings') }}</span>
      </a>
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
        @statechange="
          state => {
            handleStateChange('reaction', state);
          }
        "
        :video="reaction"
        v-if="reaction.type === 3"
      >
      </funimation>
      <iframe-vue
        ref="reactionplayer"
        @statechange="
          state => {
            handleStateChange('reaction', state);
          }
        "
        :video="reaction"
        v-else-if="reaction.type === 4"
      >
      </iframe-vue>
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
      ></vue-plyr>
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
        @statechange="
          state => {
            handleStateChange('source', state);
          }
        "
        :video="source"
      >
      </funimation>
      <iframe-vue
        ref="sourcelayer"
        @statechange="
          state => {
            handleStateChange('source', state);
          }
        "
        :video="source"
        v-else-if="source.type === 4"
      >
      </iframe-vue>
      <vue-plyr
        ref="sourceplayer"
        @statechange="
          state => {
            handleStateChange('source', state);
          }
        "
        :videoId="videoId.source"
        :video="source"
        :volume="sourceVolume"
      ></vue-plyr>
      <div class="overlay" v-if="showOverlay" :style="{ 'z-index': swapPip === 0 ? 3 : 2 }">
        <p>
          Starts in {{ timeRemaining }}
          <br />
          <a class="button is-danger is-rounded" @click.prevent="cancelSync">Cancel</a>
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

<script setup lang="ts">
import { ref, computed, defineProps, onMounted, onBeforeUnmount, defineEmits } from "vue";
import { useI18n } from "vue-i18n"
import { Video, VideoState } from "@/components/VideoStruct";
import type { PlayerInterface } from "@/components/VideoStruct";
import Settings from "@/components/Settings.vue";
import VuePlyr from "@/components/VuePlyr.vue";
import HelpVue from "@/components/Help.vue";
import Funimation from "@/components/platforms/Funimation.vue";
import IframeVue from "@/components/platforms/Iframe.vue";
import { TimeStruct } from "./time_utils";
import { SettingStorage, PiPMode, PiPPosition } from "./Settings";

const props = defineProps<{
  reaction: Video,
  source: Video,
  sync: TimeStruct
}>();
const { t } = useI18n();
const { reaction = new Video(""), source = new Video(""), sync = new TimeStruct() } = props;

const videoState = ref<{
  reaction: VideoState | null;
  source: VideoState | null;
}>({ reaction: null, source: null });
const videoId = ref<{
  reaction: string;
  source: string;
}>({ reaction: "", source: "" });
const player = ref<HTMLElement | null>(null);
const sourceplayer = ref<PlayerInterface | null>(null);
const reactionplayer = ref<PlayerInterface | null>(null);
const currentDuration = ref(0);
const syncTime = ref<TimeStruct>(sync);
const totalWidth = ref(document.body.offsetWidth);
const totalHeight = ref(document.body.offsetHeight);
const settings = new SettingStorage();
const reactionVolume = ref(settings.reactionVolume);
const sourceVolume = ref(settings.sourceVolume);
const pipSize = ref(settings.pipVideoSize);
const swapPip = ref(settings.swapPiP);
const pipPosition = ref(settings.pipPosition);
const syncPlayPause = ref(settings.syncPlayPause);

const showSettings = ref(false);
const showHelp = ref(false);
const loading = ref(true);

const emits = defineEmits<{
  (event: "needchange"): void;
}>();


const handleResize = () => {
  totalWidth.value = document.body.offsetWidth;
  totalHeight.value = document.body.offsetHeight;
}
const addEvents = () => {
  window.addEventListener("resize", handleResize);
};
const removeEvents = () => {
  window.removeEventListener("resize", handleResize);
}
onMounted(addEvents);
onBeforeUnmount(removeEvents);

const generateLinks = () => {
  Promise.all([reaction.getVideoId(), source.getVideoId()]).then(
    result => {
      loading.value = false;
      videoId.value = {
        reaction: result[0],
        source: result[1]
      };
    }
  );
}
onMounted(generateLinks);


const handleStateChange = (video: "reaction" | "source", state: VideoState) => {
  const otherKeyState = video === "reaction" ? "source" : "reaction";
  videoState.value[video] = state;
  if (state === VideoState.PLAYING) {
    const currentPlayer = video === "reaction" ? reactionplayer : sourceplayer;
    if (videoState.value[otherKeyState] === VideoState.BUFFERING) {
      currentPlayer.value?.pause();
    } else if (
      videoState.value[otherKeyState] !== VideoState.PLAYING &&
      syncPlayPause.value
    ) {
    } else if (videoState.value[otherKeyState] !== VideoState.PLAYING) {
      currentPlayer.value?.play();
      if (
        otherKeyState === "reaction" ||
        currentDuration.value >= syncTime.value.toSeconds
      ) {
        const otherPlayer = video === "reaction" ? sourceplayer : reactionplayer;
        otherPlayer.value?.play();
      }
    }
  } else if (state === VideoState.PAUSED || state === VideoState.BUFFERING) {
      if (
        videoState.value[otherKeyState] === VideoState.PLAYING &&
        syncPlayPause.value
      ) {
        const otherPlayer = video === "reaction" ? sourceplayer : reactionplayer;
        otherPlayer.value?.pause();
      }
  } else {
    if (video === "reaction" && state === VideoState.ENDED) {
      sourceplayer.value?.pause();
    }
  }
}

const handleCloseHelp = () => {
  showHelp.value = false;
}

const handleDurationChange = (duration: number) => {
  currentDuration.value = Math.round(duration);
  if (
    currentDuration.value === syncTime.value.toSeconds &&
    videoState.value.reaction === VideoState.PLAYING &&
    videoState.value.source !== VideoState.PLAYING
  ) {
    sourceplayer.value?.play();
  }
}

const handleSpace = () => {
  if (videoState.value.reaction === VideoState.PLAYING) {
    reactionplayer.value?.pause();
  } else {
    reactionplayer.value?.play();
  }
}

const cancelSync = () => {
  syncTime.value = new TimeStruct();
}

const enterFullscreen = () => {
  player.value?.requestFullscreen();
}

const handleCloseSettings = () => {
  showSettings.value = false;
}

const handlePipSizeChange = (size: number) => {
  pipSize.value = size;
}

const handleReactionVolumeChange = (volume: number) => {
    reactionVolume.value = volume;
    reactionplayer.value?.setVolume(volume);
  }
const handleSourceVolumeChange = (volume: number) => {
    sourceVolume.value = volume;
    sourceplayer.value?.setVolume(volume);
  }

const handlePipChange = (swap: PiPMode) => {
  swapPip.value = swap;
}

const handlePipPositionChange = (position: PiPPosition) => {
  pipPosition.value = position;
}

const handleSyncChange = (t: TimeStruct) => {
  syncTime.value = t;
}

const handleSyncPlayPauseChange = (checked: boolean) => {
  syncPlayPause.value = checked;
}

const handleSettings = () => {
  showSettings.value = true;
}

const handleHelp = () => {
  showHelp.value = true;
}
const handleNeedChange = () => {
  emits("needchange");
}

const sourceHeight = computed((): number => {
  return swapPip.value === PiPMode.REACTION
    ? totalHeight.value * pipSize.value
    : totalHeight.value;
})
const sourceWidth = computed((): number => {
  return swapPip.value === PiPMode.REACTION
    ? totalWidth.value * pipSize.value
    : totalWidth.value;
})
const reactionHeight = computed((): number => {
  return swapPip.value === PiPMode.SOURCE
    ? totalHeight.value * pipSize.value
    : totalHeight.value;
})
const reactionWidth = computed((): number => {
  return swapPip.value === PiPMode.SOURCE
    ? totalWidth.value * pipSize.value
    : totalWidth.value;
})

const centerPip = computed((): number => {
  return (totalWidth.value * (1 - pipSize.value)) / 2;
})

const showOverlay = computed((): boolean => {
  return (
    syncTime.value !== undefined &&
    syncTime.value.toSeconds > 0 &&
    currentDuration.value < syncTime.value.toSeconds
  );
})

const timeRemaining = computed((): string => {
  if (syncTime.value !== undefined && showOverlay.value) {
    const time = new TimeStruct();
    time.fromSeconds(syncTime.value.toSeconds - currentDuration.value);
    return time.toNumberFormat();
  } else return "0 seconds";
})
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
