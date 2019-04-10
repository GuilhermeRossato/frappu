/**
 * Transforms a "snake_case_string" into a "Proper String", where words are separated by spaces and starts with a capital letter 
 *
 * @param  {String} str  The snake_case_string to be transformed
 *
 * @return {String}     The converted string, with spaces and capital letters at the start of each word.
 */
function snakeCaseToProperString(str) {
	return str.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

module.exports = snakeCaseToProperString;