import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  handler: () => void
  description?: string
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Hook to register keyboard shortcuts
 * @param options Configuration with shortcuts array and enabled flag
 * 
 * @example
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { key: 's', ctrlKey: true, handler: () => saveForm(), description: 'Save form' },
 *     { key: 'Escape', handler: () => closeModal(), description: 'Close modal' },
 *   ],
 *   enabled: isModalOpen,
 * });
 */
export const useKeyboardShortcuts = ({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions): void => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow Escape key to work even in input fields
        if (event.key !== 'Escape') {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])
}

/**
 * Predefined keyboard shortcut configurations for common actions
 */
export const KeyboardShortcuts = {
  /**
   * Save form (Ctrl+S)
   */
  save: (handler: () => void): KeyboardShortcut => ({
    key: 's',
    ctrlKey: true,
    handler,
    description: 'Save',
  }),

  /**
   * Close modal/dialog (Escape)
   */
  escape: (handler: () => void): KeyboardShortcut => ({
    key: 'Escape',
    handler,
    description: 'Close',
  }),

  /**
   * Delete item (Ctrl+Delete)
   */
  delete: (handler: () => void): KeyboardShortcut => ({
    key: 'Delete',
    ctrlKey: true,
    handler,
    description: 'Delete',
  }),

  /**
   * Undo (Ctrl+Z)
   */
  undo: (handler: () => void): KeyboardShortcut => ({
    key: 'z',
    ctrlKey: true,
    handler,
    description: 'Undo',
  }),

  /**
   * Redo (Ctrl+Shift+Z)
   */
  redo: (handler: () => void): KeyboardShortcut => ({
    key: 'z',
    ctrlKey: true,
    shiftKey: true,
    handler,
    description: 'Redo',
  }),

  /**
   * Search (Ctrl+K)
   */
  search: (handler: () => void): KeyboardShortcut => ({
    key: 'k',
    ctrlKey: true,
    handler,
    description: 'Search',
  }),

  /**
   * Create new (Ctrl+N)
   */
  new: (handler: () => void): KeyboardShortcut => ({
    key: 'n',
    ctrlKey: true,
    handler,
    description: 'New',
  }),
}
