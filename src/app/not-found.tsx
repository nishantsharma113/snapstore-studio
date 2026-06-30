"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Layers, Search, Sparkles } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden select-none bg-background">
      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/8 blur-[120px] pointer-events-none" />

      {/* Floating decorative elements */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-16 hidden lg:block"
      >
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Layers className="h-6 w-6 text-primary/60" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [8, -8, 8], rotate: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-24 right-20 hidden lg:block"
      >
        <div className="h-10 w-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-secondary/60" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-32 right-32 hidden lg:block"
      >
        <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Search className="h-4 w-4 text-accent/60" />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-extrabold text-foreground tracking-tight">
              SnapStore <span className="text-primary font-semibold">Studio</span>
            </span>
          </Link>
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, type: "spring", bounce: 0.3 }}
          className="relative mb-6"
        >
          <span className="text-[clamp(6rem,20vw,12rem)] font-black leading-none tracking-tighter text-gradient select-none">
            404
          </span>
          {/* Reflection */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{
              background: "linear-gradient(to top, hsl(var(--background)), transparent)",
              transform: "scaleY(-1) translateY(-100%)",
              opacity: 0.4,
            }}
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="space-y-2 mb-10"
        >
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Page not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved. Let&rsquo;s get
            you back to designing beautiful screenshots.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 transition-all duration-200 active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-border bg-surface text-foreground text-sm font-semibold shadow-sm hover:bg-muted/60 hover:border-primary/30 transition-all duration-200 active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </motion.div>

        {/* Decorative divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 flex items-center gap-6 text-xs text-muted-foreground/50"
        >
          {["Dashboard", "Projects", "Templates", "Assets", "Settings"].map((item, i) => (
            <React.Fragment key={item}>
              {i > 0 && <span>·</span>}
              <Link
                href={`/dashboard${i === 0 ? "" : `/${item.toLowerCase()}`}`}
                className="hover:text-muted-foreground transition-colors"
              >
                {item}
              </Link>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
