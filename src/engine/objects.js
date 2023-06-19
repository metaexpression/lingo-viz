import {BoxGeometry, MeshPhongMaterial, Mesh, WireframeGeometry, LineSegments, LineBasicMaterial, Vector3, Line,
  MeshBasicMaterial, EdgesGeometry, Vector2} from 'three'
import {TextGeometry} from 'three-examples/geometries/TextGeometry';

import {ctx} from './scene'
import {addRenderingHook} from './engine'


// ---- Text Rendering

const textList = []
const addText = (text, color, x, y, z) => {
  let textGeo = new TextGeometry(text, {
    font: ctx.font,
    size: 0.1,
    height: 0.001,
    curveSegments: 3
  });

  let textMaterial = new MeshBasicMaterial({color});
  let textMesh = new Mesh(textGeo, textMaterial);
  textMesh.position.copy(new Vector3(x, y, z));
  textList.push(textMesh)
  ctx.scene.add(textMesh);
  return textMesh;
}

const rotateText = () => {
  textList.forEach(t => {
    t.quaternion.copy(ctx.camera.quaternion);
  })
}

addRenderingHook(rotateText)


// ---- Platform Object

export const createPlatform = () => {
  let platformGeometry = new BoxGeometry(1, 0.1, 1);
  let material = new MeshPhongMaterial({color: 0x27272A});
  let platform = new Mesh(platformGeometry, material);
  platform.scale.set(3, 1, 3)

  platform.position.set(0, -1.6, 0)

  let frame = lineMeshFromBox(0x000000, true, platformGeometry)
  frame.position.set(0, -1.6, 0)
  frame.scale.set(3, 1, 3)

  let frame2 = lineMeshFromBox(0x000000, true, platformGeometry)
  frame2.position.set(0, -2, 0)
  frame2.scale.set(3, 1, 3)

  let frame3 = lineMeshFromBox(0x000000, true, platformGeometry)
  frame3.position.set(0, -2.4, 0)
  frame3.material.opacity = 0.15
  frame3.scale.set(3, 1, 3)

  let frame4 = lineMeshFromBox(0x000000, true, platformGeometry)
  frame4.position.set(0, -2.8, 0)
  frame4.material.opacity = 0.1
  frame4.scale.set(3, 1, 3)

  // add platform data to the context, remember to sync this and update the object
  // based on the number of extra squares on each side from the origin
  ctx.platform = {
    maxX: 1, maxZ: 1, minX: 1, minZ: 1
  }

  addRenderingHook(resetControls)

  ctx.scene.add(platform);

  platform.frames = [frame, frame2, frame3, frame4]
  platform.resize = (minX, maxX, minZ, maxZ) => {
    let xRange = (maxX - (0 - minX)) + 1
    let zRange = (maxZ - (0 - minZ)) + 1
    let xCenter = (maxX-(xRange/2)) + 0.5
    let zCenter = (maxZ-(zRange/2)) + 0.5

    ctx.platform.maxX = maxX
    ctx.platform.minX = minX
    ctx.platform.minZ = minZ
    ctx.platform.maxZ = maxZ

    platform.position.set(xCenter, -1.6, zCenter)
    platform.scale.set(xRange, 1, zRange)
  }

  return platform
}

const nudge = (n, min, max, delta) => {
  if (n < min) {
    let difference = min - n
    let factor = (difference / delta) * 0.5
    return n + (delta * factor);
  } else if (n > max) {
    let difference = n - max
    let factor = (difference / delta) * 0.5
    return n - (delta * factor)
  }
  return n
}

// slow movement back towards camera pan bounds, could be smoother
const resetControls = () => {
  let target = ctx.controls.target
  target.x = nudge(target.x, ctx.platform.minX*-2, ctx.platform.maxX*2, 0.08)
  target.z = nudge(target.z, ctx.platform.minZ*-2, ctx.platform.maxZ*2, 0.08)
  target.y = nudge(target.y, 0, 3, 0.08)
}


// ---- Cube Objects

const cubeGeometry = new BoxGeometry(1, 1, 1);

