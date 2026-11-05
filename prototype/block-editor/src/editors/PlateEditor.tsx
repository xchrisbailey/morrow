import { useEffect, useMemo } from 'react'
import { Plate, usePlateEditor } from 'platejs/react'
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit'
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit'
import { CodeBlockKit } from '@/components/editor/plugins/code-block-kit'
import { LinkKit } from '@/components/editor/plugins/link-kit'
import { ListKit } from '@/components/editor/plugins/list-kit'
import { AutoformatKit } from '@/components/editor/plugins/autoformat-kit'
import { DndKit } from '@/components/editor/plugins/dnd-kit'
import { SlashKit } from '@/components/editor/plugins/slash-kit'
import { BlockPlaceholderKit } from '@/components/editor/plugins/block-placeholder-kit'
import { Editor, EditorContainer } from '@/components/ui/editor'
import { TooltipProvider } from '@/components/ui/tooltip'

const t = (text: string, marks: Record<string, boolean> = {}) => ({ text, ...marks })

const seed = [
  { type: 'h1', children: [t('Trip planning')] },
  {
    type: 'p',
    children: [
      t('Book the '),
      t('train', { bold: true }),
      t(' early, it is '),
      t('much', { italic: true }),
      t(' cheaper. See the '),
      { type: 'a', url: 'https://example.com', children: [t('timetable')] },
      t('.'),
    ],
  },
  { type: 'p', indent: 1, listStyleType: 'disc', children: [t('Passports')] },
  { type: 'p', indent: 1, listStyleType: 'disc', children: [t('Chargers')] },
  { type: 'p', indent: 1, listStyleType: 'todo', checked: true, children: [t('Book hotel')] },
  { type: 'p', indent: 1, listStyleType: 'todo', checked: false, children: [t('Book train')] },
  { type: 'blockquote', children: [t('Travel light, plan loosely.')] },
  {
    type: 'code_block',
    lang: 'typescript',
    children: [
      { type: 'code_line', children: [t('const days = 4')] },
      { type: 'code_line', children: [t('console.log(days)')] },
    ],
  },
  { type: 'hr', children: [t('')] },
  { type: 'p', children: [t('')] },
]

export default function PlateEditor({ onChange }: { onChange: (doc: unknown) => void }) {
  const plugins = useMemo(
    () => [
      ...BasicBlocksKit,
      ...BasicMarksKit,
      ...CodeBlockKit,
      ...LinkKit,
      ...ListKit,
      ...AutoformatKit,
      ...DndKit,
      ...SlashKit,
      ...BlockPlaceholderKit,
    ],
    [],
  )
  const editor = usePlateEditor({ plugins, value: seed as never })
  useEffect(() => onChange(editor.children), [editor, onChange])
  return (
    <TooltipProvider>
      <Plate editor={editor} onChange={({ value }) => onChange(value)}>
        <EditorContainer>
          <Editor variant="none" className="px-12 py-4" placeholder="Type '/' for commands" />
        </EditorContainer>
      </Plate>
    </TooltipProvider>
  )
}
