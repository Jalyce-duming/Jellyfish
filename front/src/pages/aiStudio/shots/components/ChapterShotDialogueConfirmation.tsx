import { Button, Empty, Input, Spin, Tooltip } from 'antd'
import { DeleteOutlined, FireOutlined, PlusOutlined, SmileOutlined } from '@ant-design/icons'
import type {
  ShotDialogLineRead,
  ShotExtractedDialogueCandidateRead,
} from '../../../../services/generated'

function dialogTitle(speaker?: string | null, target?: string | null) {
  const s = (speaker ?? '').trim() || '未知'
  const t = (target ?? '').trim() || '未知'
  return `${s} → ${t}`
}

type ChapterShotDialogueConfirmationProps = {
  savedDialogLines: ShotDialogLineRead[]
  extractedDialogLines: ShotExtractedDialogueCandidateRead[]
  batchDialogAdding: boolean
  dialogLoading: boolean
  dialogDeletingIds: Record<number, boolean>
  dialogAddingKeys: Record<string, boolean>
  onAcceptAll: () => void
  onIgnoreAll: () => void
  onDeleteSavedDialogLine: (lineId: number) => void
  onUpdateSavedDialogText: (lineId: number, text: string) => void
  onAddExtractedDialogLine: (line: ShotExtractedDialogueCandidateRead) => void
  onIgnoreExtractedDialogLine: (line: ShotExtractedDialogueCandidateRead) => void
  onUpdateExtractedDialogText: (candidateId: number, text: string) => void
}

export function ChapterShotDialogueConfirmation({
  savedDialogLines,
  extractedDialogLines,
  batchDialogAdding,
  dialogLoading,
  dialogDeletingIds,
  dialogAddingKeys,
  onAcceptAll,
  onIgnoreAll,
  onDeleteSavedDialogLine,
  onUpdateSavedDialogText,
  onAddExtractedDialogLine,
  onIgnoreExtractedDialogLine,
  onUpdateExtractedDialogText,
}: ChapterShotDialogueConfirmationProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <div className="text-xs text-gray-600 font-medium">对白确认</div>
          <div className="text-[11px] text-gray-500 mt-1">对白候选的接受与忽略也在这里完成，准备完成后可进入工作室继续生成。</div>
        </div>
        <div className="flex items-center gap-2">
          {extractedDialogLines.length > 0 ? (
            <>
              <Button size="small" loading={batchDialogAdding} onClick={onAcceptAll}>
                全部接受
              </Button>
              <Button size="small" disabled={batchDialogAdding} onClick={onIgnoreAll}>
                全部忽略
              </Button>
            </>
          ) : null}
          {dialogLoading ? <Spin size="small" /> : null}
        </div>
      </div>

      <div className="space-y-2">
        {savedDialogLines.length === 0 && extractedDialogLines.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无对白" />
        ) : null}

        {savedDialogLines.length > 0 ? (
          <div className="space-y-2">
            {savedDialogLines
              .slice()
              .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
              .map((l) => (
                <div key={l.id} className="flex items-start gap-2">
                  <Tooltip title="已保存">
                    <span className="mt-1 text-gray-500">
                      <SmileOutlined />
                    </span>
                  </Tooltip>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    loading={!!dialogDeletingIds[l.id]}
                    onClick={() => onDeleteSavedDialogLine(l.id)}
                  />
                  <div className="w-36 shrink-0 text-xs text-gray-700 mt-1 truncate">
                    {dialogTitle(l.speaker_name, l.target_name)}
                  </div>
                  <Input.TextArea
                    value={l.text ?? ''}
                    onChange={(e) => onUpdateSavedDialogText(l.id, e.target.value)}
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    placeholder="对白内容"
                  />
                </div>
              ))}
          </div>
        ) : null}

        {extractedDialogLines.length > 0 ? (
          <div className="space-y-2">
            {extractedDialogLines.map((l) => (
              <div key={l.id} className="flex items-start gap-2">
                <Tooltip title="新提取">
                  <span className="mt-1 text-red-600">
                    <FireOutlined />
                  </span>
                </Tooltip>
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  loading={!!dialogAddingKeys[String(l.id)]}
                  onClick={() => onAddExtractedDialogLine(l)}
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={!!dialogAddingKeys[String(l.id)]}
                  onClick={() => onIgnoreExtractedDialogLine(l)}
                />
                <div className="w-36 shrink-0 text-xs text-gray-700 mt-1 truncate">
                  {dialogTitle(l.speaker_name, l.target_name)}
                </div>
                <Input.TextArea
                  value={l.text ?? ''}
                  onChange={(e) => onUpdateExtractedDialogText(l.id, e.target.value)}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  placeholder="对白内容"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
