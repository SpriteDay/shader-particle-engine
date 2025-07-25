import * as THREE from "three"
import { ShaderAttribute } from "../helpers/ShaderAttribute"

type TypeMap = {
    boolean: boolean
    string: string
    number: number
    object: object
}

type TypeString = keyof TypeMap

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Constructor<T = object> = new (...args: any[]) => T

type EnsureArrayTypedArg = {
    <T extends TypeString>(
        arg: unknown[],
        type: T,
        defaultValue: TypeMap[T][],
    ): TypeMap[T][]
    <T extends TypeString>(
        arg: unknown,
        type: T,
        defaultValue: TypeMap[T],
    ): TypeMap[T]
}

type EnsureArrayInstanceOf = {
    <T extends object>(
        arg: unknown[],
        instance: Constructor<T>,
        defaultValue: T[],
    ): T[]
    <T extends object>(
        arg: unknown,
        instance: Constructor<T>,
        defaultValue: T,
    ): T
}

/**
 * A bunch of utility functions used throughout the library.
 * @namespace
 * @type {Object}
 */
export const utils = {
    /**
     * A map of types used by `utils.ensureTypedArg` and
     * `utils.ensureArrayTypedArg` to compare types against.
     *
     * @enum {String}
     */
    types: {
        /**
         * Boolean type.
         * @type {String}
         */
        BOOLEAN: "boolean",

        /**
         * String type.
         * @type {String}
         */
        STRING: "string",

        /**
         * Number type.
         * @type {String}
         */
        NUMBER: "number",

        /**
         * Object type.
         * @type {String}
         */
        OBJECT: "object",
    } as const,

    /**
     * Given a value, a type, and a default value to fallback to,
     * ensure the given argument adheres to the type requesting,
     * returning the default value if type check is false.
     *
     * @param  {(boolean|string|number|object)} arg          The value to perform a type-check on.
     * @param  {String} type         The type the `arg` argument should adhere to.
     * @param  {(boolean|string|number|object)} defaultValue A default value to fallback on if the type check fails.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */
    ensureTypedArg: function <T extends TypeString>(
        arg: unknown,
        type: T,
        defaultValue: TypeMap[T],
    ): TypeMap[T] {
        "use strict"

        if (typeof arg === type) {
            return arg as TypeMap[T]
        } else {
            return defaultValue
        }
    },

    /**
     * Given an array of values, a type, and a default value,
     * ensure the given array's contents ALL adhere to the provided type,
     * returning the default value if type check fails.
     *
     * If the given value to check isn't an Array, delegates to utils.ensureTypedArg.
     *
     * @param  {Array|boolean|string|number|object} arg          The array of values to check type of.
     * @param  {String} type         The type that should be adhered to.
     * @param  {(boolean|string|number|object)} defaultValue A default fallback value.
     * @return {(boolean|string|number|object)}              The given value if type check passes, or the default value if it fails.
     */
    ensureArrayTypedArg: function <T extends TypeString>(
        arg: unknown,
        type: T,
        defaultValue: TypeMap[T] | TypeMap[T][],
    ): TypeMap[T] | TypeMap[T][] {
        "use strict"

        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if (Array.isArray(arg)) {
            for (var i = arg.length - 1; i >= 0; --i) {
                if (typeof arg[i] !== type) {
                    return defaultValue as TypeMap[T][]
                }
            }

            return arg as TypeMap[T][]
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return utils.ensureTypedArg(arg, type, defaultValue as TypeMap[T])
    } as EnsureArrayTypedArg,

    /**
     * Ensures the given value is an instance of a constructor function.
     *
     * @param  {Object} arg          The value to check instance of.
     * @param  {Function} instance     The constructor of the instance to check against.
     * @param  {Object} defaultValue A default fallback value if instance check fails
     * @return {Object}              The given value if type check passes, or the default value if it fails.
     */
    ensureInstanceOf: function <T>(
        arg: unknown,
        instance: Constructor<T> | undefined,
        defaultValue: T,
    ): T {
        "use strict"

        if (instance !== undefined && arg instanceof instance) {
            return arg
        } else {
            return defaultValue
        }
    },

    /**
     * Given an array of values, ensure the instances of all items in the array
     * matches the given instance constructor falling back to a default value if
     * the check fails.
     *
     * If given value isn't an Array, delegates to `utils.ensureInstanceOf`.
     *
     * @param  {Array|Object} arg          The value to perform the instanceof check on.
     * @param  {Function} instance     The constructor of the instance to check against.
     * @param  {Object} defaultValue A default fallback value if instance check fails
     * @return {Object}              The given value if type check passes, or the default value if it fails.
     */
    ensureArrayInstanceOf: function <T extends object>(
        arg: unknown,
        instance: Constructor<T>,
        defaultValue: T | T[],
    ): T | T[] {
        "use strict"

        // If the argument being checked is an array, loop through
        // it and ensure all the values are of the correct type,
        // falling back to the defaultValue if any aren't.
        if (Array.isArray(arg)) {
            for (var i = arg.length - 1; i >= 0; --i) {
                if (instance !== undefined && !(arg[i] instanceof instance)) {
                    return defaultValue as T[]
                }
            }

            return arg as T[]
        }

        // If the arg isn't an array then just fallback to
        // checking the type.
        return utils.ensureInstanceOf(arg, instance, defaultValue as T)
    } as EnsureArrayInstanceOf,

    /**
     * Ensures that any "value-over-lifetime" properties of an emitter are
     * of the correct length (as dictated by `SPE.valueOverLifetimeLength`).
     *
     * Delegates to `utils.interpolateArray` for array resizing.
     *
     * If properties aren't arrays, then property values are put into one.
     *
     * @param  {Object} property  The property of an SPE.Emitter instance to check compliance of.
     * @param  {Number} minLength The minimum length of the array to create.
     * @param  {Number} maxLength The maximum length of the array to create.
     */
    ensureValueOverLifetimeCompliance: function (
        property: {
            _value?: unknown[]
            _spread?: unknown[]
        },
        minLength: number,
        maxLength: number,
    ) {
        "use strict"

        minLength = minLength || 3
        maxLength = maxLength || 3

        // First, ensure both properties are arrays.
        if (Array.isArray(property._value) === false) {
            property._value = [property._value]
        }

        if (Array.isArray(property._spread) === false) {
            property._spread = [property._spread]
        }

        var valueLength = utils.clamp(
                property._value.length,
                minLength,
                maxLength,
            ),
            spreadLength = utils.clamp(
                property._spread.length,
                minLength,
                maxLength,
            ),
            desiredLength = Math.max(valueLength, spreadLength)

        if (property._value.length !== desiredLength) {
            property._value = this.interpolateArray(
                property._value,
                desiredLength,
            )
        }

        if (property._spread.length !== desiredLength) {
            property._spread = this.interpolateArray(
                property._spread,
                desiredLength,
            )
        }
    },

    /**
     * Performs linear interpolation (lerp) on an array.
     *
     * For example, lerping [1, 10], with a `newLength` of 10 will produce [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
     *
     * Delegates to `utils.lerpTypeAgnostic` to perform the actual
     * interpolation.
     *
     * @param  {Array} srcArray  The array to lerp.
     * @param  {Number} newLength The length the array should be interpolated to.
     * @return {Array}           The interpolated array.
     */
    interpolateArray: function <T>(srcArray: T[], newLength: number): T[] {
        "use strict"

        var sourceLength = srcArray.length,
            newArray = [
                typeof (srcArray[0] as any).clone === "function"
                    ? (srcArray[0] as any).clone()
                    : srcArray[0],
            ],
            factor = (sourceLength - 1) / (newLength - 1)

        for (var i = 1; i < newLength - 1; ++i) {
            var f = i * factor,
                before = Math.floor(f),
                after = Math.ceil(f),
                delta = f - before

            newArray[i] = this.lerpTypeAgnostic(
                srcArray[before],
                srcArray[after],
                delta,
            )
        }

        newArray.push(
            typeof (srcArray[sourceLength - 1] as any).clone === "function"
                ? (srcArray[sourceLength - 1] as any).clone()
                : srcArray[sourceLength - 1],
        )

        return newArray
    },

    /**
     * Clamp a number to between the given min and max values.
     * @param  {Number} value The number to clamp.
     * @param  {Number} min   The minimum value.
     * @param  {Number} max   The maximum value.
     * @return {Number}       The clamped number.
     */
    clamp: function (value: number, min: number, max: number) {
        "use strict"

        return Math.max(min, Math.min(value, max))
    },

    /**
     * If the given value is less than the epsilon value, then return
     * a randomised epsilon value if specified, or just the epsilon value if not.
     * Works for negative numbers as well as positive.
     *
     * @param  {Number} value     The value to perform the operation on.
     * @param  {Boolean} randomise Whether the value should be randomised.
     * @return {Number}           The result of the operation.
     */
    zeroToEpsilon: function (value: number, randomise?: boolean) {
        "use strict"

        var epsilon = 0.00001,
            result = value

        result = randomise ? Math.random() * epsilon * 10 : epsilon

        if (value < 0 && value > -epsilon) {
            result = -result
        }

        // if ( value === 0 ) {
        //     result = randomise ? Math.random() * epsilon * 10 : epsilon;
        // }
        // else if ( value > 0 && value < epsilon ) {
        //     result = randomise ? Math.random() * epsilon * 10 : epsilon;
        // }
        // else if ( value < 0 && value > -epsilon ) {
        //     result = -( randomise ? Math.random() * epsilon * 10 : epsilon );
        // }

        return result
    },

    /**
     * Linearly interpolates two values of various types. The given values
     * must be of the same type for the interpolation to work.
     * @param  {(number|Object)} start The start value of the lerp.
     * @param  {(number|object)} end   The end value of the lerp.
     * @param  {Number} delta The delta posiiton of the lerp operation. Ideally between 0 and 1 (inclusive).
     * @return {(number|object|undefined)}       The result of the operation. Result will be undefined if
     *                                               the start and end arguments aren't a supported type, or
     *                                               if their types do not match.
     */
    lerpTypeAgnostic: function (
        start:
            | number
            | THREE.Vector2
            | THREE.Vector3
            | THREE.Vector4
            | THREE.Color
            | unknown,
        end:
            | number
            | THREE.Vector2
            | THREE.Vector3
            | THREE.Vector4
            | THREE.Color
            | unknown,
        delta: number,
    ) {
        "use strict"

        var out

        if (typeof start === "number" && typeof end === "number") {
            return start + (end - start) * delta
        } else if (
            start instanceof THREE.Vector2 &&
            end instanceof THREE.Vector2
        ) {
            out = start.clone()
            out.x = utils.lerp(start.x, end.x, delta)
            out.y = utils.lerp(start.y, end.y, delta)
            return out
        } else if (
            start instanceof THREE.Vector3 &&
            end instanceof THREE.Vector3
        ) {
            out = start.clone()
            out.x = utils.lerp(start.x, end.x, delta)
            out.y = utils.lerp(start.y, end.y, delta)
            out.z = utils.lerp(start.z, end.z, delta)
            return out
        } else if (
            start instanceof THREE.Vector4 &&
            end instanceof THREE.Vector4
        ) {
            out = start.clone()
            out.x = utils.lerp(start.x, end.x, delta)
            out.y = utils.lerp(start.y, end.y, delta)
            out.z = utils.lerp(start.z, end.z, delta)
            out.w = utils.lerp(start.w, end.w, delta)
            return out
        } else if (start instanceof THREE.Color && end instanceof THREE.Color) {
            out = start.clone()
            out.r = utils.lerp(start.r, end.r, delta)
            out.g = utils.lerp(start.g, end.g, delta)
            out.b = utils.lerp(start.b, end.b, delta)
            return out
        } else {
            console.warn(
                "Invalid argument types, or argument types do not match:",
                start,
                end,
            )
        }
    },

    /**
     * Perform a linear interpolation operation on two numbers.
     * @param  {Number} start The start value.
     * @param  {Number} end   The end value.
     * @param  {Number} delta The position to interpolate to.
     * @return {Number}       The result of the lerp operation.
     */
    lerp: function (start: number, end: number, delta: number) {
        "use strict"
        return start + (end - start) * delta
    },

    /**
     * Rounds a number to a nearest multiple.
     *
     * @param  {Number} n        The number to round.
     * @param  {Number} multiple The multiple to round to.
     * @return {Number}          The result of the round operation.
     */
    roundToNearestMultiple: function (n: number, multiple: number) {
        "use strict"

        var remainder = 0

        if (multiple === 0) {
            return n
        }

        remainder = Math.abs(n) % multiple

        if (remainder === 0) {
            return n
        }

        if (n < 0) {
            return -(Math.abs(n) - remainder)
        }

        return n + multiple - remainder
    },

    /**
     * Check if all items in an array are equal. Uses strict equality.
     *
     * @param  {Array} array The array of values to check equality of.
     * @return {Boolean}       Whether the array's values are all equal or not.
     */
    arrayValuesAreEqual: function (array: unknown[]) {
        "use strict"

        for (var i = 0; i < array.length - 1; ++i) {
            if (array[i] !== array[i + 1]) {
                return false
            }
        }

        return true
    },

    // colorsAreEqual: function() {
    //     var colors = Array.prototype.slice.call( arguments ),
    //         numColors = colors.length;

    //     for ( var i = 0, color1, color2; i < numColors - 1; ++i ) {
    //         color1 = colors[ i ];
    //         color2 = colors[ i + 1 ];

    //         if (
    //             color1.r !== color2.r ||
    //             color1.g !== color2.g ||
    //             color1.b !== color2.b
    //         ) {
    //             return false
    //         }
    //     }

    //     return true;
    // },

    /**
     * Given a start value and a spread value, create and return a random
     * number.
     * @param  {Number} base   The start value.
     * @param  {Number} spread The size of the random variance to apply.
     * @return {Number}        A randomised number.
     */
    randomFloat: function (base: number, spread: number) {
        "use strict"
        return base + spread * (Math.random() - 0.5)
    },

    /**
     * Given an ShaderAttribute instance, and various other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base        THREE.Vector3 instance describing the start value.
     * @param  {Object} spread      THREE.Vector3 instance describing the random variance to apply to the start value.
     * @param  {Object} spreadClamp THREE.Vector3 instance describing the multiples to clamp the randomness to.
     */
    randomVector3: function (
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        spread: THREE.Vector3,
        spreadClamp?: THREE.Vector3,
    ) {
        "use strict"

        var x = base.x + (Math.random() * spread.x - spread.x * 0.5),
            y = base.y + (Math.random() * spread.y - spread.y * 0.5),
            z = base.z + (Math.random() * spread.z - spread.z * 0.5)

        // var x = this.randomFloat( base.x, spread.x ),
        // y = this.randomFloat( base.y, spread.y ),
        // z = this.randomFloat( base.z, spread.z );

        if (spreadClamp) {
            x =
                -spreadClamp.x * 0.5 +
                this.roundToNearestMultiple(x, spreadClamp.x)
            y =
                -spreadClamp.y * 0.5 +
                this.roundToNearestMultiple(y, spreadClamp.y)
            z =
                -spreadClamp.z * 0.5 +
                this.roundToNearestMultiple(z, spreadClamp.z)
        }

        attribute.typedArray?.setVec3Components(index, x, y, z)
    },

    /**
     * Given an SPE.Shader attribute instance, and various other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
     */
    randomColor: function (
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Color,
        spread: THREE.Vector3,
    ) {
        "use strict"

        var r = base.r + Math.random() * spread.x,
            g = base.g + Math.random() * spread.y,
            b = base.b + Math.random() * spread.z

        r = this.clamp(r, 0, 1)
        g = this.clamp(g, 0, 1)
        b = this.clamp(b, 0, 1)

        attribute.typedArray?.setVec3Components(index, r, g, b)
    },

    randomColorAsHex: (function () {
        "use strict"

        var workingColor = new THREE.Color()

        /**
         * Assigns a random color value, encoded as a hex value in decimal
         * format, to a ShaderAttribute instance.
         * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
         * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
         * @param  {Object} base      THREE.Color instance describing the start color.
         * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
         */
        return function (
            attribute: ShaderAttribute,
            index: number,
            base: THREE.Color[],
            spread: THREE.Vector3[],
        ) {
            var numItems = base.length,
                colors = []

            for (var i = 0; i < numItems; ++i) {
                var spreadVector = spread[i]

                workingColor.copy(base[i])

                workingColor.r +=
                    Math.random() * spreadVector.x - spreadVector.x * 0.5
                workingColor.g +=
                    Math.random() * spreadVector.y - spreadVector.y * 0.5
                workingColor.b +=
                    Math.random() * spreadVector.z - spreadVector.z * 0.5

                workingColor.r = utils.clamp(workingColor.r, 0, 1)
                workingColor.g = utils.clamp(workingColor.g, 0, 1)
                workingColor.b = utils.clamp(workingColor.b, 0, 1)

                colors.push(workingColor.getHex())
            }

            attribute.typedArray?.setVec4Components(
                index,
                colors[0],
                colors[1],
                colors[2],
                colors[3],
            )
        }
    })(),

    /**
     * Given an ShaderAttribute instance, and various other settings,
     * assign values to the attribute's array in a `vec3` format.
     *
     * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
     * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} start       THREE.Vector3 instance describing the start line position.
     * @param  {Object} end         THREE.Vector3 instance describing the end line position.
     */
    randomVector3OnLine: function (
        attribute: ShaderAttribute,
        index: number,
        start: THREE.Vector3,
        end: THREE.Vector3,
    ) {
        "use strict"
        var pos = start.clone()

        pos.lerp(end, Math.random())

        attribute.typedArray?.setVec3Components(index, pos.x, pos.y, pos.z)
    },

    /**
     * Given an SPE.Shader attribute instance, and various other settings,
     * assign Color values to the attribute.
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base      THREE.Color instance describing the start color.
     * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
     */

    /**
     * Assigns a random vector 3 value to an ShaderAttribute instance, projecting the
     * given values onto a sphere.
     *
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
     * @param  {Number} radius            The radius of the sphere to project onto.
     * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
     * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the sphere.
     * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
     */
    randomVector3OnSphere: function (
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        radius: number,
        radiusSpread: number,
        radiusScale: THREE.Vector3,
        radiusSpreadClamp: number,
        _distributionClamp?: number,
    ) {
        "use strict"

        var depth = 2 * Math.random() - 1,
            t = 6.2832 * Math.random(),
            r = Math.sqrt(1 - depth * depth),
            rand = this.randomFloat(radius, radiusSpread),
            x = 0,
            y = 0,
            z = 0

        if (radiusSpreadClamp) {
            rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp
        }

        // Set position on sphere
        x = r * Math.cos(t) * rand
        y = r * Math.sin(t) * rand
        z = depth * rand

        // Apply radius scale to this position
        x *= radiusScale.x
        y *= radiusScale.y
        z *= radiusScale.z

        // Translate to the base position.
        x += base.x
        y += base.y
        z += base.z

        // Set the values in the typed array.
        attribute.typedArray?.setVec3Components(index, x, y, z)
    },

    seededRandom: function (seed: number) {
        var x = Math.sin(seed) * 10000
        return x - (x | 0)
    },

    /**
     * Assigns a random vector 3 value to an ShaderAttribute instance, projecting the
     * given values onto a 2d-disc.
     *
     * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
     * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
     * @param  {Object} base              THREE.Vector3 instance describing the origin of the transform.
     * @param  {Number} radius            The radius of the sphere to project onto.
     * @param  {Number} radiusSpread      The amount of randomness to apply to the projection result
     * @param  {Object} radiusScale       THREE.Vector3 instance describing the scale of each axis of the disc. The z-component is ignored.
     * @param  {Number} radiusSpreadClamp What numeric multiple the projected value should be clamped to.
     */
    randomVector3OnDisc: function (
        attribute: ShaderAttribute,
        index: number,
        base: THREE.Vector3,
        radius: number,
        radiusSpread: number,
        radiusScale: THREE.Vector3,
        radiusSpreadClamp: number,
    ) {
        "use strict"

        var t = 6.2832 * Math.random(),
            rand = Math.abs(this.randomFloat(radius, radiusSpread)),
            x = 0,
            y = 0,
            z = 0

        if (radiusSpreadClamp) {
            rand = Math.round(rand / radiusSpreadClamp) * radiusSpreadClamp
        }

        // Set position on sphere
        x = Math.cos(t) * rand
        y = Math.sin(t) * rand

        // Apply radius scale to this position
        x *= radiusScale.x
        y *= radiusScale.y

        // Translate to the base position.
        x += base.x
        y += base.y
        z += base.z

        // Set the values in the typed array.
        attribute.typedArray?.setVec3Components(index, x, y, z)
    },

    randomDirectionVector3OnSphere: (function () {
        "use strict"

        var v = new THREE.Vector3()

        /**
         * Given an ShaderAttribute instance, create a direction vector from the given
         * position, using `speed` as the magnitude. Values are saved to the attribute.
         *
         * @param  {Object} attribute       The instance of ShaderAttribute to save the result to.
         * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
         * @param  {Number} posX            The particle's x coordinate.
         * @param  {Number} posY            The particle's y coordinate.
         * @param  {Number} posZ            The particle's z coordinate.
         * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
         * @param  {Number} speed           The magnitude to apply to the vector.
         * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
         */
        return function (
            attribute: ShaderAttribute,
            index: number,
            posX: number,
            posY: number,
            posZ: number,
            emitterPosition: THREE.Vector3,
            speed: number,
            speedSpread: number,
        ) {
            v.copy(emitterPosition)

            v.x -= posX
            v.y -= posY
            v.z -= posZ

            v.normalize().multiplyScalar(-utils.randomFloat(speed, speedSpread))

            attribute.typedArray?.setVec3Components(index, v.x, v.y, v.z)
        }
    })(),

    randomDirectionVector3OnDisc: (function () {
        "use strict"

        var v = new THREE.Vector3()

        /**
         * Given an ShaderAttribute instance, create a direction vector from the given
         * position, using `speed` as the magnitude. Values are saved to the attribute.
         *
         * @param  {Object} attribute       The instance of ShaderAttribute to save the result to.
         * @param  {Number} index           The offset in the attribute's TypedArray to save the result from.
         * @param  {Number} posX            The particle's x coordinate.
         * @param  {Number} posY            The particle's y coordinate.
         * @param  {Number} posZ            The particle's z coordinate.
         * @param  {Object} emitterPosition THREE.Vector3 instance describing the emitter's base position.
         * @param  {Number} speed           The magnitude to apply to the vector.
         * @param  {Number} speedSpread     The amount of randomness to apply to the magnitude.
         */
        return function (
            attribute: ShaderAttribute,
            index: number,
            posX: number,
            posY: number,
            posZ: number,
            emitterPosition: THREE.Vector3,
            speed: number,
            speedSpread: number,
        ) {
            v.copy(emitterPosition)

            v.x -= posX
            v.y -= posY
            v.z -= posZ

            v.normalize().multiplyScalar(-utils.randomFloat(speed, speedSpread))

            attribute.typedArray?.setVec3Components(index, v.x, v.y, 0)
        }
    })(),

    getPackedRotationAxis: (function () {
        "use strict"

        var v = new THREE.Vector3(),
            vSpread = new THREE.Vector3(),
            c = new THREE.Color(),
            addOne = new THREE.Vector3(1, 1, 1)

        /**
         * Given a rotation axis, and a rotation axis spread vector,
         * calculate a randomised rotation axis, and pack it into
         * a hexadecimal value represented in decimal form.
         * @param  {Object} axis       THREE.Vector3 instance describing the rotation axis.
         * @param  {Object} axisSpread THREE.Vector3 instance describing the amount of randomness to apply to the rotation axis.
         * @return {Number}            The packed rotation axis, with randomness.
         */
        return function (axis: THREE.Vector3, axisSpread: THREE.Vector3) {
            v.copy(axis).normalize()
            vSpread.copy(axisSpread).normalize()

            v.x += -axisSpread.x * 0.5 + Math.random() * axisSpread.x
            v.y += -axisSpread.y * 0.5 + Math.random() * axisSpread.y
            v.z += -axisSpread.z * 0.5 + Math.random() * axisSpread.z

            // v.x = Math.abs( v.x );
            // v.y = Math.abs( v.y );
            // v.z = Math.abs( v.z );

            v.normalize().add(addOne).multiplyScalar(0.5)

            c.setRGB(v.x, v.y, v.z)

            return c.getHex()
        }
    })(),
}
