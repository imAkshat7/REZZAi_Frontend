import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { downloadPdfFromUrl, downloadPptFromUrl, getFileName, getLanguage } from '../utils/artifactUtils'

const ArtifactPreview = ({ files, previewMode }) => {
  const htmlFile = files.find((file) => /\.html?$/i.test(file.path))
  const css = files.filter((file) => /\.css$/i.test(file.path)).map((file) => file.content).join('\n')
  const javascript = files.filter((file) => /\.js$/i.test(file.path)).map((file) => file.content).join('\n')
  const source = (htmlFile?.content || '<!doctype html><html><body><p>No HTML preview available.</p></body></html>')
    .replace(/<link[^>]+href=["'][^"']+\.css["'][^>]*>/gi, '')
    .replace(/<script[^>]+src=["'][^"']+\.js["'][^>]*><\/script>/gi, '')
    .replace('</head>', `<style>${css}</style></head>`)
    .replace('</body>', `<script>${javascript.replace(/<\/script>/gi, '<\\/script>')}</script></body>`)

  return (
    <div className={`artifact-preview-wrapper ${previewMode || 'desktop'}`}>
      <iframe
        className="artifact-preview-frame"
        title="Generated project preview"
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
        srcDoc={source}
      />
    </div>
  )
}

const AnimatedCode = ({ file }) => {
  const [visibleContent, setVisibleContent] = useState('')

  useEffect(() => {
    let position = 0
    const step = Math.max(1, Math.ceil(file.content.length / 180))
    const timer = window.setInterval(() => {
      position = Math.min(position + step, file.content.length)
      setVisibleContent(file.content.slice(0, position))
      if (position >= file.content.length) window.clearInterval(timer)
    }, 14)

    return () => window.clearInterval(timer)
  }, [file])

  return (
    <SyntaxHighlighter
      language={getLanguage(file.path)}
      style={vscDarkPlus}
      PreTag="div"
      customStyle={{ margin: '0', minHeight: '100%', background: '#0d110e', fontSize: '13px', borderRadius: '0' }}
      codeTagProps={{ style: { fontFamily: "'DM Mono', monospace" } }}
    >
      {visibleContent}
    </SyntaxHighlighter>
  )
}

