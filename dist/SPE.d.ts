import { Color } from 'three';
import * as THREE_2 from 'three';
import { Vector2 } from 'three';
import { Vector3 } from 'three';
import { Vector4 } from 'three';

declare type Distribution = (typeof distributions)[keyof typeof distributions];

/**
 * A map of supported distribution types used
 * by SPE.Emitter instances.
 *
 * These distribution types can be applied to
 * an emitter globally, which will affect the
 * `position`, `velocity`, and `acceleration`
 * value calculations for an emitter, or they
 * can be applied on a per-property basis.
 *
 * @enum {Number}
 */
declare const distributions: {
    /**
     * Values will be distributed within a box.
     * @type {Number}
     */
    BOX: number;
    /**
     * Values will be distributed on a sphere.
     * @type {Number}
     */
    SPHERE: number;
    /**
     * Values will be distributed on a 2d-disc shape.
     * @type {Number}
     */
    DISC: number;
    /**
     * Values will be distributed along a line.
     * @type {Number}
     */
    LINE: number;
};

declare class Emitter {
    uuid: string;
    type: Distribution;
    position: WithGetters<{
        _value: THREE_2.Vector3;
        _spread: THREE_2.Vector3;
        _spreadClamp: THREE_2.Vector3;
        _distribution: Distribution;
        _randomise: boolean;
        _radius: number;
        _radiusScale: THREE_2.Vector3;
        _distributionClamp: number;
    }>;
    velocity: WithGetters<{
        _value: THREE_2.Vector3;
        _spread: THREE_2.Vector3;
        _distribution: Distribution;
        _randomise: boolean;
    }>;
    acceleration: WithGetters<{
        _value: THREE_2.Vector3;
        _spread: THREE_2.Vector3;
        _distribution: Distribution;
        _randomise: boolean;
    }>;
    drag: WithGetters<{
        _value: number;
        _spread: number;
        _randomise: boolean;
    }>;
    wiggle: WithGetters<{
        _value: number;
        _spread: number;
    }>;
    rotation: WithGetters<{
        _axis: THREE_2.Vector3;
        _axisSpread: THREE_2.Vector3;
        _angle: number;
        _angleSpread: number;
        _static: boolean;
        _center: THREE_2.Vector3;
        _randomise: boolean;
    }>;
    maxAge: WithGetters<{
        _value: number;
        _spread: number;
    }>;
    color: WithGetters<{
        _value: THREE_2.Color | THREE_2.Color[];
        _spread: THREE_2.Vector3 | THREE_2.Vector3[];
        _randomise: boolean;
    }>;
    opacity: WithGetters<{
        _value: number | number[];
        _spread: number | number[];
        _randomise: boolean;
    }>;
    size: WithGetters<{
        _value: number | number[];
        _spread: number | number[];
        _randomise: boolean;
    }>;
    angle: WithGetters<{
        _value: number | number[];
        _spread: number | number[];
        _randomise: boolean;
    }>;
    particleCount: number;
    duration: number | null;
    isStatic: boolean;
    activeMultiplier: number;
    direction: number;
    alive: boolean;
    particlesPerSecond: number;
    activationIndex: number;
    attributeOffset: number;
    attributeEnd: number;
    age: number;
    activeParticleCount: number;
    group: Group | null;
    attributes: Group["attributes"] | null;
    paramsArray: TypedArray | null | undefined;
    resetFlags: {
        position: boolean;
        velocity: boolean;
        acceleration: boolean;
        rotation: boolean;
        rotationCenter: boolean;
        size: boolean;
        color: boolean;
        opacity: boolean;
        angle: boolean;
    };
    updateFlags: Record<string, boolean>;
    updateCounts: Record<string, number>;
    updateMap: Record<string, string>;
    attributeKeys: (keyof Group["attributes"])[] | null;
    attributeCount: number;
    bufferUpdateRanges: {
        [K in keyof Group["attributes"]]?: {
            min: number;
            max: number;
        };
    };
    activationEnd?: number;
    /**
     * The SPE.Emitter class.
     *
     * @constructor
     *
     * @param {EmitterOptions} options A map of options to configure the emitter.
     */
    constructor(options?: EmitterOptions);
    _createGetterSetters(propObj: any, propName: string): void;
    _setBufferUpdateRanges(keys: (keyof Group["attributes"])[]): void;
    _calculatePPSValue(groupMaxAge: number): void;
    _setAttributeOffset(startIndex: number): void;
    _assignValue(prop: keyof typeof Emitter.updateMap, index: number): void;
    _assignPositionValue(index: number): void;
    _assignForceValue(index: number, attrName: keyof typeof Emitter.updateMap): void;
    _assignAbsLifetimeValue(index: number, propName: keyof typeof Emitter.updateMap): void;
    _assignAngleValue(index: number): void;
    _assignParamsValue(index: number): void;
    _assignRotationValue(index: number): void;
    _assignColorValue(index: number): void;
    _resetParticle(index: number): void;
    _updateAttributeUpdateRange(attr: keyof Group["attributes"], i: number): void;
    _resetBufferRanges(): void;
    _onRemove(): void;
    _decrementParticleCount(): void;
    _incrementParticleCount(): void;
    _checkParticleAges(start: number, end: number, params: number[], dt: number): void;
    _activateParticles(activationStart: number, activationEnd: number, params: number[], dtPerParticle: number): void;
    /**
     * Simulates one frame's worth of particles, updating particles
     * that are already alive, and marking ones that are currently dead
     * but should be alive as alive.
     *
     * If the emitter is marked as static, then this function will do nothing.
     *
     * @param  {Number} dt The number of seconds to simulate (deltaTime)
     */
    tick(dt: number): void;
    /**
     * Resets all the emitter's particles to their start positions
     * and marks the particles as dead if the `force` argument is
     * true.
     *
     * @param  {Boolean} [force=undefined] If true, all particles will be marked as dead instantly.
     * @return {Emitter}       This emitter instance.
     */
    reset(force?: boolean): this;
    /**
     * Enables the emitter. If not already enabled, the emitter
     * will start emitting particles.
     *
     * @return {Emitter} This emitter instance.
     */
    enable(): this;
    /**
     * Disables th emitter, but does not instantly remove it's
     * particles fromt the scene. When called, the emitter will be
     * 'switched off' and just stop emitting. Any particle's alive will
     * be allowed to finish their lifecycle.
     *
     * @return {Emitter} This emitter instance.
     */
    disable(): this;
    /**
     * Remove this emitter from it's parent group (if it has been added to one).
     * Delgates to SPE.group.prototype.removeEmitter().
     *
     * When called, all particle's belonging to this emitter will be instantly
     * removed from the scene.
     *
     * @return {Emitter} This emitter instance.
     *
     * @see SPE.Group.prototype.removeEmitter
     */
    remove(): this;
}

