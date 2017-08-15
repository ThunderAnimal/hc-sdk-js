module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
    "rules" : {
		"indent": ["error", "tab", {"SwitchCase": 1}],
		"func-names": 0,
		"no-tabs": 0,
		"no-param-reassign": 0,
		"class-methods-use-this": 0,
		"arrow-body-style":  ["error", "as-needed"],
		"camelcase": 1,
		"object-curly-newline": [2, {"minProperties": 3, "multiline": true, "consistent": true}],
		"prefer-const": 1,
		"no-unused-vars": 1,
		"newline-per-chained-call": ["error", { "ignoreChainWithDepth": 3 }],
		"max-len": ["error",  { "code": 100, "ignoreTemplateLiterals": true }]
	},
	"env": {
		"browser": true
	},
	"globals": {
		"zkit_sdk": true
	}
};
