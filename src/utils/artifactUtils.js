export const downloadPdfFromUrl = (pdfUrl, filename = 'document.pdf') => {
  if (!pdfUrl) return

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

  if (pdfUrl.startsWith('data:')) {
    try {
      const parts = pdfUrl.split(',')
      const base64Data = parts[1] || parts[0]
      const binaryString = atob(base64Data)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = cleanFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
      return
    } catch (err) {
      console.error('Data URI PDF conversion failed:', err)
    }
  }

  const link = document.createElement('a')
  link.href = pdfUrl
  link.download = cleanFilename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const downloadPptFromUrl = (pptUrl, filename = 'presentation.pptx') => {
  if (!pptUrl) return

  const cleanFilename = filename.endsWith('.pptx') ? filename : `${filename}.pptx`

  if (pptUrl.startsWith('data:')) {
    try {
      const parts = pptUrl.split(',')
      const base64Data = parts[1] || parts[0]
      const binaryString = atob(base64Data)
      const len = binaryString.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = cleanFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
      return
    } catch (err) {
      console.error('Data URI PPT conversion failed:', err)
    }
  }

  const link = document.createElement('a')
  link.href = pptUrl
  link.download = cleanFilename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const getGeneratedFiles = (content) => {
  if (typeof content !== 'string') return null

  // 1. Check if response is JSON with files array (from explicit web app project generation)
  if (content.trim().startsWith('{')) {
    try {
      const result = JSON.parse(content)
      if (Array.isArray(result.files)) {
        const files = result.files.filter((file) => file && typeof file.path === 'string' && typeof file.content === 'string')
        if (files.length > 0) return files
      }
    } catch {
      // ignore JSON parse failure and fallback to markdown blocks
    }
  }

  // 2. Extract multi-file project blocks ONLY if explicit file= annotations are specified
  const codeBlocks = []
  const blockRegex = /```(?:(\w+)\s+file=([^\n]+))\n([\s\S]*?)```/gi
  let match

  while ((match = blockRegex.exec(content)) !== null) {
    const filename = (match[2] || '').trim()
    const code = (match[3] || '').trim()

    if (code && filename && (filename.includes('.') || filename.includes('/'))) {
      codeBlocks.push({ path: filename, content: code })
    }
  }

  if (codeBlocks.length >= 2) {
    return codeBlocks
  }

  return null
}

export const getLanguage = (path) => {
  const extension = path.split('.').pop()?.toLowerCase()
  const languages = {
    css: 'css',
    html: 'html',
    htm: 'html',
    js: 'javascript',
    jsx: 'jsx',
    json: 'json',
    ts: 'typescript',
    tsx: 'tsx',
    vue: 'markup',
    md: 'markdown'
  }

  return languages[extension] || 'text'
}

export const getFileName = (path) => path.split('/').pop() || path

export const isPdfRequest = (prompt, selectedAgent) => {
  if (selectedAgent === 'pdf') return true
  if (!prompt || typeof prompt !== 'string') return false
  const text = prompt.trim().toLowerCase()
  return /\b(pdf|document|create pdf|generate pdf|make pdf|pdfkit|report)\b/i.test(text)
}

export const isPptRequest = (prompt, selectedAgent) => {
  if (selectedAgent === 'ppt' || selectedAgent === 'slides') return true
  if (!prompt || typeof prompt !== 'string') return false
  const text = prompt.trim().toLowerCase()
  return /\b(ppt|pptx|powerpoint|slides|presentation|deck|create slides|make slides|generate ppt)\b/i.test(text)
}

export const isFullWebAppRequest = (prompt) => {
  if (!prompt || typeof prompt !== 'string') return false
  const text = prompt.trim().toLowerCase()

  const hasPreview = /\b(preview|with preview|canvas|live preview|interactive|demo)\b/i.test(text)
  if (hasPreview) return true

  const hasAppNoun = /\b(website|web app|webapp|application|landing page|portfolio|dashboard|calculator|todo|game|dice|quiz|e-commerce|storefront|site|ui|widget|tool|project)\b/i.test(text)
  const hasBuildVerb = /\b(build|create|generate|make|develop|design|code)\b/i.test(text)
  const hasMultiFileExplicit = /\b(html\s+css\s+js|html,?\s*css|full project|multi-file|frontend)\b/i.test(text)
  const isSimpleSnippet = /\b(hello world|console\.log|reverse|algorithm|how to|explain|fix|debug|log|print|example)\b/i.test(text)

  if (isSimpleSnippet && !hasAppNoun && !hasMultiFileExplicit && !hasPreview) return false

  return (hasBuildVerb && hasAppNoun) || hasMultiFileExplicit || (hasAppNoun && text.length > 15)
}

export const getPdfDataUri = (content) => {
  if (typeof content !== 'string') return null
  const match = content.match(/\[(?:PDF_DOCUMENT|PDF_DATA_SOURCE|📥\s*\*\*Download Generated PDF Document\*\*|PDF)\]\((data:application\/pdf[^)]+|https:\/\/[^)]+)\)/i) ||
                content.match(/<!--\s*pdf:\s*(data:application\/pdf[^>]+|https:\/\/[^>]+)\s*-->/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return null
}

export const getPdfArtifact = (content) => {
  const pdfUrl = getPdfDataUri(content)
  if (!pdfUrl) return null

  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'PDF Document'

  return {
    isPdf: true,
    title,
    pdfUrl
  }
}

export const getPptDataUri = (content) => {
  if (typeof content !== 'string') return null
  const match = content.match(/\[(?:PPT_DOCUMENT|PPT)\]\((data:application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation[^)]+|https:\/\/[^)]+)\)/i) ||
                content.match(/<!--\s*ppt:\s*(data:application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation[^>]+|https:\/\/[^>]+)\s*-->/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return null
}

