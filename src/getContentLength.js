const request = require('request')

const getContentLength = async function(url) {
	return new Promise((resolve, reject) => {
		const req = request({ url, followRedirect: true, maxRedirects: 5, strictSSL: false })
		req.on('response',function(d) {
			req.abort()
			if (!d.headers['content-length'])
				reject('Could not retrieve content-length from ranged request')
			else
				resolve(d.headers['content-length'])
		}).on('error', reject)
	})
}

module.exports = getContentLength
