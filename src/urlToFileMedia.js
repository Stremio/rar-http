const request = require('request')
const getContentLength = require('./getContentLength')

const urlToFileMedia = async function(url) {
	return new Promise(async (resolve, reject) => {
		let contentLength = false
		try {
			contentLength = await getContentLength(url)
		} catch(e) {
			console.error(e)
			reject(e)
			return
		}
		let fileName = url.split('/').pop()
		if ((fileName || '').includes('.')) {
			fileName = decodeURIComponent(fileName)
			if (fileName.includes('?'))
				fileName = fileName.split('?')[0]
		} else
		  	fileName = 'archive.rar'
		const file = {
			length: parseInt(contentLength),
			name: fileName,
			createReadStream: (range) => {
				const opts = { url, followRedirect: true, maxRedirects: 5, strictSSL: false }
				if (Object.values(range).length) {
					range.start = range.start || 0
					range.end = range.end || 0
					if (range.end > contentLength -1 || range.end === 0)
						range.end = ''
					opts.headers = { range: `bytes=${range.start}-${range.end}` }
		  		}
		  		return request(opts)
		  	},
		  }
		  resolve(file)
    })
}

module.exports = urlToFileMedia
