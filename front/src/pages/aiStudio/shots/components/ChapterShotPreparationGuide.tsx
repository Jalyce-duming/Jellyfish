import { Button, Tooltip } from 'antd'

type ChecklistItem = {
  key: string
  label: string
  tone: 'success' | 'warning' | 'default'
  text: string
}

type ChapterShotPreparationGuideProps = {
  statusReady: boolean
  checklistItems: readonly ChecklistItem[]
  nextStepTitle: string
  nextStepDescription: string
  onGoToStudio: () => void
}

export function ChapterShotPreparationGuide({
  statusReady,
  checklistItems,
  nextStepTitle,
  nextStepDescription,
  onGoToStudio,
}: ChapterShotPreparationGuideProps) {
  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
        这里负责当前镜头的准备工作：提取并确认资产、对白和基础信息。准备完成后，再进入分镜工作室继续关键帧、图片和视频生成。
      </div>

      {statusReady ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-emerald-900">当前镜头已完成准备</div>
              <div className="text-xs text-emerald-700 mt-1">
                资产候选与对白候选已经确认完成，可以把这条镜头交给分镜工作室，继续关键帧、参考图、视频提示词和视频生成。
              </div>
            </div>
            <Button type="primary" size="small" onClick={onGoToStudio}>
              去工作室继续生成
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {checklistItems.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border px-3 py-2 bg-white/70 min-w-[180px] flex-1"
            style={{
              borderColor:
                item.tone === 'success'
                  ? '#86efac'
                  : item.tone === 'warning'
                    ? '#fcd34d'
                    : '#dbeafe',
              background:
                item.tone === 'success'
                  ? '#f0fdf4'
                  : item.tone === 'warning'
                    ? '#fffbeb'
                    : '#f8fafc',
            }}
          >
            <div className="text-[11px] text-gray-500 mb-1">{item.label}</div>
            <div className="text-sm font-medium text-gray-900">{item.text}</div>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border px-4 py-4 flex flex-wrap items-center justify-between gap-3"
        style={{
          borderColor: statusReady ? '#86efac' : '#cbd5e1',
          background: statusReady ? '#f0fdf4' : '#f8fafc',
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-900">{nextStepTitle}</div>
          <div className="text-xs text-slate-500 mt-1">{nextStepDescription}</div>
        </div>
        <Tooltip title={statusReady ? '进入分镜工作室继续关键帧、图片和视频生成。' : '可以先进入工作室查看视频准备度；如需真正继续生成，建议先完成当前准备项。'}>
          <Button
            type={statusReady ? 'primary' : 'default'}
            size="small"
            onClick={onGoToStudio}
          >
            {statusReady ? '进入分镜工作室继续生成' : '进入分镜工作室查看生成准备'}
          </Button>
        </Tooltip>
      </div>
    </>
  )
}
