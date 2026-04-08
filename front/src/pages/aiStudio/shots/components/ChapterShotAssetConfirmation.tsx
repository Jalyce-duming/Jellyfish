import { Button, Empty, Popconfirm, Tag, Tooltip } from 'antd'
import { DisplayImageCard } from '../../assets/components/DisplayImageCard'
import { resolveAssetUrl } from '../../assets/utils'
import type {
  EntityNameExistenceItem,
  ShotAssetOverviewItem,
} from '../../../../services/generated'

type AssetKind = 'scene' | 'actor' | 'prop' | 'costume'
type AssetVM = {
  name: string
  thumbnail?: string | null
  id?: string | null
  file_id?: string | null
  description?: string | null
  kind: AssetKind
  status: 'linked' | 'new'
  candidateId?: number
  candidateStatus?: ShotAssetOverviewItem['candidate_status']
}

type ChapterShotAssetConfirmationProps = {
  projectId: string
  extractingAssets: boolean
  skipExtractionUpdating: boolean
  skipExtraction: boolean
  unionAssets: Record<AssetKind, AssetVM[]>
  expandedKinds: Record<AssetKind, boolean>
  candidateActionIds: Record<number, boolean>
  existenceByKindName: Record<AssetKind, Record<string, EntityNameExistenceItem>>
  onExtractAssets: () => void
  onUpdateSkipExtraction: (skip: boolean) => void
  onToggleExpanded: (kind: AssetKind) => void
  onIgnoreCandidate: (asset: AssetVM) => void
  onHandleNewAsset: (asset: AssetVM) => void
}

function assetDetailUrl(kind: AssetKind, id: string, projectId: string) {
  if (kind === 'scene') return `/assets/scenes/${encodeURIComponent(id)}/edit`
  if (kind === 'prop') return `/assets/props/${encodeURIComponent(id)}/edit`
  if (kind === 'costume') return `/assets/costumes/${encodeURIComponent(id)}/edit`
  return `/projects/${encodeURIComponent(projectId)}/roles/${encodeURIComponent(id)}/edit`
}

