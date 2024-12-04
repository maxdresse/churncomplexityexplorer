/**
 * a metric for regular (=non-directory) files
 */
export interface RegularFileMetric {

    getValue(path: string): number;

}