/**
 * An SPE.Emitter instance.
 *  {Object} Emitter
 * @see SPE.Emitter
 */
/**
 * A map of options to configure an SPE.Emitter instance.
 *
 * {Object} EmitterOptions
 *
 * @property {distribution} [type=BOX] The default distribution this emitter should use to control
 *                         its particle's spawn position and force behaviour.
 *                         Must be an distributions.* value.
 *
 *
 * @property {Number} [particleCount=100] The total number of particles this emitter will hold. NOTE: this is not the number
 *                                  of particles emitted in a second, or anything like that. The number of particles
 *                                  emitted per-second is calculated by particleCount / maxAge (approximately!)
 *
 * @property {Number|null} [duration=null] The duration in seconds that this emitter should live for. If not specified, the emitter
 *                                         will emit particles indefinitely.
 *                                         NOTE: When an emitter is older than a specified duration, the emitter is NOT removed from
 *                                         it's group, but rather is just marked as dead, allowing it to be reanimated at a later time
 *                                         using `SPE.Emitter.prototype.enable()`.
 *
 * @property {Boolean} [isStatic=false] Whether this emitter should be not be simulated (true).
 * @property {Boolean} [activeMultiplier=1] A value between 0 and 1 describing what percentage of this emitter's particlesPerSecond should be
 *                                          emitted, where 0 is 0%, and 1 is 100%.
 *                                          For example, having an emitter with 100 particles, a maxAge of 2, yields a particlesPerSecond
 *                                          value of 50. Setting `activeMultiplier` to 0.5, then, will only emit 25 particles per second (0.5 = 50%).
 *                                          Values greater than 1 will emulate a burst of particles, causing the emitter to run out of particles
 *                                          before it's next activation cycle.
 *
 * @property {Boolean} [direction=1] The direction of the emitter. If value is `1`, emitter will start at beginning of particle's lifecycle.
 *                                   If value is `-1`, emitter will start at end of particle's lifecycle and work it's way backwards.
 *
 * @property {Object} [maxAge={}] An object describing the particle's maximum age in seconds.
 * @property {Number} [maxAge.value=2] A number between 0 and 1 describing the amount of maxAge to apply to all particles.
 * @property {Number} [maxAge.spread=0] A number describing the maxAge variance on a per-particle basis.
 *
 *
 * @property {Object} [position={}] An object describing this emitter's position.
 * @property {Object} [position.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base position.
 * @property {Object} [position.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's position variance on a per-particle basis.
 *                                                          Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                          of this vector is used.
 *                                                          When using a LINE distribution, this value is the endpoint of the LINE.
 * @property {Object} [position.spreadClamp=new THREE.Vector3()] A THREE.Vector3 instance describing the numeric multiples the particle's should
 *                                                               be spread out over.
 *                                                               Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                               of this vector is used.
 *                                                               When using a LINE distribution, this property is ignored.
 * @property {Number} [position.radius=10] This emitter's base radius.
 * @property {Object} [position.radiusScale=new THREE.Vector3()] A THREE.Vector3 instance describing the radius's scale in all three axes. Allows a SPHERE or DISC to be squashed or stretched.
 * @property {distribution} [position.distribution=value of the `type` option.] A specific distribution to use when radiusing particles. Overrides the `type` option.
 * @property {Boolean} [position.randomise=false] When a particle is re-spawned, whether it's position should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [velocity={}] An object describing this particle velocity.
 * @property {Object} [velocity.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base velocity.
 * @property {Object} [velocity.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's velocity variance on a per-particle basis.
 *                                                          Note that when using a SPHERE or DISC distribution, only the x-component
 *                                                          of this vector is used.
 * @property {distribution} [velocity.distribution=value of the `type` option.] A specific distribution to use when calculating a particle's velocity. Overrides the `type` option.
 * @property {Boolean} [velocity.randomise=false] When a particle is re-spawned, whether it's velocity should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [acceleration={}] An object describing this particle's acceleration.
 * @property {Object} [acceleration.value=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's base acceleration.
 * @property {Object} [acceleration.spread=new THREE.Vector3()] A THREE.Vector3 instance describing this emitter's acceleration variance on a per-particle basis.
 *                           Note that when using a SPHERE or DISC distribution, only the x-component
 *                           of this vector is used.
 * @property {distribution} [acceleration.distribution=value of the `type` option.] A specific distribution to use when calculating a particle's acceleration. Overrides the `type` option.
 * @property {Boolean} [acceleration.randomise=false] When a particle is re-spawned, whether it's acceleration should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [drag={}] An object describing this particle drag. Drag is applied to both velocity and acceleration values.
 * @property {Number} [drag.value=0] A number between 0 and 1 describing the amount of drag to apply to all particles.
 * @property {Number} [drag.spread=0] A number describing the drag variance on a per-particle basis.
 * @property {Boolean} [drag.randomise=false] When a particle is re-spawned, whether it's drag should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [wiggle={}] This is quite a fun one! The values of this object will determine whether a particle will wiggle, or jiggle, or wave,
 *                                or shimmy, or waggle, or... Well you get the idea. The wiggle is calculated over-time, meaning that a particle will
 *                                start off with no wiggle, and end up wiggling about with the distance of the `value` specified by the time it dies.
 *                                It's quite handy to simulate fire embers, or similar effects where the particle's position should slightly change over
 *                                time, and such change isn't easily controlled by rotation, velocity, or acceleration. The wiggle is a combination of sin and cos calculations, so is circular in nature.
 * @property {Number} [wiggle.value=0] A number describing the amount of wiggle to apply to all particles. It's measured in distance.
 * @property {Number} [wiggle.spread=0] A number describing the wiggle variance on a per-particle basis.
 *
 *
 * @property {Object} [rotation={}] An object describing this emitter's rotation. It can either be static, or set to rotate from 0radians to the value of `rotation.value`
 *                                  over a particle's lifetime. Rotation values affect both a particle's position and the forces applied to it.
 * @property {Object} [rotation.axis=new THREE.Vector3(0, 1, 0)] A THREE.Vector3 instance describing this emitter's axis of rotation.
 * @property {Object} [rotation.axisSpread=new THREE.Vector3()] A THREE.Vector3 instance describing the amount of variance to apply to the axis of rotation on
 *                                                              a per-particle basis.
 * @property {Number} [rotation.angle=0] The angle of rotation, given in radians. If `rotation.static` is true, the emitter will start off rotated at this angle, and stay as such.
 *                                       Otherwise, the particles will rotate from 0radians to this value over their lifetimes.
 * @property {Number} [rotation.angleSpread=0] The amount of variance in each particle's rotation angle.
 * @property {Boolean} [rotation.static=false] Whether the rotation should be static or not.
 * @property {Object} [rotation.center=The value of `position.value`] A THREE.Vector3 instance describing the center point of rotation.
 * @property {Boolean} [rotation.randomise=false] When a particle is re-spawned, whether it's rotation should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [color={}] An object describing a particle's color. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of THREE.Color instances are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Object} [color.value=new THREE.Color()] Either a single THREE.Color instance, or an array of THREE.Color instances to describe the color of a particle over it's lifetime.
 * @property {Object} [color.spread=new THREE.Vector3()] Either a single THREE.Vector3 instance, or an array of THREE.Vector3 instances to describe the color variance of a particle over it's lifetime.
 * @property {Boolean} [color.randomise=false] When a particle is re-spawned, whether it's color should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [opacity={}] An object describing a particle's opacity. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Number} [opacity.value=1] Either a single number, or an array of numbers to describe the opacity of a particle over it's lifetime.
 * @property {Number} [opacity.spread=0] Either a single number, or an array of numbers to describe the opacity variance of a particle over it's lifetime.
 * @property {Boolean} [opacity.randomise=false] When a particle is re-spawned, whether it's opacity should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [size={}] An object describing a particle's size. This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Number} [size.value=1] Either a single number, or an array of numbers to describe the size of a particle over it's lifetime.
 * @property {Number} [size.spread=0] Either a single number, or an array of numbers to describe the size variance of a particle over it's lifetime.
 * @property {Boolean} [size.randomise=false] When a particle is re-spawned, whether it's size should be re-randomised or not. Can incur a performance hit.
 *
 *
 * @property {Object} [angle={}] An object describing a particle's angle. The angle is a 2d-rotation, measured in radians, applied to the particle's texture.
 *                               NOTE: if a particle's texture is a sprite-sheet, this value IS IGNORED.
 *                               This property is a "value-over-lifetime" property, meaning an array of values and spreads can be
 *                               given to describe specific value changes over a particle's lifetime.
 *                               Depending on the value of SPE.valueOverLifetimeLength, if arrays of numbers are given, then the array will be interpolated to
 *                               have a length matching the value of SPE.valueOverLifetimeLength.
 * @property {Number} [angle.value=0] Either a single number, or an array of numbers to describe the angle of a particle over it's lifetime.
 * @property {Number} [angle.spread=0] Either a single number, or an array of numbers to describe the angle variance of a particle over it's lifetime.
 * @property {Boolean} [angle.randomise=false] When a particle is re-spawned, whether it's angle should be re-randomised or not. Can incur a performance hit.
 *
 */