const CanvasSkeleton = ({ onClose, isPdf, isPpt }) => {
  return (
    <aside className="canvas-panel skeleton">
      <header className="canvas-header">
        <div className="canvas-title">
          <span className="canvas-icon pulsing">{isPpt ? '📊' : isPdf ? '▤' : '✦'}</span>
          <div className="skeleton-title-group">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-sub" />
          </div>
        </div>

        <div className="canvas-toolbar">
          <div className="skeleton-generating-pill">
            <span className="skeleton-pulsing-dot" />
            {isPpt ? 'Compiling PowerPoint slides...' : isPdf ? 'Compiling PDF document...' : 'Crafting project files...'}
          </div>
          <button className="canvas-close" type="button" onClick={onClose} title="Close Canvas">
            ✕
          </button>
        </div>
      </header>

      <div className="canvas-body">
        <div className="canvas-code-view">
          <nav className="canvas-tabs">
            <div className="skeleton-tab active">{isPpt ? 'Slides Preview' : isPdf ? 'Document Preview' : 'index.html'}</div>
          </nav>
          <div className="canvas-code-header">
            <span className="skeleton-line skeleton-filepath" />
          </div>
          <div className="canvas-skeleton-lines">
            <div className="skeleton-code-line w-40" />
            <div className="skeleton-code-line w-75" />
            <div className="skeleton-code-line w-60" />
            <div className="skeleton-code-line w-90" />
            <div className="skeleton-code-line w-30" />
            <div className="skeleton-code-line w-80" />
          </div>
          <div className="canvas-generating-footer">
            <span className="typing-dots"><span /><span /><span /></span>
            <span>{isPpt ? 'REZZAi Slides Agent is preparing PowerPoint presentation...' : isPdf ? 'REZZAi PDF Agent is formatting document...' : 'REZZAi Coding Agent is building project structure...'}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

const CanvasPanel = ({ artifact, onClose }) => {
  const defaultPath = artifact?.files?.[0]?.path
  const [activePath, setActivePath] = useState(defaultPath)
  const [view, setView] = useState('preview')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  if (artifact?.isGenerating) {
    return <CanvasSkeleton onClose={onClose} isPdf={artifact?.isPdf} isPpt={artifact?.isPpt} />
  }

  if (artifact?.isPpt || artifact?.pptUrl) {
    const slides = artifact.slides || []
    const totalSlides = slides.length + 1
    const activeSlide = currentSlideIndex > 0 ? slides[currentSlideIndex - 1] : null

    return (
      <aside className={`canvas-panel ppt-canvas${expanded ? ' expanded' : ''}`}>
        <header className="canvas-header">
          <div className="canvas-title">
            <span className="canvas-icon">📊</span>
            <div>
              <strong>{artifact.title || 'PowerPoint Presentation'}</strong>
              <small>Slide {currentSlideIndex + 1} of {totalSlides} • 16:9 Widescreen</small>
            </div>
          </div>

          <div className="canvas-toolbar">
            <button
              type="button"
              className="canvas-btn highlight"
              onClick={() => downloadPptFromUrl(artifact.pptUrl, `${(artifact.title || 'presentation').replace(/[^a-zA-Z0-9_-]/g, '_')}.pptx`)}
            >
              📥 Download PPTX
            </button>
            <button
              className="canvas-btn"
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              title={expanded ? 'Collapse view' : 'Maximize view'}
            >
              {expanded ? '⤢' : '⤡'}
            </button>
            <button className="canvas-close" type="button" onClick={onClose} title="Close Canvas">
              ✕
            </button>
          </div>
        </header>

        <div className="canvas-body ppt-canvas-body">
          <div className={`ppt-slide-viewer ${currentSlideIndex === 0 ? 'cover-theme' : 'light-slide-theme'}`}>
            {currentSlideIndex === 0 ? (
              <div className="ppt-cover-slide">
                <span className="ppt-badge">✦ REZZAi PRESENTATION</span>
                <h2>{artifact.title || 'Presentation'}</h2>
                <p className="ppt-subtitle">{artifact.subtitle || 'Executive 16:9 Presentation compiled by REZZAi Slides Agent.'}</p>
                <div className="ppt-cover-accent-line" />
                <div className="ppt-meta-info">
                  <span>{slides.length} Content Slides</span>
                  <span>•</span>
                  <span>16:9 Widescreen</span>
                  <span>•</span>
                  <span>Direct PPTX export</span>
                </div>
                <div className="ppt-actions">
                  <button
                    type="button"
                    className="canvas-btn highlight ppt-dl-big"
                    onClick={() => downloadPptFromUrl(artifact.pptUrl, `${(artifact.title || 'presentation').replace(/[^a-zA-Z0-9_-]/g, '_')}.pptx`)}
                  >
                    📥 Download PowerPoint (.pptx)
                  </button>
                </div>
              </div>
            ) : (
              <div className="ppt-content-slide">
                <div className="ppt-top-accent-bar" />
                <div className="ppt-slide-header">
                  <div className="ppt-title-group">
                    <span className="ppt-blue-vertical-bar" />
                    <h3 className="ppt-slide-title">{activeSlide?.title || `Slide ${currentSlideIndex}`}</h3>
                  </div>
                  <span className="ppt-slide-num-badge">Slide {currentSlideIndex} of {slides.length}</span>
                </div>

                <div className="ppt-bullet-grid">
                  {activeSlide?.points?.map((point, index) => (
                    <div key={index} className="ppt-bullet-item">
                      <span className="ppt-bullet-dot">•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="ppt-slide-footer">
                  <span>REZZAi Presentation Intelligence</span>
                  <span>REZZAi • {artifact.title}</span>
                </div>
              </div>
            )}
          </div>

          <div className="ppt-navigation-bar">
            <button
              type="button"
              className="ppt-nav-btn"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            >
              ‹ Prev
            </button>

            <div className="ppt-slide-pills">
              <button
                type="button"
                className={`ppt-pill ${currentSlideIndex === 0 ? 'active' : ''}`}
                onClick={() => setCurrentSlideIndex(0)}
              >
                Cover
              </button>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`ppt-pill ${currentSlideIndex === idx + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentSlideIndex(idx + 1)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="ppt-nav-btn"
              disabled={currentSlideIndex === totalSlides - 1}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1))}
            >
              Next ›
            </button>
          </div>
        </div>
      </aside>
    )
  }

  if (artifact?.isPdf || artifact?.pdfUrl) {
    return (
      <aside className={`canvas-panel pdf-canvas${expanded ? ' expanded' : ''}`}>
        <header className="canvas-header">
          <div className="canvas-title">
            <span className="canvas-icon">▤</span>
            <div>
              <strong>{artifact.title || 'PDF Document'}</strong>
              <small>PDF Document ready</small>
            </div>
          </div>

          <div className="canvas-toolbar">
            <button
              type="button"
              className="canvas-btn highlight"
              onClick={() => downloadPdfFromUrl(artifact.pdfUrl, `${(artifact.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`)}
            >
              📥 Download PDF
            </button>
            <button
              className="canvas-btn"
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              title={expanded ? 'Collapse view' : 'Maximize view'}
            >
              {expanded ? '⤢' : '⤡'}
            </button>
            <button className="canvas-close" type="button" onClick={onClose} title="Close Canvas">
              ✕
            </button>
          </div>
        </header>

        <div className="canvas-body">
          <iframe
            src={artifact.pdfUrl}
            className="pdf-preview-frame"
            title="Generated PDF Document Preview"
          />
        </div>
      </aside>
    )
  }

  if (!artifact || !artifact.files || artifact.files.length === 0) return null

  const files = artifact.files
  const effectivePath = activePath && files.some((f) => f.path === activePath) ? activePath : files[0]?.path
  const activeFile = files.find((file) => file.path === effectivePath) || files[0]
  const artifactName = artifact.title || getFileName(files.find((file) => /\.html?$/i.test(file.path))?.path || files[0]?.path || 'Artifact')

  const copyActiveCode = async () => {
    if (!activeFile) return
    await navigator.clipboard.writeText(activeFile.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <aside className={`canvas-panel${expanded ? ' expanded' : ''}`}>
      <header className="canvas-header">
        <div className="canvas-title">
          <span className="canvas-icon">✦</span>
          <div>
            <strong>{artifactName}</strong>
            <small>{files.length} file{files.length === 1 ? '' : 's'} compiled</small>
          </div>
        </div>

        <div className="canvas-toolbar">
          <div className="canvas-view-toggle">
            <button className={view === 'preview' ? 'active' : ''} type="button" onClick={() => setView('preview')}>
              Live Demo
            </button>
            <button className={view === 'code' ? 'active' : ''} type="button" onClick={() => setView('code')}>
              Code
            </button>
          </div>

          {view === 'preview' && (
            <div className="device-toggle-group">
              <button
                className={`device-btn ${previewMode === 'desktop' ? 'active' : ''}`}
                type="button"
                onClick={() => setPreviewMode('desktop')}
                title="Desktop view"
              >
                🖥
              </button>
              <button
                className={`device-btn ${previewMode === 'mobile' ? 'active' : ''}`}
                type="button"
                onClick={() => setPreviewMode('mobile')}
                title="Mobile view"
              >
                📱
              </button>
            </div>
          )}

          {view === 'code' && (
            <button className="canvas-btn" type="button" onClick={copyActiveCode} title="Copy file code">
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}

          <button
            className="canvas-btn"
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            title={expanded ? 'Collapse view' : 'Maximize view'}
          >
            {expanded ? '⤢' : '⤡'}
          </button>
          <button className="canvas-close" type="button" onClick={onClose} title="Close Canvas">
            ✕
          </button>
        </div>
      </header>

      <div className="canvas-body">
        {view === 'code' ? (
          <div className="canvas-code-view">
            <nav className="canvas-tabs" aria-label="Generated project files">
              {files.map((file) => (
                <button
                  className={file.path === effectivePath ? 'active' : ''}
                  key={file.path}
                  type="button"
                  onClick={() => setActivePath(file.path)}
                >
                  {getFileName(file.path)}
                </button>
              ))}
            </nav>
            <div className="canvas-code-header">
              <span className="canvas-file-path">{activeFile?.path}</span>
            </div>
            <div className="canvas-code-container">
              {activeFile && <AnimatedCode key={activeFile.path} file={activeFile} />}
            </div>
          </div>
        ) : (
          <ArtifactPreview files={files} previewMode={previewMode} />
        )}
      </div>
    </aside>
  )
}

export default CanvasPanel
