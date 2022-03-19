<template>
    <iframe
        allowfullscreen
        frameborder="0"
        height="100%"
        name="player"
        :src="video.link"
        ref="iframeplayer"
        width="100%"
    ></iframe>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, defineEmits } from "vue";
import { VideoState, Video } from "../VideoStruct";

const props = defineProps<{
    video: Video
}>();
const { video = new Video("") } = props;

const emits = defineEmits<{
    (event: "statechange", value: VideoState): void;
}>();

const iframeplayer = ref<HTMLIFrameElement | null>(null);
const videoId = ref("");
const loadVideo = async () => {
    videoId.value = await video.getVideoId()
    emits("statechange", VideoState.BUFFERING);
    iframeplayer.value?.addEventListener("load", () => {
        emits("statechange", VideoState.PLAYING);
    });
}
onMounted(loadVideo);
const play = (): void => {
    console.log("play");
}
const pause = (): void => {
    console.log("pause");
}
const seek = (t: number): void => {
    console.log("seek");
}
const setVolume = (volume: number): void => {
    console.log("volume");
}
</script>