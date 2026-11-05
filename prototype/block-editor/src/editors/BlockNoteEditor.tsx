import { useEffect, useMemo } from 'react'
import type { PartialBlock } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/shadcn/style.css'

const seed: PartialBlock[] = [
  { type: 'heading', props: { level: 1 }, content: 'Trip planning' },
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Book the ', styles: {} },
      { type: 'text', text: 'train', styles: { bold: true } },
      { type: 'text', text: ' early, it is ', styles: {} },
      { type: 'text', text: 'much', styles: { italic: true } },
      { type: 'text', text: ' cheaper. See the ', styles: {} },
      { type: 'link', href: 'https://example.com', content: 'timetable' },
      { type: 'text', text: '.', styles: {} },
    ],
  },
  { type: 'bulletListItem', content: 'Passports' },
  { type: 'bulletListItem', content: 'Chargers' },
  { type: 'checkListItem', props: { checked: true }, content: 'Book hotel' },
  { type: 'checkListItem', props: { checked: false }, content: 'Book train' },
  { type: 'quote', content: 'Travel light, plan loosely.' },
  { type: 'codeBlock', props: { language: 'typescript' }, content: 'const days = 4\nconsole.log(days)' },
  { type: 'divider' },
  { type: 'paragraph' },
]

export default function BlockNoteEditor({
  theme,
  onChange,
}: {
  theme: 'light' | 'dark'
  onChange: (doc: unknown) => void
}) {
  const initialContent = useMemo(() => seed, [])
  const editor = useCreateBlockNote({ initialContent })
  useEffect(() => onChange(editor.document), [editor, onChange])
  return (
    <BlockNoteView
      editor={editor}
      theme={theme}
      onChange={() => onChange(editor.document)}
    />
  )
}
