<template>
  <Player
    :reaction="reaction"
    :source="source"
    :sync="syncTime"
    v-if="showPlayer"
  />
  <PlayerForm
    :reaction="reaction"
    :source="source"
    :sync="syncTime"
    v-else
    @submit="handleFormSubmit"
  />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PlayerForm from "@/components/PlayerForm.vue";
import Player from "@/components/Player.vue";
import { VideoStruct, Video } from "@/components/VideoStruct";
import { TimeStruct } from "@/components/time_utils";

@Component({
  components: {
    PlayerForm,
    Player
  }
})
export default class Home extends Vue {
  reaction: Video = new Video("");
  source = new Video("");
  syncTime = new TimeStruct(); // seconds
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
  }
  needToChange = false;

  handleFormSubmit(data: VideoStruct) {
    this.reaction = data.reaction;
    this.source = data.source;
    this.syncTime = data.syncTime;
    this.needToChange = false;
  }

  get showPlayer() {
    return (
      this.reaction.link !== "" && this.source.link !== "" && !this.needToChange
    );
  }
}
</script>
