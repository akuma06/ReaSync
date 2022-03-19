<template>
    <div class="modal is-active">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">
                    <span class="icon">
                        <font-awesome-icon icon="question-circle" />
                    </span>
                    {{ t('help') }}
                </p>
                <button class="delete" aria-label="close" @click.prevent="handleClose"></button>
            </header>
            <section class="modal-card-body">
                <p>
                    <strong>{{ t("reaction-url") }}:</strong>
                    {{ reaction.link }} (
                    <a @click.prevent="handleChange">{{ t("change") }}</a>
                    )
                    <br />
                    <strong>{{ t('generated-link') }}:</strong>
                </p>
                <p class="generated">
                    <a :href="reactionLink" target="_blank">{{ reactionLink }}</a>
                </p>
                <hr />
                <p>
                    <strong>{{ t("source-url") }}:</strong>
                    {{ source.link }} (
                    <a @click.prevent="handleChange">{{ t("change") }}</a>
                    )
                    <br />
                    <strong>{{ t("generated-link") }}:</strong>
                </p>
                <p class="generated">
                    <a :href="sourceLink" target="_blank">{{ sourceLink }}</a>
                </p>
                <hr />
                <p class="help">{{ t("version") }}: {{ Version }}</p>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from "vue";
import { useI18n } from "vue-i18n"
import { generateEmbedLink, Video } from "./VideoStruct";
import { Version } from "./Settings";

const props = defineProps<{
    reaction: Video,
    source: Video,
}>()
const reactionLink = ref("");
const sourceLink = ref("")
const { reaction, source } = props;

const { t } = useI18n()

const emits = defineEmits<{
    (event: "close"): void,
    (event: "needchange"): void,
}>();
const generateLinks = () => {
    Promise.all([reaction.getVideoId(), source.getVideoId()]).then(
        result => {
            reactionLink.value = generateEmbedLink(
                reaction.type,
                reaction.link,
                result[0]
            );
            sourceLink.value = generateEmbedLink(
                source.type,
                source.link,
                result[1]
            );
        }
    );
}
onMounted(generateLinks)
const handleClose = () => {
    emits("close");
}
const handleChange = () => {
    emits("needchange");
}
</script>

<style lang="scss">
.generated a {
    width: 100%;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>