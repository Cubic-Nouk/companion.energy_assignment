import '@xyflow/react/dist/style.css'

import {
  Background,
  BackgroundVariant,
  ReactFlow,
  useReactFlow,
  type NodeTypes,
} from '@xyflow/react'
import { Tooltip } from 'radix-ui'

import { ZoomControls } from '../../../components/ZoomControls/ZoomControls'

import type { Site } from '../domain/site'
import { AssetCard } from './AssetCard'
import styles from './SiteDiagram.module.css'
import { buildSiteGraph } from './siteGraph'

const DOT_GAP_PX = 20
const MIN_ZOOM = 0.25
const MAX_ZOOM = 2
/** Opening a site frames its cards, but never zooms past real size on a small site. */
const FIT_VIEW_OPTIONS = { padding: 0.3, maxZoom: 1 }
const ZOOM_ANIMATION_MS = 200

// Defined once, outside render: React Flow warns when the node type map changes identity.
const NODE_TYPES: NodeTypes = { assetCard: AssetCard }

interface SiteDiagramProps {
  site: Site
}

/** The site's grid connection and the assets behind it, on a dotted plane that pans and zooms. */
export function SiteDiagram({ site }: SiteDiagramProps) {
  const { nodes, edges } = buildSiteGraph(site)

  return (
    <div className={styles.canvas}>
      <Tooltip.Provider delayDuration={200}>
        {/* Uncontrolled: React Flow keeps card positions while they are dragged around. */}
        <ReactFlow
          defaultNodes={nodes}
          defaultEdges={edges}
          nodeTypes={NODE_TYPES}
          nodesConnectable={false}
          fitView
          fitViewOptions={FIT_VIEW_OPTIONS}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
        >
          <Background variant={BackgroundVariant.Dots} gap={DOT_GAP_PX} size={1.5} />
          {/* Top right, like the map's: the bottom-left corner holds the map embed. */}
          <DiagramZoomControls />
        </ReactFlow>
      </Tooltip.Provider>
    </div>
  )
}

/** The shared zoom control, driven by React Flow; it must render inside the flow to reach it. */
function DiagramZoomControls() {
  const { zoomIn, zoomOut } = useReactFlow()
  return (
    <ZoomControls
      onZoomIn={() => void zoomIn({ duration: ZOOM_ANIMATION_MS })}
      onZoomOut={() => void zoomOut({ duration: ZOOM_ANIMATION_MS })}
    />
  )
}
