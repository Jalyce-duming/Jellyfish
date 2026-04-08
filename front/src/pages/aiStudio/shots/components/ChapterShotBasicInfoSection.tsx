import { Button, Input, Tooltip } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

type ChapterShotBasicInfoSectionProps = {
  title: string
  scriptExcerpt: string
  saving: boolean
  statusReady: boolean
  onTitleChange: (value: string) => void
  onScriptExcerptChange: (value: string) => void
  onSave: () => void
  onGoToStudio: () => void
}

export function ChapterShotBasicInfoSection({
  title,
  scriptExcerpt,
  saving,
  statusReady,
  onTitleChange,
  onScriptExcerptChange,
  onSave,
  onGoToStudio,
}: ChapterShotBasicInfoSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <span className="shrink-0">基础信息</span>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="标题"
          size="small"
          style={{ maxWidth: 520, flex: '1 1 200px' }}
        />
        <Tooltip
          title={
            statusReady
              ? '当前镜头已完成信息确认，可进入工作室继续准备关键帧与视频。'
              : '当前镜头仍有信息待确认，也可以先进入工作室查看视频准备度。'
          }
        >
          <Button
            type={statusReady ? 'primary' : 'default'}
            size="small"
            onClick={onGoToStudio}
          >
            进入分镜工作室
          </Button>
        </Tooltip>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="text-xs text-gray-600">剧本摘录</div>
          <Button
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={onSave}
          >
            保存
          </Button>
        </div>
        <Input.TextArea
          value={scriptExcerpt}
          onChange={(e) => onScriptExcerptChange(e.target.value)}
          autoSize={{ minRows: 4, maxRows: 14 }}
          placeholder="剧本摘录"
        />
      </div>
    </div>
  )
}
