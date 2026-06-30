"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, Trash2, X } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmVariant = "danger" | "warning" | "info"

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  icon?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

// ─── Variant Config ────────────────────────────────────────────────────────────

const variantConfig: Record<
  ConfirmVariant,
  {
    iconBg: string
    iconColor: string
    confirmBtn: string
    borderGlow: string
    defaultIcon: React.ReactNode
  }
> = {
  danger: {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    confirmBtn:
      "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)] hover:shadow-[0_0_28px_rgba(239,68,68,0.5)]",
    borderGlow:
      "border-zinc-800/60 shadow-[0_0_0_1px_rgba(239,68,68,0.12),0_30px_60px_rgba(0,0,0,0.7)]",
    defaultIcon: <Trash2 className="h-6 w-6" />,
  },
  warning: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    confirmBtn:
      "bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.5)]",
    borderGlow:
      "border-zinc-800/60 shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_30px_60px_rgba(0,0,0,0.7)]",
    defaultIcon: <AlertTriangle className="h-6 w-6" />,
  },
  info: {
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-400",
    confirmBtn:
      "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_28px_rgba(168,85,247,0.5)]",
    borderGlow:
      "border-zinc-800/60 shadow-[0_0_0_1px_rgba(168,85,247,0.12),0_30px_60px_rgba(0,0,0,0.7)]",
    defaultIcon: <AlertTriangle className="h-6 w-6" />,
  },
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant]

  // Keyboard shortcuts: Escape → cancel, Enter → confirm
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
      if (e.key === "Enter") onConfirm()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onCancel, onConfirm])

  // Lock body scroll while open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Blurred Backdrop ── */}
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9998] bg-black/65 backdrop-blur-md"
            onClick={onCancel}
          />

          {/* ── Dialog Panel ── */}
          <motion.div
            key="confirm-panel"
            initial={{ opacity: 0, scale: 0.86, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: 28 }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          >
            <div
              className={`pointer-events-auto relative w-[min(92vw,420px)] rounded-2xl border bg-zinc-950 p-7 ${cfg.borderGlow}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle top gradient accent line */}
              <div
                className={`absolute top-0 left-8 right-8 h-[1px] rounded-full ${
                  variant === "danger"
                    ? "bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
                    : variant === "warning"
                      ? "bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
                      : "bg-gradient-to-r from-transparent via-purple-500/40 to-transparent"
                }`}
              />

              {/* Top-right close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Icon Badge */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05, type: "spring", stiffness: 500, damping: 28 }}
                className={`inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-5 ${cfg.iconBg} ${cfg.iconColor}`}
              >
                {icon ?? cfg.defaultIcon}
              </motion.div>

              {/* Title */}
              <h2 className="text-[15px] font-bold text-white mb-2 leading-snug pr-8">{title}</h2>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed mb-7">{description}</p>

              {/* Divider */}
              <div className="border-t border-zinc-800/50 mb-5" />

              {/* Keyboard hint */}
              <p className="text-[10px] text-zinc-600 mb-4 text-right">
                <kbd className="font-mono bg-zinc-900 border border-zinc-800 rounded px-1">Esc</kbd>{" "}
                to cancel &nbsp;·&nbsp;{" "}
                <kbd className="font-mono bg-zinc-900 border border-zinc-800 rounded px-1">↵</kbd>{" "}
                to confirm
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all duration-150 cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${cfg.confirmBtn}`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  if (typeof window === "undefined") return null
  return createPortal(content, document.body)
}

// ─── useConfirm Hook ───────────────────────────────────────────────────────────

interface ConfirmOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmVariant
  icon?: React.ReactNode
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: ((value: boolean) => void) | null
}

const defaultState: ConfirmState = {
  open: false,
  title: "",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "danger",
  icon: undefined,
  resolve: null,
}

/**
 * @hook useConfirm
 * Provides an async `confirm(options)` function that opens an attractive
 * modal dialog and resolves `true` if the user confirms, `false` if cancelled.
 *
 * Spread `dialogProps` onto a `<ConfirmDialog />` element in your JSX.
 *
 * @example
 * const { confirm, dialogProps } = useConfirm()
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: "Delete project?",
 *     description: "This action cannot be undone.",
 *     variant: "danger",
 *   })
 *   if (ok) await deleteProject()
 * }
 *
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <ConfirmDialog {...dialogProps} />
 *   </>
 * )
 */
export function useConfirm() {
  const [state, setState] = React.useState<ConfirmState>(defaultState)

  const confirm = React.useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...defaultState, ...options, open: true, resolve })
    })
  }, [])

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true)
    setState(defaultState)
  }, [state])

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false)
    setState(defaultState)
  }, [state])

  const dialogProps: ConfirmDialogProps = {
    open: state.open,
    title: state.title,
    description: state.description,
    confirmLabel: state.confirmLabel ?? "Confirm",
    cancelLabel: state.cancelLabel ?? "Cancel",
    variant: state.variant ?? "danger",
    icon: state.icon,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }

  return { confirm, dialogProps }
}
