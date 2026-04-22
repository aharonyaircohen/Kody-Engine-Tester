'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Module } from '@/collections/Modules'
import type { Lesson, UpdateLessonInput } from '@/collections/Lessons'
import { LessonEditor } from './LessonEditor'
import styles from './ModuleList.module.css'

interface ModuleListProps {
  modules: Module[]
  lessons: Record<string, Lesson[]>
  onReorder: (sourceId: string, targetOrder: number) => void
  onAddModule: () => void
  onUpdateModule: (id: string, data: { title?: string; description?: string }) => void
  onDeleteModule: (id: string) => void
  onAddLesson: (moduleId: string) => void
  onUpdateLesson: (id: string, data: UpdateLessonInput) => void
  onDeleteLesson: (id: string) => void
}

export function ModuleList({
  modules,
  lessons,
  onReorder,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
}: ModuleListProps) {
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)

  return (
    <div className={styles.container} data-testid="module-list">
      {modules.map((mod) => (
        <ModuleItem
          key={mod.id}
          mod={mod}
          lessonsForModule={lessons[mod.id] ?? []}
          editingModuleId={editingModuleId}
          onSetEditingModuleId={setEditingModuleId}
          onUpdateModule={onUpdateModule}
          onReorder={onReorder}
          onAddLesson={onAddLesson}
          onUpdateLesson={onUpdateLesson}
          onDeleteLesson={onDeleteLesson}
          onDeleteModule={onDeleteModule}
        />
      ))}

      <button
        className={styles.addModuleButton}
        onClick={onAddModule}
        data-testid="add-module"
      >
        + Add Module
      </button>
    </div>
  )
}

interface ModuleItemProps {
  mod: Module
  lessonsForModule: Lesson[]
  editingModuleId: string | null
  onSetEditingModuleId: (id: string | null) => void
  onUpdateModule: (id: string, data: { title?: string; description?: string }) => void
  onReorder: (sourceId: string, targetOrder: number) => void
  onAddLesson: (moduleId: string) => void
  onUpdateLesson: (id: string, data: UpdateLessonInput) => void
  onDeleteLesson: (id: string) => void
  onDeleteModule: (id: string) => void
}

function ModuleItem({
  mod,
  lessonsForModule,
  editingModuleId,
  onSetEditingModuleId,
  onUpdateModule,
  onReorder,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  onDeleteModule,
}: ModuleItemProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [maxMinutes, setMaxMinutes] = useState<number | ''>('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleDragStart(e: React.DragEvent) {
    setDraggingId(mod.id)
    e.dataTransfer.setData('moduleId', mod.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(targetId)
  }

  function handleDragLeave() {
    setDragOverId(null)
  }

  function handleDrop(e: React.DragEvent, targetModule: Module) {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('moduleId')
    setDraggingId(null)
    setDragOverId(null)
    if (!sourceId || sourceId === targetModule.id) return
    onReorder(sourceId, targetModule.order)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverId(null)
  }

  useEffect(() => {
    if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)
    return () => {
      if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
    }
  }, [searchQuery])

  const filteredLessons = useMemo(() => {
    let results = [...lessonsForModule].sort((a, b) => a.order - b.order)

    if (debouncedQuery.trim() !== '') {
      const lower = debouncedQuery.toLowerCase()
      results = results.filter((l) => l.title.toLowerCase().includes(lower))
    }

    const mm = maxMinutes === '' ? undefined : maxMinutes
    if (mm !== undefined && mm !== null && mm > 0) {
      results = results.filter(
        (l) => l.estimatedMinutes === null || l.estimatedMinutes <= mm,
      )
    }

    return results
  }, [lessonsForModule, debouncedQuery, maxMinutes])

  return (
    <div
      className={[
        styles.module,
        draggingId === mod.id ? styles.dragging : '',
        dragOverId === mod.id ? styles.dragOver : '',
      ]
        .filter(Boolean)
        .join(' ')}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => handleDragOver(e, mod.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, mod)}
      onDragEnd={handleDragEnd}
      data-testid="module-item"
    >
      <div className={styles.moduleHeader}>
        <span className={styles.dragHandle} aria-label="drag to reorder">
          ⠿
        </span>

        {editingModuleId === mod.id ? (
          <input
            className={styles.titleInput}
            defaultValue={mod.title}
            autoFocus
            aria-label="module title"
            onBlur={(e) => {
              onUpdateModule(mod.id, { title: e.target.value })
              onSetEditingModuleId(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUpdateModule(mod.id, { title: (e.target as HTMLInputElement).value })
                onSetEditingModuleId(null)
              } else if (e.key === 'Escape') {
                onSetEditingModuleId(null)
              }
            }}
          />
        ) : (
          <h3
            className={styles.moduleTitle}
            onClick={() => onSetEditingModuleId(mod.id)}
            data-testid="module-title"
          >
            {mod.title}
          </h3>
        )}

        <button
          className={styles.deleteButton}
          onClick={() => onDeleteModule(mod.id)}
          aria-label={`delete module ${mod.title}`}
          data-testid="delete-module"
        >
          ✕
        </button>
      </div>

      <div className={styles.filterBar} data-testid="lesson-filter-bar">
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search lessons…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="search lessons"
          data-testid="lesson-search-input"
        />
        <div className={styles.maxDurationWrapper}>
          <label className={styles.maxDurationLabel} htmlFor={`max-minutes-${mod.id}`}>
            Max duration (min)
          </label>
          <input
            id={`max-minutes-${mod.id}`}
            className={styles.maxDurationInput}
            type="number"
            placeholder="No max"
            min="1"
            value={maxMinutes}
            onChange={(e) => {
              const val = e.target.value
              setMaxMinutes(val === '' ? '' : Number(val))
            }}
            aria-label="max duration in minutes"
            data-testid="max-minutes-input"
          />
        </div>
      </div>

      <div className={styles.lessons}>
        {filteredLessons.map((lesson) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            onUpdate={(data) => onUpdateLesson(lesson.id, data)}
            onDelete={() => onDeleteLesson(lesson.id)}
          />
        ))}
      </div>

      <button
        className={styles.addLessonButton}
        onClick={() => onAddLesson(mod.id)}
        aria-label={`add lesson to ${mod.title}`}
        data-testid="add-lesson"
      >
        + Add Lesson
      </button>
    </div>
  )
}
