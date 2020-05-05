<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Settings</p>
        <button
          class="delete"
          aria-label="close"
          @click.prevent="handleClose"
        ></button>
      </header>
      <section class="modal-card-body">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Sharing URL</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <input class="input" type="text" :value="shareUrl" readonly />
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Start at</label>
          </div>
          <div class="field-body">
            <div class="field has-addons">
              <div class="control">
                <input
                  type="number"
                  max="24"
                  min="0"
                  class="input"
                  v-model="hours"
                  @change="handleSyncChange"
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
                  @change="handleSyncChange"
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
                  @change="handleSyncChange"
                  placeholder="ss"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">PiP size:</label>
          </div>
          <div class="field-body">
            <div class="field has-addons">
              <div class="control">
                <input
                  type="number"
                  max="100"
                  min="0"
                  step="5"
                  class="input"
                  @change="handlePipSizeChange"
                  v-model="sourceSize"
                  placeholder="hh"
                />
              </div>
              <p class="control">
                <a class="button is-static">%</a>
              </p>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">Swap PiP:</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="swapPiP" @change="handlePipChange">
                    <option value="0">Reaction as main video</option>
                    <option value="1">Source as main video</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">PiP position:</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                  <select
                    v-model="pipPosition"
                    @change="handlePipPositionChange"
                  >
                    <option value="0">Top Left</option>
                    <option value="1">Top Center</option>
                    <option value="2">Top Right</option>
                    <option value="3">Bottom Left</option>
                    <option value="4">Bottom Center</option>
                    <option value="5">Bottom Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { TimeStruct } from "./time_utils";
import { SettingStorage } from "./Settings";
import { Video, VideoPlatform } from "./VideoStruct";

@Component
export default class Settings extends Vue {
  @Prop({ default: new TimeStruct() }) private sync!: TimeStruct;
  @Prop({ default: new Video("") }) private reaction!: Video;
  @Prop({ default: new Video("") }) private source!: Video;

  localSync = this.sync;
  hours = this.sync.hours.toString();
  minutes = this.sync.minutes.toString();
  seconds = this.sync.seconds.toString();
  settings = new SettingStorage();
  swapPiP = this.settings.swapPiP.toString();
  sourceSize = this.settings.pipVideoSize * 100;
  pipPosition = this.settings.pipPosition.toString();

  handlePipChange() {
    this.settings.swapPiP = Number.parseInt(this.swapPiP);
    this.$emit("pipchange", this.settings.swapPiP);
    this.settings.save();
  }
  handlePipPositionChange() {
    this.settings.pipPosition = Number.parseInt(this.pipPosition);
    this.$emit("pippositionchange", this.settings.pipPosition);
    this.settings.save();
  }
  handlePipSizeChange() {
    this.settings.pipVideoSize = this.sourceSize / 100;
    this.$emit("pipsizechange", this.settings.pipVideoSize);
    this.settings.save();
  }
  handleSyncChange() {
    this.localSync.hours = Number.parseInt(this.hours);
    this.localSync.minutes = Number.parseInt(this.minutes);
    this.localSync.seconds = Number.parseInt(this.seconds);
    this.$emit("syncchange", this.localSync);
  }

  handleClose() {
    this.$emit("close");
  }

  get shareUrl() {
    return `${this.settings.host}/?reaction=${encodeURIComponent(
      this.reaction.link
    )}&source=${
      this.source.type !== VideoPlatform.LOCAL && this.source.type !== undefined
        ? encodeURIComponent(this.source.link)
        : ""
    }&t=${this.localSync.toString}`;
  }
}
</script>
