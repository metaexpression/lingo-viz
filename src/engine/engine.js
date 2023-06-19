import {Clock, Vector3, Vector2} from 'three'
import {ctx, setupScene} from './scene'

// only one object hovered at a time
let hoveredObject = null

// type: 'hover' or 'click'
const castRays = (type = 'hover', position) => {
  let {raycaster, pointer, camera, scene} = ctx
  raycaster.setFromCamera(position ? position : pointer, camera);
  let intersects = raycaster.intersectObjects(scene.children, false);

  // if there are any objects under the pointer
  if (intersects.length > 0) {
    let i = 1
    let target = intersects[0].object

    // phase through frames until a solid object is found, or return
    while(target.phase) {
      if (intersects.length > (i + 1)) {
        target = intersects[i++].object
      } else {
        // no solid objects!
        if (hoveredObject) {
          hoveredObject.mouseLeave ? hoveredObject.mouseLeave() : null
          hoveredObject = null
          return;
        }
        return;
      }
    }

    // if it was a click
    if (type === 'click') {
      return target;
    }
    // if there's a new object hovered
    if (hoveredObject != target) {
      if (hoveredObject) {
        hoveredObject.mouseLeave ? hoveredObject.mouseLeave() : null
      }
      hoveredObject = target
      hoveredObject.mouseEnter ? hoveredObject.mouseEnter() : null
    }
    // if the object is the one already hovered, no nothing,
    // the callback only fires once per hover
  } else {
    // no objects hovered
    if (hoveredObject) {
      hoveredObject.mouseLeave ? hoveredObject.mouseLeave() : null
      hoveredObject = null
    }
  }
}

const clickHooks = []

export const addClickHook = (h) =>
  clickHooks.push(h)

const addEventListeners = () => {
  document.addEventListener('pointermove', (e) => {
    ctx.pointer.x = ( e.clientX / ctx.w ) * 2 - 1;
    ctx.pointer.y = - ( e.clientY / ctx.h ) * 2 + 1;
  });
  let canvas = document.querySelector('canvas')
  canvas.addEventListener('click', (e) => {
    let click = new Vector2()
    click.x = ( e.clientX / ctx.w ) * 2 - 1;
    click.y = - ( e.clientY / ctx.h ) * 2 + 1;
    let r = castRays('click', click)
    clickHooks.forEach(hook => hook(r))
  });

}

const renderingHooks = []

export const addRenderingHook = (h) =>
  renderingHooks.push(h)

export const setupEngine = () => {
  setupScene()
  addEventListeners()
  addRenderingHook(castRays)
  return ctx
}

export const startRendering = () => {
  let clock = new Clock();
  let delta = 0;
  let interval = 1 / 30;
  let cycle = () => {
    requestAnimationFrame(cycle);
    delta += clock.getDelta();
    if (delta  > interval) {
      renderingHooks.forEach(hook => hook())
      ctx.renderer.render(ctx.scene, ctx.camera);
      delta = delta % interval;
    }
  }
  cycle();
}
