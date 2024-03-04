const needle = require('needle')

const getContentLengthFromRange = async function(url) {
	// this works better than getContentLengthFromHead
	// which i have seen fail by retrieving the full file body
	return new Promise((resolve, reject) => {
		needle.get(url, { 'follow_max': 5, headers: { range: `bytes=0-1` } }, (err, resp, body) => {
		  if (!err && [200,206].includes(resp.statusCode)) {
		  	let contentLength = false
			  	if ((resp.headers['content-range'] || '').includes('/')) {
		  			contentLength = resp.headers['content-range'].split('/').pop()
			  		resolve(contentLength)
			  		return
			  	}
		  	}
	  		reject('Could not retrieve content-length from ranged request')
		  })
	})
}

const getContentLengthFromHead = async function(url) {
	// used as fallback, getContentLengthFromRange is better because
	// needle seems to have a bug that retrieves the entire body
	return new Promise((resolve, reject) => {
		needle.head(url, { 'follow_max': 5 }, (err, resp, body) => {
		  if (!err && resp.statusCode === 200) {
		      if (!resp.headers['accept-ranges'] || !resp.headers['accept-ranges'].includes('bytes')) {
		      	reject(Error('RAR stream does not accept byte range'))
		      	return
		      }
		    if ('content-length' in resp.headers) {
		      resolve(resp.headers['content-length'])
		      return
		  }
	  	}
		reject('Could not retrieve content-length from head request')
	  })
	})
}

const getContentLength = async function(url) {
	return new Promise(async (resolve, reject) => {
		let contentLength = false
		try {
			contentLength = await getContentLengthFromRange(url)
		} catch(e) {
			console.log(e)
		}
		if (!contentLength) {
			try {
				contentLength = await getContentLengthFromHead(url)
			} catch(e) {
				reject(e)
				return
			}
		}
		resolve(contentLength)
	})
}

module.exports = getContentLength
