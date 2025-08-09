'use strict';

/**
 * @typedef {object} Options
 * @property {boolean} [setup=true] - 是否启用 Vue 3 的 `<script setup>` 语法。
 * @property {string | undefined} [NuxtLayout=undefined] - Nuxt.js 布局名称，如果需要使用 Nuxt.js 布局，则提供此名称。
 */

/**
 * 拼接 Vue 模板和脚本，生成完整的 Vue 单文件组件字符串。
 * @param {string} template - Vue 模板内容（不包含 `<template>` 标签）。
 * @param {string | null} script - Vue 脚本内容（不包含 `<script>` 标签），可为 null。
 * @param {Options} [options] - 额外的配置选项。
 * @returns {string} 生成的完整 Vue 组件字符串。
 */
function generateVue(template, script, options = {}) {
	const result = [];

	// Template 部分
	result.push('<template>');
	if (options.NuxtLayout) result.push(`<NuxtLayout name="${options.NuxtLayout}">`);
	result.push(template);
	if (options.NuxtLayout) result.push('</NuxtLayout>');
	result.push('</template>');

	// 此部分为了美观
	result.push('\n');

	// Script 部分
	if (script) {
		result.push(`<script ${options.setup ? 'setup' : ''}>`);
		result.push(script);
		result.push('</script>');
	}

	return result.join('\n');
}

module.exports = generateVue;
