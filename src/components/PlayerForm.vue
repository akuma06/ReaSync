<template>
  <div class="body">
    <section class="hero is-dark is-bold is-fullheight">
      <div class="hero-head">
        <h1 class="title has-text-centered is-size-1">ReaSync</h1>
      </div>
      <div class="hero-body">
        <div class="container">
          <div class="card">
            <div class="card-content">
              <div class="content">
                <div class="field">
                  <label for="reaction" class="label">
                    Reaction Video:
                  </label>
                  <div class="control">
                    <input
                      type="text"
                      name="reaction"
                      id="reaction"
                      class="input"
                      :class="{
                        'is-danger': sumbittedOnce && !isReactionValid
                      }"
                      v-model="localReaction"
                      placeholder="Reaction Video URL (YouTube, Vimeo, Direct)"
                    />
                  </div>
                  <p
                    class="help is-danger"
                    v-if="sumbittedOnce && !isReactionValid"
                  >
                    No valid reaction video provided!
                  </p>
                </div>
                <div class="field">
                  <label for="islocal" class="checkbox">
                    Is your source video a local file?
                    <input
                      type="checkbox"
                      name="islocal"
                      id="islocal"
                      v-model="isLocal"
                    />
                  </label>
                </div>
                <div class="field">
                  <label for="source" class="label">
                    Source Video:
                  </label>
                  <div class="control">
                    <input
                      type="file"
                      name="source"
                      id="source"
                      class="input"
                      @change="handleFileChange"
                      placeholder="Source Video File"
                      v-if="isLocal"
                    />
                    <input
                      type="text"
                      name="source"
                      id="source"
                      class="input"
                      :class="{
                        'is-danger': sumbittedOnce && !isSourceValid
                      }"
                      placeholder="Source Video URL (YouTube, Vimeo, Direct)"
                      v-model="localSource"
                      v-else
                    />
                  </div>
                  <p
                    class="help is-danger"
                    v-if="sumbittedOnce && !isSourceValid"
                  >
                    No valid source video provided!
                  </p>
                </div>
                <div class="field">
                  <label for="syncTime" class="label">
                    Start source video at
                  </label>
                  <div class="field has-addons">
                    <div class="control">
                      <input
                        type="number"
                        max="24"
                        min="0"
                        class="input"
                        v-model="hours"
                        placeholder="hh"
                      />
                    </div>
                    <p class="control">
                      <a class="button is-static">:</a>
                    </p>
                    <div class="control">
                      <input
                        type="number"
                        max="60"
                        min="0"
                        class="input"
                        v-model="minutes"
                        placeholder="mm"
                      />
                    </div>
                    <p class="control">
                      <a class="button is-static">:</a>
                    </p>
                    <div class="control">
                      <input
                        type="number"
                        max="60"
                        min="0"
                        class="input"
                        v-model="seconds"
                        placeholder="ss"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <footer class="card-footer">
              <a class="card-footer-item" @click.prevent="submit">Play</a>
            </footer>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { VideoStruct, Video } from "@/components/VideoStruct";
import { TimeStruct } from "./time_utils";

@Component
export default class PlayerForm extends Vue {
  @Prop({ default: new Video("") }) private reaction!: Video;
  @Prop({ default: new Video("") }) private source!: Video;
  @Prop({ default: new TimeStruct() }) private sync!: TimeStruct;

  localReaction = this.reaction.link;
  localSource = this.source.link;
  isLocal = false;
  localFile: File | null = null;
  hours = this.sync.hours.toString();
  minutes = this.sync.minutes.toString();
  seconds = this.sync.seconds.toString();
  sumbittedOnce = false;

  handleFileChange(e: Event) {
    const { files } = e.target as HTMLInputElement;
    if (files !== null && files.length > 0) {
      console.log(files[0]);
      this.localFile = files[0];
    }
  }

  submit() {
    this.sumbittedOnce = true;
    if (
      this.isReactionValid &&
      (this.isSourceValid || this.localFile !== null)
    ) {
      const time = new TimeStruct();
      time.fromNumberString(
        this.hours + ":" + this.minutes + ":" + this.seconds
      );
      this.$emit("submit", {
        reaction: new Video(this.localReaction),
        source:
          this.isLocal && this.localFile !== null
            ? new Video(this.localFile)
            : new Video(this.localSource),
        syncTime: time
      } as VideoStruct);
    }
  }

  get isReactionValid() {
    if (this.localReaction !== "") {
      try {
        new URL(this.localReaction);
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }
  get isSourceValid() {
    if (this.localSource !== "") {
      try {
        new URL(this.localSource);
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.title {
  margin-top: 2em;
}

.body {
  overflow: auto;
  height: 100%;
}
</style>