export const createCube = (x, y, z) => {
  let material = new MeshPhongMaterial({color: 0xf2f2f2});
  let cube = new Mesh(cubeGeometry, material);
  let frame = lineMeshFromBox(0x000000, true, cubeGeometry)

  frame.position.set(x, y, z)
  cube.position.set(x, y, z)

  cube.panels = []

  cube.remove = () => {
    ctx.scene.remove(cube)
    ctx.scene.remove(frame)
  }

  cube.setColor = (h) => {
    cube.material.color.setHex(h)
  }

  cube.setFrameColor = (h) => {
    frame.material.color.setHex(h)
    frame.material.opacity = 1
  }

  cube.revertFrameColor = (h) => {
    frame.material.color.setHex(0x000000)
    frame.material.opacity = 0.25
  }

  cube.addPanel = (side) => {
    let panel = experimentalPanel(cube, side)
    cube.panels.push(panel)
    panel.side = side
  }

  ctx.scene.add(cube);
  return cube
}


// ---- Panels & Inputs

const experimentalPanel = (cube, side) => {
  let geometry = new BoxGeometry(0.001, 0.90, 0.90);
  let material = new MeshPhongMaterial({color: 0x18181B});
  let panel = new Mesh(geometry, material);
  panel.position.set(0.5, 0, 0)
  //panel.rotateOnAxis(new Vector3(0, 1, 0), Math.PI * (1/2))
  cube.add(panel)

  panel.addInput = () => {
    let geometry2 = new BoxGeometry(0.001, 0.37, 0.80);
    let material2 = new MeshPhongMaterial({color: 0xffffff});
    let input = new Mesh(geometry2, material2);
    input.position.set(0.001, -0.21, 0)
    panel.add(input)

    let frame = lineMeshFromBox(0x94A3B8, false, geometry2)

    frame.position.set(0.001, -0.21, 0)
    panel.add(frame)

    panel.input = input
    panel.frame = frame
  }

  return panel;
}


// ---- Invisicube Objects

export const createInvisicube = (x, y, z) => {
  let scale = 0.55
  if (y == -1) scale = 0.6;
  if (y == 1) scale = 0.5;

  let bigGeometry = new BoxGeometry(scale, scale, scale);
  let smallGeometry = new BoxGeometry(0.2, 0.2, 0.2);

  let material = new MeshPhongMaterial();
  let cube = new Mesh(bigGeometry, material);

  let frame = lineMeshFromBox(0xF97316, false, smallGeometry)
  let plus = null

  frame.visible = false
  cube.visible = false

  frame.position.set(x, y, z)
  cube.position.set(x, y, z)

  cube.showFrame = () => {
    frame.visible = true
    plus = addPlus(x, y, z)
    pushPlus(plus)
    plus.quaternion.copy(ctx.camera.quaternion);
  }

  cube.hideFrame = () => {
    frame.visible = false
    if (plus) removePlus(plus);
    plus = null
  }

  cube.remove = () => {
    ctx.scene.remove(cube)
    ctx.scene.remove(frame)
    if (plus) removePlus(plus)
  }

  ctx.scene.add(cube);
  return cube
}

const plusList = []
const addPlus = (x, y, z) => {
  let plus = addText('+', 0xF97316, x, y, z)
  plus.origin = [x, y, z]
  plusList.push(plus)
  return plus
}

const removePlus = (plus) => {
  ctx.scene.remove(plus)
  textList.splice(textList.indexOf(plus), 1)
  plusList.splice(plusList.indexOf(plus), 1)
}

const pushPlus = (p) => {
  let [x, y, z] = p.origin
  let distance = 0.25

  let cameraPosition = new Vector3();
  ctx.camera.getWorldPosition(cameraPosition);

  let xDist = cameraPosition.x - x;
  let zDist = cameraPosition.z - z;

  let angle1 = Math.atan2(zDist, xDist);
  let targetAngle = (angle1 + (Math.PI/2)) % (Math.PI * 2)

  let factor1 = Math.sin(targetAngle)
  let factor2 = Math.cos(targetAngle)

  let px = (factor2*distance)+x
  let py = 0.2+y
  let pz = (factor1*distance)+z

  p.position.set(px, py, pz)
}

const rotatePlus = () => {
  plusList.forEach(p => {
    pushPlus(p)
  })
}

addRenderingHook(rotatePlus)


// ---- Utility

const lineMeshFromBox = (color, transparent, geometry) => {
  let edgeGeometry = new EdgesGeometry(geometry);
  let line = new LineSegments(edgeGeometry, new LineBasicMaterial({color, transparent, opacity: 0.25}));
  line.phase = true
  ctx.scene.add(line);
  return line
}
