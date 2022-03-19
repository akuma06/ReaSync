<template>
  <div class="body">
    <section class="hero is-dark is-bold is-fullheight">
      <div class="hero-head">
        <figure class="image">
          <img src="/img/icons/logo-transparent.png" />
        </figure>
        <h1 class="title has-text-centered is-size-1">ReaSync</h1>
      </div>
      <div class="hero-body">
        <div class="container">
          <div class="card">
            <div class="card-content">
              <div class="content">
                <div class="field">
                  <label for="isreactionlocal" class="checkbox">
                    {{ t('is-reaction-locale') }}
                    <input
                      type="checkbox"
                      name="isreactionlocal"
                      id="isreactionlocal"
                      v-model="isReactionLocal"
                    />
                  </label>
                </div>
                <div class="field">
                  <label for="reaction" class="label">{{ t("reaction-video") }}:</label>
                  <div class="control">
                    <input
                      type="file"
                      name="reaction"
                      id="reaction"
                      class="input"
                      @change="handleReactionFileChange"
                      :placeholder="t('reaction-video-file')"
                      v-if="isReactionLocal"
                    />
                    <input
                      type="text"
                      name="reaction"
                      id="reaction"
                      class="input"
                      :class="{ 'is-danger': errors.reaction !== '' }"
                      v-model="localReaction"
                      :placeholder="t('reaction-url-placeholder')"
                      v-else
                    />
                  </div>
                  <p class="help is-danger" v-if="errors.reaction !== ''">{{ errors.reaction }}</p>
                </div>
                <hr />
                <div class="field">
                  <label for="islocal" class="checkbox">
                    {{ t("is-source-locale") }}
                    <input
                      type="checkbox"
                      name="islocal"
                      id="islocal"
                      v-model="isSourceLocal"
                    />
                  </label>
                </div>
                <div class="field">
                  <label for="source" class="label">{{ t("source-video") }}:</label>
                  <div class="control">
                    <input
                      type="file"
                      name="source"
                      id="source"
                      class="input"
                      @change="handleSourceFileChange"
                      :placeholder="t('source-video-file')"
                      v-if="isSourceLocal"
                    />
                    <input
                      type="text"
                      name="source"
                      id="source"
                      class="input"
                      :class="{ 'is-danger': errors.source !== '' }"
                      :placeholder="t('source-url-placeholder')"
                      v-model="localSource"
                      v-else
                    />
                  </div>
                  <p class="help is-danger" v-if="errors.source !== ''">{{ errors.source }}</p>
                </div>
                <div class="field">
                  <label for="syncTime" class="label">{{ t("start-source-at") }}</label>
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
              <a class="card-footer-item button is-primary" @click.prevent="submit">{{ t("play") }}</a>
            </footer>
          </div>
        </div>
      </div>
      <div class="hero-foot">
        <div class="container">
          <p class="has-text-centered">{{ t("version") }} {{ Version }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import { Video, VideoState } from "@/components/VideoStruct";
import type { VideoStruct } from "@/components/VideoStruct";
import { TimeStruct } from "./time_utils";
import { Version } from "./Settings";

interface ErrorMessages {
  reaction: string;
  source: string;
}

const props = defineProps({
  reaction: {
    type: Video,
    default: new Video("")
  },
  source: {
    type: Video,
    default: new Video("")
  },
  sync: {
    type: TimeStruct,
    default: new TimeStruct()
  }
});

const { t } = useI18n();

const localReaction = ref(props.reaction.link);
const localSource = ref(props.source.link);
const isSourceLocal = ref(false);
const isReactionLocal = ref(false);
const localReactionFile = ref<File | null>(null);
const localFile = ref<File | null>(null);
const hours = ref(props.sync.hours.toString());
const minutes = ref(props.sync.minutes.toString());
const seconds = ref(props.sync.seconds.toString());
const sumbittedOnce = ref(false);
const errors = ref<ErrorMessages>({
  reaction: "",
  source: ""
});
const emits = defineEmits<{
  (event: "submit", video: VideoStruct): void
}>()

const handleSourceFileChange = (e: Event) => {
  const { files } = e.target as HTMLInputElement;
  if (files !== null && files.length > 0) {
    localFile.value = files[0];
  }
}

const handleReactionFileChange = (e: Event) => {
  const { files } = e.target as HTMLInputElement;
  if (files !== null && files.length > 0) {
    localReactionFile.value = files[0];
  }
}
const submit = () => {
  sumbittedOnce.value = true;
  const reaction =
    isReactionLocal.value && localReactionFile.value !== null
      ? new Video(localReactionFile.value)
      : new Video(localReaction.value);
  const source =
    isSourceLocal.value && localFile.value !== null
      ? new Video(localFile.value)
      : new Video(localSource.value);
  const syncTime = new TimeStruct();
  syncTime.fromNumberString(
    hours.value + ":" + minutes.value + ":" + seconds.value
  );
  Promise.all([reaction.isValid(), source.isValid()]).then(result => {
    errors.value = {
      reaction: t(result[0]),
      source: t(result[1])
    };
    if (errors.value.reaction === "" && errors.value.source === "") {
      emits("submit", {
        reaction,
        source,
        syncTime
      } as VideoStruct);
    }
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.body {
  overflow: auto;
  height: 100%;
}

.hero-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  figure {
    max-width: 256px;
    width: 90%;
    img {
      width: 100%;
    }
  }
}
</style>
