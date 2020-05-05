import { TimeStruct } from "./time_utils";

export enum VideoPlatform {
  LOCAL,
  YOUTUBE,
  VIMEO
}

export class Video {
  private source: File | string;

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
      return videoId;
    }
    return "";
  }

  async vimeoId(): Promise<string> {
    try {
      const result = await fetch(
        "https://vimeo.com/api/oembed.json?url=" + encodeURIComponent(this.link)
      );
      if (result.status === 200) {
        const json = await result.json();
        return json["video_id"];
      }
    } catch (e) {
      return "";
    }
    return "";
  }

  async getVideoId(): Promise<string> {
    switch (this.type) {
      case VideoPlatform.YOUTUBE:
        return this.youtubeId();
      case VideoPlatform.VIMEO:
        return await this.vimeoId();
      default:
        return "";
    }
  }

  get type() {
    if (this.source instanceof File) {
      return VideoPlatform.LOCAL;
    } else if (this.source.match(/youtu/i) !== null) {
      return VideoPlatform.YOUTUBE;
    } else if (this.source.match(/vimeo/i) !== null) {
      return VideoPlatform.VIMEO;
    }
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