declare type EmitterOptions = {
    type?: Distribution;
    distribution?: Distribution;
    particleCount?: number;
    duration?: number | null;
    isStatic?: boolean;
    activeMultiplier?: number;
    direction?: number;
    maxAge?: {
        value?: number;
        spread?: number;
    };
    position?: {
        value?: THREE_2.Vector3;
        spread?: THREE_2.Vector3;
        spreadClamp?: THREE_2.Vector3;
        radius?: number;
        radiusScale?: THREE_2.Vector3;
        distribution?: Distribution;
        distributionClamp?: number;
        randomise?: boolean;
    };
    velocity?: {
        value?: THREE_2.Vector3;
        spread?: THREE_2.Vector3;
        distribution?: Distribution;
        randomise?: boolean;
    };
    acceleration?: {
        value?: THREE_2.Vector3;
        spread?: THREE_2.Vector3;
        distribution?: Distribution;
        randomise?: boolean;
    };
    radius?: {
        value?: number;
        spread?: number;
        randomise?: boolean;
    };
    drag?: {
        value?: number;
        spread?: number;
        randomise?: boolean;
    };
    wiggle?: {
        value?: number;
        spread?: number;
    };
    rotation?: {
        axis?: THREE_2.Vector3;
        axisSpread?: THREE_2.Vector3;
        angle?: number;
        angleSpread?: number;
        static?: boolean;
        center?: THREE_2.Vector3;
        randomise?: boolean;
    };
    color?: {
        value?: THREE_2.Color | THREE_2.Color[];
        spread?: THREE_2.Vector3 | THREE_2.Vector3[];
        randomise?: boolean;
    };
    opacity?: {
        value?: number | number[];
        spread?: number | number[];
        randomise?: boolean;
    };
    size?: {
        value?: number | number[];
        spread?: number | number[];
        randomise?: boolean;
    };
    angle?: {
        value?: number | number[];
        spread?: number | number[];
        randomise?: boolean;
    };
    alive?: boolean;
};

