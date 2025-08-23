/**
 * @type {import("@textlint/types").TextlintRuleModule}
 */
const rule = function (context, options = {}) {
	// rule object
	return {
		[context.Syntax.Document](node) {},

		[context.Syntax.Paragraph](node) {},

		[context.Syntax.Str](node) {
			const text = context.getSource(node);
			if (/found wrong use-case/.test(text)) {
				// report error
				context.report(node, new context.RuleError('Found wrong'));
			}
		},

		[context.Syntax.Break](node) {},
	};
};

export default rule;
