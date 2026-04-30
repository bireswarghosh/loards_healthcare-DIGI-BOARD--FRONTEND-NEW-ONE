import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const CkEditor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });
  return (
    <div className="editor">
      <EditorContent editor={editor} />
    </div>
  )
}

export default CkEditor