declare class Group {
    uuid: string;
    fixedTimeStep: number;
    texture: THREE_2.Texture | null;
    textureFrames: THREE_2.Vector2;
    textureFrameCount: number;
    textureLoop: number;
    hasPerspective: boolean;
    colorize: boolean;
    maxParticleCount: number | null;
    blending: number;
    transparent: boolean;
    alphaTest: number;
    depthWrite: boolean;
    depthTest: boolean;
    fog: boolean;
    scale: number;
    emitters: Emitter[];
    emitterIDs: string[];
    _pool: Emitter[];
    _poolCreationSettings: EmitterOptions | null;
    _createNewWhenPoolEmpty: boolean;
    _attributesNeedRefresh: boolean;
    _attributesNeedDynamicReset: boolean;
    particleCount: number;
    uniforms: Uniforms;
    defines: {
        HAS_PERSPECTIVE: boolean;
        COLORIZE: boolean;
        VALUE_OVER_LIFETIME_LENGTH: number;
        SHOULD_ROTATE_TEXTURE: boolean;
        SHOULD_ROTATE_PARTICLES: boolean;
        SHOULD_WIGGLE_PARTICLES: boolean;
        SHOULD_CALCULATE_SPRITE: boolean;
    };
    attributes: {
        position: ShaderAttribute;
        acceleration: ShaderAttribute;
        velocity: ShaderAttribute;
        rotation: ShaderAttribute;
        rotationCenter: ShaderAttribute;
        params: ShaderAttribute;
        size: ShaderAttribute;
        angle: ShaderAttribute;
        color: ShaderAttribute;
        opacity: ShaderAttribute;
    };
    attributeKeys: (keyof typeof Group.attributes)[];
    attributeCount: number;
    material: THREE_2.ShaderMaterial;
    geometry: THREE_2.BufferGeometry;
    mesh: THREE_2.Points;
    constructor(options?: GroupOptions);
    _updateDefines(): void;
    _applyAttributesToGeometry(): void;
    /**
     * Adds an SPE.Emitter instance to this group, creating particle values and
     * assigning them to this group's shader attributes.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    addEmitter(emitter: Emitter): this | undefined;
    /**
     * Removes an SPE.Emitter instance from this group. When called,
     * all particle's belonging to the given emitter will be instantly
     * removed from the scene.
     *
     * @param {Emitter} emitter The emitter to add to this group.
     */
    removeEmitter(emitter: Emitter): void;
    /**
     * Fetch a single emitter instance from the pool.
     * If there are no objects in the pool, a new emitter will be
     * created if specified.
     *
     * @return {Emitter|null}
     */
    getFromPool(): Emitter | null | undefined;
    /**
     * Release an emitter into the pool.
     *
     * @param  {ShaderParticleEmitter} emitter
     * @return {Group} This group instance.
     */
    releaseIntoPool(emitter: Emitter): this | undefined;
    /**
     * Get the pool array
     *
     * @return {Array}
     */
    getPool(): Emitter[];
    /**
     * Add a pool of emitters to this particle group
     *
     * @param {Number} numEmitters      The number of emitters to add to the pool.
     * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
     * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
     * @return {Group} This group instance.
     */
    addPool(numEmitters: number, emitterOptions: EmitterOptions | EmitterOptions[], createNew: boolean): this;
    _triggerSingleEmitter(pos: THREE_2.Vector3): this | undefined;
    /**
     * Set a given number of emitters as alive, with an optional position
     * vector3 to move them to.
     *
     * @param  {Number} numEmitters The number of emitters to activate
     * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
     * @return {Group} This group instance.
     */
    triggerPoolEmitter(numEmitters: number, position: THREE_2.Vector3): this;
    _updateUniforms(dt: number): void;
    _resetBufferRanges(): void;
    _updateBuffers(emitter: Emitter): void;
    /**
     * Simulate all the emitter's belonging to this group, updating
     * attribute values along the way.
     * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
     */
    tick(dt: number): void;
    /**
     * Dipose the geometry and material for the group.
     *
     * @return {Group} Group instance.
     */
    dispose(): this;
}

