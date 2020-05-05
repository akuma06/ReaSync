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

export class SettingStorage {
  swapPiP: PiPMode = PiPMode.REACTION;
  pipVideoSize = 0.35;
  pipPosition: PiPPosition = PiPPosition.BOTTOMLEFT;
  host = "https://localhost:8080";

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
      this.pipPosition =
        settings["pipPosition"] !== undefined
          ? settings["pipPosition"]
          : PiPPosition.BOTTOMLEFT;
    }
  }

  toJson() {
    return {
      swapPiP: this.swapPiP,
      pipVideoSize: this.pipVideoSize
    };
  }

  save() {
    localStorage.setItem("settings", JSON.stringify(this.toJson()));
  }
}
