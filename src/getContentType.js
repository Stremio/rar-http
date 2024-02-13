const mime = require('mime')

function getContentType(rarInnerFile) {
	return mime.lookup(rarInnerFile.name) || 'application/octet-stream'
}

module.exports = getContentType