/**
 * A map of options to configure an SPE.Group instance.
 * {Object} GroupOptions
 *
 * @property {Object} texture An object describing the texture used by the group.
 *
 * @property {Object} texture.value An instance of THREE.Texture.
 *
 * @property {Object=} texture.frames A THREE.Vector2 instance describing the number
 *                                    of frames on the x- and y-axis of the given texture.
 *                                    If not provided, the texture will NOT be treated as
 *                                    a sprite-sheet and as such will NOT be animated.
 *
 * @property {Number} [texture.frameCount=texture.frames.x * texture.frames.y] The total number of frames in the sprite-sheet.
 *                                                                   Allows for sprite-sheets that don't fill the entire
 *                                                                   texture.
 *
 * @property {Number} texture.loop The number of loops through the sprite-sheet that should
 *                                 be performed over the course of a single particle's lifetime.
 *
 * @property {Number} fixedTimeStep If no `dt` (or `deltaTime`) value is passed to this group's
 *                                  `tick()` function, this number will be used to move the particle
 *                                  simulation forward. Value in SECONDS.
 *
 * @property {Boolean} hasPerspective Whether the distance a particle is from the camera should affect
 *                                    the particle's size.
 *
 * @property {Boolean} colorize Whether the particles in this group should be rendered with color, or
 *                              whether the only color of particles will come from the provided texture.
 *
 * @property {Number} blending One of Three.js's blending modes to apply to this group's `ShaderMaterial`.
 *
 * @property {Boolean} transparent Whether these particle's should be rendered with transparency.
 *
 * @property {Number} alphaTest Sets the alpha value to be used when running an alpha test on the `texture.value` property. Value between 0 and 1.
 *
 * @property {Boolean} depthWrite Whether rendering the group has any effect on the depth buffer.
 *
 * @property {Boolean} depthTest Whether to have depth test enabled when rendering this group.
 *
 * @property {Boolean} fog Whether this group's particles should be affected by their scene's fog.
 *
 * @property {Number} scale The scale factor to apply to this group's particle sizes. Useful for
 *                          setting particle sizes to be relative to renderer size.
 */
/**
 * The SPE.Group class. Creates a new group, containing a material, geometry, and mesh.
 *
 * @constructor
 * @param {GroupOptions} options A map of options to configure the group instance.
 */
declare type GroupOptions = {
    texture?: {
        value?: THREE_2.Texture;
        frames?: THREE_2.Vector2;
        frameCount?: number;
        loop?: number;
    };
    fixedTimeStep?: number;
    hasPerspective?: boolean;
    colorize?: boolean;
    maxParticleCount?: number;
    blending?: number;
    transparent?: boolean;
    alphaTest?: number;
    depthWrite?: boolean;
    depthTest?: boolean;
    fog?: boolean;
    scale?: number;
};

