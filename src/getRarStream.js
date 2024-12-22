const { RarFilesPackage } = require('rar-stream')
const urlToFileMedia = require('./urlToFileMedia')
const store = require('./store')
const safeStatelessRegex = require('safe-stateless-regex')
const namedQueue = require('named-queue')

const q = new namedQueue(async (task, cb) => {
  const { opts, query } = task
  const rarUrls = getRarUrls(query)
  rarStreams[task.url] = rarStreams[task.url] || await streamRar(rarUrls, opts)
  cb(rarStreams[task.url])
}, 10)

const rarStreams = {}

const isRegex = /^\/(.*)\/(.*)$/

function parseQuery(req) {
  let opts = {}
  try {
    opts = JSON.parse(req.query.o)
  } catch(e) {}
  if ((opts.fileMustInclude || []).length)
    opts.fileMustInclude = opts.fileMustInclude.map(el => {
      if ((el || '').match(isRegex)) {
        const parts = isRegex.exec(el)
        try {
          return new RegExp(parts[1],parts[2])
        } catch(e) {}
      }
      return el
    })
  return { opts, query: req.query }
}

function getRarUrls(query) {
  let rarUrls = []
  let key = query.key
  if (key && store.get(key)) {
    rarUrls = store.get(key)
  } else {
    // there is an issue here, as there is such a thing as an url that is too long
    // it would be cropped in this case and some rar parts could be missing..
    // using /create-rar to get a token prior to using the /rar endpoint solves this
    rarUrls = query.r || []
    if (typeof rarUrls === 'string')
      rarUrls = [rarUrls]
  }
  return rarUrls
}

const streamRar = async (urls, opts = {}) => {
  const rarFiles = []
  for (let url of urls)
    rarFiles.push(urlToFileMedia(url))

  const rarStreamPackage = new RarFilesPackage(await Promise.all(rarFiles))

  if (!(opts.fileMustInclude || []).length && !opts.hasOwnProperty('fileIdx'))
    opts = { fileMustInclude: [/.mkv$|.mp4$|.avi$/i] }

  const rarStreamOpts = { filter: () => { return true } }

  rarStreamOpts.filter = function(name, idx) {
    if ((opts.fileMustInclude || []).length) {
      return !!opts.fileMustInclude.find(reg => {
        reg = typeof reg === 'string' ? new RegExp(reg) : reg
        return safeStatelessRegex(name || '', reg, 500)
      })
    } else if (opts.hasOwnProperty('fileIdx')) {
      return opts.fileIdx === idx
    } else {
      return true
    }
  }

  rarStreamOpts.maxFiles = 1

  const innerFiles = await rarStreamPackage.parse(rarStreamOpts)

  if (!innerFiles[0])
    throw Error('no file matching ' + JSON.stringify(opts))

  return innerFiles[0]

}

function promiseRarStream(task) {
  return new Promise((resolve, reject) => {
    task.id = task.query.key
    q.push(task, (rarStream) => {
      resolve(rarStream)
    })
  })
}

async function getRarStream(req) {
  const task = parseQuery(req)
  task.url = req.url
  rarStream = await promiseRarStream(task)
  return rarStream
}

module.exports = getRarStream
