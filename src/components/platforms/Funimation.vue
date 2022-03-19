<template>
    <iframe
        allowfullscreen
        frameborder="0"
        height="100%"
        name="player"
        ref="funplayer"
        :src="'https://www.funimation.com/player/' + videoId + '/?bdub=0&amp;qid='"
        width="100%"
    ></iframe>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, defineEmits, defineExpose } from "vue";
import { VideoState, Video, type PlayerInterface } from "../VideoStruct";
import { SettingStorage } from "../Settings";
interface FunimationPlayer {
    play: () => void;
    pause: () => void;
    currentTime: (t?: number) => number;
    on: (ev: string, listener: () => void) => void;
    volume: number;
}
interface FunimationWindow extends Window {
    fp:
    | {
        player: FunimationPlayer;
    }
    | undefined;
}

const props = defineProps<{
    video: Video
}>();
const { video = new Video("") } = props;

const emits = defineEmits<{
    (event: "statechange", value: VideoState): void;
}>();

const funplayer = ref<HTMLElement | null>(null);
const settings = new SettingStorage();
const videoId = ref("");
const player = ref<FunimationPlayer | null>(null);
const loadVideo = async () => {
    videoId.value = await video.getVideoId()
    emits("statechange", VideoState.BUFFERING);
    funplayer.value?.addEventListener("load", () => {
        emits("statechange", VideoState.PAUSED);
    });
}
onMounted(loadVideo);
const play = (): void => {
    player.value?.play();
}
const pause = (): void => {
    player.value?.pause();
}
const seek = (t: number): void => {
    player.value?.pause();
    player.value?.currentTime(t);
}
const setVolume = (volume: number) => {
    if (player.value !== null) {
        player.value.volume = volume;
    }
}
defineExpose<PlayerInterface>({
    play,
    pause,
    seek,
    setVolume
});
</script>