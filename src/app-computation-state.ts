export enum ComputationState {
    IDLE,
    RUNNING,
}

export interface MetricState {
    computation: ComputationState;
    isDataPresent: boolean;
}

export interface AppComputationAppState {
    commandIdToMetricState: Record<string, MetricState>;
}
