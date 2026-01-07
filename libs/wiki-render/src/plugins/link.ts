import type MarkdownIt from 'markdown-it';
import { hasProtocol, isRelative } from 'ufo';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';

const getDefaultRender = (md: MarkdownIt, rule: keyof MarkdownIt['renderer']['rules']): RenderRule => {
	return md.renderer.rules?.[rule] || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
};

const link: (md: MarkdownIt) => void = (md) => {
	const defaultOpenRender = getDefaultRender(md, 'link_open');
	const defaultCloseRender = getDefaultRender(md, 'link_close');

	md.renderer.rules = md.renderer.rules || {};
	md.renderer.rules['link_open'] = (tokens, idx, opt, env, self) => {
		const token = tokens[idx];
		if (!token) return defaultOpenRender(tokens, idx, opt, env, self);

		const hrefIndex = token.attrIndex('href');
		if (hrefIndex >= 0 && token.attrs?.[hrefIndex]) {
			const href = token.attrs[hrefIndex][1];

			if (!hasProtocol(href) && isRelative(href)) {
				token.tag = 'nuxt-link';
				token.attrs[hrefIndex][0] = 'to';
			} else {
				token.attrSet('target', '_blank');
				token.attrSet('rel', 'noopener noreferrer');
			}
		}

		return defaultOpenRender(tokens, idx, opt, env, self);
	};

	md.renderer.rules['link_close'] = (tokens, idx, opt, env, self) => {
		const token = tokens[idx];
		if (!token) return defaultCloseRender(tokens, idx, opt, env, self);

		for (let i = idx - 1; i >= 0; i--) {
			const openingToken = tokens[i];
			if (openingToken && openingToken.type === 'link_open') {
				token.tag = openingToken.tag;
				break;
			}
		}

		return defaultCloseRender(tokens, idx, opt, env, self);
	};
};

export { link };
