module.exports = {
	"env": {
		"browser": false,
		"commonjs": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"globals": {
	},
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"plugins": [],
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"no-console": "off",
		"no-undef": "off",
	}
};