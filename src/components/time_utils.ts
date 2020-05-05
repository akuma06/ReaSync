export class TimeStruct {
  private _hours = 0;
  private _minutes = 0;
  private _seconds = 0;

  get hours() {
    return this._hours;
  }
  set hours(h: number) {
    this._hours = h > 0 ? h : 0;
  }
  get minutes() {
    return this._minutes;
  }

  set minutes(m: number) {
    if (m > 60) {
      const h = Math.floor(m / 60);
      this.hours = h;
      this._minutes = m % 60;
    } else {
      this._minutes = m > 0 ? m : 0;
    }
  }

  get seconds() {
    return this._seconds;
  }
  set seconds(s: number) {
    if (s > 60) {
      const m = Math.floor(s / 60);
      this._minutes = m;
      this._seconds = s % 60;
    } else {
      this._seconds = s > 0 ? s : 0;
    }
  }

  get toSeconds() {
    return this.seconds + this.minutes * 60 + this.hours * 3600;
  }

  get toString() {
    if (this.hours > 0) {
      return `${this.hours}h${this.minutes}m${this.seconds}s`;
    } else if (this.minutes > 0) {
      return `${this.minutes}m${this.seconds}s`;
    } else {
      return `${this.seconds}s`;
    }
  }

  fromSeconds(t: number) {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = (t % 3600) % 60;
    this.hours = h;
    this.minutes = m;
    this.seconds = s;
  }

  fromString(s: string) {
    const match = s.match(/^(?:([0-9]+)h)*(?:([0-9]+)m)*(?:([0-9]+)s)*/i);
    if (match !== null) {
      for (let i = 0; i < match.length - 1; i++) {
        switch (i) {
          case 0:
            this.seconds = Number.parseInt(match[match.length - 1]);
            break;
          case 1:
            this.minutes = Number.parseInt(match[match.length - 2]);
            break;
          case 2:
            this.hours = Number.parseInt(match[match.length - 3]);
        }
      }
    }
  }
  fromNumberString(s: string) {
    const match = s.split(":");
    if (match.length === 3) {
      for (let i = 0; i < match.length; i++) {
        switch (i) {
          case 0:
            this.seconds = Number.parseInt(match[match.length - 1]);
            break;
          case 1:
            this.minutes = Number.parseInt(match[match.length - 2]);
            break;
          case 2:
            this.hours = Number.parseInt(match[match.length - 3]);
        }
      }
    }
  }

  toNumberFormat() {
    return `${this.hours}:${this.minutes}:${this.seconds}`;
  }
}
