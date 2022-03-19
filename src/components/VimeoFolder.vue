<template>
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <span class="icon">
                        <font-awesome-icon icon="question-circle" />
                    </span>
                    {{ t("choose-video") }}
                </p>
                <button class="delete" aria-label="close" @click.prevent="handleClose"></button>
            </header>
            <section class="modal-card-body">
                <div class="field" v-show="reaction.isFolder">
                    <label class="label" for="reactionFolder">{{ t("choose-reaction") }}</label>
                    <div class="control">
                        <div class="select is-info">
                            <select
                                name="reactionFolder"
                                id="reactionFolder"
                                :v-model="reactionKeySelected"
                            >
                                <option
                                    v-for="(video, k) in reactionVideos"
                                    :key="'reaction' + k"
                                    :value="k"
                                    :selected="reactionKeySelected === k"
                                >{{ video.title }}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <article class="media" v-if="reactionVideos.length > 0">
                    <figure class="media-left">
                        <p class="image is-64x64">
                            <img :src="reactionVideos[reactionKeySelected].image" />
                        </p>
                    </figure>
                    <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>{{ reactionVideos[reactionKeySelected].title }}</strong>
                            </p>
                        </div>
                    </div>
                </article>
                <hr v-show="reaction.isFolder && source.isFolder" />
                <div class="field" v-show="source.isFolder">
                    <label class="label" for="sourceFolder">{{ t("choose-source") }}</label>
                    <div class="control">
                        <div class="select is-info">
                            <select
                                name="sourceFolder"
                                id="sourceFolder"
                                v-model="sourceKeySelected"
                            >
                                <option
                                    v-for="(video, k) in sourceVideos"
                                    :key="'source' + k"
                                    :value="k"
                                    :selected="sourceKeySelected === k"
                                >{{ video.title }}</option>
                            </select>
                        </div>
                    </div>
                </div>
                <article class="media" v-if="sourceVideos.length > 0">
                    <figure class="media-left">
                        <p class="image is-64x64">
                            <img :src="sourceVideos[sourceKeySelected].image" />
                        </p>
                    </figure>
                    <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>{{ sourceVideos[sourceKeySelected].title }}</strong>
                            </p>
                        </div>
                    </div>
                </article>
                <p class="help">{{ t("choose-help") }}</p>
            </section>
            <section class="modal-card-foot">
                <button
                    class="button is-success"
                    @click.prevent="handleFormSubmit"
                >{{ t("select-video") }}</button>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { Video, parseVimeoFolder } from "./VideoStruct";


const props = defineProps<{
    reaction: Video;
    source: Video;
}>();
const { reaction = new Video(""), source = new Video("") } = props;

const { t } = useI18n();

const emits = defineEmits<{
    (event: "submit", payload: { reaction: Video, source: Video }): void;
}>();

const reactionKeySelected = ref(0);
const sourceKeySelected = ref(0);
const reactionVideos = reactive<Video[]>([]);
const sourceVideos = reactive<Video[]>([]);
const reloadReaction = async () => {
    if (!reaction.isFolder) {
        return;
    }
    for await (const video of parseVimeoFolder(reaction.link)) {
        reactionVideos.push(video);
    }
}
onMounted(reloadReaction);
const reloadSource = async () => {
    if (!source.isFolder) {
        return;
    }
    for await (const video of parseVimeoFolder(source.link)) {
        sourceVideos.push(video);
    }
}
onMounted(reloadSource);
const handleFormSubmit = () => {
    const reactionVideo = reaction.isFolder
        ? reactionVideos[reactionKeySelected.value]
        : reaction;
    const sourceVideo = source.isFolder
        ? sourceVideos[sourceKeySelected.value]
        : source;
    emits("submit", {
        reaction: reactionVideo,
        source: sourceVideo
    });
}

const handleClose = () => {
}
</script>