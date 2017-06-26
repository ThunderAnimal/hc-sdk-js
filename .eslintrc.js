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
		"class-methods-use-this" : 0,


		"prefer-const": 0,
		"no-unused-vars": 0,
	},
	"env": {
		"browser": true
	},
	"globals": {
		"zkit_sdk": true
	}
};