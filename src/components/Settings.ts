export enum PiPMode {
  REACTION,
  SOURCE
}

export enum PiPPosition {
  TOPLEFT,
  TOPCENTER,
  TOPRIGHT,
  BOTTOMLEFT,
  BOTTOMCENTER,
  BOTTOMRIGHT
}

export const Version = "1.0";

export class SettingStorage {
  swapPiP: PiPMode = PiPMode.REACTION;
  pipVideoSize = 0.35;
  pipPosition: PiPPosition = PiPPosition.BOTTOMLEFT;
  syncPlayPause = true;
  reactionVolume = 1;
  sourceVolume = 0.3;
  host = "https://reasync.netlify.app";

  constructor() {
    const storage = localStorage.getItem("settings");
    if (storage !== null) {
      const settings = JSON.parse(storage);
      this.swapPiP =
        settings["swapPiP"] !== undefined
          ? settings["swapPiP"]
          : PiPMode.REACTION;
      this.pipVideoSize =
        settings["pipVideoSize"] !== undefined
          ? settings["pipVideoSize"]
          : 0.35;
      this.reactionVolume =
        settings["reactionVolume"] !== undefined
          ? settings["reactionVolume"]
          : 1;
      this.sourceVolume =
        settings["sourceVolume"] !== undefined ? settings["sourceVolume"] : 0.3;
      this.pipPosition =
        settings["pipPosition"] !== undefined
          ? settings["pipPosition"]
          : PiPPosition.BOTTOMLEFT;
      this.syncPlayPause =
        settings["syncPlayPause"] !== undefined &&
        settings["syncPlayPause"] === "1";
    }
  }

  toJson() {
    return {
      swapPiP: this.swapPiP,
      pipVideoSize: this.pipVideoSize,
      reactionVolume: this.reactionVolume,
      sourceVolume: this.sourceVolume,
      pipPosition: this.pipPosition,
      syncPlayPause: this.syncPlayPause ? "1" : "0"
    };
  }

  save() {
    localStorage.setItem("settings", JSON.stringify(this.toJson()));
  }
}
