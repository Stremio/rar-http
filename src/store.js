const cache = {}

function getRandom() {
	return (Math.random() + 1).toString(36).substring(7)
}

module.exports = {
	set: (data) => {
		let key = getRandom()
		while (cache[key])
			key = getRandom()
		cache[key] = data
		return key
	},
	get: (key) => {
		return cache[key] || null
	}
}