<template>
  <div v-if="hasFolder">
    <vimeo-folder
      :reaction="reaction"
      :source="source"
      @submit="handleFolderSubmit"
    />
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

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PlayerForm from "@/components/PlayerForm.vue";
import Player from "@/components/Player.vue";
import VimeoFolder from "@/components/VimeoFolder.vue";
import { VideoStruct, Video, isVimeoFolder } from "@/components/VideoStruct";
import { TimeStruct } from "@/components/time_utils";

@Component({
  components: {
    PlayerForm,
    Player,
    VimeoFolder
  }
})
export default class Home extends Vue {
  reaction: Video = new Video("");
  source = new Video("");
  syncTime = new TimeStruct(); // seconds
  needToChange = false;
  showPlayer = false;

  beforeMount() {
    this.reaction = new Video(
      this.$route.query.reaction !== undefined
        ? decodeURIComponent(
            Array.isArray(this.$route.query.reaction)
              ? this.$route.query.reaction[0] || ""
              : this.$route.query.reaction
          )
        : ""
    );
    this.source = new Video(
      this.$route.query.source !== undefined
        ? decodeURIComponent(
            Array.isArray(this.$route.query.source)
              ? this.$route.query.source[0] || ""
              : this.$route.query.source
          )
        : ""
    );
    if (this.$route.query.t !== undefined) {
      if (Array.isArray(this.$route.query.t)) {
        this.syncTime.fromString(this.$route.query.t[0] || "");
      } else {
        this.syncTime.fromString(this.$route.query.t || "");
      }
    }
    this.shouldShowPlayer();
  }

  handleFormSubmit(data: VideoStruct) {
    this.reaction = data.reaction;
    this.source = data.source;
    this.syncTime = data.syncTime;
    this.needToChange = false;
    this.shouldShowPlayer();
  }

  shouldShowPlayer() {
    if (
      this.reaction.link !== "" &&
      this.source.link !== "" &&
      !this.needToChange
    ) {
      Promise.all([this.reaction.isValid(), this.source.isValid()]).then(
        result => {
          this.showPlayer = result[0] === "" && result[1] === "";
        }
      );
    }
  }

  handleChange() {
    this.showPlayer = false;
    this.needToChange = true;
  }

  handleFolderSubmit(data: { reaction: Video; source: Video }) {
    this.reaction = data.reaction;
    this.source = data.source;
  }

  get hasFolder() {
    return this.source.isFolder || this.reaction.isFolder;
  }
}
</script>