/**
 * A helper to handle creating and updating a THREE.BufferAttribute instance.
 *
 * @author  Luke Moody
 * @constructor
 * @param {String} type          The buffer attribute type. See ShaderAttribute.typeSizeMap for valid values.
 * @param {Boolean=} dynamicBuffer Whether this buffer attribute should be marked as dynamic or not.
 * @param {Function=} arrayType     A reference to a TypedArray constructor. Defaults to Float32Array if none provided.
 */
declare class ShaderAttribute {
    type: ShaderAttributType;
    componentSize: number;
    arrayType: TypedArrayConstructor;
    typedArray: TypedArrayHelper | null;
    bufferAttribute: THREE_2.BufferAttribute | null;
    dynamicBuffer: boolean;
    updateMin: number;
    updateMax: number;
    constructor(type: ShaderAttributType, dynamicBuffer: boolean, arrayType?: TypedArrayConstructor);
    /**
     * A map of uniform types to their component size.
     * @enum {Number}
     */
    static typeSizeMap: {
        /**
         * Float
         * @type {Number}
         */
        f: number;
        /**
         * Vec2
         * @type {Number}
         */
        v2: number;
        /**
         * Vec3
         * @type {Number}
         */
        v3: number;
        /**
         * Vec4
         * @type {Number}
         */
        v4: number;
        /**
         * Color
         * @type {Number}
         */
        c: number;
        /**
         * Mat3
         * @type {Number}
         */
        m3: number;
        /**
         * Mat4
         * @type {Number}
         */
        m4: number;
    };
    /**
     * Calculate the minimum and maximum update range for this buffer attribute using
     * component size independant min and max values.
     *
     * @param {Number} min The start of the range to mark as needing an update.
     * @param {Number} max The end of the range to mark as needing an update.
     */
    setUpdateRange(min: number, max: number): void;
    /**
     * Calculate the number of indices that this attribute should mark as needing
     * updating. Also marks the attribute as needing an update.
     */
    flagUpdate(): void;
    /**
     * Reset the index update counts for this attribute
     */
    resetUpdateRange(): void;
    resetDynamic(): void;
    /**
     * Perform a splice operation on this attribute's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     */
    splice(start: number, end: number): void;
    forceUpdateAll(): void;
    /**
     * Make sure this attribute has a typed array associated with it.
     *
     * If it does, then it will ensure the typed array is of the correct size.
     *
     * If not, a new TypedArrayHelper instance will be created.
     *
     * @param  {Number} size The size of the typed array to create or update to.
     */
    _ensureTypedArray(size: number): void;
    /**
     * Creates a THREE.BufferAttribute instance if one doesn't exist already.
     *
     * Ensures a typed array is present by calling _ensureTypedArray() first.
     *
     * If a buffer attribute exists already, then it will be marked as needing an update.
     *
     * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
     */
    _createBufferAttribute(size: number): void;
    /**
     * Returns the length of the typed array associated with this attribute.
     * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
     */
    getLength(): number;
}

declare type ShaderAttributType = keyof typeof ShaderAttribute.typeSizeMap;

/**
 * Namespace for Shader Particle Engine.
 *
 * All SPE-related code sits under this namespace.
 *
 * @type {Object}
 * @namespace
 */
