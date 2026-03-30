/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * 人物画像缺失信息分析请求。
 */
export type CharacterPortraitAnalysisRequest = {
    /**
     * 原文人物上下文（可为空；用于提供额外背景，帮助判断缺失信息）
     */
    character_context?: (string | null);
    /**
     * 原文人物描述
     */
    character_description: string;
};

