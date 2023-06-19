import {useSubscription, useSelection, state} from '../util/state'

import {setupEngine, startRendering, addClickHook} from './engine'
import {createPlatform, createInvisicube, createCube} from './objects'

const initialHash = window.location.hash

const lingo = state.create({
  name: 'lingo-state',
  boxes: [],
  platformSize: {maxX: 1, minX: 1, maxZ: 1, minZ: 1},
  platform: null,
})

const ui = state.create({
  name: 'ui-state',
  selected: undefined,
  editmode: true,
})

const gridRangeX = () =>
  [0 - lingo.platformSize.minX, lingo.platformSize.maxX]

const gridRangeZ = () =>
  [0 - lingo.platformSize.minX, lingo.platformSize.maxX]

const getBox = (x, y, z) => {
  let result = null
  lingo.boxes.forEach(box => {
    if (box.x === x && box.y === y && box.z === z) {
      result = box
    }
  })
  return result
}

const removeBox = (box) =>
  lingo.boxes.splice(lingo.boxes.indexOf(box), 1)

addClickHook((o) => {
  if (!o && ui.selected) {
    ui.selected.mesh.revertFrameColor()
    state.edit(ui, {selected: null})
  } else if (o && ui.selected && o !== ui.selected) {
    ui.selected.mesh.revertFrameColor()
    state.edit(ui, {selected: null})
  }
})

addClickHook((o) => {
  if (o) {
    o.click ? o.click() : null
  }
})

export const colors = {
  white: {raw: 0xf2f2f2, hex: "#f2f2f2", name: "White"},
  black: {raw: 0x222222, hex: "#222222", name: "Black"},
  blue: {raw: 0x003585, hex: "#003585", name: "Blue"},
  red: {raw: 0xe02b00, hex: "#e02b00", name: "Red"},
  yellow: {raw: 0xffff00, hex: "#ffff00", name: "Yellow"},
  purple: {raw: 0x7100a5, hex: "#7100a5", name: "Purple"},
  green: {raw: 0x118e29, hex: "#118e29", name: "Green"},
  orange: {raw: 0xe07e00, hex: "#e07e00", name: "Orange"},
  grey: {raw: 0xa0a0a0, hex: "#a0a0a0", name: "Grey"},
}

const addInvisicube = (x, y, z) => {
  let box = {type: 'invsible', x, y, z, mesh: createInvisicube(x, y, z)}
  lingo.boxes.push(box)

  box.mesh.click = () => {
    box.mesh.remove()
    removeBox(box)
    let cube = addCube(x, y, z)
    cube.mesh.setFrameColor(0xF97316)
    state.edit(ui, {selected: cube})
  }

  box.mesh.mouseEnter = () => {
    box.mesh.showFrame()
  }

  box.mesh.mouseLeave = () => {
    box.mesh.hideFrame()
  }

  box.remove = () => {
    box.mesh.remove()
    removeBox(box)
  }

  return box
}

const addCube = (x, y, z) => {
  let box = {type: 'box', x, y, z, mesh: createCube(x, y, z), color: colors.white}
  lingo.boxes.push(box)

  box.mesh.click = () => {
    state.edit(ui, {selected: box})
    box.mesh.setFrameColor(0xF97316)
  }

  box.remove = () => {
    box.mesh.remove()
    removeBox(box)
    if (ui.selected == box) {
      state.edit(ui, {selected: null})
    }
    refreshInvisicubes()
  }

  box.setColor = (color) => {
    box.mesh.setColor(color.raw)
    box.color = color
  }

  box.addPanel = (side) => {
    box.mesh.addPanel(side)
  }

  refreshInvisicubes()
  console.log(box)

  return box
}

const createInitialTower = () => {
  addInvisicube(0, -1, 0)
  addInvisicube(0, 0, 0)
  addInvisicube(0, 1, 0)
}

// quicker method would be to iterate over boxes and check orthogonals?
const refreshInvisicubes = () => {
  // add Invisicubes orthogonal to existing blocks
  // and the origin tower

  let [x0, xm] = gridRangeX(), [z0, zm] = gridRangeZ()
  for (let x = x0; x <= xm; x++) {
    for (let z = z0; z <= zm; z++) {
      for (let y = -1; y <= 1; y++) {
        let orth = getOrthogonals(x, y, z)
        let current = getBox(x, y, z)
        let boxes = orth.map(([x, y, z]) => getBox(x, y, z))
        let adjacent = false
        boxes.forEach(b => {
          if (b && b.type === "box") {
            adjacent = true
          }
        })
        if (adjacent && !current) {
          addInvisicube(x, y, z)
        }
        if (!adjacent && current && current.type === "invsible") {
          current.remove()
        }
      }
    }
  }
  if (!getBox(0, -1, 0)) addInvisicube(0, -1, 0)
  if (!getBox(0, 0, 0)) addInvisicube(0, 0, 0)
  if (!getBox(0, 1, 0)) addInvisicube(0, 1, 0)
}

const getOrthogonals = (x, y, z) => {
  return ([
    [x+1, y, z],
    [x-1, y, z],
    [x, y+1, z],
    [x, y-1, z],
    [x, y, z+1],
    [x, y, z-1],
  ])
}

export const start = () => {
  setupEngine()
  startRendering()
  lingo.platform = createPlatform()
  if (initialHash.trim() === "") {
    createInitialTower()

    // let test = addCube(0, 1, 0)
    // test.mesh.addPanel(0)

    lingo.platform.resize(1, 1, 1, 1)
  } else {
    // decode hashed/encrypted state here
  }
}
