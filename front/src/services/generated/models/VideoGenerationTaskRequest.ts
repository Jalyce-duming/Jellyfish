/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 视频生成任务请求。
 */
export type VideoGenerationTaskRequest = {
    /**
     * 镜头 ID
     */
    shot_id: string;
    /**
     * 参考模式：first | last | key | first_last | first_last_key | text_only
     */
    reference_mode: 'first' | 'last' | 'key' | 'first_last' | 'first_last_key' | 'text_only';
    /**
     * 视频提示词（text_only 必填）
     */
    prompt?: (string | null);
    /**
     * 参考图 file_id 列表，数量需与 reference_mode 严格匹配
     */
    images?: Array<string>;
    /**
     * 分辨率（可选），如 720x1280
     */
    size?: (string | null);
};

