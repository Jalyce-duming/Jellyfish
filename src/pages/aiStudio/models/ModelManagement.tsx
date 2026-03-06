import { useEffect, useState, useMemo } from 'react'
import {
  Layout,
  Tabs,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Tree,
  Drawer,
  Card,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Empty,
  Grid,
  Form,
  Select,
  InputNumber,
  Switch,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  CopyOutlined,
  ExportOutlined,
  MenuOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  DownOutlined,
  RightOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import api from '../../../services/aiStudioApi'
import type {
  Provider,
  Model,
  ModelSettings,
  ModelCategoryKey,
  ProviderStatus,
} from '../../../mocks/data'

const MODEL_CATEGORIES: { key: ModelCategoryKey; label: string; color: string }[] = [
  { key: 'text', label: '文本生成', color: 'blue' },
  { key: 'image', label: '图片生成', color: 'orange' },
  { key: 'video', label: '视频生成', color: 'purple' },
]

const categoryLabelMap = Object.fromEntries(MODEL_CATEGORIES.map((c) => [c.key, c.label]))
const categoryColorMap = Object.fromEntries(MODEL_CATEGORIES.map((c) => [c.key, c.color]))

const PROVIDER_STATUS_MAP: Record<ProviderStatus, { text: string; color: string }> = {
  active: { text: '活跃', color: 'green' },
  testing: { text: '测试中', color: 'orange' },
  disabled: { text: '禁用', color: 'default' },
}

const SORT_OPTIONS = [
  { value: 'updated', label: '最近更新' },
  { value: 'name', label: '名称' },
  { value: 'category', label: '类别' },
]

function maskUrl(url: string) {
  if (!url) return '—'
  try {
    const u = new URL(url)
    return `${u.protocol}//***${u.host.slice(-6)}${u.pathname}`
  } catch {
    return url.slice(0, 20) + '***'
  }
}

export default function ModelManagement() {
  const [activeTab, setActiveTab] = useState<string>('providers')
  const [providers, setProviders] = useState<Provider[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [settings, setSettings] = useState<ModelSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'category'>('updated')
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [treeCollapsed, setTreeCollapsed] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<ModelCategoryKey | null>(null)
  const [providerModalOpen, setProviderModalOpen] = useState(false)
  const [providerEditing, setProviderEditing] = useState<Provider | null>(null)
  const [modelModalOpen, setModelModalOpen] = useState(false)
  const [modelEditing, setModelEditing] = useState<Model | null>(null)
  const [testConnecting, setTestConnecting] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [form] = Form.useForm()
  const [modelForm] = Form.useForm()
  const [settingsForm] = Form.useForm()
  const { lg } = Grid.useBreakpoint()
  const isLargeScreen = lg ?? false

  const load = async () => {
    setLoading(true)
    try {
      const [provList, modelList, sett] = await Promise.all([
        api.models.providers.list(),
        api.models.list(),
        api.models.settings.get(),
      ])
      setProviders(Array.isArray(provList) ? provList : [])
      setModels(Array.isArray(modelList) ? modelList : [])
      setSettings(sett || null)
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const providerList = useMemo(() => {
    let list = providers
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.baseUrl.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else list = [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return list
  }, [providers, search, sortBy])

  const modelList = useMemo(() => {
    let list = models
    if (categoryFilter) list = list.filter((m) => m.category === categoryFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          categoryLabelMap[m.category]?.toLowerCase().includes(q) ||
          (m.description || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'category') list = [...list].sort((a, b) => a.category.localeCompare(b.category))
    else list = [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    return list
  }, [models, categoryFilter, search, sortBy])

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {}
    MODEL_CATEGORIES.forEach((cat) => {
      c[cat.key] = models.filter((m) => m.category === cat.key).length
    })
    return c
  }, [models])

  const treeData = useMemo(
    () =>
      MODEL_CATEGORIES.map((c) => ({
        key: c.key,
        title: `${c.label} (${categoryCounts[c.key] ?? 0})`,
        isLeaf: true,
      })),
    [categoryCounts]
  )

  const getProviderName = (id: string) => providers.find((p) => p.id === id)?.name ?? id

  const handleTestConnection = async (provider?: Provider) => {
    const p = provider ?? selectedProvider
    if (!p) return
    setTestConnecting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      message.success('连接成功')
    } catch {
      message.error('连接失败，请检查 Base URL 与 AK/SK')
    } finally {
      setTestConnecting(false)
    }
  }

  const handleSaveProvider = async () => {
    try {
      const values = await form.validateFields()
      if (providerEditing) {
        const updatePayload: Parameters<typeof api.models.providers.update>[1] = {
          name: values.name,
          baseUrl: values.baseUrl,
          description: values.description,
          status: values.status,
        }
        if (values.apiKey && values.apiKey !== '********') updatePayload.apiKey = values.apiKey
        if (values.apiSecret && values.apiSecret !== '********') updatePayload.apiSecret = values.apiSecret
        await api.models.providers.update(providerEditing.id, updatePayload)
        message.success('供应商已更新')
      } else {
        await api.models.providers.create({
          name: values.name,
          baseUrl: values.baseUrl,
          apiKey: values.apiKey,
          apiSecret: values.apiSecret,
          description: values.description,
          status: values.status,
        })
        message.success('供应商已添加')
      }
      setProviderModalOpen(false)
      setProviderEditing(null)
      form.resetFields()
      void load()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error('保存失败')
    }
  }

  const handleSaveModel = async () => {
    try {
      const values = await modelForm.validateFields()
      let params: Record<string, unknown> = {}
        try {
          if (values.params && String(values.params).trim()) params = JSON.parse(String(values.params))
        } catch {
          message.error('参数格式需为合法 JSON')
          return
        }
        if (modelEditing) {
        await api.models.update(modelEditing.id, {
          name: values.name,
          category: values.category,
          providerId: values.providerId,
          description: values.description,
          params,
          isDefault: values.isDefault,
        })
        message.success('模型已更新')
      } else {
        if (!values.providerId) {
          message.warning('请先添加供应商后再添加模型')
          return
        }
        await api.models.create({
          name: values.name,
          category: values.category,
          providerId: values.providerId,
          description: values.description,
          params,
          isDefault: values.isDefault,
        })
        message.success('模型已添加')
      }
      setModelModalOpen(false)
      setModelEditing(null)
      modelForm.resetFields()
      void load()
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return
      message.error('保存失败')
    }
  }

  const handleSaveSettings = async () => {
    try {
      const values = await settingsForm.validateFields()
      setSettingsSaving(true)
      await api.models.settings.update(values)
      message.success('设置已保存')
      void load()
    } catch {
      message.error('保存失败')
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSetDefaultModel = (model: Model) => {
    Modal.confirm({
      title: '设为默认',
      content: '此操作将替换当前该类别的默认模型。',
      onOk: async () => {
        await api.models.update(model.id, { isDefault: true })
        message.success('已设为默认')
        void load()
        if (selectedModel?.id === model.id) setSelectedModel({ ...model, isDefault: true })
      },
    })
  }

  const handleDeleteProvider = (p: Provider) => {
    const linked = models.filter((m) => m.providerId === p.id).length
    Modal.confirm({
      title: '删除供应商',
      content: linked > 0 ? `该供应商下还有 ${linked} 个模型，删除后关联模型将失效。确定删除？` : '确定删除该供应商？',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await api.models.providers.delete(p.id)
        message.success('已删除')
        if (selectedProvider?.id === p.id) setSelectedProvider(null)
        void load()
      },
    })
  }

  const handleDeleteModel = (m: Model) => {
    Modal.confirm({
      title: '删除模型',
      content: `确定删除「${m.name}」？`,
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        await api.models.delete(m.id)
        message.success('已删除')
        if (selectedModel?.id === m.id) setSelectedModel(null)
        void load()
      },
    })
  }

  const openProviderModal = (p?: Provider) => {
    setProviderEditing(p ?? null)
    if (p) {
      form.setFieldsValue({
        name: p.name,
        baseUrl: p.baseUrl,
        apiKey: p.apiKey ? '********' : '',
        apiSecret: p.apiSecret ? '********' : '',
        description: p.description,
        status: p.status,
      })
    } else {
      form.resetFields()
    }
    setProviderModalOpen(true)
  }

  const openModelModal = (m?: Model) => {
    setModelEditing(m ?? null)
    if (m) {
      modelForm.setFieldsValue({
        name: m.name,
        category: m.category,
        providerId: m.providerId,
        description: m.description,
        params: JSON.stringify(m.params, null, 2),
        isDefault: m.isDefault,
      })
    } else {
      modelForm.resetFields()
      modelForm.setFieldsValue({ category: 'text', isDefault: false })
    }
    setModelModalOpen(true)
  }

  useEffect(() => {
    if (settings && activeTab === 'settings') {
      settingsForm.setFieldsValue({
        defaultTextModelId: settings.defaultTextModelId,
        defaultImageModelId: settings.defaultImageModelId,
        defaultVideoModelId: settings.defaultVideoModelId,
        apiTimeout: settings.apiTimeout,
        logLevel: settings.logLevel,
      })
    }
  }, [settings, activeTab])

  const providerColumns: TableColumnsType<Provider> = [
    { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true, render: (n) => <Space>{n}</Space> },
    {
      title: 'Base URL',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      ellipsis: true,
      render: (url: string) => <Tooltip title={url}>{maskUrl(url)}</Tooltip>,
    },
    {
      title: 'AK/SK',
      key: 'aksk',
      render: () => (
        <span>
          <WarningOutlined className="text-amber-500 mr-1" />
          ******** / ********
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (d: string) => <Tooltip title={d}>{d || '—'}</Tooltip>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s: ProviderStatus) => <Tag color={PROVIDER_STATUS_MAP[s]?.color}>{PROVIDER_STATUS_MAP[s]?.text}</Tag>,
    },
    {
      title: '创建/更新',
      key: 'up',
      width: 140,
      render: (_, r) => `${r.createdBy} / ${r.updatedAt}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openProviderModal(record)}>编辑</Button>
          <Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => handleTestConnection(record)}>测试连接</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制', icon: <CopyOutlined /> },
                { key: 'export', label: '导出配置', icon: <ExportOutlined /> },
                { type: 'divider' },
                { key: 'delete', label: '删除', danger: true, icon: <DeleteOutlined />, onClick: () => handleDeleteProvider(record) },
              ],
            }}
            trigger={['click']}
          >
            <Button type="link" size="small" icon={<MenuOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  const modelColumns: TableColumnsType<Model> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (n, r) => (
        <Space>
          {r.isDefault && <StarFilled style={{ color: '#faad14' }} />}
          {n}
        </Space>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c: ModelCategoryKey) => <Tag color={categoryColorMap[c]}>{categoryLabelMap[c]}</Tag>,
    },
    {
      title: '关联供应商',
      dataIndex: 'providerId',
      key: 'providerId',
      width: 120,
      render: (id: string) => getProviderName(id),
    },
    {
      title: '参数',
      dataIndex: 'params',
      key: 'params',
      ellipsis: true,
      render: (p: Record<string, unknown>) => (
        <Tooltip title={JSON.stringify(p)}>
          <span>{p && Object.keys(p).length ? JSON.stringify(p).slice(0, 30) + '…' : '—'}</span>
        </Tooltip>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (d: string) => <Tooltip title={d}>{d || '—'}</Tooltip>,
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 70,
      render: (isDefault: boolean, record) =>
        isDefault ? (
          <StarFilled style={{ color: '#faad14' }} />
        ) : (
          <StarOutlined className="text-gray-400 hover:text-amber-500 cursor-pointer" onClick={() => handleSetDefaultModel(record)} />
        ),
    },
    {
      title: '创建/更新',
      key: 'up',
      width: 120,
      render: (_, r) => `${r.createdBy} / ${r.updatedAt}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openModelModal(record)}>编辑</Button>
          <Button type="link" size="small" icon={<ThunderboltOutlined />}>测试生成</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制', icon: <CopyOutlined /> },
                { key: 'delete', label: '删除', danger: true, icon: <DeleteOutlined />, onClick: () => handleDeleteModel(record) },
              ],
            }}
            trigger={['click']}
          >
            <Button type="link" size="small" icon={<MenuOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  return (
    <Layout className="h-full flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">模型管理</span>
            <span className="text-gray-500 text-sm">
              · 总计 {providers.length} 个供应商 / {models.length} 个模型
            </span>
          </div>
          <Space wrap>
            {activeTab === 'providers' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openProviderModal()}>
                添加供应商
              </Button>
            )}
            {activeTab === 'models' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModelModal()}>
                添加模型
              </Button>
            )}
            {activeTab !== 'settings' && (
              <>
                <Input
                  placeholder="搜索名称/类型"
                  allowClear
                  className="w-48"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Dropdown
                  menu={{
                    items: SORT_OPTIONS.map((o) => ({
                      key: o.value,
                      label: o.label,
                      onClick: () => setSortBy(o.value as 'updated' | 'name' | 'category'),
                    })),
                  }}
                >
                  <Button icon={<DownOutlined />}>排序：{SORT_OPTIONS.find((s) => s.value === sortBy)?.label}</Button>
                </Dropdown>
              </>
            )}
          </Space>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={[
            { key: 'providers', label: '供应商' },
            { key: 'models', label: '模型' },
            { key: 'settings', label: '设置' },
          ]}
        />
      </div>

      {activeTab === 'settings' ? (
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <Card title="全局默认模型与参数" className="max-w-2xl">
            <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
              <Form.Item name="defaultTextModelId" label="默认文本生成模型">
                <Select
                  allowClear
                  placeholder="选择模型"
                  options={models.filter((m) => m.category === 'text').map((m) => ({ label: m.name, value: m.id }))}
                />
              </Form.Item>
              <Form.Item name="defaultImageModelId" label="默认图片生成模型">
                <Select
                  allowClear
                  placeholder="选择模型"
                  options={models.filter((m) => m.category === 'image').map((m) => ({ label: m.name, value: m.id }))}
                />
              </Form.Item>
              <Form.Item name="defaultVideoModelId" label="默认视频生成模型">
                <Select
                  allowClear
                  placeholder="选择模型"
                  options={models.filter((m) => m.category === 'video').map((m) => ({ label: m.name, value: m.id }))}
                />
              </Form.Item>
              <Form.Item name="apiTimeout" label="API 超时（秒）">
                <InputNumber min={5} max={300} className="w-full" />
              </Form.Item>
              <Form.Item name="logLevel" label="日志级别">
                <Select
                  options={[
                    { label: 'Debug', value: 'debug' },
                    { label: 'Info', value: 'info' },
                    { label: 'Warn', value: 'warn' },
                    { label: 'Error', value: 'error' },
                  ]}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={settingsSaving}>保存设置</Button>
            </Form>
          </Card>
        </div>
      ) : (
        <Layout className="flex-1 min-h-0 flex-row overflow-hidden">
          <div
            className="flex-shrink-0 border-r border-gray-200 bg-white overflow-auto"
            style={{ width: treeCollapsed ? 48 : 200 }}
          >
            {treeCollapsed ? (
              <Button type="text" icon={<RightOutlined />} onClick={() => setTreeCollapsed(false)} className="w-full rounded-none" />
            ) : (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">筛选</span>
                  <Button type="text" size="small" icon={<RightOutlined rotate={180} />} onClick={() => setTreeCollapsed(true)} />
                </div>
                {activeTab === 'models' && (
                  <Tree
                    selectedKeys={categoryFilter ? [categoryFilter] : []}
                    treeData={treeData}
                    showLine
                    blockNode
                    onSelect={([key]) => setCategoryFilter(key ? (key as ModelCategoryKey) : null)}
                    className="py-2"
                  />
                )}
                {activeTab === 'providers' && (
                  <div className="p-3 text-sm text-gray-500">点击列表项查看详情</div>
                )}
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-auto p-4 bg-gray-50">
            <div className="flex justify-end gap-1 mb-2">
              <Button
                type={viewMode === 'table' ? 'primary' : 'default'}
                size="small"
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode('table')}
              />
              <Button
                type={viewMode === 'card' ? 'primary' : 'default'}
                size="small"
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('card')}
              />
            </div>

            {activeTab === 'providers' && (
              providerList.length === 0 ? (
                <Card>
                  <Empty
                    description={providers.length === 0 ? '暂无供应商，点击「添加供应商」开始' : '无匹配结果'}
                  >
                    {providers.length === 0 && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openProviderModal()}>
                        添加第一个供应商
                      </Button>
                    )}
                  </Empty>
                </Card>
              ) : viewMode === 'table' ? (
                <Card>
                  <Table<Provider>
                    rowKey="id"
                    loading={loading}
                    columns={providerColumns}
                    dataSource={providerList}
                    pagination={{ pageSize: 20 }}
                    onRow={(record) => ({
                      onClick: () => { setSelectedProvider(record); setSelectedModel(null); setDetailPanelOpen(true) },
                      style: { cursor: 'pointer' },
                    })}
                    size="small"
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {providerList.map((p) => (
                    <Card
                      key={p.id}
                      hoverable
                      className="cursor-pointer"
                      style={{ minHeight: 220 }}
                      onClick={() => { setSelectedProvider(p); setSelectedModel(null); setDetailPanelOpen(true) }}
                      actions={[
                        <Button key="edit" type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openProviderModal(p) }}>编辑</Button>,
                        <Button key="test" type="text" size="small" icon={<ThunderboltOutlined />} onClick={(e) => { e.stopPropagation(); handleTestConnection(p) }}>测试</Button>,
                        <Dropdown key="more" menu={{ items: [{ key: 'delete', label: '删除', danger: true, onClick: () => handleDeleteProvider(p) }] }} trigger={['click']}>
                          <Button type="text" size="small" onClick={(e) => e.stopPropagation()}>更多</Button>
                        </Dropdown>,
                      ]}
                    >
                      <div className="font-medium mb-1">{p.name}</div>
                      <div className="text-gray-500 text-sm mb-1 truncate" title={p.baseUrl}>Base URL：{maskUrl(p.baseUrl)}</div>
                      <div className="text-gray-500 text-sm mb-1">AK/SK：******** / ********</div>
                      <div className="text-gray-500 text-sm line-clamp-2 mb-2">{p.description || '—'}</div>
                      <Tag color={PROVIDER_STATUS_MAP[p.status]?.color}>{PROVIDER_STATUS_MAP[p.status]?.text}</Tag>
                      <span className="text-xs text-gray-400 ml-2">更新：{p.updatedAt}</span>
                    </Card>
                  ))}
                </div>
              )
            )}

            {activeTab === 'models' && (
              modelList.length === 0 ? (
                <Card>
                  <Empty
                    description={models.length === 0 ? '暂无模型，请先添加供应商再添加模型' : '无匹配结果'}
                  >
                    {providers.length > 0 && models.length === 0 && (
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => openModelModal()}>
                        添加第一个模型
                      </Button>
                    )}
                  </Empty>
                </Card>
              ) : viewMode === 'table' ? (
                <Card>
                  <Table<Model>
                    rowKey="id"
                    loading={loading}
                    columns={modelColumns}
                    dataSource={modelList}
                    pagination={{ pageSize: 20 }}
                    onRow={(record) => ({
                      onClick: () => { setSelectedModel(record); setSelectedProvider(null); setDetailPanelOpen(true) },
                      style: { cursor: 'pointer' },
                    })}
                    size="small"
                  />
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {modelList.map((m) => (
                    <Card
                      key={m.id}
                      hoverable
                      className="cursor-pointer"
                      style={{ minHeight: 220 }}
                      onClick={() => { setSelectedModel(m); setSelectedProvider(null); setDetailPanelOpen(true) }}
                      actions={[
                        <Button key="edit" type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); openModelModal(m) }}>编辑</Button>,
                        <Button key="test" type="text" size="small" icon={<ThunderboltOutlined />}>测试生成</Button>,
                        <Dropdown key="more" menu={{ items: [{ key: 'delete', label: '删除', danger: true, onClick: () => handleDeleteModel(m) }] }} trigger={['click']}>
                          <Button type="text" size="small" onClick={(e) => e.stopPropagation()}>更多</Button>
                        </Dropdown>,
                      ]}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color={categoryColorMap[m.category]}>{categoryLabelMap[m.category]}</Tag>
                        {m.isDefault && <StarFilled style={{ color: '#faad14' }} />}
                      </div>
                      <div className="font-medium mb-1">{m.name}</div>
                      <div className="text-gray-500 text-sm mb-1">供应商：{getProviderName(m.providerId)}</div>
                      <div className="text-gray-500 text-sm line-clamp-2 mb-2">{m.description || '—'}</div>
                      <span className="text-xs text-gray-400">更新：{m.updatedAt}</span>
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>

          {(selectedProvider || selectedModel) && isLargeScreen && (
            <div className="flex-shrink-0 overflow-auto border-l border-gray-200 bg-white" style={{ width: '36%', minWidth: 320 }}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-medium">详情</span>
                <Button type="link" size="small" onClick={() => { setDetailPanelOpen(false); setSelectedProvider(null); setSelectedModel(null) }}>收起</Button>
              </div>
              <div className="p-4 space-y-4">
                {selectedProvider && (
                  <>
                    <div><div className="text-sm text-gray-500 mb-1">名称</div><div className="font-medium">{selectedProvider.name}</div></div>
                    <div><div className="text-sm text-gray-500 mb-1">Base URL</div><Tooltip title={selectedProvider.baseUrl}><span className="text-sm">{maskUrl(selectedProvider.baseUrl)}</span></Tooltip></div>
                    <div><div className="text-sm text-gray-500 mb-1">描述</div><div className="text-gray-700 text-sm">{selectedProvider.description || '—'}</div></div>
                    <Space>
                      <Button type="primary" icon={<EditOutlined />} onClick={() => openProviderModal(selectedProvider)}>编辑</Button>
                      <Button icon={<ThunderboltOutlined />} loading={testConnecting} onClick={() => handleTestConnection()}>测试连接</Button>
                    </Space>
                  </>
                )}
                {selectedModel && (
                  <>
                    <div><div className="text-sm text-gray-500 mb-1">名称</div><div className="font-medium">{selectedModel.name}</div></div>
                    <div><div className="text-sm text-gray-500 mb-1">类别</div><Tag color={categoryColorMap[selectedModel.category]}>{categoryLabelMap[selectedModel.category]}</Tag></div>
                    <div><div className="text-sm text-gray-500 mb-1">关联供应商</div><div>{getProviderName(selectedModel.providerId)}</div></div>
                    <div><div className="text-sm text-gray-500 mb-1">描述</div><div className="text-gray-700 text-sm">{selectedModel.description || '—'}</div></div>
                    <Space>
                      <Button type="primary" icon={<EditOutlined />} onClick={() => openModelModal(selectedModel)}>编辑</Button>
                      <Button icon={<ThunderboltOutlined />}>快速测试</Button>
                    </Space>
                  </>
                )}
              </div>
            </div>
          )}

          {(selectedProvider || selectedModel) && !isLargeScreen && (
            <Drawer
              title="详情"
              placement="right"
              open={detailPanelOpen}
              onClose={() => setDetailPanelOpen(false)}
              width="min(100%, 400px)"
            >
              {selectedProvider && (
                <div className="space-y-4">
                  <div><div className="text-sm text-gray-500 mb-1">名称</div><div className="font-medium">{selectedProvider.name}</div></div>
                  <div><div className="text-sm text-gray-500 mb-1">Base URL</div><span className="text-sm">{maskUrl(selectedProvider.baseUrl)}</span></div>
                  <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => openProviderModal(selectedProvider)}>编辑</Button>
                    <Button icon={<ThunderboltOutlined />} onClick={() => handleTestConnection()}>测试连接</Button>
                  </Space>
                </div>
              )}
              {selectedModel && (
                <div className="space-y-4">
                  <div><div className="text-sm text-gray-500 mb-1">名称</div><div className="font-medium">{selectedModel.name}</div></div>
                  <div><div className="text-sm text-gray-500 mb-1">类别</div><Tag color={categoryColorMap[selectedModel.category]}>{categoryLabelMap[selectedModel.category]}</Tag></div>
                  <Space>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => openModelModal(selectedModel)}>编辑</Button>
                    <Button icon={<ThunderboltOutlined />}>快速测试</Button>
                  </Space>
                </div>
              )}
            </Drawer>
          )}
        </Layout>
      )}

      <Modal
        title={providerEditing ? '编辑供应商' : '添加供应商'}
        open={providerModalOpen}
        onCancel={() => { setProviderModalOpen(false); setProviderEditing(null); form.resetFields() }}
        onOk={() => void handleSaveProvider()}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="pt-2">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：OpenAI" />
          </Form.Item>
          <Form.Item name="baseUrl" label="Base URL" rules={[{ required: true }, { type: 'url', message: '请输入有效 URL' }]}>
            <Input placeholder="https://api.openai.com/v1" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key" help={providerEditing ? '留空则不修改' : '请勿分享密钥'}>
            <Input.Password placeholder="AK" />
          </Form.Item>
          <Form.Item name="apiSecret" label="API Secret" help={providerEditing ? '留空则不修改' : undefined}>
            <Input.Password placeholder="SK" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="支持 GPT 系列模型" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select options={[
              { label: '活跃', value: 'active' },
              { label: '测试中', value: 'testing' },
              { label: '禁用', value: 'disabled' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={modelEditing ? '编辑模型' : '添加模型'}
        open={modelModalOpen}
        onCancel={() => { setModelModalOpen(false); setModelEditing(null); modelForm.resetFields() }}
        onOk={() => void handleSaveModel()}
        width={560}
        destroyOnClose
      >
        <Form form={modelForm} layout="vertical" className="pt-2">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="例如：GPT-4" />
          </Form.Item>
          <Form.Item name="category" label="类别" rules={[{ required: true }]}>
            <Select options={MODEL_CATEGORIES.map((c) => ({ label: c.label, value: c.key }))} />
          </Form.Item>
          <Form.Item name="providerId" label="关联供应商" rules={[{ required: true, message: '请选择供应商' }]}>
            <Select
              placeholder="选择供应商（请先添加供应商）"
              options={providers.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Form.Item name="params" label="参数（JSON）">
            <Input.TextArea rows={3} placeholder='{"max_tokens": 4096, "temperature": 0.7}' />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="isDefault" label="设为该类别默认" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
