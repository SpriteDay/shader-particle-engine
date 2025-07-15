import { distributions } from "./constants"
import * as THREE from "three"
import { type ShaderAttribute } from "./helpers/ShaderAttribute"

// A generic type for a single uniform

export type ShaderAttributType = keyof typeof ShaderAttribute.typeSizeMap
export type UniformType = ShaderAttributType | "t"

export type Uniform<T extends UniformType> = T extends "f"
    ? number
    : T extends "t"
      ? THREE.Texture
      : T extends "v2"
        ? THREE.Vector2
        : T extends "v3"
          ? THREE.Vector3
          : T extends "v4"
            ? THREE.Vector4
            : T extends "c"
              ? THREE.Color
              : T extends "m3"
                ? THREE.Matrix3
                : T extends "m4"
                  ? THREE.Matrix4
                  : never

export type UniformEntry = {
    [T in UniformType]: {
        type: T
        value: Uniform<T> | null
    }
}[UniformType]

export type Uniforms = Record<string, UniformEntry>

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

export type Distribution = (typeof distributions)[keyof typeof distributions]

export type WithGetters<T> = T & {
    [K in keyof T as K extends `_${infer P}` ? P : never]?: T[K]
}
