<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import PlayerForm from "@/components/PlayerForm.vue";
import Player from "@/components/Player.vue";
import { Video, isVimeoFolder } from "@/components/VideoStruct";
import { TimeStruct } from "@/components/time_utils";
import VimeoFolder from "@/components/VimeoFolder.vue";
import type { VideoStruct } from "@/components/VideoStruct";
const { query } = useRoute();

const reaction = ref<Video>(new Video(
  query.reaction !== undefined
    ? decodeURIComponent(
      Array.isArray(query.reaction)
        ? query.reaction[0] || ""
        : query.reaction!
    )
    : ""
));
const source = ref<Video>(new Video(
  query.source !== undefined
    ? decodeURIComponent(
      Array.isArray(query.source)
        ? query.source[0] || ""
        : query.source!
    )
    : ""
));
const parseTime = new TimeStruct();

if (query.t !== undefined) {
  if (Array.isArray(query.t)) {
    parseTime.fromString(query.t[0] || "");
  } else {
    parseTime.fromString(query.t || "");
  }
}
const syncTime = ref(parseTime);
const showPlayer = ref(false);
const needToChange = ref(false);

const shouldShowPlayer = async () => {
  if (
    reaction.value.link !== "" &&
    source.value.link !== "" &&
    !needToChange.value
  ) {
    const isReactionValid = await reaction.value.isValid();
    const isSourceValid = await source.value.isValid();
    showPlayer.value = isReactionValid === "" && isSourceValid === "";
  }
}
onBeforeMount(shouldShowPlayer);
const handleFormSubmit = (data: VideoStruct) => {
  reaction.value = data.reaction;
  source.value = data.source;
  syncTime.value = data.syncTime;
  needToChange.value = false;
  shouldShowPlayer();
}
const handleChange = () => {
  showPlayer.value = false;
  needToChange.value = true;
}
const handleFolderSubmit = (data: { reaction: Video; source: Video }) => {
  reaction.value = data.reaction;
  source.value = data.source;
}
const hasFolder = computed(() => {
  return source.value.isFolder || reaction.value.isFolder;
});
</script>

<template>
  <div v-if="hasFolder">
    <vimeo-folder :reaction="reaction" :source="source" @submit="handleFolderSubmit" />
  </div>
  <div v-else>
    <Player
      :reaction="reaction"
      :source="source"
      :sync="syncTime"
      @needchange="handleChange"
      v-if="showPlayer"
    />
    <PlayerForm
      :reaction="reaction"
      :source="source"
      :sync="syncTime"
      v-else
      @submit="handleFormSubmit"
    />
  </div>
</template>
