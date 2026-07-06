import React from 'react'

/* useTweaks — lightweight view-preference state.
 * In the Claude Design mockup this also spoke the host edit-mode protocol;
 * in the real app it is just persistent UI state (list mode, row density). */
export function useTweaks(defaults) {
  const [values, setValues] = React.useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bluescan.tweaks') || 'null')
      return saved ? { ...defaults, ...saved } : defaults
    } catch {
      return defaults
    }
  })
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits =
      typeof keyOrEdits === 'object' && keyOrEdits !== null
        ? keyOrEdits
        : { [keyOrEdits]: val }
    setValues((prev) => {
      const next = { ...prev, ...edits }
      try {
        localStorage.setItem('bluescan.tweaks', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])
  return [values, setTweak]
}
