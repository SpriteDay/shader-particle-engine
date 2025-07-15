export type TypedArrayConstructor =
    | typeof Int8Array
    | typeof Uint8Array
    | typeof Uint8ClampedArray
    | typeof Int16Array
    | typeof Uint16Array
    | typeof Int32Array
    | typeof Uint32Array
    | typeof Float32Array
    | typeof Float64Array

export type TypedArray = InstanceType<TypedArrayConstructor>
