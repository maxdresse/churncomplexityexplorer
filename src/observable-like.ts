export interface ObservableLike<T> {
    subscribe(cb: (v: T) => void): { unsubscribe: () => void }
}