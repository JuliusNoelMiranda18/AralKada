"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

interface WaveformPlayerProps {
  /** The text to speak aloud using the browser's Speech Synthesis API */
  summaryText?: string
  className?: string
}

export default function WaveformPlayer({ summaryText, className }: WaveformPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [supported, setSupported] = React.useState(true)
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null)
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = React.useRef<number>(0)
  const elapsedRef = React.useRef<number>(0)

  // Randomised bar heights (stable across renders)
  const barHeights = React.useMemo(
    () => Array.from({ length: 60 }, () => 20 + Math.random() * 40),
    []
  )

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false)
    }
    return () => {
      stopSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopSpeech = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    window.speechSynthesis?.cancel()
    setIsPlaying(false)
    setProgress(0)
    elapsedRef.current = 0
  }

  const startSpeech = () => {
    if (!summaryText || !window.speechSynthesis) return

    // Pick a natural, slower rate for a 20-30 second feel over the summary
    const utterance = new SpeechSynthesisUtterance(summaryText)
    utterance.rate = 0.95
    utterance.pitch = 1.05
    utterance.volume = 1

    // Prefer a natural English voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))
    )
    if (preferred) utterance.voice = preferred

    // Estimate duration: ~150 words per minute at rate 0.95 → chars/min ÷ 5
    const wordCount = summaryText.split(/\s+/).length
    durationRef.current = Math.max(20, (wordCount / 150) * 60 * 1000) // ms

    utterance.onstart = () => {
      setIsPlaying(true)
      elapsedRef.current = 0
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 200
        const pct = Math.min((elapsedRef.current / durationRef.current) * 100, 99)
        setProgress(pct)
      }, 200)
    }

    utterance.onend = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setProgress(100)
      setIsPlaying(false)
    }

    utterance.onerror = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setIsPlaying(false)
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const togglePlay = () => {
    if (isPlaying) {
      stopSpeech()
    } else {
      setProgress(0)
      startSpeech()
    }
  }

  const restart = () => {
    stopSpeech()
    setTimeout(startSpeech, 100)
  }

  if (!supported) {
    return (
      <p className="text-xs text-paper-muted font-bold text-center">
        Your browser does not support text-to-speech.
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-5 w-full", className)}>
      {/* Waveform visual */}
      <div
        className="relative rounded-2xl overflow-hidden w-full"
        style={{ height: 64, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        {/* Bars */}
        <div className="absolute inset-0 flex justify-between items-center px-2">
          {barHeights.map((h, idx) => {
            const inProgress = (idx / barHeights.length) * 100 < progress
            return (
              <motion.div
                key={idx}
                className="rounded-full"
                style={{ width: 2, height: h }}
                animate={isPlaying && inProgress ? { scaleY: [1, 1.4, 0.8, 1.2, 1], opacity: [0.6, 1, 0.7, 1, 0.8] } : { scaleY: 1, opacity: inProgress ? 0.9 : 0.3 }}
                transition={{ duration: 0.6, repeat: isPlaying && inProgress ? Infinity : 0, repeatType: "mirror", delay: (idx % 10) * 0.05 }}
              >
                <div className="w-full h-full rounded-full" style={{ background: inProgress ? "var(--duo-green)" : "rgba(255,255,255,0.4)" }} />
              </motion.div>
            )
          })}
        </div>
        {/* Progress overlay */}
        <div
          className="absolute top-0 left-0 h-full transition-all"
          style={{ width: `${progress}%`, background: "rgba(88,204,2,0.15)", borderRight: "2px solid var(--duo-green)" }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={togglePlay}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 h-12 px-8 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl text-white"
          style={{ background: isPlaying ? "var(--pal-cafenoir)" : "var(--duo-green)", border: "2px solid rgba(0,0,0,0.2)", borderBottom: "4px solid rgba(0,0,0,0.3)" }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? "Pause" : "Play Session"}
        </motion.button>

        {(isPlaying || progress > 0) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={restart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-12 w-12 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)" }}
            title="Restart"
          >
            <RotateCcw size={16} className="text-white" />
          </motion.button>
        )}
      </div>
    </div>
  )
}
