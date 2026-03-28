'use client'

import { useState } from 'react'
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
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)

  function handleDragStart(e: React.DragEvent, moduleId: string) {
    setDraggingId(moduleId)
    e.dataTransfer.setData('moduleId', moduleId)
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

  function commitModuleTitle(moduleId: string, value: string) {
    onUpdateModule(moduleId, { title: value })
    setEditingModuleId(null)
  }

  return (
    <div className={styles.container} data-testid="module-list">
      {modules.map((mod) => (
        <div
          key={mod.id}
          className={[
            styles.module,
            draggingId === mod.id ? styles.dragging : '',
            dragOverId === mod.id ? styles.dragOver : '',
          ]
            .filter(Boolean)
            .join(' ')}
          draggable
          onDragStart={(e) => handleDragStart(e, mod.id)}
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
                onBlur={(e) => commitModuleTitle(mod.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitModuleTitle(mod.id, (e.target as HTMLInputElement).value)
                  } else if (e.key === 'Escape') {
                    setEditingModuleId(null)
                  }
                }}
              />
            ) : (
              <h3
                className={styles.moduleTitle}
                onClick={() => setEditingModuleId(mod.id)}
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

          <div className={styles.lessons}>
            {(lessons[mod.id] ?? []).map((lesson) => (
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
