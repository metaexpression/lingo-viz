import {h, Component, render, createContext, Fragment} from 'preact';
import {useEffect, useState, useRef, useContext, useCallback} from 'preact/hooks';
import base from '../styles/base.css'
import {useSubscription, useSelection, state} from '../util/state'

import {start, colors} from '../engine/editor'

import Settings from '../../public/resources/settings.svg'
import Edit from '../../public/resources/edit.svg'
import ChevronDown from '../../public/resources/chevron-down.svg'
import ChevronRight from '../../public/resources/chevron-right.svg'
import Box from '../../public/resources/box.svg'
import Attribute from '../../public/resources/attribute.svg'
import Delete from '../../public/resources/close.svg'
import Move from '../../public/resources/move.svg'
import Plus from '../../public/resources/plus.svg'
import Pen from '../../public/resources/pen.svg'
import Copy from '../../public/resources/copy.svg'

const UIPanel = () => {

}

const ColorPreview = (keys) => {
  if (keys.pattern === "solid") {
    return (
      <svg height="20" width="20">
        <g fill="currentcolor">
          <circle cx="10" cy="10" r="7" fill={keys.color} />
          <circle cx="10" cy="10" r="7" fill="none" stroke={keys.color} stroke-opacity="0.3" stroke-width="1" />
        </g>
      </svg>
    )
  }
}

const BigColorPreview = ({color, click}) => {
  return (
    <div style="height: 70px;min-width:54px;display:flex;flex-direction: column;align-items: center;" onClick={click}>
      <svg height="40" width="40">
        <g fill="currentcolor">
          <circle cx="20" cy="20" r="18" fill={color.hex} />
          <circle cx="20" cy="20" r="18" fill="none" stroke={color.hex} stroke-opacity="0.2" stroke-width="3" />
        </g>
      </svg>
      <div class="text" style="font-size: 12px;color: #91919A">{color.name}</div>
    </div>
  )
}

const BoxUI = ({box}) => {
  return (
    <Fragment>
      <div class="ui-box">

        <div class="ui-split" style="border-bottom: 1px solid #ffffff10">
          <div class="ui-group">
            <div class="icon box" style="margin-right: 0.5em" dangerouslySetInnerHTML={{ __html: Box}} />
            <div class="title">Cube</div>
          </div>
          <div class="ui-group">
            <div class="icon chevron-down" onClick={box.remove} style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Delete}} />
          </div>
        </div>

        <div class="ui-split" style="">
          <div class="ui-group">
            <div class="ui-group" style="min-width: 130px">
              <div class="icon attribute" style="margin-right: 0.5em" dangerouslySetInnerHTML={{ __html: Attribute}} />
              <div class="subtitle" style="margin-right: 0.5em">Color</div>
            </div>
            {ColorPreview({pattern: 'solid', color: box.color.hex})}
            <div class="text" style="margin-left: 0.5em">Solid {box.color.name}</div>
          </div>
          <div class="ui-group">
              <div class="icon" style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Pen}} />
          </div>
        </div>

        <div class="ui-list" style="border-bottom: 1px solid #ffffff10; min-height: 86px;">
          {Object.keys(colors).map(k =>
            <BigColorPreview color={colors[k]} click={() => box.setColor(colors[k])} />
          )}

        </div>

        <div class="ui-split" style="border-bottom: 1px solid #ffffff10">
          <div class="ui-group">
            <div class="ui-group" style="min-width: 130px">
              <div class="icon attribute" style="margin-right: 0.5em" dangerouslySetInnerHTML={{ __html: Attribute}} />
              <div class="subtitle" style="margin-right: 0.5em">Panels</div>
            </div>
            <div class="text" style="margin-left: 0.3em">None</div>
          </div>
          <div class="ui-group">
            <div class="icon" style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Plus}} />
          </div>
        </div>

        <div class="ui-split" style="border-bottom: 1px solid #ffffff10">
          <div class="ui-group">
            <div class="ui-group" style="min-width: 130px">
              <div class="icon attribute" style="margin-right: 0.5em" dangerouslySetInnerHTML={{ __html: Attribute}} />
              <div class="subtitle" style="margin-right: 0.5em">Decorations</div>
            </div>
            <div class="text" style="margin-left: 0.3em">None</div>
          </div>
          <div class="ui-group">
            <div class="icon" style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Plus}} />
          </div>
        </div>

        <div class="ui-split">
          <div class="ui-group">
            <div class="ui-group" style="min-width: 130px">
              <div class="icon attribute" style="margin-right: 0.5em" dangerouslySetInnerHTML={{ __html: Attribute}} />
              <div class="subtitle" style="margin-right: 0.5em">Position</div>
            </div>
            <div class="text position" style="margin-left: 0.3em">{`[${box.x}, ${box.y+1}, ${box.z}]`}</div>
          </div>
          <div class="ui-group">
            <div class="icon move" style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Move}} />
          </div>
        </div>

      </div>
    </Fragment>
  )
}

const ObjectUI = ({obj}) => {
  if (obj.type === 'box') {
    return (<BoxUI box={obj} />)
  } else {
    return null
  }
}

const Interface = () => {
  const [{selected, editmode}] = useSelection({name: 'ui-state'}, [])

  return (
    <Fragment>
      <div class="ui-box">
        <div class="ui-split">
          <div class="ui-group">
            <div class="title">Lingo-Viz</div>
            <div class="version">{"v0.1"}</div>
          </div>
          <div class="ui-group">
            <div class={editmode ? "icon active" : "icon"} dangerouslySetInnerHTML={{ __html: Edit}} />
            <div class="icon" style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Copy}} />
            <div class="icon" style="margin-left: 0.5em" dangerouslySetInnerHTML={{ __html: Settings}} />
          </div>
        </div>
      </div>
      {selected ? <ObjectUI obj={selected}/> : null}
    </Fragment>
  )
}

const Canvas = () => {
  useEffect(() => {
    start()
  },[])

  return (
    <div id="ui-container">
      <Interface />
    </div>
  )
}

export default Canvas
