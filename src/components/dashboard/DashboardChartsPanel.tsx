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
  DASHBOARD_CHART_DEFS,
  DASHBOARD_CHART_DEFS_BY_ID,
  DASHBOARD_CHART_GROUPS,
  DEFAULT_VISIBLE_DASHBOARD_CHART_IDS,
} from '@/lib/dashboardCharts'

function SortableChartRow({
  id,
  label,
  fullWidth,
  onRemove,
}: {
  id: string
  label: string
  fullWidth?: boolean
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
      className={`flex items-center gap-2 rounded-lg border border-[var(--color-card-border)] bg-white px-2.5 py-2 text-sm ${
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
      {fullWidth ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          linha inteira
        </span>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${label}`}
        className="-my-2 rounded-md p-2.5 text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-slate-100 hover:text-[var(--color-negative-text)]"
      >
        ✕
      </button>
    </li>
  )
}

interface DashboardChartsPanelContentProps {
  visibleChartIds: string[]
  onApply: (chartIds: string[]) => void
}

function DashboardChartsPanelContent({
  visibleChartIds,
  onApply,
}: DashboardChartsPanelContentProps) {
  const [draftIds, setDraftIds] = useState<string[]>(visibleChartIds)
  const requestClose = useRequestClose()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const selectedIds = new Set(draftIds)

  function toggleChart(id: string) {
    setDraftIds((current) =>
      current.includes(id) ? current.filter((chartId) => chartId !== id) : [...current, id],
    )
  }

  function removeChart(id: string) {
    setDraftIds((current) => current.filter((chartId) => chartId !== id))
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
    setDraftIds(DEFAULT_VISIBLE_DASHBOARD_CHART_IDS)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <h3 className={sectionTitleClass}>Gráficos disponíveis</h3>
          <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-lg border border-[var(--color-card-border)] p-3">
            {DASHBOARD_CHART_GROUPS.map((group) => {
              const chartsInGroup = DASHBOARD_CHART_DEFS.filter((chart) => chart.group === group)
              if (chartsInGroup.length === 0) return null
              return (
                <div key={group}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {chartsInGroup.map((chart) => (
                      <label
                        key={chart.id}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(chart.id)}
                          onChange={() => toggleChart(chart.id)}
                          className="h-4 w-4 rounded border-[var(--color-card-border)] text-[var(--color-accent)] focus:ring-[var(--color-accent)]/30"
                        />
                        {chart.label}
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
            Gráficos selecionados{' '}
            <span className="text-[var(--color-text-secondary)]">({draftIds.length})</span>
          </h3>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-[var(--color-card-border)] p-3">
            {draftIds.length === 0 ? (
              <p className="px-1.5 py-2 text-sm text-[var(--color-text-secondary)]">
                Nenhum gráfico selecionado — marque ao menos um à esquerda.
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
                      <SortableChartRow
                        key={id}
                        id={id}
                        label={DASHBOARD_CHART_DEFS_BY_ID[id]?.label ?? id}
                        fullWidth={DASHBOARD_CHART_DEFS_BY_ID[id]?.fullWidth}
                        onRemove={() => removeChart(id)}
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

interface DashboardChartsPanelProps {
  visibleChartIds: string[]
  onApply: (chartIds: string[]) => void
  onClose: () => void
}

export function DashboardChartsPanel({
  visibleChartIds,
  onApply,
  onClose,
}: DashboardChartsPanelProps) {
  return (
    <Modal
      title="Personalizar gráficos"
      subtitle="Escolha quais gráficos aparecem no dashboard e arraste para reordenar. Taxa de fuga e Parcela de impressões sempre ocupam a linha inteira."
      onClose={onClose}
      widthClassName="max-w-3xl"
    >
      <DashboardChartsPanelContent visibleChartIds={visibleChartIds} onApply={onApply} />
    </Modal>
  )
}
