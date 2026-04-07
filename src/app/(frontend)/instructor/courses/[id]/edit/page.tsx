'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { moduleStore, type Module } from '@/collections/Modules'
import { lessonStore, type Lesson, type UpdateLessonInput } from '@/collections/Lessons'
import { ModuleList } from '@/components/course-editor/ModuleList'
import { CoursePublishToggle, type PublishStatus } from '@/components/course-editor/CoursePublishToggle'

const AUTOSAVE_DEBOUNCE_MS = 2000

export default function CourseEditPage() {
  const params = useParams<{ id: string }>()
  if (!params) return null
  const courseId = params.id

  const [modules, setModules] = useState<Module[]>([])
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({})
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('draft')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load initial data
  useEffect(() => {
    const courseModules = moduleStore.getByCourse(courseId)
    setModules(courseModules)

    const grouped: Record<string, Lesson[]> = {}
    for (const mod of courseModules) {
      grouped[mod.id] = lessonStore.getByModule(mod.id)
    }
    setLessonsByModule(grouped)
  }, [courseId])

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    setSaveState('saving')
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveState('saved')
      autoSaveTimerRef.current = null
    }, AUTOSAVE_DEBOUNCE_MS)
  }, [])

  function handleReorder(sourceId: string, targetOrder: number) {
    const source = moduleStore.getById(sourceId)
    if (!source) return

    const sourceOrder = source.order
    const updated = moduleStore.update(sourceId, { order: targetOrder })
    // Shift the target module to the old position
    const targetMod = moduleStore
      .getByCourse(courseId)
      .find((m) => m.id !== sourceId && m.order === targetOrder)
    if (targetMod) {
      moduleStore.update(targetMod.id, { order: sourceOrder })
    }
    setModules(moduleStore.getByCourse(courseId))
    scheduleAutoSave()
    return updated
  }

  function handleAddModule() {
    moduleStore.create({ courseId, title: 'New Module' })
    setModules(moduleStore.getByCourse(courseId))
    scheduleAutoSave()
  }

  function handleUpdateModule(id: string, data: { title?: string; description?: string }) {
    moduleStore.update(id, data)
    setModules(moduleStore.getByCourse(courseId))
    scheduleAutoSave()
  }

  function handleDeleteModule(id: string) {
    moduleStore.delete(id)
    setModules(moduleStore.getByCourse(courseId))
    setLessonsByModule((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    scheduleAutoSave()
  }

  function handleAddLesson(moduleId: string) {
    lessonStore.create({ moduleId, title: 'New Lesson' })
    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: lessonStore.getByModule(moduleId),
    }))
    scheduleAutoSave()
  }

  function handleUpdateLesson(id: string, data: UpdateLessonInput) {
    const lesson = lessonStore.getById(id)
    if (!lesson) return
    lessonStore.update(id, data)
    const moduleId = lesson.moduleId
    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: lessonStore.getByModule(moduleId),
    }))
    scheduleAutoSave()
  }

  function handleDeleteLesson(id: string) {
    const lesson = lessonStore.getById(id)
    if (!lesson) return
    const moduleId = lesson.moduleId
    lessonStore.delete(id)
    setLessonsByModule((prev) => ({
      ...prev,
      [moduleId]: lessonStore.getByModule(moduleId),
    }))
    scheduleAutoSave()
  }

  function handlePublishToggle(newStatus: PublishStatus) {
    setPublishStatus(newStatus)
    scheduleAutoSave()
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <Link
            href={`/instructor/courses/${courseId}`}
            style={{ color: '#6c63ff', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            &larr; Back to course
          </Link>
          <h1 style={{ color: '#e0e0e0', margin: '8px 0 0' }}>Edit Course Content</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {saveState === 'saving' && (
            <span style={{ color: '#888', fontSize: '0.85rem' }} data-testid="autosave-indicator">
              Saving…
            </span>
          )}
          {saveState === 'saved' && (
            <span style={{ color: '#4ecdc4', fontSize: '0.85rem' }} data-testid="autosave-indicator">
              Saved
            </span>
          )}
          <CoursePublishToggle status={publishStatus} onToggle={handlePublishToggle} />
        </div>
      </div>

      <ModuleList
        modules={modules}
        lessons={lessonsByModule}
        onReorder={handleReorder}
        onAddModule={handleAddModule}
        onUpdateModule={handleUpdateModule}
        onDeleteModule={handleDeleteModule}
        onAddLesson={handleAddLesson}
        onUpdateLesson={handleUpdateLesson}
        onDeleteLesson={handleDeleteLesson}
      />
    </div>
  )
}
