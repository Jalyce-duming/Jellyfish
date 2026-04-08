import { Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  AppstoreOutlined,
  ScissorOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'

type ChapterStudioBatchToolbarProps = {
  selectedCount: number
  batchExtractingCandidates: boolean
  batchVideoReadinessLoading: boolean
  generating: boolean
  maintenanceMenuItems: MenuProps['items']
  onBatchRefreshCandidates: () => void
  onBatchInspectVideoReadiness: () => void
  onBatchGenerate: () => void
}

export function ChapterStudioBatchToolbar({
  selectedCount,
  batchExtractingCandidates,
  batchVideoReadinessLoading,
  generating,
  maintenanceMenuItems,
  onBatchRefreshCandidates,
  onBatchInspectVideoReadiness,
  onBatchGenerate,
}: ChapterStudioBatchToolbarProps) {
  return (
    <div className="cs-group m-3 mt-0 mb-2">
      <div className="cs-group-title mb-1 flex items-center gap-2">
        <AppstoreOutlined /> 批量操作
      </div>
      <div className="mb-2 text-xs text-gray-500">
        正在批量处理 {selectedCount} 条分镜，可继续按{' '}
        <span className="font-medium text-gray-700">Command/Ctrl + 点击</span>{' '}
        调整选择
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-600">已选 {selectedCount} 项</span>
        <Button
          size="small"
          icon={<ScissorOutlined />}
          loading={batchExtractingCandidates}
          disabled={batchExtractingCandidates}
          onClick={onBatchRefreshCandidates}
        >
          刷新候选后去确认
        </Button>
        <Button
          size="small"
          icon={<VideoCameraOutlined />}
          loading={batchVideoReadinessLoading}
          disabled={batchVideoReadinessLoading}
          onClick={onBatchInspectVideoReadiness}
        >
          批量视频准备度
        </Button>
        <Button
          size="small"
          icon={<ThunderboltOutlined />}
          loading={generating}
          onClick={onBatchGenerate}
        >
          批量生成
        </Button>
        <Dropdown menu={{ items: maintenanceMenuItems }} trigger={['click']}>
          <Button size="small" icon={<SettingOutlined />}>
            更多维护
          </Button>
        </Dropdown>
      </div>
    </div>
  )
}
