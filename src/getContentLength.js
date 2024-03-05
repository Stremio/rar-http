const fetch = require('node-fetch')

const getContentLengthFromRange = async function(url) {
	return new Promise(async (resolve, reject) => {
		const resp = await fetch(url, { 'method': 'HEAD', 'follow': 5, headers: { range: `bytes=0-1` } })
		if (resp.ok) {
			const headers = resp.headers
			if ((headers.get('content-range') || '').includes('/')) {
				const contentLength = headers.get('content-range').split('/').pop()
				resolve(contentLength)
				return
			}
		}
		reject('Could not retrieve content-length from ranged request')
	})
}

const getContentLengthFromHead = async function(url) {
	return new Promise(async (resolve, reject) => {
		const resp = await fetch(url, { 'method': 'HEAD', 'follow': 5 })
		if (resp.ok) {
			const headers = resp.headers
			if (!headers.get('accept-ranges') || !(headers.get('accept-ranges') || '').includes('bytes')) {
				reject(Error('RAR stream does not accept byte range'))
				return
			}
			if (headers.get('content-length')) {
				resolve(resp.headers['content-length'])
				return
			}
		}
		reject('Could not retrieve content-length from head request')
	})
}

const getContentLength = async function(url) {
	return new Promise(async (resolve, reject) => {
		let contentLength = false
		try {
			contentLength = await getContentLengthFromHead(url)
		} catch(e) {
			console.log(e)
		}
		if (!contentLength) {
			try {
				contentLength = await getContentLengthFromRange(url)
			} catch(e) {
				reject(e)
				return
			}
		}
		resolve(contentLength)
	})
}

module.exports = getContentLength
