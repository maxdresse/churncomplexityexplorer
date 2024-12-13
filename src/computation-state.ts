export enum MetricComputationState {
    IDLE,
    RUNNING,
}

export interface MetricState {
    computation: MetricComputationState;
    isDataPresent: boolean;
}

export interface ComputationState {
     readonly metricIdToState: Record<string, MetricState>;
}

export class AppComputationState {
    private cbs: Array<(v: ComputationState) => void> = [];
    private current: ComputationState = {
        metricIdToState: {}
    };

    updateMetricState(id: string, ms: MetricState) {
        const newState = this.cloneState();
        newState.metricIdToState[id] = ms;
        this.current = newState;
        this.notifyAll();
    }

    subscribe(cb: (v: ComputationState) => void): { unsubscribe: () => void } {
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

    private cloneState(): ComputationState {
        const s: ComputationState = { 
            metricIdToState: Object.fromEntries(Object.entries(this.current)
             .map(([mid, ms]) => [mid, {...ms}]))
        };
        return s;
    }

    private notifyAll() {
        this.cbs.forEach(cb => cb(this.current));
    }

}
