/**
 * a metric for regular (=non-directory) files
 */
export interface RegularFileMetric {

    init?(): Promise<void>;
    getValue(path: string): number;

}