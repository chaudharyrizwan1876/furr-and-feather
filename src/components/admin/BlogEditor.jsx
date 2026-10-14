'use client';
import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  FiBold, FiItalic, FiLink, FiList, FiMinus, FiCode, FiX,
} from 'react-icons/fi';
import { MdFormatListNumbered, MdFormatQuote, MdTitle, MdStrikethroughS } from 'react-icons/md';

function ToolbarButton({ onClick, active, title, children }) {
  return (
    <button type="button" onClick={onClick} title={title}
      style={{
        width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? 'var(--primary)' : 'transparent',
        color: active ? 'white' : 'var(--text)',
      }}>
      {children}
    </button>
  );
}

// A WYSIWYG editor for blog content — what the admin sees while typing
// (bold text, bullet points, headings, links) is what actually gets
// published, instead of writing raw HTML by hand in a plain textarea.
//
// The parent must remount this component (e.g. key={editingId || 'new'})
// whenever it loads a different post's content — TipTap owns its own
// internal state once created, so this component only reads `value` for
// its *initial* content, not on every re-render.
export default function BlogEditor({ value, onChange }) {
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      // Default to plain links (no target="_blank", no rel="nofollow") since
      // most links here point to our own product/category pages — a
      // nofollow link tells Google not to pass authority through it, which
      // would defeat the whole point of linking blog posts to products.
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { target: null, rel: null } }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'blog-content',
        style: 'min-height: 320px; padding: 14px; outline: none;',
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL (e.g. /products/your-product-slug)', previousUrl || '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // "Import HTML" parses a pasted HTML string (e.g. a file's raw source
  // code) into real formatted content. A normal paste only works when the
  // clipboard carries rendered HTML (copying from a webpage) — pasting
  // from something like Notepad only carries plain text, so the tags
  // would show up as literal text instead of becoming headings/links.
  const openImport = () => {
    setImportText(editor.getHTML());
    setImportOpen(true);
  };

  const applyImport = () => {
    editor.commands.setContent(importText);
    onChange(editor.getHTML());
    setImportOpen(false);
  };

  return (
    <div style={{ border: '2px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '6px', borderBottom: '2px solid var(--border)', backgroundColor: 'var(--bg)', flexWrap: 'wrap' }}>
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><FiBold size={15} /></ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><FiItalic size={15} /></ToolbarButton>
        <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><MdStrikethroughS size={17} /></ToolbarButton>
        <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarButton title="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><MdTitle size={17} /></ToolbarButton>
        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><FiList size={15} /></ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><MdFormatListNumbered size={17} /></ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><MdFormatQuote size={17} /></ToolbarButton>
        <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><FiMinus size={15} /></ToolbarButton>
        <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarButton title="Link (e.g. to a product or category page)" active={editor.isActive('link')} onClick={setLink}><FiLink size={15} /></ToolbarButton>
        <span style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 4px' }} />
        <ToolbarButton title="Import HTML source (paste a prepared blog file here)" onClick={openImport}><FiCode size={15} /></ToolbarButton>
      </div>
      <EditorContent editor={editor} />

      {importOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '22px', maxWidth: '640px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '16px' }}>Import HTML</h3>
              <button type="button" onClick={() => setImportOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Paste the full HTML source of a prepared blog post below, then click Apply. This replaces the current content.
            </p>
            <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={12}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '12px', fontFamily: 'monospace', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button type="button" onClick={() => setImportOpen(false)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
              <button type="button" onClick={applyImport} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
