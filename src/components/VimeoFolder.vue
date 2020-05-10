<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span class="icon">
            <font-awesome-icon icon="question-circle" />
          </span>
          Choose your video
        </p>
        <button
          class="delete"
          aria-label="close"
          @click.prevent="handleClose"
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field" v-show="reaction.isFolder">
          <label class="label" for="reactionFolder">
            Choose a reaction video from the folder
          </label>
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
                >
                  {{ video.title }}
                </option>
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
          <label class="label" for="sourceFolder">
            Choose a source video from the folder
          </label>
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
                >
                  {{ video.title }}
                </option>
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
        <p class="help">
          If you don't see a video inside the folder, it means the owner didn't
          enable the embedding for this video. Please inform the creator.
        </p>
      </section>
      <section class="modal-card-foot">
        <button class="button is-success" @click.prevent="handleFormSubmit">
          Select video
        </button>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Video, parseVimeoFolder } from "./VideoStruct";

@Component
export default class VimeoFolder extends Vue {
  @Prop({ default: new Video("") }) private reaction!: Video;
  @Prop({ default: new Video("") }) private source!: Video;

  reactionKeySelected = 0;
  sourceKeySelected = 0;

  reactionVideos: Video[] = [];
  sourceVideos: Video[] = [];

  async reloadReaction() {
    for await (const video of parseVimeoFolder(this.reaction.link)) {
      this.reactionVideos.push(video);
    }
  }

  async reloadSource() {
    for await (const video of parseVimeoFolder(this.source.link)) {
      this.sourceVideos.push(video);
    }
  }

  mounted() {
    if (this.reaction.isFolder) {
      this.reloadReaction();
    }
    if (this.source.isFolder) {
      this.reloadSource();
    }
  }

  handleFormSubmit() {
    const reaction = this.reaction.isFolder
      ? this.reactionVideos[this.reactionKeySelected]
      : this.reaction;
    const source = this.source.isFolder
      ? this.sourceVideos[this.sourceKeySelected]
      : this.source;
    this.$emit("submit", {
      reaction,
      source
    });
  }
}
</script>
