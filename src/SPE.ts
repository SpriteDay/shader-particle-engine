/**
 * @typedef {Number} distribution
 * @property {Number} distributions.BOX Values will be distributed within a box.
 * @property {Number} distributions.SPHERE Values will be distributed within a sphere.
 * @property {Number} distributions.DISC Values will be distributed within a 2D disc.
 */

import { distributions, valueOverLifetimeLength } from "./constants"
import { shaderChunks } from "./shaders/shaderChunks"
import { shaders } from "./shaders/shaders"
import { Emitter } from "./core/Emitter"
import { Group } from "./core/Group"
import { utils } from "./core/utils"
import { ShaderAttribute } from "./helpers/ShaderAttribute"
import { TypedArrayHelper } from "./helpers/TypedArrayHelper"

/**
 * Namespace for Shader Particle Engine.
 *
 * All SPE-related code sits under this namespace.
 *
 * @type {Object}
 * @namespace
 */
const SPE = {
    distributions,
    valueOverLifetimeLength,
    shaderChunks,
    shaders,
    Emitter,
    Group,
    utils,
    ShaderAttribute,
    TypedArrayHelper,
}

export default SPE