export const getPptArtifact = (content) => {
  const pptUrl = getPptDataUri(content)
  if (!pptUrl) return null

  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 'PowerPoint Presentation'

  let data = null
  const dataMatch = content.match(/<!--\s*ppt_data:([\s\S]*?)\s*-->/)
  if (dataMatch && dataMatch[1]) {
    try {
      data = JSON.parse(dataMatch[1].trim())
    } catch (e) {
      console.error('Failed to parse ppt_data:', e)
    }
  }

  let slides = data?.slides || []
  if (!Array.isArray(slides) || slides.length === 0) {
    const extractedSlides = []
    const slideBlocks = content.split(/^##\s+/m).slice(1)
    for (const block of slideBlocks) {
      const lines = block.split('\n')
      const slideTitle = lines[0].replace(/^#+\s*/, '').replace(/^\d+\.\s*/, '').trim()
      const points = lines.slice(1)
        .map((l) => l.trim())
        .filter((l) => /^[-*•\u2022\u25E6\u25AA]\s+/.test(l))
        .map((l) => l.replace(/^[-*•\u2022\u25E6\u25AA]\s+/, '').trim())
        .filter(Boolean)
      if (slideTitle && !slideTitle.toLowerCase().includes('download')) {
        extractedSlides.push({ title: slideTitle, points: points.length > 0 ? points : ['Executive overview slide'] })
      }
    }

    if (extractedSlides.length === 0) {
      const numberedMatches = [...content.matchAll(/^\s*\d+\.\s+(.+)$/gm)]
      for (const m of numberedMatches) {
        const slideTitle = m[1].replace(/[*_#]/g, '').trim()
        if (slideTitle && !slideTitle.toLowerCase().includes('download')) {
          extractedSlides.push({
            title: slideTitle,
            points: [
              `Overview and strategic focus for ${slideTitle}`,
              `Key objectives and operational milestones`,
              `Core analysis and impact assessment`,
              `Execution path and recommended actions`
            ]
          })
        }
      }
    }

    if (extractedSlides.length > 0) {
      slides = extractedSlides
    } else {
      slides = [
        {
          title: "Executive Overview",
          points: [
            `Comprehensive briefing on ${title}`,
            "Strategic priorities and core objectives",
            "Key drivers and target audience alignment",
            "Summary of fundamental value propositions"
          ]
        },
        {
          title: "Core Pillars & Methodology",
          points: [
            "Detailed assessment of primary operational components",
            "Framework analysis and structural breakdown",
            "Integration of key methodologies and workflows",
            "Efficiency metrics and benchmark standards"
          ]
        },
        {
          title: "Implementation & Action Plan",
          points: [
            "Step-by-step rollout and milestone schedule",
            "Resource allocation and operational accountability",
            "Risk mitigation and quality assurance procedures",
            "Immediate deliverables and follow-through items"
          ]
        },
        {
          title: "Outcomes & Next Steps",
          points: [
            "Measurable benefits and expected business impact",
            "Scalability roadmap and future expansion",
            "Stakeholder alignment and sign-off process",
            "Actionable recommendations for immediate execution"
          ]
        }
      ]
    }
  }

  return {
    isPpt: true,
    title: data?.title || title,
    subtitle: data?.subtitle || 'Executive 16:9 Widescreen PowerPoint Presentation',
    slides,
    pptUrl
  }
}
