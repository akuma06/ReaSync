<template>
  <div class="plyrplayer">
    <div
      class="plyrplayer plyr__video-embed"
      ref="plyrplayer"
      v-if="video.type === 1 || video.type === 2 || video.type === 5"
    >
      <iframe
        v-if="video.type === 1"
        frameborder="0"
        allowfullscreen="true"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        title="YouTube video player"
        width="100%"
        height="100%"
        :src="iframeLink"
      ></iframe>
      <iframe
        v-else-if="video.type === 2"
        :src="iframeLink"
        allow="autoplay; fullscreen; picture-in-picture"
        referrerpolicy="no-referrer"
        title="Vimeo Video Player"
        data-ready="true"
        width="100%"
        height="100%"
        allowfullscreen
        allowtransparency
      ></iframe>
    </div>
    <video :src="video.link" v-else class="plyrplayer" playsinline controls ref="plyrplayer" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, computed, onMounted, onBeforeUnmount, defineExpose } from "vue";
import Plyr from "plyr";
import { SettingStorage } from "./Settings";
import {
  VideoState,
  Video,
  generateEmbedLink,
type PlayerInterface
} from "./VideoStruct";

type K = keyof Plyr.PlyrEventMap;

const props = defineProps<{
  options?: Plyr.Options,
  emit?: Array<Plyr.StandadEvent | Plyr.Html5Event | Plyr.YoutubeEvent>,
  hideYouTubeDOMError?: Boolean,
  video: Video,
  videoId: string,
  volume: number,
}>();

const { options, emit, hideYouTubeDOMError, video = new Video(""), videoId = "", volume = 0 } = props;
const emits = defineEmits<{
  (event: "statechange", value: VideoState): void;
  (event: "durationchange", value: number): void;
  (event: string, value: Plyr.PlyrEvent): void;
}>();

const settings = new SettingStorage();
const player = ref<Plyr | null>(null);
const plyrplayer = ref<HTMLElement | null>(null);
const localeOptions: Plyr.Options = Object.assign<Plyr.Options, Plyr.Options, Plyr.Options>(
  {
    autopause: false,
    storage: {
      enabled: false
    },
    ratio: "",
  },
  options || {},
  { volume }
);
const localVideoId = ref(videoId);

const loadVideo = async () => {
  emits("statechange", VideoState.BUFFERING);
  localVideoId.value = await video.getVideoId();
  emits("statechange", VideoState.PAUSED);
  if (plyrplayer.value !== null) {
    player.value = new Plyr(plyrplayer.value, localeOptions);
    if (emit !== undefined)
      emit.forEach((element) => {
        if (player.value !== null)
          player.value?.on(element, emitPlayerEvent);
      });
    player.value.on("waiting", () => {
      emits("statechange", VideoState.BUFFERING);
    });
    player.value.on("pause", () => {
      emits("statechange", VideoState.PAUSED);
    });
    player.value.on("playing", () => {
      emits("statechange", VideoState.PLAYING);
    });
    player.value.on("ended", () => {
      emits("statechange", VideoState.ENDED);
    });
    player.value.on("timeupdate", () => {
      if (player.value !== null)
        emits("durationchange", player.value.currentTime);
    });
    player.value.on("statechange", e => {
      if (
        e.detail.code !== null &&
        e.detail.code !== -1 &&
        e.detail.code !== 5
      )
        emits("statechange", (e.detail.code as unknown) as VideoState);
    });
    if (!plyrplayer.value.classList.contains("plyrplayer")) {
      plyrplayer.value.classList.add("plyrplayer");
    }
  }

}
onMounted(loadVideo);
onBeforeUnmount(() => {
  try {
    if (player.value !== null) player.value.destroy();
  } catch (e: any) {
    if (
      !(
        hideYouTubeDOMError &&
        e.message === "The YouTube player is not attached to the DOM."
      )
    ) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }
})
const emitPlayerEvent = (event: Plyr.PlyrEvent) => {
  emits(event.type, event);
}
const play = (): void => {
  player.value?.play();
}
const pause = (): void => {
  player.value?.pause();
}
const seek = (t: number): void => {
  if (player.value !== null) {
    player.value.pause();
    player.value.currentTime = t;
  }
}
const setVolume = (volume: number) => {
  if (player.value !== null) {
    player.value.volume = volume;
  }
}
const host = computed((): string => {
  return encodeURIComponent(settings.host);
});
const iframeLink = computed((): string => {
  return generateEmbedLink(
    video.type,
    video.link,
    localVideoId.value
  );
});
defineExpose<PlayerInterface>({
    play,
    pause,
    seek,
    setVolume
});
</script>

<style lang="scss">
@import "plyr/dist/plyr.css";
.plyrplayer, .plyr--html5 {
  height: 100%;
  width: 100%;
}
</style>
