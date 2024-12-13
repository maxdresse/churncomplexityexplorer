export const enum MetricComputationState {
    IDLE,
    RUNNING,
}

export interface MetricState {
    computation: MetricComputationState;
    isDataPresent: boolean;
}

export interface ReadableAppState {
     readonly metricIdToState: Record<string, MetricState | undefined>;
}

// needs to stay JSON-able in order to pass it to web views
export class AppState {
    private cbs: Array<(v: ReadableAppState) => void> = [];
    private current: ReadableAppState = {
        metricIdToState: {}
    };

    updateMetricState(id: string, ms: MetricState) {
        const newState = this.cloneState();
        newState.metricIdToState[id] = ms;
        this.current = newState;
        this.notifyAll();
    }

    subscribe(cb: (v: ReadableAppState) => void): { unsubscribe: () => void } {
        this.cbs.push(cb);
        cb(this.current);
        return {
            unsubscribe: () => {
                const idx = this.cbs.indexOf(cb);
                if (idx >= 0) {
                    this.cbs.splice(idx, 1);
                }
            }
        };
    }

    getMetricState(id: string): MetricState | undefined {
        return this.current.metricIdToState[id];
    }

    private cloneState(): ReadableAppState {
        const s: ReadableAppState = { 
            metricIdToState: Object.fromEntries(Object.entries(this.current)
             .map(([mid, ms]) => [mid, {...ms}]))
        };
        return s;
    }

    private notifyAll() {
        this.cbs.forEach(cb => cb(this.current));
    }

}
