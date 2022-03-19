<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          <span class="icon">
            <font-awesome-icon icon="cog" />
          </span>
          {{ t('settings') }}
        </p>
        <button class="delete" aria-label="close" @click.prevent="handleClose"></button>
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
            <label class="label">{{ t("reaction-volume") }}:</label>
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
                  @change="handleReactionVolumeChange"
                  v-model="reactionVolume"
                  :placeholder="t('percentage')"
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
            <label class="label">{{ t("source-volume") }}:</label>
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
                  @change="handleSourceVolumeChange"
                  v-model="sourceVolume"
                  :placeholder="t('percentage')"
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
                  :placeholder="t('percentage')"
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
            <label class="label">{{ t("swap-pip") }}:</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="swapPiP" @change="handlePipChange">
                    <option value="0">{{ t("reaction-main-video") }}</option>
                    <option value="1">{{ t("source-main-video") }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label class="label">{{ t("pip-position") }}:</label>
          </div>
          <div class="field-body">
            <div class="field">
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="pipPosition" @change="handlePipPositionChange">
                    <option value="0">{{ t("top-left") }}</option>
                    <option value="1">{{ t("top-center") }}</option>
                    <option value="2">{{ t("top-right") }}</option>
                    <option value="3">{{ t("bottom-left") }}</option>
                    <option value="4">{{ t("bottom-center") }}</option>
                    <option value="5">{{ t("bottom-right") }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="field">
          <label for="syncPlayPause" class="checkbox">
            {{ t("sync-play-pause") }}
            <input
              type="checkbox"
              name="syncPlayPause"
              id="syncPlayPause"
              @change="handleSyncPlayPauseChange"
              v-model="syncPlayPause"
            />
          </label>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import { TimeStruct } from "./time_utils";
import { PiPMode, SettingStorage } from "./Settings";
import { Video, VideoPlatform } from "./VideoStruct";

const { t } = useI18n();
const props = defineProps<{
  sync: TimeStruct,
  reaction: Video,
  source: Video,
}>()

const { sync = new TimeStruct(), reaction = new Video(""), source = new Video("") } = props;
const localSync = Object.assign({}, sync);
const hours = ref(sync.hours.toString());
const minutes = ref(sync.minutes.toString());
const seconds = ref(sync.seconds.toString());
const settings = new SettingStorage();
const swapPiP = ref(settings.swapPiP.toString());
const sourceSize = ref(settings.pipVideoSize * 100);
const pipPosition = ref(settings.pipPosition.toString());
const syncPlayPause = ref(settings.syncPlayPause);
const reactionVolume = ref(settings.reactionVolume * 100);
const sourceVolume = ref(settings.sourceVolume * 100);
const emits = defineEmits<{
  (event: "pipchange", value: PiPMode): void;
  (event: "pippositionchange", value: number): void;
  (event: "pipsizechange", value: number): void;
  (event: "reactionvolume", value: number): void;
  (event: "sourcevolume", value: number): void;
  (event: "syncchange", value: TimeStruct): void;
  (event: "syncplaypause", value: boolean): void;
  (event: "close"): void;
}>()

const handleReactionVolumeChange = () => {
  settings.reactionVolume = reactionVolume.value / 100;
  emits("reactionvolume", settings.reactionVolume);
  settings.save();
}
const handleSourceVolumeChange = () => {
  settings.sourceVolume = sourceVolume.value / 100;
  emits("sourcevolume", settings.sourceVolume);
  settings.save();
}
const handleSyncPlayPauseChange = () => {
  settings.syncPlayPause = syncPlayPause.value;
  emits("syncplaypause", settings.syncPlayPause);
  settings.save();
}
const handlePipChange = () => {
  settings.swapPiP = Number.parseInt(swapPiP.value);
  emits("pipchange", settings.swapPiP);
  settings.save();
}
const handlePipPositionChange = () => {
  settings.pipPosition = Number.parseInt(pipPosition.value);
  emits("pippositionchange", settings.pipPosition);
  settings.save();
}
const handlePipSizeChange = () => {
  settings.pipVideoSize = sourceSize.value / 100;
  emits("pipsizechange", settings.pipVideoSize);
  settings.save();
}
const handleSyncChange = () => {
  localSync.hours = Number.parseInt(hours.value);
  localSync.minutes = Number.parseInt(minutes.value);
  localSync.seconds = Number.parseInt(seconds.value);
  emits("syncchange", localSync);
}

const handleClose = () => {
  emits("close");
}

const shareUrl = computed(() => {
  return `${settings.host}/?reaction=${
      reaction.type !== VideoPlatform.LOCAL &&
      reaction.type !== undefined
        ? encodeURIComponent(reaction.link)
        : ""
    }&source=${source.type !== VideoPlatform.LOCAL && source.type !== undefined
    ? encodeURIComponent(source.link)
    : ""
    }&t=${localSync.toString}`;
})
</script>
