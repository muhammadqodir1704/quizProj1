import { useEffect, useRef, useCallback } from "react"
import dayjs from "dayjs"

export type CheatEvent =
  | "Tab changed / Window minimized"
  | "Window lost focus"
  | "Window focused"
  | "DevTools opened"
  | "DevTools hotkey"
  | "Fullscreen exited"
  | "Fullscreen entered"
  | "Copy"
  | "Paste"
  | "Cut"
  | "Context menu"
  | "Offline"
  | "Online"
  | "Page hide"
  | "Before unload"

interface CheatingProps {
  token: string
  studentName: string
  answerIds: number[]
  unansweredQuestionIds: number[]
  // ixtiyoriy sozlamalar
  throttleMs?: number     
  devToolsPollMs?: number      
  webhookUrl?: string        
  onLog?: (payload: any) => void 
}

// Tashqi tomondan ham foydalanish uchun helper: fullscreen so‘rash
export async function requestAppFullscreen(): Promise<void> {
  const el = document.documentElement as any
  const req =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen
  if (req) await req.call(el)
}

export default function Cheating({
  token,
  studentName,
  answerIds,
  unansweredQuestionIds,
  throttleMs = 15000,
  devToolsPollMs = 1000,
  webhookUrl,
  onLog,
}: CheatingProps) {
  const tokenRef = useRef(token)
  const studentRef = useRef(studentName)
  const answersRef = useRef(answerIds)
  const unansweredRef = useRef(unansweredQuestionIds)

  useEffect(() => { tokenRef.current = token }, [token])
  useEffect(() => { studentRef.current = studentName }, [studentName])
  useEffect(() => { answersRef.current = answerIds }, [answerIds])
  useEffect(() => { unansweredRef.current = unansweredQuestionIds }, [unansweredQuestionIds])

  const lastSentRef = useRef<Record<string, number>>({})

  const logOnly = useCallback(async (event: CheatEvent) => {
    const now = Date.now()
    const last = lastSentRef.current[event] || 0
    if (now - last < throttleMs) return // throttle

    lastSentRef.current[event] = now

    const payload = {
      event,
      time: dayjs().format("HH:mm:ss"),
      token: tokenRef.current,
      studentName: studentRef.current,
      answerIds: answersRef.current,
      unansweredQuestionIds: unansweredRef.current,
      pageUrl: location.href,
      userAgent: navigator.userAgent,
    }
    onLog?.(payload)
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        })
      } catch (e) {
      }
    }

    // 3) Hech bo‘lmasa konsolga yozamiz
    if (!onLog && !webhookUrl) {
      // eslint-disable-next-line no-console
      console.log("Cheating log:", payload)
    }
  }, [onLog, webhookUrl, throttleMs])

  const detectDevTools = useCallback(() => {
    const threshold = 160
    const widthDiff = window.outerWidth - window.innerWidth > threshold
    const heightDiff = window.outerHeight - window.innerHeight > threshold
    if (widthDiff || heightDiff) {
      void logOnly("DevTools opened")
    }
  }, [logOnly])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        void logOnly("Tab changed / Window minimized")
      } else {
        void logOnly("Window focused")
      }
    }
    const onBlur = () => void logOnly("Window lost focus")
    const onFocus = () => void logOnly("Window focused")

    const onFsChange = () => {
      const isFs =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement
      void logOnly(isFs ? "Fullscreen entered" : "Fullscreen exited")
    }

    const onKeydown = (e: KeyboardEvent) => {
      const isF12 = e.key === "F12" || e.key === "f12"
      const isCtrlShiftI = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i")
      if (isF12 || isCtrlShiftI) {
        void logOnly("DevTools hotkey")
      }
    }

    const onCopy = () => void logOnly("Copy")
    const onPaste = () => void logOnly("Paste")
    const onCut = () => void logOnly("Cut")
    const onContext = () => void logOnly("Context menu")

    const onOffline = () => void logOnly("Offline")
    const onOnline = () => void logOnly("Online")

    const onPageHide = () => void logOnly("Page hide")
    const onBeforeUnload = () => void logOnly("Before unload")

    let devToolsInterval: number | undefined
    if (devToolsPollMs > 0) {
      devToolsInterval = window.setInterval(detectDevTools, devToolsPollMs)
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("blur", onBlur)
    window.addEventListener("focus", onFocus)

    document.addEventListener("fullscreenchange", onFsChange as EventListener)
    document.addEventListener("webkitfullscreenchange", onFsChange as EventListener)
    document.addEventListener("mozfullscreenchange", onFsChange as EventListener)

    window.addEventListener("keydown", onKeydown)

    document.addEventListener("copy", onCopy)
    document.addEventListener("paste", onPaste)
    document.addEventListener("cut", onCut)
    document.addEventListener("contextmenu", onContext)

    window.addEventListener("offline", onOffline)
    window.addEventListener("online", onOnline)

    window.addEventListener("pagehide", onPageHide)
    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      if (devToolsInterval) window.clearInterval(devToolsInterval)

      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("focus", onFocus)

      document.removeEventListener("fullscreenchange", onFsChange as EventListener)
      document.removeEventListener("webkitfullscreenchange", onFsChange as EventListener)
      document.removeEventListener("mozfullscreenchange", onFsChange as EventListener)

      window.removeEventListener("keydown", onKeydown)

      document.removeEventListener("copy", onCopy)
      document.removeEventListener("paste", onPaste)
      document.removeEventListener("cut", onCut)
      document.removeEventListener("contextmenu", onContext)

      window.removeEventListener("offline", onOffline)
      window.removeEventListener("online", onOnline)

      window.removeEventListener("pagehide", onPageHide)
      window.removeEventListener("beforeunload", onBeforeUnload)
    }
  }, [logOnly, detectDevTools, devToolsPollMs])

  return null
}