declare const SPE: {
    distributions: {
        BOX: number;
        SPHERE: number;
        DISC: number;
        LINE: number;
    };
    valueOverLifetimeLength: number;
    shaderChunks: {
        defines: string;
        uniforms: string;
        attributes: string;
        varyings: string;
        branchAvoidanceFunctions: string;
        unpackColor: string;
        unpackRotationAxis: string;
        floatOverLifetime: string;
        colorOverLifetime: string;
        paramFetchingFunctions: string;
        forceFetchingFunctions: string;
        rotationFunctions: string;
        rotateTexture: string;
    };
    shaders: {
        vertex: string;
        fragment: string;
    };
    Emitter: typeof Emitter;
    Group: typeof Group;
    utils: {
        types: {
            readonly BOOLEAN: "boolean";
            readonly STRING: "string";
            readonly NUMBER: "number";
            readonly OBJECT: "object";
        };
        ensureTypedArg: <T extends keyof {
            boolean: boolean;
            string: string;
            number: number;
            object: object;
        }>(arg: unknown, type: T, defaultValue: {
            boolean: boolean;
            string: string;
            number: number;
            object: object;
        }[T]) => {
            boolean: boolean;
            string: string;
            number: number;
            object: object;
        }[T];
        ensureArrayTypedArg: {
            <T extends keyof {
                boolean: boolean;
                string: string;
                number: number;
                object: object;
            }>(arg: unknown[], type: T, defaultValue: {
                boolean: boolean;
                string: string;
                number: number;
                object: object;
            }[T][]): {
                boolean: boolean;
                string: string;
                number: number;
                object: object;
            }[T][];
            <T extends keyof {
                boolean: boolean;
                string: string;
                number: number;
                object: object;
            }>(arg: unknown, type: T, defaultValue: {
                boolean: boolean;
                string: string;
                number: number;
                object: object;
            }[T]): {
                boolean: boolean;
                string: string;
                number: number;
                object: object;
            }[T];
        };
        ensureInstanceOf: <T>(arg: unknown, instance: (new (...args: any[]) => T) | undefined, defaultValue: T) => T;
        ensureArrayInstanceOf: {
            <T extends object>(arg: unknown[], instance: new (...args: any[]) => T, defaultValue: T[]): T[];
            <T extends object>(arg: unknown, instance: new (...args: any[]) => T, defaultValue: T): T;
        };
        ensureValueOverLifetimeCompliance: (property: {
            _value?: unknown[];
            _spread?: unknown[];
        }, minLength: number, maxLength: number) => void;
        interpolateArray: <T>(srcArray: T[], newLength: number) => T[];
        clamp: (value: number, min: number, max: number) => number;
        zeroToEpsilon: (value: number, randomise?: boolean) => number;
        lerpTypeAgnostic: (start: number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color | unknown, end: number | THREE.Vector2 | THREE.Vector3 | THREE.Vector4 | THREE.Color | unknown, delta: number) => number | Vector2 | Vector3 | Vector4 | Color | undefined;
        lerp: (start: number, end: number, delta: number) => number;
        roundToNearestMultiple: (n: number, multiple: number) => number;
        arrayValuesAreEqual: (array: unknown[]) => boolean;
        randomFloat: (base: number, spread: number) => number;
        randomVector3: (attribute: ShaderAttribute, index: number, base: THREE.Vector3, spread: THREE.Vector3, spreadClamp?: THREE.Vector3) => void;
        randomColor: (attribute: ShaderAttribute, index: number, base: THREE.Color, spread: THREE.Vector3) => void;
        randomColorAsHex: (attribute: ShaderAttribute, index: number, base: THREE.Color[], spread: THREE.Vector3[]) => void;
        randomVector3OnLine: (attribute: ShaderAttribute, index: number, start: THREE.Vector3, end: THREE.Vector3) => void;
        randomVector3OnSphere: (attribute: ShaderAttribute, index: number, base: THREE.Vector3, radius: number, radiusSpread: number, radiusScale: THREE.Vector3, radiusSpreadClamp: number, _distributionClamp?: number) => void;
        seededRandom: (seed: number) => number;
        randomVector3OnDisc: (attribute: ShaderAttribute, index: number, base: THREE.Vector3, radius: number, radiusSpread: number, radiusScale: THREE.Vector3, radiusSpreadClamp: number) => void;
        randomDirectionVector3OnSphere: (attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: THREE.Vector3, speed: number, speedSpread: number) => void;
        randomDirectionVector3OnDisc: (attribute: ShaderAttribute, index: number, posX: number, posY: number, posZ: number, emitterPosition: THREE.Vector3, speed: number, speedSpread: number) => void;
        getPackedRotationAxis: (axis: THREE.Vector3, axisSpread: THREE.Vector3) => number;
    };
    ShaderAttribute: typeof ShaderAttribute;
    TypedArrayHelper: typeof TypedArrayHelper;
};
export default SPE;

declare type TypedArray = InstanceType<TypedArrayConstructor>;

declare type TypedArrayConstructor = typeof Int8Array | typeof Uint8Array | typeof Uint8ClampedArray | typeof Int16Array | typeof Uint16Array | typeof Int32Array | typeof Uint32Array | typeof Float32Array | typeof Float64Array;

/**
 * A helper class for TypedArrays.
 *
 * Allows for easy resizing, assignment of various component-based
 * types (Vector2s, Vector3s, Vector4s, Mat3s, Mat4s),
 * as well as Colors (where components are `r`, `g`, `b`),
 * Numbers, and setting from other TypedArrays.
 *
 * @author Luke Moody
 * @constructor
 * @param {Function} TypedArrayConstructor The constructor to use (Float32Array, Uint8Array, etc.)
 * @param {Number} size                 The size of the array to create
 * @param {Number} componentSize        The number of components per-value (ie. 3 for a vec3, 9 for a Mat3, etc.)
 * @param {Number} indexOffset          The index in the array from which to start assigning values. Default `0` if none provided
 */
