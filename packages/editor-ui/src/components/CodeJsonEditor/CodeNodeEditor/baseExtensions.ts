import {
  history,
  indentLess,
  indentMore,
  insertNewlineAndIndent,
  toggleComment,
  redo,
  deleteCharBackward,
  undo
} from '@codemirror/commands'
import { acceptCompletion, selectedCompletion } from '@codemirror/autocomplete'

export const enterKeyMap: KeyBinding[] = [
  {
    key: 'Enter',
    run: (editor) => {
      if (selectedCompletion(editor.state)) {
        return acceptCompletion(editor)
      }

      return insertNewlineAndIndent(editor)
    }
  }
]

export const tabKeyMap: KeyBinding[] = [
  {
    any(editor, event) {
      if (event.key === 'Tab' || (event.key === 'Escape' && selectedCompletion(editor.state))) {
        event.stopPropagation()
      }

      return false
    }
  },
  {
    key: 'Tab',
    run: (editor) => {
      if (selectedCompletion(editor.state)) {
        return acceptCompletion(editor)
      }

      return indentMore(editor)
    }
  },
  { key: 'Shift-Tab', run: indentLess }
]
