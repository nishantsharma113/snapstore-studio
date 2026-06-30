"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/store/editorStore"

/**
 * Global keyboard shortcuts for the canvas editor.
 * Skips all shortcuts when focus is inside an input, textarea, select, or contenteditable.
 *
 * Ctrl+Z         Undo
 * Ctrl+Y / Ctrl+Shift+Z  Redo
 * Delete / Backspace     Delete selected layer(s)
 * Ctrl+C         Copy selected layer
 * Ctrl+V         Paste clipboard layer
 * Ctrl+X         Cut selected layer
 * Ctrl+D         Duplicate selected layer
 * Ctrl+A         Select all unlocked layers
 * Escape         Deselect all
 * Ctrl+=  / Ctrl++       Zoom in
 * Ctrl+-         Zoom out
 * Ctrl+0         Reset zoom to default (25%)
 * ]              Bring selected layer forward
 * [              Send selected layer backward
 * Ctrl+Shift+C   Copy layer style
 * Ctrl+Shift+V   Paste layer style
 */
export function useKeyboardShortcuts() {
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const deleteLayer = useEditorStore((s) => s.deleteLayer)
  const copyLayer = useEditorStore((s) => s.copyLayer)
  const pasteLayer = useEditorStore((s) => s.pasteLayer)
  const cutLayer = useEditorStore((s) => s.cutLayer)
  const duplicateLayer = useEditorStore((s) => s.duplicateLayer)
  const setSelectedIds = useEditorStore((s) => s.setSelectedIds)
  const selectAllLayers = useEditorStore((s) => s.selectAllLayers)
  const setZoom = useEditorStore((s) => s.setZoom)
  const reorderLayer = useEditorStore((s) => s.reorderLayer)
  const copyLayerStyle = useEditorStore((s) => s.copyLayerStyle)
  const pasteLayerStyle = useEditorStore((s) => s.pasteLayerStyle)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return

      const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform)
      const ctrl = isMac ? e.metaKey : e.ctrlKey

      // Read fresh state inside handler to avoid stale closures
      const { selectedIds, zoom } = useEditorStore.getState()

      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        e.preventDefault()
        selectedIds.forEach((id) => deleteLayer(id))
      } else if (ctrl && e.shiftKey && e.key === "C" && selectedIds.length > 0) {
        e.preventDefault()
        copyLayerStyle(selectedIds[0])
      } else if (ctrl && e.shiftKey && e.key === "V" && selectedIds.length > 0) {
        e.preventDefault()
        pasteLayerStyle(selectedIds[0])
      } else if (ctrl && e.key === "c" && selectedIds.length > 0) {
        e.preventDefault()
        copyLayer(selectedIds[0])
      } else if (ctrl && e.key === "v") {
        e.preventDefault()
        pasteLayer()
      } else if (ctrl && e.key === "x" && selectedIds.length > 0) {
        e.preventDefault()
        cutLayer(selectedIds[0])
      } else if (ctrl && e.key === "d" && selectedIds.length > 0) {
        e.preventDefault()
        duplicateLayer(selectedIds[0])
      } else if (ctrl && e.key === "a") {
        e.preventDefault()
        selectAllLayers()
      } else if (e.key === "Escape") {
        setSelectedIds([])
      } else if (ctrl && (e.key === "=" || e.key === "+")) {
        e.preventDefault()
        setZoom(Math.min(zoom + 0.1, 3))
      } else if (ctrl && e.key === "-") {
        e.preventDefault()
        setZoom(Math.max(zoom - 0.1, 0.05))
      } else if (ctrl && e.key === "0") {
        e.preventDefault()
        setZoom(0.25)
      } else if (e.key === "]" && !ctrl && selectedIds.length > 0) {
        e.preventDefault()
        reorderLayer(selectedIds[0], "up")
      } else if (e.key === "[" && !ctrl && selectedIds.length > 0) {
        e.preventDefault()
        reorderLayer(selectedIds[0], "down")
      }
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [
    undo,
    redo,
    deleteLayer,
    copyLayer,
    pasteLayer,
    cutLayer,
    duplicateLayer,
    setSelectedIds,
    selectAllLayers,
    setZoom,
    reorderLayer,
    copyLayerStyle,
    pasteLayerStyle,
  ])
}