declare class TypedArrayHelper {
    componentSize: number;
    size: number;
    TypedArrayConstructor: TypedArrayConstructor;
    array: TypedArray;
    indexOffset: number;
    constructor(TypedArrayConstructor: TypedArrayConstructor, size: number, componentSize: number, indexOffset?: number);
    /**
     * Sets the size of the internal array.
     *
     * Delegates to `this.shrink` or `this.grow` depending on size
     * argument's relation to the current size of the internal array.
     *
     * Note that if the array is to be shrunk, data will be lost.
     *
     * @param {Number} size The new size of the array.
     */
    setSize(size: number, noComponentMultiply?: boolean): this | undefined;
    /**
     * Shrinks the internal array.
     *
     * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
     * @return {TypedArrayHelper}      Instance of this class.
     */
    shrink(size: number): this;
    /**
     * Grows the internal array.
     * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
     * @return {TypedArrayHelper}      Instance of this class.
     */
    grow(size: number): this;
    /**
     * Perform a splice operation on this array's buffer.
     * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
     * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
     * @returns {Object} The TypedArrayHelper instance.
     */
    splice(start: number, end: number): this;
    /**
     * Copies from the given TypedArray into this one, using the index argument
     * as the start position. Alias for `TypedArray.set`. Will automatically resize
     * if the given source array is of a larger size than the internal array.
     *
     * @param {Number} index      The start position from which to copy into this array.
     * @param {TypedArray} array The array from which to copy; the source array.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setFromArray(index: number, array: TypedArray | number[]): this;
    /**
     * Set a Vector2 value at `index`.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Vector2} vec2  Any object that has `x` and `y` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec2(index: number, vec2: THREE_2.Vector2): this;
    /**
     * Set a Vector2 value using raw components.
     *
     * @param {Number} index The index at which to set the vec2 values from.
     * @param {Number} x     The Vec2's `x` component.
     * @param {Number} y     The Vec2's `y` component.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec2Components(index: number, x: number, y: number): this;
    /**
     * Set a Vector3 value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Vector3} vec2  Any object that has `x`, `y`, and `z` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec3(index: number, vec3: THREE_2.Vector3): this;
    /**
     * Set a Vector3 value using raw components.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} x     The Vec3's `x` component.
     * @param {Number} y     The Vec3's `y` component.
     * @param {Number} z     The Vec3's `z` component.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec3Components(index: number, x: number, y: number, z: number): this;
    /**
     * Set a Vector4 value at `index`.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Vector4} vec2  Any object that has `x`, `y`, `z`, and `w` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec4(index: number, vec4: THREE_2.Vector4): this;
    /**
     * Set a Vector4 value using raw components.
     *
     * @param {Number} index The index at which to set the vec4 values from.
     * @param {Number} x     The Vec4's `x` component.
     * @param {Number} y     The Vec4's `y` component.
     * @param {Number} z     The Vec4's `z` component.
     * @param {Number} w     The Vec4's `w` component.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setVec4Components(index: number, x: number, y: number, z: number, w: number): this;
    /**
     * Set a Matrix3 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setMat3(index: number, mat3: THREE_2.Matrix3): this;
    /**
     * Set a Matrix4 value at `index`.
     *
     * @param {Number} index The index at which to set the matrix values from.
     * @param {Matrix4} mat3 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setMat4(index: number, mat4: THREE_2.Matrix4): this;
    /**
     * Set a Color value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setColor(index: number, color: THREE_2.Color): this;
    /**
     * Set a Number value at `index`.
     *
     * @param {Number} index The index at which to set the vec3 values from.
     * @param {Number} numericValue  The number to assign to this index in the array.
     * @return {TypedArrayHelper} Instance of this class.
     */
    setNumber(index: number, numericValue: number): this;
    /**
     * Returns the value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * Note that this function ignores the component size and will just return a
     * single value.
     *
     * @param  {Number} index The index in the array to fetch.
     * @return {Number}       The value at the given index.
     */
    getValueAtIndex(index: number): number;
    /**
     * Returns the component value of the array at the given index, taking into account
     * the `indexOffset` property of this class.
     *
     * If the componentSize is set to 3, then it will return a new TypedArray
     * of length 3.
     *
     * @param  {Number} index The index in the array to fetch.
     * @return {TypedArray}       The component value at the given index.
     */
    getComponentValueAtIndex(index: number): Int8Array<ArrayBuffer> | Uint8Array<ArrayBuffer> | Uint8ClampedArray<ArrayBuffer> | Int16Array<ArrayBuffer> | Uint16Array<ArrayBuffer> | Int32Array<ArrayBuffer> | Uint32Array<ArrayBuffer> | Float32Array<ArrayBuffer> | Float64Array<ArrayBuffer>;
}

declare type Uniform<T extends UniformType> = T extends "f" ? number : T extends "t" ? THREE_2.Texture : T extends "v2" ? THREE_2.Vector2 : T extends "v3" ? THREE_2.Vector3 : T extends "v4" ? THREE_2.Vector4 : T extends "c" ? THREE_2.Color : T extends "m3" ? THREE_2.Matrix3 : T extends "m4" ? THREE_2.Matrix4 : never;

declare type UniformEntry = {
    [T in UniformType]: {
        type: T;
        value: Uniform<T> | null;
    };
}[UniformType];

declare type Uniforms = Record<string, UniformEntry>;

declare type UniformType = ShaderAttributType | "t";

declare type WithGetters<T> = T & {
    [K in keyof T as K extends `_${infer P}` ? P : never]?: T[K];
};

export { }
