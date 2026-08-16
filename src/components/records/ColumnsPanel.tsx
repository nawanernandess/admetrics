import { useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Modal } from '@/components/common/Modal'
import { useRequestClose } from '@/components/common/modalContext'
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  sectionTitleClass,
} from '@/components/common/formStyles'
import {
  COLUMN_DEFS,
  COLUMN_DEFS_BY_ID,
  COLUMN_GROUPS,
  DEFAULT_VISIBLE_COLUMN_IDS,
} from '@/lib/columns'

function SortableColumnRow({
  id,
  label,
  onRemove,
}: {
  id: string
  label: string
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 rounded-lg border border-[var(--color-card-border)] bg-[var(--color-card-bg)] px-2.5 py-2 text-sm ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        aria-label={`Reordenar ${label}`}
        className="-my-2 cursor-grab touch-none px-2 py-3 text-[var(--color-text-secondary)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span className="flex-1 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${label}`}
        className="-my-2 rounded-md p-2.5 text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-hover-bg)] hover:text-[var(--color-negative-text)]"
      >
        ✕
      </button>
    </li>
  )
}

interface ColumnsPanelContentProps {
  visibleColumnIds: string[]
  onApply: (columnIds: string[]) => void
}

function ColumnsPanelContent({ visibleColumnIds, onApply }: ColumnsPanelContentProps) {
  const [draftIds, setDraftIds] = useState<string[]>(visibleColumnIds)
  const requestClose = useRequestClose()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const selectedIds = new Set(draftIds)

  function toggleColumn(id: string) {
    setDraftIds((current) =>
      current.includes(id) ? current.filter((columnId) => columnId !== id) : [...current, id],
    )
  }

  function removeColumn(id: string) {
    setDraftIds((current) => current.filter((columnId) => columnId !== id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setDraftIds((current) => {
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return current
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  function handleApply() {
    onApply(draftIds)
    requestClose()
  }

  function handleRestoreDefault() {
    setDraftIds(DEFAULT_VISIBLE_COLUMN_IDS)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <h3 className={sectionTitleClass}>Colunas disponíveis</h3>
          <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-lg border border-[var(--color-card-border)] p-3">
            {COLUMN_GROUPS.map((group) => {
              const columnsInGroup = COLUMN_DEFS.filter((column) => column.group === group)
              if (columnsInGroup.length === 0) return null
              return (
                <div key={group}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {columnsInGroup.map((column) => (
                      <label
                        key={column.id}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-[var(--color-hover-bg)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(column.id)}
                          onChange={() => toggleColumn(column.id)}
                          className="h-4 w-4 rounded border-[var(--color-card-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/30"
                        />
                        {column.label}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className={sectionTitleClass}>
            Colunas selecionadas{' '}
            <span className="text-[var(--color-text-secondary)]">({draftIds.length})</span>
          </h3>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-[var(--color-card-border)] p-3">
            {draftIds.length === 0 ? (
              <p className="px-1.5 py-2 text-sm text-[var(--color-text-secondary)]">
                Nenhuma coluna selecionada — marque ao menos uma à esquerda.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={draftIds} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-1.5">
                    {draftIds.map((id) => (
                      <SortableColumnRow
                        key={id}
                        id={id}
                        label={COLUMN_DEFS_BY_ID[id]?.label ?? id}
                        onRemove={() => removeColumn(id)}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-card-border)] pt-4">
        <button type="button" onClick={handleRestoreDefault} className={buttonSecondaryClass}>
          Restaurar padrão
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={requestClose} className={buttonSecondaryClass}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={draftIds.length === 0}
            className={buttonPrimaryClass}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

interface ColumnsPanelProps {
  visibleColumnIds: string[]
  onApply: (columnIds: string[]) => void
  onClose: () => void
}

export function ColumnsPanel({ visibleColumnIds, onApply, onClose }: ColumnsPanelProps) {
  return (
    <Modal
      title="Personalizar colunas"
      subtitle="Escolha quais métricas aparecem na tabela e arraste para reordenar."
      onClose={onClose}
      widthClassName="max-w-3xl"
    >
      <ColumnsPanelContent visibleColumnIds={visibleColumnIds} onApply={onApply} />
    </Modal>
  )
}
