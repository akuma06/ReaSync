import { TimeStruct } from "./time_utils";
import { SettingStorage } from "./Settings";

const BlaclistedIframes = ["twist.moe", "netflix.com"];
const vimeoToken = "da548feee27719d601c544fa79e9fa4e";

export enum VideoPlatform {
  LOCAL,
  YOUTUBE,
  VIMEO,
  FUNIMATION,
  IFRAME
}

const vimeoFolderRegex = new RegExp(
  "http[s]*://vimeo.com/user/([0-9]+)/folder/([0-9]+)",
  "i"
);
const reasyncVimeoId = new RegExp(
  "http[s]*://vimeo.com/reasync/videos/([0-9]+)",
  "i"
);

export function isVimeoFolder(source: string): boolean {
  return source.match(vimeoFolderRegex) !== null;
}

export class Video {
  private source: File | string;
  public videoId = "";
  public title = "";
  public image = "";

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
    const match = this.link.match(reasyncVimeoId);
    if (match !== null) {
      this.videoId = match[1];
      return this.videoId;
    }
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
    if (
      BlaclistedIframes.some(
        v => !(this.source instanceof File) && this.source.match(v)
      )
    ) {
      return "The website prohibit the embedding of their player inside this app.";
    }
    if (
      !(this.source instanceof File) &&
      this.source.match(/vimeo/i) !== null &&
      this.source.match(/review/i) !== null
    ) {
      return "Vimeo review links doesn't work, please provide a vimeo video link (e.g. https://vimeo.com/qsdz4212s/dq45qdsd) or a vimeo folder link (e.g. https://vimeo.com/user/694845413/folder/13541631)";
    }
    if (
      this.type !== VideoPlatform.LOCAL &&
      this.type !== VideoPlatform.IFRAME &&
      !this.isFolder
    ) {
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
    } else if (
      this.source.match(/vimeo/i) !== null &&
      this.source.match(/review/i) === null
    ) {
      return VideoPlatform.VIMEO;
    } else if (this.source.match(/funimation\.com/i) !== null) {
      return VideoPlatform.FUNIMATION;
    } else if (this.source.match(/[mp4|ogg|wav|webm]$/i) !== null) {
      return VideoPlatform.LOCAL;
    }
    return VideoPlatform.IFRAME;
  }

  get isFolder() {
    return isVimeoFolder(this.link);
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
  setVolume(volume: number): void;
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
      return `https://player.vimeo.com/video/${videoId}?loop=false&autoplay=false&muted=false&gesture=media&playsinline=true&byline=false&portrait=false&title=false&speed=true&transparent=false&autopause=false`;
    case VideoPlatform.FUNIMATION:
      return videoLink;
    case VideoPlatform.IFRAME:
      return videoLink;
  }
}

interface VimeoVideoResponse {
  uri: string;
  name: string;
  description: string;
  type: string;
  link: string;
  duration: number;
  width: number;
  language: string | null;
  height: number;
  embed: {
    html: string | null;
  };
  pictures: {
    uri: string;
    active: boolean;
    type: string;
    sizes: Array<{
      width: number;
      height: number;
      link: string;
      link_with_play_button: string;
    }>;
  };
}

interface VimeoFolderResponse {
  total: number;
  page: number;
  per_page: number;
  paging: {
    next: string | null;
    previous: string | null;
    first: string;
    last: string;
  };
  data: Array<VimeoVideoResponse>;
}

async function fetchVimeoFolder(
  link: string
): Promise<VimeoFolderResponse | null> {
  try {
    const result = await fetch(
      `https://api.vimeo.com${link}?per_page=100&direction=desc`,
      {
        headers: new Headers({
          Authorization: "Bearer " + vimeoToken
        })
      }
    );
    if (result.status === 200) {
      return await result.json();
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export async function* parseVimeoFolder(folder: string): AsyncGenerator<Video> {
  const match = folder.match(vimeoFolderRegex);
  if (match === null) return;
  const link = `/users/${match[1]}/projects/${match[2]}/videos`;
  let json = await fetchVimeoFolder(link);
  while (json !== null) {
    for (const response of json.data) {
      const match = response.uri.match(/^\/videos\/([0-9]+)/i);
      if (match !== null && response.embed.html !== null) {
        const video = new Video("https://vimeo.com/reasync" + response.uri);
        video.videoId = match[1];
        video.title = response.name;
        video.image = response.pictures.sizes[4].link;
        yield video;
      }
    }
    json =
      json !== null &&
      json.paging.next !== null &&
      json.paging.last !== json.paging.next
        ? await fetchVimeoFolder(json.paging.next)
        : null;
  }
}
