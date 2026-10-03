'use client';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '@/state/store';
import { tweens } from '@/animation/tween';
import { damp } from '@/utils/math';

/**
 * PostStack — hand-written post pipeline.
 *
 * Why not @react-three/postprocessing: this needs four passes with one custom
 * grade, and owning the render loop is also how the chapter wipe and the boot
 * exposure ramp are driven. The whole stack is ~120 lines and one extra render
 * target chain, against two dependencies and a generic effect graph.
 *
 * scene -> HDR target -> bright pass (1/4) -> H blur -> V blur -> composite
 * composite does: chromatic aberration, bloom add, cold-shadow grade, ACES,
 * vignette, shadow-weighted grain, sRGB encode, transition wipe.
 */
export function PostStack(): JSX.Element | null {
  const { gl, scene, camera, size, viewport } = useThree();
  const lowEffects = useExperience((s) => s.lowEffects);
  const phase = useExperience((s) => s.phase);
  const transitioning = useExperience((s) => s.transitioning);

  const dpr = viewport.dpr;
  const w = Math.max(2, Math.floor(size.width * dpr));
  const h = Math.max(2, Math.floor(size.height * dpr));

  const rt = useMemo(() => {
    const opts = { type: THREE.HalfFloatType, samples: 4 } as const;
    const main = new THREE.WebGLRenderTarget(w, h, opts);
    const a = new THREE.WebGLRenderTarget(Math.max(2, w >> 2), Math.max(2, h >> 2), { type: THREE.HalfFloatType });
    const b = new THREE.WebGLRenderTarget(Math.max(2, w >> 2), Math.max(2, h >> 2), { type: THREE.HalfFloatType });
    return { main, a, b };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passes = useMemo(() => {
    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const fsScene = new THREE.Scene();
    const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const bright = new THREE.ShaderMaterial({
      uniforms: { tD: { value: null as THREE.Texture | null }, uT: { value: 1.05 } },
      vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        varying vec2 v; uniform sampler2D tD; uniform float uT;
        void main(){
          vec3 c = texture2D(tD, v).rgb;
          float l = dot(c, vec3(.2126,.7152,.0722));
          gl_FragColor = vec4(c * (max(0., l - uT) / max(l, 1e-4)), 1.);
        }`,
    });

    const blur = new THREE.ShaderMaterial({
      uniforms: {
        tD: { value: null as THREE.Texture | null },
        uDir: { value: new THREE.Vector2(1, 0) },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        varying vec2 v; uniform sampler2D tD; uniform vec2 uDir, uRes;
        void main(){
          vec2 o = uDir / uRes; vec3 s = vec3(0.);
          s += texture2D(tD, v - o * 4.).rgb * .051;
          s += texture2D(tD, v - o * 3.).rgb * .0918;
          s += texture2D(tD, v - o * 2.).rgb * .1225;
          s += texture2D(tD, v - o).rgb * .1533;
          s += texture2D(tD, v).rgb * .1633;
          s += texture2D(tD, v + o).rgb * .1533;
          s += texture2D(tD, v + o * 2.).rgb * .1225;
          s += texture2D(tD, v + o * 3.).rgb * .0918;
          s += texture2D(tD, v + o * 4.).rgb * .051;
          gl_FragColor = vec4(s, 1.);
        }`,
    });

    const composite = new THREE.ShaderMaterial({
      uniforms: {
        tD: { value: null as THREE.Texture | null },
        tB: { value: null as THREE.Texture | null },
        uTime: { value: 0 },
        uExposure: { value: 0 },
        uBloom: { value: 0.5 },
        uGrain: { value: 0.055 },
        uCA: { value: 0.0016 },
        uWipe: { value: 0 },
      },
      vertexShader: 'varying vec2 v; void main(){ v = uv; gl_Position = vec4(position.xy, 0., 1.); }',
      fragmentShader: `
        varying vec2 v;
        uniform sampler2D tD, tB;
        uniform float uTime, uExposure, uBloom, uGrain, uCA, uWipe;
        vec3 aces(vec3 x){ return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14), 0., 1.); }
        float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
        void main(){
          vec2 d = v - .5; float r2 = dot(d, d);
          vec2 off = d * (uCA + uWipe * .01) * r2 * 4.0;
          vec3 c;
          c.r = texture2D(tD, v + off).r;
          c.g = texture2D(tD, v).g;
          c.b = texture2D(tD, v - off).b;
          c += texture2D(tB, v).rgb * uBloom;
          c *= uExposure;
          float l = dot(c, vec3(.2126,.7152,.0722));
          c = mix(c, c * vec3(.82, 1.0, 1.06), smoothstep(.35, 0.0, l) * .55);
          c = aces(c);
          c *= smoothstep(1.0, .18, r2 * 2.1);
          float g = hash(v * vec2(1024., 768.) + fract(uTime) * 97.3);
          c += (g - .5) * (uGrain + uWipe * .25) * (1.0 - l * .55);
          c = pow(max(c, 0.), vec3(1. / 2.2));
          gl_FragColor = vec4(c * (1.0 - uWipe), 1.);
        }`,
    });

    const quad = new THREE.Mesh(quadGeo, composite);
    quad.frustumCulled = false;
    fsScene.add(quad);
    return { fsScene, fsCam, quad, bright, blur, composite };
  }, []);

  // Resize targets with the viewport instead of recreating them.
  useMemo(() => {
    rt.main.setSize(w, h);
    rt.a.setSize(Math.max(2, w >> 2), Math.max(2, h >> 2));
    rt.b.setSize(Math.max(2, w >> 2), Math.max(2, h >> 2));
  }, [rt, w, h]);

  const exposure = useRef(0);
  const wipe = useRef(0);

  useFrame((state, dt) => {
    tweens.step(Math.min(dt, 0.05));

    const u = passes.composite.uniforms;
    const targetExposure = phase === 'boot' ? 0.5 : 1;
    exposure.current = damp(exposure.current, targetExposure, phase === 'entering' ? 0.5 : 2.2, dt);
    wipe.current = damp(wipe.current, transitioning ? 1 : 0, transitioning ? 7 : 3.2, dt);

    u.uTime.value = state.clock.elapsedTime;
    u.uExposure.value = exposure.current;
    u.uWipe.value = wipe.current;
    u.uGrain.value = lowEffects ? 0 : 0.055;
    u.uCA.value = lowEffects ? 0 : 0.0016;

    // 1. scene -> HDR target
    gl.setRenderTarget(rt.main);
    gl.clear();
    gl.render(scene, camera);

    // 2. bloom chain (skipped entirely in low-effects mode)
    const doBloom = !lowEffects;
    if (doBloom) {
      passes.quad.material = passes.bright;
      passes.bright.uniforms.tD.value = rt.main.texture;
      gl.setRenderTarget(rt.a);
      gl.render(passes.fsScene, passes.fsCam);

      passes.quad.material = passes.blur;
      passes.blur.uniforms.uRes.value.set(rt.a.width, rt.a.height);
      passes.blur.uniforms.tD.value = rt.a.texture;
      passes.blur.uniforms.uDir.value.set(1, 0);
      gl.setRenderTarget(rt.b);
      gl.render(passes.fsScene, passes.fsCam);

      passes.blur.uniforms.tD.value = rt.b.texture;
      passes.blur.uniforms.uDir.value.set(0, 1);
      gl.setRenderTarget(rt.a);
      gl.render(passes.fsScene, passes.fsCam);
    }

    // 3. composite to screen
    passes.quad.material = passes.composite;
    u.tD.value = rt.main.texture;
    u.tB.value = doBloom ? rt.a.texture : rt.main.texture;
    u.uBloom.value = doBloom ? 0.5 : 0;
    gl.setRenderTarget(null);
    gl.render(passes.fsScene, passes.fsCam);
  }, 1);

  return null;
}
