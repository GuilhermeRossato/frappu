/**
 * Attempts to resolves a Promise and return its value, but wrap it so that instead of an error it returns a default value
 *
 * @param  {Unresolved Promise}  promise      The promise to be awaited on
 * @param  {mixed}               catchResult  The object of any type to be returned if the promise fails
 * @param  {Boolean} logError    logError     Whenever the error raised by the promise is to be logged to console.error
 *
 * @return {mixed}               The promise resolved return on success or the catchResult parameter value if it failed
 */

async function resolveOrDefault(promise, catchResult, logError = false) {
	try {
		return await promise;
	} catch (err) {
		if (logError === true) {
			console.error(err);
		}
		if (catchResult === undefined) {
			return err;
		}
		return catchResult;
	}
}

module.exports = resolveOrDefault;