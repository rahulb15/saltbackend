// interfaces/booking/booking-update.interface.ts
type NestedPaths<T> = {
    [K in keyof T]: T[K] extends object
        ? `${string & K}.${string & keyof T[K]}`
        : K;
}[keyof T];

export type UpdateQuery<T> = {
    [K in NestedPaths<T>]?: any;
};