export function ChapterShotAssetConfirmation({
  projectId,
  extractingAssets,
  skipExtractionUpdating,
  skipExtraction,
  unionAssets,
  expandedKinds,
  candidateActionIds,
  existenceByKindName,
  onExtractAssets,
  onUpdateSkipExtraction,
  onToggleExpanded,
  onIgnoreCandidate,
  onHandleNewAsset,
}: ChapterShotAssetConfirmationProps) {
  const renderAssetCard = (asset: AssetVM) => {
    const existence = existenceByKindName[asset.kind][asset.name]
    const actionLabel = existence ? (existence.exists ? '关联' : '新建') : '…'
    const candidateBusy = asset.candidateId ? !!candidateActionIds[asset.candidateId] : false
    const footer =
      asset.status === 'new' ? (
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-500 truncate">
            {existence
              ? existence.linked_to_project
                ? '项目内可关联'
                : existence.exists
                  ? '资产库已有'
                  : '需新建'
              : '正在检查…'}
          </div>
          <div className="flex items-center gap-1">
            {asset.candidateId ? (
              <Button
                size="small"
                type="text"
                danger
                loading={candidateBusy}
                onClick={() => onIgnoreCandidate(asset)}
              >
                忽略
              </Button>
            ) : null}
            <Button size="small" disabled={!existence || candidateBusy} onClick={() => onHandleNewAsset(asset)}>
              {actionLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-gray-500">当前镜头已关联</div>
      )
    return (
      <div key={`${asset.kind}:${asset.name}`} className="col-span-12 md:col-span-6 xl:col-span-3 2xl:col-span-2">
        <DisplayImageCard
          title={
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                {asset.id ? (
                  <Button
                    type="link"
                    size="small"
                    className="!p-0 !h-auto"
                    onClick={() =>
                      window.open(assetDetailUrl(asset.kind, asset.id!, projectId), '_blank', 'noopener,noreferrer')
                    }
                  >
                    <span className="truncate inline-block max-w-[140px] align-bottom">{asset.name}</span>
                  </Button>
                ) : (
                  <Tooltip title="该资产仅提取结果，尚未落库">
                    <span className="truncate inline-block max-w-[140px] text-gray-400 cursor-not-allowed align-bottom">{asset.name}</span>
                  </Tooltip>
                )}
              </div>
              {asset.status === 'linked' ? <Tag color="blue">已关联</Tag> : <Tag color="magenta">新提取</Tag>}
            </div>
          }
          imageUrl={resolveAssetUrl(asset.thumbnail)}
          imageAlt={asset.name}
          enablePreview
          hoverable={false}
          size="small"
          imageHeightClassName="h-24"
          footer={footer}
        />
      </div>
    )
  }

  const renderAssetGrid = (kind: AssetKind, titleLabel: string, items: AssetVM[]) => {
    const linkedItems = items.filter((item) => item.status === 'linked')
    const candidateItems = items.filter((item) => item.status === 'new')
    const expanded = expandedKinds[kind]
    const linkedVisible = expanded ? linkedItems : linkedItems.slice(0, 6)
    const candidateVisible = expanded ? candidateItems : candidateItems.slice(0, 6)
    const hiddenCount = Math.max(0, linkedItems.length + candidateItems.length - linkedVisible.length - candidateVisible.length)
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-gray-600 font-medium">
            {titleLabel}（{items.length}）
          </div>
          {items.length > 12 ? (
            <Button type="link" size="small" onClick={() => onToggleExpanded(kind)}>
              {expanded ? '收起' : `更多（+${hiddenCount}）`}
            </Button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <Empty description={`暂无${titleLabel}`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-medium text-slate-600">当前已关联（{linkedItems.length}）</div>
                {linkedItems.length > 0 ? <Tag color="blue">当前状态</Tag> : null}
              </div>
              {linkedItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-xs text-slate-500">
                  当前镜头还没有关联{titleLabel}
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-2">
                  {linkedVisible.map((asset) => renderAssetCard(asset))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-medium text-slate-600">待确认候选（{candidateItems.length}）</div>
                {candidateItems.length > 0 ? <Tag color="magenta">待确认</Tag> : null}
              </div>
              {candidateItems.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-xs text-slate-500">
                  当前没有待确认的{titleLabel}候选
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-2">
                  {candidateVisible.map((asset) => renderAssetCard(asset))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <div className="text-xs text-gray-600 font-medium">信息提取与资产确认</div>
          <div className="text-[11px] text-gray-500 mt-1">在这里提取并确认本镜头的资产候选，确认完成后再进入工作室继续生成。</div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="primary"
            size="small"
            loading={extractingAssets}
            onClick={onExtractAssets}
          >
            提取并刷新候选
          </Button>
          {skipExtraction ? (
            <Button
              size="small"
              loading={skipExtractionUpdating}
              onClick={() => onUpdateSkipExtraction(false)}
            >
              恢复提取
            </Button>
          ) : (
            <Popconfirm
              title="确认标记为无需提取？"
              description="标记后当前镜头会直接按“提取确认已完成”处理。"
              okText="确认"
              cancelText="取消"
              onConfirm={() => onUpdateSkipExtraction(true)}
              okButtonProps={{ danger: true, loading: skipExtractionUpdating }}
              cancelButtonProps={{ disabled: skipExtractionUpdating }}
            >
              <Button
                size="small"
                danger
                loading={skipExtractionUpdating}
              >
                无需提取
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>
      {skipExtraction ? (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          当前镜头已标记为无需提取，系统会直接按“提取确认已完成”处理。
        </div>
      ) : null}
      <div className="space-y-4">
        {renderAssetGrid('scene', '场景', unionAssets.scene)}
        {renderAssetGrid('actor', '角色', unionAssets.actor)}
        {renderAssetGrid('prop', '道具', unionAssets.prop)}
        {renderAssetGrid('costume', '服装', unionAssets.costume)}
      </div>
    </div>
  )
}
