import { useMemo } from 'react'
import { getFileName } from '../utils/artifactUtils'

const ArtifactCard = ({ files, isPdf, isPpt, title, active, onOpen }) => {
  const artifactName = useMemo(() => {
    if (title) return title
    const htmlFile = files?.find((file) => /\.html?$/i.test(file.path))
    return getFileName(htmlFile?.path || files?.[0]?.path || 'Artifact')
  }, [files, title])

  return (
    <div
      className={`artifact-card ${active ? 'active' : ''}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen()
      }}
    >
      <div className="artifact-card-badge">
        <span className="artifact-card-icon">{isPpt ? '📊' : isPdf ? '▤' : '✦'}</span>
      </div>
      <div className="artifact-card-content">
        <strong className="artifact-card-title">{artifactName}</strong>
        <span className="artifact-card-subtitle">
          {isPpt
            ? 'PowerPoint Presentation • Click to open Canvas'
            : isPdf
            ? 'PDF Document • Click to open Canvas'
            : `${files?.length || 1} file${files?.length === 1 ? '' : 's'} • Click to open Canvas`}
        </span>
      </div>
      <div className="artifact-card-action">
        <span>Canvas</span>
        <span className="artifact-card-arrow">↗</span>
      </div>
    </div>
  )
}

export default ArtifactCard
