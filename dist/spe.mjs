var k = Object.defineProperty;
var H = (a, e, t) => e in a ? k(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var u = (a, e, t) => H(a, typeof e != "symbol" ? e + "" : e, t);
import * as c from "three";
const _ = {
  /**
   * Values will be distributed within a box.
   * @type {Number}
   */
  BOX: 1,
  /**
   * Values will be distributed on a sphere.
   * @type {Number}
   */
  SPHERE: 2,
  /**
   * Values will be distributed on a 2d-disc shape.
   * @type {Number}
   */
  DISC: 3,
  /**
   * Values will be distributed along a line.
   * @type {Number}
   */
  LINE: 4
}, O = 4, g = {
  // Register color-packing define statements.
  defines: [
    "#define PACKED_COLOR_SIZE 256.0",
    "#define PACKED_COLOR_DIVISOR 255.0"
  ].join(`
`),
  // All uniforms used by vertex / fragment shaders
  uniforms: [
    "uniform float deltaTime;",
    "uniform float runTime;",
    "uniform sampler2D tex;",
    "uniform vec4 textureAnimation;",
    "uniform float scale;"
  ].join(`
`),
  // All attributes used by the vertex shader.
  //
  // Note that some attributes are squashed into other ones:
  //
  // * Drag is acceleration.w
  attributes: [
    "attribute vec4 acceleration;",
    "attribute vec3 velocity;",
    "attribute vec4 rotation;",
    "attribute vec3 rotationCenter;",
    "attribute vec4 params;",
    "attribute vec4 size;",
    "attribute vec4 angle;",
    "attribute vec4 color;",
    "attribute vec4 opacity;"
  ].join(`
`),
  //
  varyings: [
    "varying vec4 vColor;",
    "#ifdef SHOULD_ROTATE_TEXTURE",
    "    varying float vAngle;",
    "#endif",
    "#ifdef SHOULD_CALCULATE_SPRITE",
    "    varying vec4 vSpriteSheet;",
    "#endif"
  ].join(`
`),
  // Branch-avoiding comparison fns
  // - http://theorangeduck.com/page/avoiding-shader-conditionals
  branchAvoidanceFunctions: [
    "float when_gt(float x, float y) {",
    "    return max(sign(x - y), 0.0);",
    "}",
    "float when_lt(float x, float y) {",
    "    return min( max(1.0 - sign(x - y), 0.0), 1.0 );",
    "}",
    "float when_eq( float x, float y ) {",
    "    return 1.0 - abs( sign( x - y ) );",
    "}",
    "float when_ge(float x, float y) {",
    "  return 1.0 - when_lt(x, y);",
    "}",
    "float when_le(float x, float y) {",
    "  return 1.0 - when_gt(x, y);",
    "}",
    // Branch-avoiding logical operators
    // (to be used with above comparison fns)
    "float and(float a, float b) {",
    "    return a * b;",
    "}",
    "float or(float a, float b) {",
    "    return min(a + b, 1.0);",
    "}"
  ].join(`
`),
  // From:
  // - http://stackoverflow.com/a/12553149
  // - https://stackoverflow.com/questions/22895237/hexadecimal-to-rgb-values-in-webgl-shader
  unpackColor: [
    "vec3 unpackColor( in float hex ) {",
    "   vec3 c = vec3( 0.0 );",
    "   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );",
    "   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );",
    "   float b = mod( hex, PACKED_COLOR_SIZE );",
    "   c.r = r / PACKED_COLOR_DIVISOR;",
    "   c.g = g / PACKED_COLOR_DIVISOR;",
    "   c.b = b / PACKED_COLOR_DIVISOR;",
    "   return c;",
    "}"
  ].join(`
`),
  unpackRotationAxis: [
    "vec3 unpackRotationAxis( in float hex ) {",
    "   vec3 c = vec3( 0.0 );",
    "   float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );",
    "   float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );",
    "   float b = mod( hex, PACKED_COLOR_SIZE );",
    "   c.r = r / PACKED_COLOR_DIVISOR;",
    "   c.g = g / PACKED_COLOR_DIVISOR;",
    "   c.b = b / PACKED_COLOR_DIVISOR;",
    "   c *= vec3( 2.0 );",
    "   c -= vec3( 1.0 );",
    "   return c;",
    "}"
  ].join(`
`),
  floatOverLifetime: [
    "float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {",
    "    highp float value = 0.0;",
    "    float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );",
    "    float fIndex = 0.0;",
    "    float shouldApplyValue = 0.0;",
    // This might look a little odd, but it's faster in the testing I've done than using branches.
    // Uses basic maths to avoid branching.
    //
    // Take a look at the branch-avoidance functions defined above,
    // and be sure to check out The Orange Duck site where I got this
    // from (link above).
    // Fix for static emitters (age is always zero).
    "    value += attr[ 0 ] * when_eq( deltaAge, 0.0 );",
    "",
    "    for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {",
    "       fIndex = float( i );",
    "       shouldApplyValue = and( when_gt( deltaAge, fIndex ), when_le( deltaAge, fIndex + 1.0 ) );",
    "       value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );",
    "    }",
    "",
    "    return value;",
    "}"
  ].join(`
`),
  colorOverLifetime: [
    "vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {",
    "    vec3 value = vec3( 0.0 );",
    "    value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );",
    "    value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );",
    "    value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );",
    "    return value;",
    "}"
  ].join(`
`),
  paramFetchingFunctions: [
    "float getAlive() {",
    "   return params.x;",
    "}",
    "float getAge() {",
    "   return params.y;",
    "}",
    "float getMaxAge() {",
    "   return params.z;",
    "}",
    "float getWiggle() {",
    "   return params.w;",
    "}"
  ].join(`
`),
  forceFetchingFunctions: [
    "vec4 getPosition( in float age ) {",
    "   return modelViewMatrix * vec4( position, 1.0 );",
    "}",
    "vec3 getVelocity( in float age ) {",
    "   return velocity * age;",
    "}",
    "vec3 getAcceleration( in float age ) {",
    "   return acceleration.xyz * age;",
    "}"
  ].join(`
`),
  rotationFunctions: [
    // Huge thanks to:
    // - http://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
    "#ifdef SHOULD_ROTATE_PARTICLES",
    "   mat4 getRotationMatrix( in vec3 axis, in float angle) {",
    "       axis = normalize(axis);",
    "       float s = sin(angle);",
    "       float c = cos(angle);",
    "       float oc = 1.0 - c;",
    "",
    "       return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,",
    "                   oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,",
    "                   oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,",
    "                   0.0,                                0.0,                                0.0,                                1.0);",
    "   }",
    "",
    "   vec3 getRotation( in vec3 pos, in float positionInTime ) {",
    "      if( rotation.y == 0.0 ) {",
    "           return pos;",
    "      }",
    "",
    "      vec3 axis = unpackRotationAxis( rotation.x );",
    "      vec3 center = rotationCenter;",
    "      vec3 translated;",
    "      mat4 rotationMatrix;",
    "      float angle = 0.0;",
    "      angle += when_eq( rotation.z, 0.0 ) * rotation.y;",
    "      angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );",
    "      translated = rotationCenter - pos;",
    "      rotationMatrix = getRotationMatrix( axis, angle );",
    "      return center - vec3( rotationMatrix * vec4( translated, 0.0 ) );",
    "   }",
    "#endif"
  ].join(`
`),
  // Fragment chunks
  rotateTexture: [
    "    vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );",
    "",
    "    #ifdef SHOULD_ROTATE_TEXTURE",
    "       float x = gl_PointCoord.x - 0.5;",
    "       float y = 1.0 - gl_PointCoord.y - 0.5;",
    "       float c = cos( -vAngle );",
    "       float s = sin( -vAngle );",
    "       vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );",
    "    #endif",
    "",
    // Spritesheets overwrite angle calculations.
    "    #ifdef SHOULD_CALCULATE_SPRITE",
    "        float framesX = vSpriteSheet.x;",
    "        float framesY = vSpriteSheet.y;",
    "        float columnNorm = vSpriteSheet.z;",
    "        float rowNorm = vSpriteSheet.w;",
    "        vUv.x = gl_PointCoord.x * framesX + columnNorm;",
    "        vUv.y = 1.0 - (gl_PointCoord.y * framesY + rowNorm);",
    "    #endif",
    "",
    "    vec4 rotatedTexture = texture2D( tex, vUv );"
  ].join(`
`)
}, T = {
  vertex: [
    g.defines,
    g.uniforms,
    g.attributes,
    g.varyings,
    c.ShaderChunk.common,
    c.ShaderChunk.logdepthbuf_pars_vertex,
    c.ShaderChunk.fog_pars_vertex,
    g.branchAvoidanceFunctions,
    g.unpackColor,
    g.unpackRotationAxis,
    g.floatOverLifetime,
    g.colorOverLifetime,
    g.paramFetchingFunctions,
    g.forceFetchingFunctions,
    g.rotationFunctions,
    "void main() {",
    //
    // Setup...
    //
    "    highp float age = getAge();",
    "    highp float alive = getAlive();",
    "    highp float maxAge = getMaxAge();",
    "    highp float positionInTime = (age / maxAge);",
    "    highp float isAlive = when_gt( alive, 0.0 );",
    "    #ifdef SHOULD_WIGGLE_PARTICLES",
    "        float wiggleAmount = positionInTime * getWiggle();",
    "        float wiggleSin = isAlive * sin( wiggleAmount );",
    "        float wiggleCos = isAlive * cos( wiggleAmount );",
    "    #endif",
    //
    // Forces
    //
    // Get forces & position
    "    vec3 vel = getVelocity( age );",
    "    vec3 accel = getAcceleration( age );",
    "    vec3 force = vec3( 0.0 );",
    "    vec3 pos = vec3( position );",
    // Calculate the required drag to apply to the forces.
    "    float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;",
    // Integrate forces...
    "    force += vel;",
    "    force *= drag;",
    "    force += accel * age;",
    "    pos += force;",
    // Wiggly wiggly wiggle!
    "    #ifdef SHOULD_WIGGLE_PARTICLES",
    "        pos.x += wiggleSin;",
    "        pos.y += wiggleCos;",
    "        pos.z += wiggleSin;",
    "    #endif",
    // Rotate the emitter around it's central point
    "    #ifdef SHOULD_ROTATE_PARTICLES",
    "        pos = getRotation( pos, positionInTime );",
    "    #endif",
    // Convert pos to a world-space value
    "    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );",
    // Determine point size.
    "    highp float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;",
    // Determine perspective
    "    #ifdef HAS_PERSPECTIVE",
    "        float perspective = scale / length( mvPosition.xyz );",
    "    #else",
    "        float perspective = 1.0;",
    "    #endif",
    // Apply perpective to pointSize value
    "    float pointSizePerspective = pointSize * perspective;",
    //
    // Appearance
    //
    // Determine color and opacity for this particle
    "    #ifdef COLORIZE",
    "       vec3 c = isAlive * getColorOverLifetime(",
    "           positionInTime,",
    "           unpackColor( color.x ),",
    "           unpackColor( color.y ),",
    "           unpackColor( color.z ),",
    "           unpackColor( color.w )",
    "       );",
    "    #else",
    "       vec3 c = vec3(1.0);",
    "    #endif",
    "    float o = isAlive * getFloatOverLifetime( positionInTime, opacity );",
    // Assign color to vColor varying.
    "    vColor = vec4( c, o );",
    // Determine angle
    "    #ifdef SHOULD_ROTATE_TEXTURE",
    "        vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );",
    "    #endif",
    // If this particle is using a sprite-sheet as a texture, we'll have to figure out
    // what frame of the texture the particle is using at it's current position in time.
    "    #ifdef SHOULD_CALCULATE_SPRITE",
    "        float framesX = textureAnimation.x;",
    "        float framesY = textureAnimation.y;",
    "        float loopCount = textureAnimation.w;",
    "        float totalFrames = textureAnimation.z;",
    "        float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );",
    "        float column = floor(mod( frameNumber, framesX ));",
    "        float row = floor( (frameNumber - column) / framesX );",
    "        float columnNorm = column / framesX;",
    "        float rowNorm = row / framesY;",
    "        vSpriteSheet.x = 1.0 / framesX;",
    "        vSpriteSheet.y = 1.0 / framesY;",
    "        vSpriteSheet.z = columnNorm;",
    "        vSpriteSheet.w = rowNorm;",
    "    #endif",
    //
    // Write values
    //
    // Set PointSize according to size at current point in time.
    "    gl_PointSize = pointSizePerspective;",
    "    gl_Position = projectionMatrix * mvPosition;",
    c.ShaderChunk.logdepthbuf_vertex,
    c.ShaderChunk.fog_vertex,
    "}"
  ].join(`
`),
  fragment: [
    g.uniforms,
    c.ShaderChunk.common,
    c.ShaderChunk.fog_pars_fragment,
    c.ShaderChunk.logdepthbuf_pars_fragment,
    g.varyings,
    g.branchAvoidanceFunctions,
    "void main() {",
    "    vec3 outgoingLight = vColor.xyz;",
    "    ",
    "    #ifdef ALPHATEST",
    "       if ( vColor.w < float(ALPHATEST) ) discard;",
    "    #endif",
    g.rotateTexture,
    c.ShaderChunk.logdepthbuf_fragment,
    "    outgoingLight = vColor.xyz * rotatedTexture.xyz;",
    "    gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );",
    c.ShaderChunk.fog_fragment,
    "}"
  ].join(`
`)
}, s = {
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
    OBJECT: "object"
  },
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
  ensureTypedArg: function(a, e, t) {
    return typeof a === e ? a : t;
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
  ensureArrayTypedArg: function(a, e, t) {
    if (Array.isArray(a)) {
      for (var r = a.length - 1; r >= 0; --r)
        if (typeof a[r] !== e)
          return t;
      return a;
    }
    return s.ensureTypedArg(a, e, t);
  },
  /**
   * Ensures the given value is an instance of a constructor function.
   *
   * @param  {Object} arg          The value to check instance of.
   * @param  {Function} instance     The constructor of the instance to check against.
   * @param  {Object} defaultValue A default fallback value if instance check fails
   * @return {Object}              The given value if type check passes, or the default value if it fails.
   */
  ensureInstanceOf: function(a, e, t) {
    return e !== void 0 && a instanceof e ? a : t;
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
  ensureArrayInstanceOf: function(a, e, t) {
    if (Array.isArray(a)) {
      for (var r = a.length - 1; r >= 0; --r)
        if (e !== void 0 && !(a[r] instanceof e))
          return t;
      return a;
    }
    return s.ensureInstanceOf(a, e, t);
  },
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
  ensureValueOverLifetimeCompliance: function(a, e, t) {
    e = e || 3, t = t || 3, Array.isArray(a._value) === !1 && (a._value = [a._value]), Array.isArray(a._spread) === !1 && (a._spread = [a._spread]);
    var r = s.clamp(
      a._value.length,
      e,
      t
    ), i = s.clamp(
      a._spread.length,
      e,
      t
    ), o = Math.max(r, i);
    a._value.length !== o && (a._value = this.interpolateArray(
      a._value,
      o
    )), a._spread.length !== o && (a._spread = this.interpolateArray(
      a._spread,
      o
    ));
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
  interpolateArray: function(a, e) {
    for (var t = a.length, r = [
      typeof a[0].clone == "function" ? a[0].clone() : a[0]
    ], i = (t - 1) / (e - 1), o = 1; o < e - 1; ++o) {
      var n = o * i, l = Math.floor(n), h = Math.ceil(n), f = n - l;
      r[o] = this.lerpTypeAgnostic(
        a[l],
        a[h],
        f
      );
    }
    return r.push(
      typeof a[t - 1].clone == "function" ? a[t - 1].clone() : a[t - 1]
    ), r;
  },
  /**
   * Clamp a number to between the given min and max values.
   * @param  {Number} value The number to clamp.
   * @param  {Number} min   The minimum value.
   * @param  {Number} max   The maximum value.
   * @return {Number}       The clamped number.
   */
  clamp: function(a, e, t) {
    return Math.max(e, Math.min(a, t));
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
  zeroToEpsilon: function(a, e) {
    var t = 1e-5, r = a;
    return r = e ? Math.random() * t * 10 : t, a < 0 && a > -t && (r = -r), r;
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
  lerpTypeAgnostic: function(a, e, t) {
    var r;
    if (typeof a == "number" && typeof e == "number")
      return a + (e - a) * t;
    if (a instanceof c.Vector2 && e instanceof c.Vector2)
      return r = a.clone(), r.x = s.lerp(a.x, e.x, t), r.y = s.lerp(a.y, e.y, t), r;
    if (a instanceof c.Vector3 && e instanceof c.Vector3)
      return r = a.clone(), r.x = s.lerp(a.x, e.x, t), r.y = s.lerp(a.y, e.y, t), r.z = s.lerp(a.z, e.z, t), r;
    if (a instanceof c.Vector4 && e instanceof c.Vector4)
      return r = a.clone(), r.x = s.lerp(a.x, e.x, t), r.y = s.lerp(a.y, e.y, t), r.z = s.lerp(a.z, e.z, t), r.w = s.lerp(a.w, e.w, t), r;
    if (a instanceof c.Color && e instanceof c.Color)
      return r = a.clone(), r.r = s.lerp(a.r, e.r, t), r.g = s.lerp(a.g, e.g, t), r.b = s.lerp(a.b, e.b, t), r;
    console.warn(
      "Invalid argument types, or argument types do not match:",
      a,
      e
    );
  },
  /**
   * Perform a linear interpolation operation on two numbers.
   * @param  {Number} start The start value.
   * @param  {Number} end   The end value.
   * @param  {Number} delta The position to interpolate to.
   * @return {Number}       The result of the lerp operation.
   */
  lerp: function(a, e, t) {
    return a + (e - a) * t;
  },
  /**
   * Rounds a number to a nearest multiple.
   *
   * @param  {Number} n        The number to round.
   * @param  {Number} multiple The multiple to round to.
   * @return {Number}          The result of the round operation.
   */
  roundToNearestMultiple: function(a, e) {
    var t = 0;
    return e === 0 || (t = Math.abs(a) % e, t === 0) ? a : a < 0 ? -(Math.abs(a) - t) : a + e - t;
  },
  /**
   * Check if all items in an array are equal. Uses strict equality.
   *
   * @param  {Array} array The array of values to check equality of.
   * @return {Boolean}       Whether the array's values are all equal or not.
   */
  arrayValuesAreEqual: function(a) {
    for (var e = 0; e < a.length - 1; ++e)
      if (a[e] !== a[e + 1])
        return !1;
    return !0;
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
  randomFloat: function(a, e) {
    return a + e * (Math.random() - 0.5);
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
  randomVector3: function(a, e, t, r, i) {
    var h;
    var o = t.x + (Math.random() * r.x - r.x * 0.5), n = t.y + (Math.random() * r.y - r.y * 0.5), l = t.z + (Math.random() * r.z - r.z * 0.5);
    i && (o = -i.x * 0.5 + this.roundToNearestMultiple(o, i.x), n = -i.y * 0.5 + this.roundToNearestMultiple(n, i.y), l = -i.z * 0.5 + this.roundToNearestMultiple(l, i.z)), (h = a.typedArray) == null || h.setVec3Components(e, o, n, l);
  },
  /**
   * Given an SPE.Shader attribute instance, and various other settings,
   * assign Color values to the attribute.
   * @param  {Object} attribute The instance of ShaderAttribute to save the result to.
   * @param  {Number} index     The offset in the attribute's TypedArray to save the result from.
   * @param  {Object} base      THREE.Color instance describing the start color.
   * @param  {Object} spread    THREE.Vector3 instance describing the random variance to apply to the start color.
   */
  randomColor: function(a, e, t, r) {
    var l;
    var i = t.r + Math.random() * r.x, o = t.g + Math.random() * r.y, n = t.b + Math.random() * r.z;
    i = this.clamp(i, 0, 1), o = this.clamp(o, 0, 1), n = this.clamp(n, 0, 1), (l = a.typedArray) == null || l.setVec3Components(e, i, o, n);
  },
  randomColorAsHex: function() {
    var a = new c.Color();
    return function(e, t, r, i) {
      var f;
      for (var o = r.length, n = [], l = 0; l < o; ++l) {
        var h = i[l];
        a.copy(r[l]), a.r += Math.random() * h.x - h.x * 0.5, a.g += Math.random() * h.y - h.y * 0.5, a.b += Math.random() * h.z - h.z * 0.5, a.r = s.clamp(a.r, 0, 1), a.g = s.clamp(a.g, 0, 1), a.b = s.clamp(a.b, 0, 1), n.push(a.getHex());
      }
      (f = e.typedArray) == null || f.setVec4Components(
        t,
        n[0],
        n[1],
        n[2],
        n[3]
      );
    };
  }(),
  /**
   * Given an ShaderAttribute instance, and various other settings,
   * assign values to the attribute's array in a `vec3` format.
   *
   * @param  {Object} attribute   The instance of ShaderAttribute to save the result to.
   * @param  {Number} index       The offset in the attribute's TypedArray to save the result from.
   * @param  {Object} start       THREE.Vector3 instance describing the start line position.
   * @param  {Object} end         THREE.Vector3 instance describing the end line position.
   */
  randomVector3OnLine: function(a, e, t, r) {
    var o;
    var i = t.clone();
    i.lerp(r, Math.random()), (o = a.typedArray) == null || o.setVec3Components(e, i.x, i.y, i.z);
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
  randomVector3OnSphere: function(a, e, t, r, i, o, n, l) {
    var b;
    var h = 2 * Math.random() - 1, f = 6.2832 * Math.random(), p = Math.sqrt(1 - h * h), d = this.randomFloat(r, i), y = 0, v = 0, A = 0;
    n && (d = Math.round(d / n) * n), y = p * Math.cos(f) * d, v = p * Math.sin(f) * d, A = h * d, y *= o.x, v *= o.y, A *= o.z, y += t.x, v += t.y, A += t.z, (b = a.typedArray) == null || b.setVec3Components(e, y, v, A);
  },
  seededRandom: function(a) {
    var e = Math.sin(a) * 1e4;
    return e - (e | 0);
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
  randomVector3OnDisc: function(a, e, t, r, i, o, n) {
    var y;
    var l = 6.2832 * Math.random(), h = Math.abs(this.randomFloat(r, i)), f = 0, p = 0, d = 0;
    n && (h = Math.round(h / n) * n), f = Math.cos(l) * h, p = Math.sin(l) * h, f *= o.x, p *= o.y, f += t.x, p += t.y, d += t.z, (y = a.typedArray) == null || y.setVec3Components(e, f, p, d);
  },
  randomDirectionVector3OnSphere: function() {
    var a = new c.Vector3();
    return function(e, t, r, i, o, n, l, h) {
      var f;
      a.copy(n), a.x -= r, a.y -= i, a.z -= o, a.normalize().multiplyScalar(-s.randomFloat(l, h)), (f = e.typedArray) == null || f.setVec3Components(t, a.x, a.y, a.z);
    };
  }(),
  randomDirectionVector3OnDisc: function() {
    var a = new c.Vector3();
    return function(e, t, r, i, o, n, l, h) {
      var f;
      a.copy(n), a.x -= r, a.y -= i, a.z -= o, a.normalize().multiplyScalar(-s.randomFloat(l, h)), (f = e.typedArray) == null || f.setVec3Components(t, a.x, a.y, 0);
    };
  }(),
  getPackedRotationAxis: function() {
    var a = new c.Vector3(), e = new c.Vector3(), t = new c.Color(), r = new c.Vector3(1, 1, 1);
    return function(i, o) {
      return a.copy(i).normalize(), e.copy(o).normalize(), a.x += -o.x * 0.5 + Math.random() * o.x, a.y += -o.y * 0.5 + Math.random() * o.y, a.z += -o.z * 0.5 + Math.random() * o.z, a.normalize().add(r).multiplyScalar(0.5), t.setRGB(a.x, a.y, a.z), t.getHex();
    };
  }()
};
class x {
  /**
   * The SPE.Emitter class.
   *
   * @constructor
   *
   * @param {EmitterOptions} options A map of options to configure the emitter.
   */
  constructor(e) {
    u(this, "uuid");
    u(this, "type");
    u(this, "position");
    u(this, "velocity");
    u(this, "acceleration");
    u(this, "drag");
    u(this, "wiggle");
    u(this, "rotation");
    u(this, "maxAge");
    u(this, "color");
    u(this, "opacity");
    u(this, "size");
    u(this, "angle");
    u(this, "particleCount");
    u(this, "duration");
    u(this, "isStatic");
    u(this, "activeMultiplier");
    u(this, "direction");
    u(this, "alive");
    u(this, "particlesPerSecond");
    u(this, "activationIndex");
    u(this, "attributeOffset");
    u(this, "attributeEnd");
    u(this, "age");
    u(this, "activeParticleCount");
    u(this, "group");
    u(this, "attributes");
    u(this, "paramsArray");
    u(this, "resetFlags");
    u(this, "updateFlags");
    u(this, "updateCounts");
    u(this, "updateMap");
    u(this, "attributeKeys");
    u(this, "attributeCount");
    u(this, "bufferUpdateRanges");
    u(this, "activationEnd");
    var o, n, l, h, f, p, d, y, v, A, b, C, S, R, I, L, P, V, w, M, N, z, U, B, D;
    var t = s.types, r = O;
    e = s.ensureTypedArg(
      e,
      t.OBJECT,
      {}
    ), e.position = s.ensureTypedArg(
      e.position,
      t.OBJECT,
      {}
    ), e.velocity = s.ensureTypedArg(
      e.velocity,
      t.OBJECT,
      {}
    ), e.acceleration = s.ensureTypedArg(
      e.acceleration,
      t.OBJECT,
      {}
    ), e.radius = s.ensureTypedArg(e.radius, t.OBJECT, {}), e.drag = s.ensureTypedArg(e.drag, t.OBJECT, {}), e.rotation = s.ensureTypedArg(
      e.rotation,
      t.OBJECT,
      {}
    ), e.color = s.ensureTypedArg(e.color, t.OBJECT, {}), e.opacity = s.ensureTypedArg(
      e.opacity,
      t.OBJECT,
      {}
    ), e.size = s.ensureTypedArg(e.size, t.OBJECT, {}), e.angle = s.ensureTypedArg(e.angle, t.OBJECT, {}), e.wiggle = s.ensureTypedArg(e.wiggle, t.OBJECT, {}), e.maxAge = s.ensureTypedArg(e.maxAge, t.OBJECT, {}), e.onParticleSpawn && console.warn(
      "onParticleSpawn has been removed. Please set properties directly to alter values at runtime."
    ), this.uuid = c.MathUtils.generateUUID(), this.type = s.ensureTypedArg(
      e.type,
      t.NUMBER,
      _.BOX
    ), this.position = {
      _value: s.ensureInstanceOf(
        (o = e.position) == null ? void 0 : o.value,
        c.Vector3,
        new c.Vector3()
      ),
      _spread: s.ensureInstanceOf(
        (n = e.position) == null ? void 0 : n.spread,
        c.Vector3,
        new c.Vector3()
      ),
      _spreadClamp: s.ensureInstanceOf(
        (l = e.position) == null ? void 0 : l.spreadClamp,
        c.Vector3,
        new c.Vector3()
      ),
      _distribution: s.ensureTypedArg(
        (h = e.position) == null ? void 0 : h.distribution,
        t.NUMBER,
        this.type
      ),
      _randomise: s.ensureTypedArg(
        (f = e.position) == null ? void 0 : f.randomise,
        t.BOOLEAN,
        !1
      ),
      _radius: s.ensureTypedArg(
        (p = e.position) == null ? void 0 : p.radius,
        t.NUMBER,
        10
      ),
      _radiusScale: s.ensureInstanceOf(
        (d = e.position) == null ? void 0 : d.radiusScale,
        c.Vector3,
        new c.Vector3(1, 1, 1)
      ),
      _distributionClamp: s.ensureTypedArg(
        (y = e.position) == null ? void 0 : y.distributionClamp,
        t.NUMBER,
        0
      )
    }, this.velocity = {
      _value: s.ensureInstanceOf(
        (v = e.velocity) == null ? void 0 : v.value,
        c.Vector3,
        new c.Vector3()
      ),
      _spread: s.ensureInstanceOf(
        (A = e.velocity) == null ? void 0 : A.spread,
        c.Vector3,
        new c.Vector3()
      ),
      _distribution: s.ensureTypedArg(
        (b = e.velocity) == null ? void 0 : b.distribution,
        t.NUMBER,
        this.type
      ),
      _randomise: s.ensureTypedArg(
        (C = e.position) == null ? void 0 : C.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.acceleration = {
      _value: s.ensureInstanceOf(
        (S = e.acceleration) == null ? void 0 : S.value,
        c.Vector3,
        new c.Vector3()
      ),
      _spread: s.ensureInstanceOf(
        (R = e.acceleration) == null ? void 0 : R.spread,
        c.Vector3,
        new c.Vector3()
      ),
      _distribution: s.ensureTypedArg(
        (I = e.acceleration) == null ? void 0 : I.distribution,
        t.NUMBER,
        this.type
      ),
      _randomise: s.ensureTypedArg(
        (L = e.position) == null ? void 0 : L.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.drag = {
      _value: s.ensureTypedArg(e.drag.value, t.NUMBER, 0),
      _spread: s.ensureTypedArg(e.drag.spread, t.NUMBER, 0),
      _randomise: s.ensureTypedArg(
        (P = e.position) == null ? void 0 : P.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.wiggle = {
      _value: s.ensureTypedArg(e.wiggle.value, t.NUMBER, 0),
      _spread: s.ensureTypedArg(
        e.wiggle.spread,
        t.NUMBER,
        0
      )
    }, this.rotation = {
      _axis: s.ensureInstanceOf(
        e.rotation.axis,
        c.Vector3,
        new c.Vector3(0, 1, 0)
      ),
      _axisSpread: s.ensureInstanceOf(
        e.rotation.axisSpread,
        c.Vector3,
        new c.Vector3()
      ),
      _angle: s.ensureTypedArg(
        e.rotation.angle,
        t.NUMBER,
        0
      ),
      _angleSpread: s.ensureTypedArg(
        e.rotation.angleSpread,
        t.NUMBER,
        0
      ),
      _static: s.ensureTypedArg(
        e.rotation.static,
        t.BOOLEAN,
        !1
      ),
      _center: s.ensureInstanceOf(
        e.rotation.center,
        c.Vector3,
        this.position._value.clone()
      ),
      _randomise: s.ensureTypedArg(
        (V = e.position) == null ? void 0 : V.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.maxAge = {
      _value: s.ensureTypedArg(e.maxAge.value, t.NUMBER, 2),
      _spread: s.ensureTypedArg(
        e.maxAge.spread,
        t.NUMBER,
        0
      )
    }, this.color = {
      _value: s.ensureArrayInstanceOf(
        e.color.value,
        c.Color,
        new c.Color()
      ),
      _spread: s.ensureArrayInstanceOf(
        e.color.spread,
        c.Vector3,
        new c.Vector3()
      ),
      _randomise: s.ensureTypedArg(
        (w = e.position) == null ? void 0 : w.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.opacity = {
      _value: s.ensureArrayTypedArg(
        e.opacity.value,
        t.NUMBER,
        1
      ),
      _spread: s.ensureArrayTypedArg(
        e.opacity.spread,
        t.NUMBER,
        0
      ),
      _randomise: s.ensureTypedArg(
        (M = e.position) == null ? void 0 : M.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.size = {
      _value: s.ensureArrayTypedArg(
        e.size.value,
        t.NUMBER,
        1
      ),
      _spread: s.ensureArrayTypedArg(
        e.size.spread,
        t.NUMBER,
        0
      ),
      _randomise: s.ensureTypedArg(
        (N = e.position) == null ? void 0 : N.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.angle = {
      _value: s.ensureArrayTypedArg(
        e.angle.value,
        t.NUMBER,
        0
      ),
      _spread: s.ensureArrayTypedArg(
        e.angle.spread,
        t.NUMBER,
        0
      ),
      _randomise: s.ensureTypedArg(
        (z = e.position) == null ? void 0 : z.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.particleCount = s.ensureTypedArg(
      e.particleCount,
      t.NUMBER,
      100
    ), this.duration = typeof e.duration == "number" ? e.duration : null, this.isStatic = s.ensureTypedArg(
      e.isStatic,
      t.BOOLEAN,
      !1
    ), this.activeMultiplier = s.ensureTypedArg(
      e.activeMultiplier,
      t.NUMBER,
      1
    ), this.direction = s.ensureTypedArg(
      e.direction,
      t.NUMBER,
      1
    ), this.alive = s.ensureTypedArg(e.alive, t.BOOLEAN, !0), this.particlesPerSecond = 0, this.activationIndex = 0, this.attributeOffset = 0, this.attributeEnd = 0, this.age = 0, this.activeParticleCount = 0, this.group = null, this.attributes = null, this.paramsArray = null, this.resetFlags = {
      // params: utils.ensureTypedArg( options.maxAge.randomise, types.BOOLEAN, !!options.maxAge.spread ) ||
      //     utils.ensureTypedArg( options.wiggle.randomise, types.BOOLEAN, !!options.wiggle.spread ),
      position: s.ensureTypedArg(
        (U = e.position) == null ? void 0 : U.randomise,
        t.BOOLEAN,
        !1
      ) || s.ensureTypedArg(
        e.radius.randomise,
        t.BOOLEAN,
        !1
      ),
      velocity: s.ensureTypedArg(
        (B = e.velocity) == null ? void 0 : B.randomise,
        t.BOOLEAN,
        !1
      ),
      acceleration: s.ensureTypedArg(
        (D = e.acceleration) == null ? void 0 : D.randomise,
        t.BOOLEAN,
        !1
      ) || s.ensureTypedArg(
        e.drag.randomise,
        t.BOOLEAN,
        !1
      ),
      rotation: s.ensureTypedArg(
        e.rotation.randomise,
        t.BOOLEAN,
        !1
      ),
      rotationCenter: s.ensureTypedArg(
        e.rotation.randomise,
        t.BOOLEAN,
        !1
      ),
      size: s.ensureTypedArg(
        e.size.randomise,
        t.BOOLEAN,
        !1
      ),
      color: s.ensureTypedArg(
        e.color.randomise,
        t.BOOLEAN,
        !1
      ),
      opacity: s.ensureTypedArg(
        e.opacity.randomise,
        t.BOOLEAN,
        !1
      ),
      angle: s.ensureTypedArg(
        e.angle.randomise,
        t.BOOLEAN,
        !1
      )
    }, this.updateFlags = {}, this.updateCounts = {}, this.updateMap = {
      maxAge: "params",
      position: "position",
      velocity: "velocity",
      acceleration: "acceleration",
      drag: "acceleration",
      wiggle: "params",
      rotation: "rotation",
      size: "size",
      color: "color",
      opacity: "opacity",
      angle: "angle"
    };
    for (var i in this.updateMap)
      this.updateMap.hasOwnProperty(i) && (this.updateCounts[this.updateMap[i]] = 0, this.updateFlags[this.updateMap[i]] = !1, this._createGetterSetters(this[i], i));
    this.bufferUpdateRanges = {}, this.attributeKeys = null, this.attributeCount = 0, s.ensureValueOverLifetimeCompliance(
      // @ts-expect-error - it was like that originally
      this.color,
      r,
      r
    ), s.ensureValueOverLifetimeCompliance(
      // @ts-expect-error - it was like that originally
      this.opacity,
      r,
      r
    ), s.ensureValueOverLifetimeCompliance(
      // @ts-expect-error - it was like that originally
      this.size,
      r,
      r
    ), s.ensureValueOverLifetimeCompliance(
      // @ts-expect-error - it was like that originally
      this.angle,
      r,
      r
    );
  }
  _createGetterSetters(e, t) {
    var r = this;
    for (var i in e)
      if (e.hasOwnProperty(i)) {
        var o = i.replace("_", "");
        Object.defineProperty(e, o, {
          get: /* @__PURE__ */ function(n) {
            return function() {
              return this[n];
            };
          }(i),
          set: /* @__PURE__ */ function(n) {
            return function(l) {
              var d;
              var h = r.updateMap[t], f = this[n], p = O;
              n === "_rotationCenter" ? (r.updateFlags.rotationCenter = !0, r.updateCounts.rotationCenter = 0) : n === "_randomise" ? r.resetFlags[h] = l : (r.updateFlags[h] = !0, r.updateCounts[h] = 0), (d = r.group) == null || d._updateDefines(), this[n] = l, Array.isArray(f) && s.ensureValueOverLifetimeCompliance(
                r[t],
                p,
                p
              );
            };
          }(i)
        });
      }
  }
  _setBufferUpdateRanges(e) {
    this.attributeKeys = e, this.attributeCount = e.length;
    for (var t = this.attributeCount - 1; t >= 0; --t)
      this.bufferUpdateRanges[e[t]] = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY
      };
  }
  _calculatePPSValue(e) {
    var t = this.particleCount;
    this.duration ? this.particlesPerSecond = t / (e < this.duration ? e : this.duration) : this.particlesPerSecond = t / e;
  }
  _setAttributeOffset(e) {
    this.attributeOffset = e, this.activationIndex = e, this.activationEnd = e + this.particleCount;
  }
  _assignValue(e, t) {
    switch (e) {
      case "position":
        this._assignPositionValue(t);
        break;
      case "velocity":
      case "acceleration":
        this._assignForceValue(t, e);
        break;
      case "size":
      case "opacity":
        this._assignAbsLifetimeValue(t, e);
        break;
      case "angle":
        this._assignAngleValue(t);
        break;
      case "params":
        this._assignParamsValue(t);
        break;
      case "rotation":
        this._assignRotationValue(t);
        break;
      case "color":
        this._assignColorValue(t);
        break;
    }
  }
  _assignPositionValue(e) {
    var l;
    var t = this.position, r = (l = this.attributes) == null ? void 0 : l.position, i = t._value, o = t._spread, n = t._distribution;
    switch (n) {
      case _.BOX:
        if (!r) {
          console.error("No position attribute found");
          return;
        }
        s.randomVector3(
          r,
          e,
          i,
          o,
          t._spreadClamp
        );
        break;
      case _.SPHERE:
        if (!r) {
          console.error("No position attribute found");
          return;
        }
        s.randomVector3OnSphere(
          r,
          e,
          i,
          t._radius,
          t._spread.x,
          t._radiusScale,
          t._spreadClamp.x,
          t._distributionClamp || this.particleCount
        );
        break;
      case _.DISC:
        if (!r) {
          console.error("No position attribute found");
          return;
        }
        s.randomVector3OnDisc(
          r,
          e,
          i,
          t._radius,
          t._spread.x,
          t._radiusScale,
          t._spreadClamp.x
        );
        break;
      case _.LINE:
        if (!r) {
          console.error("No position attribute found");
          return;
        }
        s.randomVector3OnLine(r, e, i, o);
        break;
    }
  }
  _assignForceValue(e, t) {
    var v, A, b, C;
    var r = this[t], i = r._value, o = r._spread, n = r._distribution, l, h, f, p, d;
    switch (n) {
      case _.BOX:
        s.randomVector3(
          this.attributes[t],
          e,
          i,
          o
        );
        break;
      case _.SPHERE:
        if (l = (A = (v = this.attributes) == null ? void 0 : v.position.typedArray) == null ? void 0 : A.array, !l) {
          console.error("No position attribute found");
          break;
        }
        d = e * 3, h = l[d], f = l[d + 1], p = l[d + 2], s.randomDirectionVector3OnSphere(
          this.attributes[t],
          e,
          h,
          f,
          p,
          this.position._value,
          r._value.x,
          r._spread.x
        );
        break;
      case _.DISC:
        if (l = (C = (b = this.attributes) == null ? void 0 : b.position.typedArray) == null ? void 0 : C.array, !l) {
          console.error("No position attribute found");
          break;
        }
        d = e * 3, h = l[d], f = l[d + 1], p = l[d + 2], s.randomDirectionVector3OnDisc(
          this.attributes[t],
          e,
          h,
          f,
          p,
          this.position._value,
          r._value.x,
          r._spread.x
        );
        break;
      case _.LINE:
        s.randomVector3OnLine(
          this.attributes[t],
          e,
          i,
          o
        );
        break;
    }
    if (t === "acceleration") {
      var y = s.clamp(
        s.randomFloat(this.drag._value, this.drag._spread),
        0,
        1
      );
      this.attributes.acceleration.typedArray.array[e * 4 + 3] = y;
    }
  }
  _assignAbsLifetimeValue(e, t) {
    var r = this.attributes[t].typedArray, i = this[t], o;
    // @ts-expect-error - it was like that originally
    s.arrayValuesAreEqual(i._value) && // @ts-expect-error - it was like that originally
    s.arrayValuesAreEqual(i._spread) ? (o = Math.abs(s.randomFloat(i._value[0], i._spread[0])), r.setVec4Components(e, o, o, o, o)) : r.setVec4Components(
      e,
      // @ts-expect-error - it was like that originally
      Math.abs(s.randomFloat(i._value[0], i._spread[0])),
      // @ts-expect-error - it was like that originally
      Math.abs(s.randomFloat(i._value[1], i._spread[1])),
      // @ts-expect-error - it was like that originally
      Math.abs(s.randomFloat(i._value[2], i._spread[2])),
      // @ts-expect-error - it was like that originally
      Math.abs(s.randomFloat(i._value[3], i._spread[3]))
    );
  }
  _assignAngleValue(e) {
    var o;
    var t = (o = this.attributes) == null ? void 0 : o.angle.typedArray, r = this.angle, i;
    // @ts-expect-error - it was like that originally
    s.arrayValuesAreEqual(r._value) && // @ts-expect-error - it was like that originally
    s.arrayValuesAreEqual(r._spread) ? (i = s.randomFloat(r._value[0], r._spread[0]), t == null || t.setVec4Components(e, i, i, i, i)) : t == null || t.setVec4Components(
      e,
      // @ts-expect-error - it was like that originally
      s.randomFloat(r._value[0], r._spread[0]),
      // @ts-expect-error - it was like that originally
      s.randomFloat(r._value[1], r._spread[1]),
      // @ts-expect-error - it was like that originally
      s.randomFloat(r._value[2], r._spread[2]),
      // @ts-expect-error - it was like that originally
      s.randomFloat(r._value[3], r._spread[3])
    );
  }
  _assignParamsValue(e) {
    var t;
    (t = this.attributes) == null || t.params.typedArray.setVec4Components(
      e,
      this.isStatic ? 1 : 0,
      0,
      Math.abs(
        s.randomFloat(this.maxAge._value, this.maxAge._spread)
      ),
      s.randomFloat(this.wiggle._value, this.wiggle._spread)
    );
  }
  _assignRotationValue(e) {
    var t, r, i, o;
    (r = (t = this.attributes) == null ? void 0 : t.rotation.typedArray) == null || r.setVec3Components(
      e,
      s.getPackedRotationAxis(
        this.rotation._axis,
        this.rotation._axisSpread
      ),
      s.randomFloat(this.rotation._angle, this.rotation._angleSpread),
      this.rotation._static ? 0 : 1
    ), (o = (i = this.attributes) == null ? void 0 : i.rotationCenter.typedArray) == null || o.setVec3(
      e,
      this.rotation._center
    );
  }
  _assignColorValue(e) {
    s.randomColorAsHex(
      this.attributes.color,
      e,
      this.color._value,
      this.color._spread
    );
  }
  _resetParticle(e) {
    for (var t = this.resetFlags, r = this.updateFlags, i = this.updateCounts, o = this.attributeKeys, n, l, h = this.attributeCount - 1; h >= 0; --h)
      n = o[h], l = r[n], (t[n] === !0 || l === !0) && (this._assignValue(n, e), this._updateAttributeUpdateRange(n, e), l === !0 && i[n] === this.particleCount ? (r[n] = !1, i[n] = 0) : l == !0 && ++i[n]);
  }
  _updateAttributeUpdateRange(e, t) {
    var r = this.bufferUpdateRanges[e];
    r.min = Math.min(t, r.min), r.max = Math.max(t, r.max);
  }
  _resetBufferRanges() {
    var e = this.bufferUpdateRanges, t = this.bufferUpdateKeys, r = this.bufferUpdateCount - 1, i;
    for (r; r >= 0; --r)
      i = t[r], e[i].min = Number.POSITIVE_INFINITY, e[i].max = Number.NEGATIVE_INFINITY;
  }
  _onRemove() {
    this.particlesPerSecond = 0, this.attributeOffset = 0, this.activationIndex = 0, this.activeParticleCount = 0, this.group = null, this.attributes = null, this.paramsArray = null, this.age = 0;
  }
  _decrementParticleCount() {
    --this.activeParticleCount;
  }
  _incrementParticleCount() {
    ++this.activeParticleCount;
  }
  _checkParticleAges(e, t, r, i) {
    for (var o = t - 1, n, l, h, f; o >= e; --o)
      n = o * 4, f = r[n], f !== 0 && (h = r[n + 1], l = r[n + 2], this.direction === 1 ? (h += i, h >= l && (h = 0, f = 0, this._decrementParticleCount())) : (h -= i, h <= 0 && (h = l, f = 0, this._decrementParticleCount())), r[n] = f, r[n + 1] = h, this._updateAttributeUpdateRange("params", o));
  }
  _activateParticles(e, t, r, i) {
    for (var o = this.direction, n = e, l, h; n < t; ++n)
      l = n * 4, !(r[l] != 0 && this.particleCount !== 1) && (this._incrementParticleCount(), r[l] = 1, this._resetParticle(n), h = i * (n - e), r[l + 1] = o === -1 ? r[l + 2] - h : h, this._updateAttributeUpdateRange("params", n));
  }
  /**
   * Simulates one frame's worth of particles, updating particles
   * that are already alive, and marking ones that are currently dead
   * but should be alive as alive.
   *
   * If the emitter is marked as static, then this function will do nothing.
   *
   * @param  {Number} dt The number of seconds to simulate (deltaTime)
   */
  tick(e) {
    var d, y;
    if (!this.isStatic) {
      this.paramsArray === null && (this.paramsArray = (y = (d = this.attributes) == null ? void 0 : d.params.typedArray) == null ? void 0 : y.array);
      var t = this.attributeOffset, r = t + this.particleCount, i = this.paramsArray, o = this.particlesPerSecond * this.activeMultiplier * e, n = this.activationIndex;
      if (this._resetBufferRanges(), this._checkParticleAges(t, r, i, e), this.alive === !1) {
        this.age = 0;
        return;
      }
      if (this.duration !== null && this.age > this.duration) {
        this.alive = !1, this.age = 0;
        return;
      }
      var l = this.particleCount === 1 ? n : n | 0, h = Math.min(
        l + o,
        this.activationEnd
      ), f = h - this.activationIndex | 0, p = f > 0 ? e / f : 0;
      this._activateParticles(
        l,
        h,
        // @ts-expect-error - it was like that originally
        i,
        p
      ), this.activationIndex += o, this.activationIndex > r && (this.activationIndex = t), this.age += e;
    }
  }
  /**
   * Resets all the emitter's particles to their start positions
   * and marks the particles as dead if the `force` argument is
   * true.
   *
   * @param  {Boolean} [force=undefined] If true, all particles will be marked as dead instantly.
   * @return {Emitter}       This emitter instance.
   */
  reset(e) {
    if (this.age = 0, this.alive = !1, e === !0) {
      for (var t = this.attributeOffset, r = t + this.particleCount, i = this.paramsArray, o = this.attributes.params.bufferAttribute, n = r - 1, l; n >= t; --n)
        l = n * 4, i[l] = 0, i[l + 1] = 0;
      o.updateRange.offset = 0, o.updateRange.count = -1, o.needsUpdate = !0;
    }
    return this;
  }
  /**
   * Enables the emitter. If not already enabled, the emitter
   * will start emitting particles.
   *
   * @return {Emitter} This emitter instance.
   */
  enable() {
    return this.alive = !0, this;
  }
  /**
   * Disables th emitter, but does not instantly remove it's
   * particles fromt the scene. When called, the emitter will be
   * 'switched off' and just stop emitting. Any particle's alive will
   * be allowed to finish their lifecycle.
   *
   * @return {Emitter} This emitter instance.
   */
  disable() {
    return this.alive = !1, this;
  }
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
  remove() {
    return this.group !== null ? this.group.removeEmitter(this) : console.error("Emitter does not belong to a group, cannot remove."), this;
  }
}
class F {
  constructor(e, t, r, i) {
    u(this, "componentSize");
    u(this, "size");
    u(this, "TypedArrayConstructor");
    u(this, "array");
    u(this, "indexOffset");
    this.componentSize = typeof r == "number" ? r : 1, this.size = typeof t == "number" ? t : 1, this.TypedArrayConstructor = e || Float32Array, this.array = new e(t * this.componentSize), this.indexOffset = typeof i == "number" ? i : 0;
  }
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
  setSize(e, t) {
    var r = this.array.length;
    if (t || (e = e * this.componentSize), e < r)
      return this.shrink(e);
    if (e > r)
      return this.grow(e);
    console.info(
      "TypedArray is already of size:",
      e + ".",
      "Will not resize."
    );
  }
  /**
   * Shrinks the internal array.
   *
   * @param  {Number} size The new size of the typed array. Must be smaller than `this.array.length`.
   * @return {TypedArrayHelper}      Instance of this class.
   */
  shrink(e) {
    return this.array = this.array.subarray(0, e), this.size = e, this;
  }
  /**
   * Grows the internal array.
   * @param  {Number} size The new size of the typed array. Must be larger than `this.array.length`.
   * @return {TypedArrayHelper}      Instance of this class.
   */
  grow(e) {
    var t = this.array, r = new this.TypedArrayConstructor(e);
    return r.set(t), this.array = r, this.size = e, this;
  }
  /**
   * Perform a splice operation on this array's buffer.
   * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
   * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
   * @returns {Object} The TypedArrayHelper instance.
   */
  splice(e, t) {
    e *= this.componentSize, t *= this.componentSize;
    for (var r = [], i = this.array, o = i.length, n = 0; n < o; ++n)
      (n < e || n >= t) && r.push(i[n]);
    return this.setFromArray(0, r), this;
  }
  /**
   * Copies from the given TypedArray into this one, using the index argument
   * as the start position. Alias for `TypedArray.set`. Will automatically resize
   * if the given source array is of a larger size than the internal array.
   *
   * @param {Number} index      The start position from which to copy into this array.
   * @param {TypedArray} array The array from which to copy; the source array.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setFromArray(e, t) {
    var r = t.length, i = e + r;
    return i > this.array.length ? this.grow(i) : i < this.array.length && this.shrink(i), this.array.set(t, this.indexOffset + e), this;
  }
  /**
   * Set a Vector2 value at `index`.
   *
   * @param {Number} index The index at which to set the vec2 values from.
   * @param {Vector2} vec2  Any object that has `x` and `y` properties.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setVec2(e, t) {
    return this.setVec2Components(e, t.x, t.y);
  }
  /**
   * Set a Vector2 value using raw components.
   *
   * @param {Number} index The index at which to set the vec2 values from.
   * @param {Number} x     The Vec2's `x` component.
   * @param {Number} y     The Vec2's `y` component.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setVec2Components(e, t, r) {
    var i = this.array, o = this.indexOffset + e * this.componentSize;
    return i[o] = t, i[o + 1] = r, this;
  }
  /**
   * Set a Vector3 value at `index`.
   *
   * @param {Number} index The index at which to set the vec3 values from.
   * @param {Vector3} vec2  Any object that has `x`, `y`, and `z` properties.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setVec3(e, t) {
    return this.setVec3Components(e, t.x, t.y, t.z);
  }
  /**
   * Set a Vector3 value using raw components.
   *
   * @param {Number} index The index at which to set the vec3 values from.
   * @param {Number} x     The Vec3's `x` component.
   * @param {Number} y     The Vec3's `y` component.
   * @param {Number} z     The Vec3's `z` component.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setVec3Components(e, t, r, i) {
    var o = this.array, n = this.indexOffset + e * this.componentSize;
    return o[n] = t, o[n + 1] = r, o[n + 2] = i, this;
  }
  /**
   * Set a Vector4 value at `index`.
   *
   * @param {Number} index The index at which to set the vec4 values from.
   * @param {Vector4} vec2  Any object that has `x`, `y`, `z`, and `w` properties.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setVec4(e, t) {
    return this.setVec4Components(e, t.x, t.y, t.z, t.w);
  }
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
  setVec4Components(e, t, r, i, o) {
    var n = this.array, l = this.indexOffset + e * this.componentSize;
    return n[l] = t, n[l + 1] = r, n[l + 2] = i, n[l + 3] = o, this;
  }
  /**
   * Set a Matrix3 value at `index`.
   *
   * @param {Number} index The index at which to set the matrix values from.
   * @param {Matrix3} mat3 The 3x3 matrix to set from. Must have a TypedArray property named `elements` to copy from.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setMat3(e, t) {
    return this.setFromArray(
      this.indexOffset + e * this.componentSize,
      t.elements
    );
  }
  /**
   * Set a Matrix4 value at `index`.
   *
   * @param {Number} index The index at which to set the matrix values from.
   * @param {Matrix4} mat3 The 4x4 matrix to set from. Must have a TypedArray property named `elements` to copy from.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setMat4(e, t) {
    return this.setFromArray(
      this.indexOffset + e * this.componentSize,
      t.elements
    );
  }
  /**
   * Set a Color value at `index`.
   *
   * @param {Number} index The index at which to set the vec3 values from.
   * @param {Color} color  Any object that has `r`, `g`, and `b` properties.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setColor(e, t) {
    return this.setVec3Components(e, t.r, t.g, t.b);
  }
  /**
   * Set a Number value at `index`.
   *
   * @param {Number} index The index at which to set the vec3 values from.
   * @param {Number} numericValue  The number to assign to this index in the array.
   * @return {TypedArrayHelper} Instance of this class.
   */
  setNumber(e, t) {
    return this.array[this.indexOffset + e * this.componentSize] = t, this;
  }
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
  getValueAtIndex(e) {
    return this.array[this.indexOffset + e];
  }
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
  getComponentValueAtIndex(e) {
    return this.array.subarray(
      this.indexOffset + e * this.componentSize
    );
  }
}
const E = class E {
  constructor(e, t, r) {
    u(this, "type");
    u(this, "componentSize");
    u(this, "arrayType");
    u(this, "typedArray");
    u(this, "bufferAttribute");
    u(this, "dynamicBuffer");
    u(this, "updateMin");
    u(this, "updateMax");
    const i = E.typeSizeMap;
    this.type = typeof e == "string" && i.hasOwnProperty(e) ? e : "f", this.componentSize = i[this.type], this.arrayType = r || Float32Array, this.typedArray = null, this.bufferAttribute = null, this.dynamicBuffer = !!t, this.updateMin = 0, this.updateMax = 0;
  }
  /**
   * Calculate the minimum and maximum update range for this buffer attribute using
   * component size independant min and max values.
   *
   * @param {Number} min The start of the range to mark as needing an update.
   * @param {Number} max The end of the range to mark as needing an update.
   */
  setUpdateRange(e, t) {
    this.updateMin = Math.min(
      e * this.componentSize,
      this.updateMin * this.componentSize
    ), this.updateMax = Math.max(
      t * this.componentSize,
      this.updateMax * this.componentSize
    );
  }
  /**
   * Calculate the number of indices that this attribute should mark as needing
   * updating. Also marks the attribute as needing an update.
   */
  flagUpdate() {
    var r;
    const e = this.bufferAttribute, t = e == null ? void 0 : e.updateRange;
    if (!e || !t) {
      console.error("No attribute or range found");
      return;
    }
    t.offset = this.updateMin, t.count = Math.min(
      this.updateMax - this.updateMin + this.componentSize,
      ((r = this.typedArray) == null ? void 0 : r.array.length) || 0
    ), e.needsUpdate = !0;
  }
  /**
   * Reset the index update counts for this attribute
   */
  resetUpdateRange() {
    this.updateMin = 0, this.updateMax = 0;
  }
  resetDynamic() {
    if (!this.bufferAttribute) {
      console.error("No buffer attribute found");
      return;
    }
    this.bufferAttribute.usage = this.dynamicBuffer ? c.DynamicDrawUsage : c.StaticDrawUsage;
  }
  /**
   * Perform a splice operation on this attribute's buffer.
   * @param  {Number} start The start index of the splice. Will be multiplied by the number of components for this attribute.
   * @param  {Number} end The end index of the splice. Will be multiplied by the number of components for this attribute.
   */
  splice(e, t) {
    var r;
    (r = this.typedArray) == null || r.splice(e, t), this.forceUpdateAll();
  }
  forceUpdateAll() {
    if (!this.bufferAttribute || !this.typedArray) {
      console.error("No buffer attribute or typed array found");
      return;
    }
    this.bufferAttribute.array = this.typedArray.array, this.bufferAttribute.updateRange.offset = 0, this.bufferAttribute.updateRange.count = -1, this.bufferAttribute.usage = c.StaticDrawUsage, this.bufferAttribute.needsUpdate = !0;
  }
  /**
   * Make sure this attribute has a typed array associated with it.
   *
   * If it does, then it will ensure the typed array is of the correct size.
   *
   * If not, a new TypedArrayHelper instance will be created.
   *
   * @param  {Number} size The size of the typed array to create or update to.
   */
  _ensureTypedArray(e) {
    this.typedArray !== null && this.typedArray.size === e * this.componentSize || (this.typedArray !== null && this.typedArray.size !== e ? this.typedArray.setSize(e) : this.typedArray === null && (this.typedArray = new F(
      this.arrayType,
      e,
      this.componentSize
    )));
  }
  /**
   * Creates a THREE.BufferAttribute instance if one doesn't exist already.
   *
   * Ensures a typed array is present by calling _ensureTypedArray() first.
   *
   * If a buffer attribute exists already, then it will be marked as needing an update.
   *
   * @param  {Number} size The size of the typed array to create if one doesn't exist, or resize existing array to.
   */
  _createBufferAttribute(e) {
    var t, r;
    if (this._ensureTypedArray(e), this.bufferAttribute !== null) {
      this.bufferAttribute.array = ((t = this.typedArray) == null ? void 0 : t.array) || [], parseFloat(c.REVISION) >= 81 && (this.bufferAttribute.count = this.bufferAttribute.array.length / this.bufferAttribute.itemSize), this.bufferAttribute.needsUpdate = !0;
      return;
    }
    this.bufferAttribute = new c.BufferAttribute(
      ((r = this.typedArray) == null ? void 0 : r.array) || [],
      this.componentSize
    ), this.bufferAttribute.usage = this.dynamicBuffer ? c.DynamicDrawUsage : c.StaticDrawUsage;
  }
  /**
   * Returns the length of the typed array associated with this attribute.
   * @return {Number} The length of the typed array. Will be 0 if no typed array has been created yet.
   */
  getLength() {
    return this.typedArray === null ? 0 : this.typedArray.array.length;
  }
};
/**
 * A map of uniform types to their component size.
 * @enum {Number}
 */
u(E, "typeSizeMap", {
  /**
   * Float
   * @type {Number}
   */
  f: 1,
  /**
   * Vec2
   * @type {Number}
   */
  v2: 2,
  /**
   * Vec3
   * @type {Number}
   */
  v3: 3,
  /**
   * Vec4
   * @type {Number}
   */
  v4: 4,
  /**
   * Color
   * @type {Number}
   */
  c: 3,
  /**
   * Mat3
   * @type {Number}
   */
  m3: 9,
  /**
   * Mat4
   * @type {Number}
   */
  m4: 16
});
let m = E;
class K {
  constructor(e) {
    u(this, "uuid");
    u(this, "fixedTimeStep");
    u(this, "texture");
    u(this, "textureFrames");
    u(this, "textureFrameCount");
    u(this, "textureLoop");
    u(this, "hasPerspective");
    u(this, "colorize");
    u(this, "maxParticleCount");
    u(this, "blending");
    u(this, "transparent");
    u(this, "alphaTest");
    u(this, "depthWrite");
    u(this, "depthTest");
    u(this, "fog");
    u(this, "scale");
    u(this, "emitters");
    u(this, "emitterIDs");
    u(this, "_pool");
    u(this, "_poolCreationSettings");
    u(this, "_createNewWhenPoolEmpty");
    u(this, "_attributesNeedRefresh");
    u(this, "_attributesNeedDynamicReset");
    u(this, "particleCount");
    u(this, "uniforms");
    u(this, "defines");
    u(this, "attributes");
    u(this, "attributeKeys");
    u(this, "attributeCount");
    u(this, "material");
    u(this, "geometry");
    u(this, "mesh");
    var r, i, o, n;
    var t = s.types;
    e = s.ensureTypedArg(
      e,
      t.OBJECT,
      {}
    ), e.texture = s.ensureTypedArg(
      e.texture,
      t.OBJECT,
      {}
    ), this.uuid = c.MathUtils.generateUUID(), this.fixedTimeStep = s.ensureTypedArg(
      e.fixedTimeStep,
      t.NUMBER,
      0.016
    ), this.texture = s.ensureInstanceOf(
      (r = e.texture) == null ? void 0 : r.value,
      c.Texture,
      null
    ), this.textureFrames = s.ensureInstanceOf(
      (i = e.texture) == null ? void 0 : i.frames,
      c.Vector2,
      new c.Vector2(1, 1)
    ), this.textureFrameCount = s.ensureTypedArg(
      (o = e.texture) == null ? void 0 : o.frameCount,
      t.NUMBER,
      this.textureFrames.x * this.textureFrames.y
    ), this.textureLoop = s.ensureTypedArg(
      (n = e.texture) == null ? void 0 : n.loop,
      t.NUMBER,
      1
    ), this.textureFrames.max(new c.Vector2(1, 1)), this.hasPerspective = s.ensureTypedArg(
      e.hasPerspective,
      t.BOOLEAN,
      !0
    ), this.colorize = s.ensureTypedArg(
      e.colorize,
      t.BOOLEAN,
      !0
    ), this.maxParticleCount = typeof e.maxParticleCount == "number" ? e.maxParticleCount : null, this.blending = s.ensureTypedArg(
      e.blending,
      t.NUMBER,
      c.AdditiveBlending
    ), this.transparent = s.ensureTypedArg(
      e.transparent,
      t.BOOLEAN,
      !0
    ), this.alphaTest = s.ensureTypedArg(
      e.alphaTest,
      t.NUMBER,
      0
    ), this.depthWrite = s.ensureTypedArg(
      e.depthWrite,
      t.BOOLEAN,
      !1
    ), this.depthTest = s.ensureTypedArg(
      e.depthTest,
      t.BOOLEAN,
      !0
    ), this.fog = s.ensureTypedArg(e.fog, t.BOOLEAN, !0), this.scale = s.ensureTypedArg(e.scale, t.NUMBER, 300), this.emitters = [], this.emitterIDs = [], this._pool = [], this._poolCreationSettings = null, this._createNewWhenPoolEmpty = !1, this._attributesNeedRefresh = !1, this._attributesNeedDynamicReset = !1, this.particleCount = 0, this.uniforms = {
      tex: {
        type: "t",
        value: this.texture
      },
      textureAnimation: {
        type: "v4",
        value: new c.Vector4(
          this.textureFrames.x,
          this.textureFrames.y,
          this.textureFrameCount,
          Math.max(Math.abs(this.textureLoop), 1)
        )
      },
      fogColor: {
        type: "c",
        value: this.fog ? new c.Color() : null
      },
      fogNear: {
        type: "f",
        value: 10
      },
      fogFar: {
        type: "f",
        value: 200
      },
      fogDensity: {
        type: "f",
        value: 0.5
      },
      deltaTime: {
        type: "f",
        value: 0
      },
      runTime: {
        type: "f",
        value: 0
      },
      scale: {
        type: "f",
        value: this.scale
      }
    }, this.defines = {
      HAS_PERSPECTIVE: this.hasPerspective,
      COLORIZE: this.colorize,
      VALUE_OVER_LIFETIME_LENGTH: O,
      SHOULD_ROTATE_TEXTURE: !1,
      SHOULD_ROTATE_PARTICLES: !1,
      SHOULD_WIGGLE_PARTICLES: !1,
      SHOULD_CALCULATE_SPRITE: this.textureFrames.x > 1 || this.textureFrames.y > 1
    }, this.attributes = {
      position: new m("v3", !0),
      acceleration: new m("v4", !0),
      // w component is drag
      velocity: new m("v3", !0),
      rotation: new m("v4", !0),
      rotationCenter: new m("v3", !0),
      params: new m("v4", !0),
      // Holds (alive, age, delay, wiggle)
      size: new m("v4", !0),
      angle: new m("v4", !0),
      color: new m("v4", !0),
      opacity: new m("v4", !0)
    }, this.attributeKeys = Object.keys(
      this.attributes
    ), this.attributeCount = this.attributeKeys.length, this.material = new c.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: T.vertex,
      fragmentShader: T.fragment,
      blending: this.blending,
      transparent: this.transparent,
      alphaTest: this.alphaTest,
      depthWrite: this.depthWrite,
      depthTest: this.depthTest,
      defines: this.defines,
      fog: this.fog
    }), this.geometry = new c.BufferGeometry(), this.mesh = new c.Points(this.geometry, this.material), this.maxParticleCount === null && console.warn(
      "SPE.Group: No maxParticleCount specified. Adding emitters after rendering will probably cause errors."
    );
  }
  _updateDefines() {
    var e = this.emitters, t = e.length - 1, r, i = this.defines;
    for (t; t >= 0; --t)
      r = e[t], i.SHOULD_CALCULATE_SPRITE || (i.SHOULD_ROTATE_TEXTURE = i.SHOULD_ROTATE_TEXTURE || !!Math.max(
        Math.max.apply(null, r.angle.value),
        Math.max.apply(null, r.angle.spread)
      )), i.SHOULD_ROTATE_PARTICLES = i.SHOULD_ROTATE_PARTICLES || !!Math.max(
        r.rotation.angle,
        r.rotation.angleSpread
      ), i.SHOULD_WIGGLE_PARTICLES = i.SHOULD_WIGGLE_PARTICLES || !!Math.max(r.wiggle.value, r.wiggle.spread);
    this.material.needsUpdate = !0;
  }
  _applyAttributesToGeometry() {
    var e = this.attributes, t = this.geometry, r = t.attributes, i, o;
    for (var n in e)
      e.hasOwnProperty(n) && (i = e[n], o = r[n], o ? o.array = i.typedArray.array : t.setAttribute(n, i.bufferAttribute), i.bufferAttribute.needsUpdate = !0);
    this.geometry.setDrawRange(0, this.particleCount);
  }
  /**
   * Adds an SPE.Emitter instance to this group, creating particle values and
   * assigning them to this group's shader attributes.
   *
   * @param {Emitter} emitter The emitter to add to this group.
   */
  addEmitter(e) {
    if (e instanceof x) {
      if (this.emitterIDs.indexOf(e.uuid) > -1) {
        console.error(
          "Emitter already exists in this group. Will not add again."
        );
        return;
      } else if (e.group !== null) {
        console.error(
          "Emitter already belongs to another group. Will not add to requested group."
        );
        return;
      }
    } else {
      console.error(
        "`emitter` argument must be instance of SPE.Emitter. Was provided with:",
        e
      );
      return;
    }
    var t = this.attributes, r = this.particleCount, i = r + e.particleCount;
    this.particleCount = i, this.maxParticleCount !== null && this.particleCount > this.maxParticleCount && console.warn(
      "SPE.Group: maxParticleCount exceeded. Requesting",
      this.particleCount,
      "particles, can support only",
      this.maxParticleCount
    ), e._calculatePPSValue(
      e.maxAge._value + e.maxAge._spread
    ), e._setBufferUpdateRanges(this.attributeKeys), e._setAttributeOffset(r), e.group = this, e.attributes = this.attributes;
    for (var o in t)
      t.hasOwnProperty(o) && t[o]._createBufferAttribute(
        this.maxParticleCount !== null ? this.maxParticleCount : this.particleCount
      );
    for (var n = r; n < i; ++n)
      e._assignPositionValue(n), e._assignForceValue(n, "velocity"), e._assignForceValue(n, "acceleration"), e._assignAbsLifetimeValue(n, "opacity"), e._assignAbsLifetimeValue(n, "size"), e._assignAngleValue(n), e._assignRotationValue(n), e._assignParamsValue(n), e._assignColorValue(n);
    return this._applyAttributesToGeometry(), this.emitters.push(e), this.emitterIDs.push(e.uuid), this._updateDefines(e), this.material.needsUpdate = !0, this.geometry.needsUpdate = !0, this._attributesNeedRefresh = !0, this;
  }
  /**
   * Removes an SPE.Emitter instance from this group. When called,
   * all particle's belonging to the given emitter will be instantly
   * removed from the scene.
   *
   * @param {Emitter} emitter The emitter to add to this group.
   */
  removeEmitter(e) {
    var t = this.emitterIDs.indexOf(e.uuid);
    if (e instanceof x) {
      if (t === -1) {
        console.error(
          "Emitter does not exist in this group. Will not remove."
        );
        return;
      }
    } else {
      console.error(
        "`emitter` argument must be instance of SPE.Emitter. Was provided with:",
        e
      );
      return;
    }
    for (var r = e.attributeOffset, i = r + e.particleCount, o = this.attributes.params.typedArray, n = r; n < i; ++n)
      o && (o.array[n * 4] = 0, o.array[n * 4 + 1] = 0);
    this.emitters.splice(t, 1), this.emitterIDs.splice(t, 1);
    for (var l in this.attributes)
      if (this.attributes.hasOwnProperty(l)) {
        const h = l;
        this.attributes[h].splice(r, i);
      }
    this.particleCount -= e.particleCount, e._onRemove(), this._attributesNeedRefresh = !0;
  }
  /**
   * Fetch a single emitter instance from the pool.
   * If there are no objects in the pool, a new emitter will be
   * created if specified.
   *
   * @return {Emitter|null}
   */
  getFromPool() {
    var e = this._pool, t = this._createNewWhenPoolEmpty;
    if (e.length)
      return e.pop();
    if (t) {
      var r = new x(
        this._poolCreationSettings
      );
      return this.addEmitter(r), r;
    }
    return null;
  }
  /**
   * Release an emitter into the pool.
   *
   * @param  {ShaderParticleEmitter} emitter
   * @return {Group} This group instance.
   */
  releaseIntoPool(e) {
    if (!(e instanceof x)) {
      console.error("Argument is not instanceof SPE.Emitter:", e);
      return;
    }
    return e.reset(), this._pool.unshift(e), this;
  }
  /**
   * Get the pool array
   *
   * @return {Array}
   */
  getPool() {
    return this._pool;
  }
  /**
   * Add a pool of emitters to this particle group
   *
   * @param {Number} numEmitters      The number of emitters to add to the pool.
   * @param {EmitterOptions|Array} emitterOptions  An object, or array of objects, describing the options to pass to each emitter.
   * @param {Boolean} createNew       Should a new emitter be created if the pool runs out?
   * @return {Group} This group instance.
   */
  addPool(e, t, r) {
    var i;
    this._poolCreationSettings = t, this._createNewWhenPoolEmpty = !!r;
    for (var o = 0; o < e; ++o)
      Array.isArray(t) ? i = new x(t[o]) : i = new x(t), this.addEmitter(i), this.releaseIntoPool(i);
    return this;
  }
  _triggerSingleEmitter(e) {
    var i;
    var t = this.getFromPool(), r = this;
    if (!t) {
      console.log("SPE.Group pool ran out.");
      return;
    }
    return e instanceof c.Vector3 && ((i = t.position.value) == null || i.copy(e), t.position.value = t.position.value), t.enable(), setTimeout(
      function() {
        if (!t) {
          console.error("Emitter is null");
          return;
        }
        t.disable(), r.releaseIntoPool(t);
      },
      Math.max(
        t.duration,
        t.maxAge.value + t.maxAge.spread
      ) * 1e3
    ), this;
  }
  /**
   * Set a given number of emitters as alive, with an optional position
   * vector3 to move them to.
   *
   * @param  {Number} numEmitters The number of emitters to activate
   * @param  {Object} [position=undefined] A THREE.Vector3 instance describing the position to activate the emitter(s) at.
   * @return {Group} This group instance.
   */
  triggerPoolEmitter(e, t) {
    if (typeof e == "number" && e > 1)
      for (var r = 0; r < e; ++r)
        this._triggerSingleEmitter(t);
    else
      this._triggerSingleEmitter(t);
    return this;
  }
  _updateUniforms(e) {
    this.uniforms.runTime.value += e, this.uniforms.deltaTime.value = e;
  }
  _resetBufferRanges() {
    var e = this.attributeKeys, t = this.attributeCount - 1, r = this.attributes;
    for (t; t >= 0; --t)
      r[e[t]].resetUpdateRange();
  }
  _updateBuffers(e) {
    var t = this.attributeKeys, r = this.attributeCount - 1, i = this.attributes, o = e.bufferUpdateRanges, n, l, h;
    for (r; r >= 0; --r)
      n = t[r], l = o[n], h = i[n], h.setUpdateRange(l.min, l.max), h.flagUpdate();
  }
  /**
   * Simulate all the emitter's belonging to this group, updating
   * attribute values along the way.
   * @param  {Number} [dt=Group's `fixedTimeStep` value] The number of seconds to simulate the group's emitters for (deltaTime)
   */
  tick(e) {
    var t = this.emitters, r = t.length, i = e || this.fixedTimeStep, o = this.attributeKeys, n, l = this.attributes;
    if (this._updateUniforms(i), this._resetBufferRanges(), !(r === 0 && this._attributesNeedRefresh === !1 && this._attributesNeedDynamicReset === !1)) {
      for (let h = 0, f; h < r; ++h)
        f = t[h], f.tick(i), this._updateBuffers(f);
      if (this._attributesNeedDynamicReset === !0) {
        for (n = this.attributeCount - 1, n; n >= 0; --n)
          l[o[n]].resetDynamic();
        this._attributesNeedDynamicReset = !1;
      }
      if (this._attributesNeedRefresh === !0) {
        for (n = this.attributeCount - 1, n; n >= 0; --n)
          l[o[n]].forceUpdateAll();
        this._attributesNeedRefresh = !1, this._attributesNeedDynamicReset = !0;
      }
    }
  }
  /**
   * Dipose the geometry and material for the group.
   *
   * @return {Group} Group instance.
   */
  dispose() {
    return this.geometry.dispose(), this.material.dispose(), this;
  }
}
const W = {
  distributions: _,
  valueOverLifetimeLength: O,
  shaderChunks: g,
  shaders: T,
  Emitter: x,
  Group: K,
  utils: s,
  ShaderAttribute: m,
  TypedArrayHelper: F
};
export {
  W as default
};
