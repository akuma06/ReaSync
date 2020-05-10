<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span class="icon">
            <font-awesome-icon icon="question-circle" />
          </span>
          Help
        </p>
        <button
          class="delete"
          aria-label="close"
          @click.prevent="handleClose"
        ></button>
      </header>
      <section class="modal-card-body">
        <p>
          <strong>Reaction URL : </strong> {{ reaction.link }} (
          <a @click.prevent="handleChange">change</a>
          )<br />
          <strong>Generated Link : </strong>
        </p>
        <p class="generated">
          <a :href="reactionLink" target="_blank">{{ reactionLink }}</a>
        </p>
        <hr />
        <p>
          <strong>Source URL : </strong> {{ source.link }} (
          <a @click.prevent="handleChange">change</a>
          )<br />
          <strong>Generated Link : </strong>
        </p>
        <p class="generated">
          <a :href="sourceLink" target="_blank">{{ sourceLink }}</a>
        </p>
        <hr />
        <p class="help">Version : {{ version }}</p>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { generateEmbedLink, Video } from "./VideoStruct";
import { Version } from "./Settings";

@Component
export default class HelpVue extends Vue {
  @Prop({ default: new Video("") }) reaction!: Video;
  @Prop({ default: new Video("") }) source!: Video;

  reactionLink = "";
  sourceLink = "";
  version = Version;

  mounted() {
    Promise.all([this.reaction.getVideoId(), this.source.getVideoId()]).then(
      result => {
        this.reactionLink = generateEmbedLink(
          this.reaction.type,
          this.reaction.link,
          result[0]
        );
        this.sourceLink = generateEmbedLink(
          this.source.type,
          this.source.link,
          result[1]
        );
      }
    );
  }

  handleClose() {
    this.$emit("close");
  }

  handleChange() {
    this.$emit("needchange");
  }
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
