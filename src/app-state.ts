export enum MetricComputationState {
    IDLE,
    RUNNING,
}

export interface MetricState {
    computation: MetricComputationState;
    isDataPresent: boolean;
}

export interface ReableAppState {
     readonly metricIdToState: Record<string, MetricState>;
}

export class AppState {
    private cbs: Array<(v: ReableAppState) => void> = [];
    private current: ReableAppState = {
        metricIdToState: {}
    };

    updateMetricState(id: string, ms: MetricState) {
        const newState = this.cloneState();
        newState.metricIdToState[id] = ms;
        this.current = newState;
        this.notifyAll();
    }

    subscribe(cb: (v: ReableAppState) => void): { unsubscribe: () => void } {
        this.cbs.push(cb);
        return {
            unsubscribe: () => {
                const idx = this.cbs.indexOf(cb);
                if (idx >= 0) {
                    this.cbs.splice(idx, 1);
                }
            }
        };
    }

    private cloneState(): ReableAppState {
        const s: ReableAppState = { 
            metricIdToState: Object.fromEntries(Object.entries(this.current)
             .map(([mid, ms]) => [mid, {...ms}]))
        };
        return s;
    }

    private notifyAll() {
        this.cbs.forEach(cb => cb(this.current));
    }

}
