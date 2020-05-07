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
                  <label for="isreactionlocal" class="checkbox">
                    Is your reaction video a local file?
                    <input
                      type="checkbox"
                      name="isreactionlocal"
                      id="isreactionlocal"
                      v-model="isReactionLocal"
                    />
                  </label>
                </div>
                <div class="field">
                  <label for="reaction" class="label">
                    Reaction Video:
                  </label>
                  <div class="control">
                    <input
                      type="file"
                      name="reaction"
                      id="reaction"
                      class="input"
                      @change="handleReactionFileChange"
                      placeholder="Reaction Video File"
                      v-if="isReactionLocal"
                    />
                    <input
                      type="text"
                      name="reaction"
                      id="reaction"
                      class="input"
                      :class="{ 'is-danger': errors.reaction !== '' }"
                      v-model="localReaction"
                      placeholder="Reaction Video URL (YouTube, Vimeo, Funimation, Direct)"
                      v-else
                    />
                  </div>
                  <p class="help is-danger" v-if="errors.reaction !== ''">
                    {{ errors.reaction }}
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
                        'is-danger': errors.source !== ''
                      }"
                      placeholder="Source Video URL (YouTube, Vimeo, Funimation, Direct)"
                      v-model="localSource"
                      v-else
                    />
                  </div>
                  <p class="help is-danger" v-if="errors.source !== ''">
                    {{ errors.source }}
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
                        aria-label="Hours"
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
                        aria-label="Minutes"
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
                        aria-label="Seconds"
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

interface ErrorMessages {
  reaction: string;
  source: string;
}

@Component
export default class PlayerForm extends Vue {
  @Prop({ default: new Video("") }) private reaction!: Video;
  @Prop({ default: new Video("") }) private source!: Video;
  @Prop({ default: new TimeStruct() }) private sync!: TimeStruct;

  localReaction = this.reaction.link;
  localSource = this.source.link;
  isLocal = false;
  isReactionLocal = false;
  localReactionFile: File | null = null;
  localFile: File | null = null;
  hours = this.sync.hours.toString();
  minutes = this.sync.minutes.toString();
  seconds = this.sync.seconds.toString();
  sumbittedOnce = false;
  errors: ErrorMessages = {
    reaction: "",
    source: ""
  };

  handleFileChange(e: Event) {
    const { files } = e.target as HTMLInputElement;
    if (files !== null && files.length > 0) {
      console.log(files[0]);
      this.localFile = files[0];
    }
  }
  handleReactionFileChange(e: Event) {
    const { files } = e.target as HTMLInputElement;
    if (files !== null && files.length > 0) {
      console.log(files[0]);
      this.localReactionFile = files[0];
    }
  }

  submit() {
    this.sumbittedOnce = true;
    const reaction =
      this.isReactionLocal && this.localReactionFile !== null
        ? new Video(this.localReactionFile)
        : new Video(this.localReaction);
    const source =
      this.isLocal && this.localFile !== null
        ? new Video(this.localFile)
        : new Video(this.localSource);
    const syncTime = new TimeStruct();
    syncTime.fromNumberString(
      this.hours + ":" + this.minutes + ":" + this.seconds
    );
    Promise.all([reaction.isValid(), source.isValid()]).then(result => {
      this.errors.reaction = result[0];
      this.errors.source = result[1];
      if (this.errors.reaction === "" && this.errors.source === "") {
        this.$emit("submit", {
          reaction,
          source,
          syncTime
        } as VideoStruct);
      }
    });
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
