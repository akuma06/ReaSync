import { TimeStruct } from "./time_utils";
import { SettingStorage } from "./Settings";

export enum VideoPlatform {
  LOCAL,
  YOUTUBE,
  VIMEO,
  FUNIMATION
}

export class Video {
  private source: File | string;
  private videoId = "";

  constructor(source: File | string) {
    this.source = source;
  }

  get link() {
    if (this.source instanceof File) {
      return URL.createObjectURL(this.source);
    } else {
      return this.source;
    }
  }

  private youtubeId(): string {
    if (this.videoId !== "") return this.videoId;
    if (this.link !== "") {
      let videoId = "";
      const match = this.link.match(
        /http[s]*:\/\/www\.youtube\.com\/watch\?.*v=([a-zA-Z0-9-]+).*/i
      );
      if (match !== null && match.length > 1) {
        videoId = match[1];
      } else {
        const match = this.link.match(
          /http[s]*:\/\/youtu\.be\/([a-zA-Z0-9-]+)/i
        );
        if (match !== null && match.length > 1) {
          videoId = match[1];
        }
      }
      this.videoId = videoId;
      return videoId;
    }
    return "";
  }

  async vimeoId(): Promise<string> {
    if (this.videoId !== "") return this.videoId;
    try {
      const result = await fetch(
        "https://vimeo.com/api/oembed.json?url=" + encodeURIComponent(this.link)
      );
      if (result.status === 200) {
        const json = await result.json();
        this.videoId = json["video_id"] || "";
        return json["video_id"];
      }
    } catch (e) {
      return "";
    }
    return "";
  }

  private funimationId(): string {
    if (this.link !== "") {
      const match = this.link.match(
        /http[s]*:\/\/www\.funimation\.com\/player\/([0-9]+).+/i
      );
      if (match !== null && match.length > 1) {
        return match[1];
      }
    }
    return "";
  }

  async getVideoId(): Promise<string> {
    switch (this.type) {
      case VideoPlatform.YOUTUBE:
        return this.youtubeId();
      case VideoPlatform.VIMEO:
        return await this.vimeoId();
      case VideoPlatform.FUNIMATION:
        return this.funimationId();
      default:
        return "";
    }
  }

  async isValid() {
    if (this.type !== VideoPlatform.LOCAL) {
      const videoId = await this.getVideoId();
      if (videoId === "") {
        return "URL provided isn't supported or the owner doesn't allow embedding";
      }
    }
    return "";
  }

  get type() {
    if (this.source instanceof File) {
      return VideoPlatform.LOCAL;
    } else if (this.source.match(/youtu/i) !== null) {
      return VideoPlatform.YOUTUBE;
    } else if (this.source.match(/vimeo/i) !== null) {
      return VideoPlatform.VIMEO;
    } else if (this.source.match(/funimation/i) !== null) {
      return VideoPlatform.FUNIMATION;
    }
    return VideoPlatform.LOCAL;
  }
}

export interface VideoStruct {
  reaction: Video;
  source: Video;
  syncTime: TimeStruct;
}

export interface PlayerInterface {
  play(): void;
  pause(): void;
  seek(t: number): void;
}

export enum VideoState {
  UNSTARTED = -1,
  ENDED,
  PLAYING,
  PAUSED,
  BUFFERING
}

export function generateEmbedLink(
  videoType: VideoPlatform,
  videoLink: string,
  videoId: string
) {
  if (videoType === VideoPlatform.LOCAL) {
    return videoLink;
  }
  const settings = new SettingStorage();
  const host = encodeURIComponent(settings.host);
  switch (videoType) {
    case VideoPlatform.YOUTUBE:
      return `https://www.youtube.com/embed/${videoId}?origin=${host}&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1&autoplay=0`;
    case VideoPlatform.VIMEO:
      return `https://player.vimeo.com/video/${videoId}?loop=false&autoplay=false&muted=false&gesture=media&playsinline=true&byline=false&portrait=false&title=false&speed=true&transparent=false`;
    case VideoPlatform.FUNIMATION:
      return videoLink;
  }
}
