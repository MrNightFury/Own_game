export class FixedTimer {
    private time: number = 0;
    private maxTime: number;
    private interval?: NodeJS.Timeout;
    private callback?: () => void;
    private notifyCallback?: (time: number) => void;

    constructor(time: number) {
        this.maxTime = time;
    }

    private tick() {
        this.time--;
        if (this.time < 0) {
            this.pause();
            this.callback?.();
            return;
        }
        if (this.notifyCallback) {
            this.notifyCallback(this.time);
        }
    }

    public setNotifyCallback(callback: (time: number) => void) {
        this.notifyCallback = callback;
    }

    public start(callback: () => void) {
        this.time = this.maxTime;
        this.callback = callback;

        this.interval = setInterval(this.tick.bind(this), 1000);
    }

    public pause() {
        clearInterval(this.interval);
        this.interval = undefined;
    }

    public resume() {
        if (this.interval) {
            return;
        }
        this.interval = setInterval(this.tick.bind(this), 1000);
    }

    public stop() {
        this.pause();
        this.callback = undefined;
        this.time = 0;
    }

    public getTime() {
        return this.time;
    }
}