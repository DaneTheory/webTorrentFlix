const electron = require('electron')
const fs = require('fs')
const path = require('path')
const parallel = require('run-parallel')

const remote = electron.remote

const {dispatch} = require('../lib/dispatcher')

module.exports = class SubtitlesController {
  constructor (state) {
    this.state = state
  }

  openSubtitles () {
    remote.dialog.showOpenDialog({
      title: 'Select a subtitles file.',
      filters: [ { name: 'Subtitles', extensions: ['vtt', 'srt'] } ],
      properties: [ 'openFile' ]
    }, (filenames) => {
      if (!Array.isArray(filenames)) return
      this.addSubtitles(filenames, true)
    })
  }

  selectSubtitle (ix) {
    this.state.playing.subtitles.selectedIndex = ix
  }

  toggleSubtitlesMenu () {
    const subtitles = this.state.playing.subtitles
    subtitles.showMenu = !subtitles.showMenu
  }

  checkOpenSubtitles(){
      /**console.log('XSXSX:::checkOpenSubtitles ')
      OpenSubtitles.search({
          sublanguageid: 'fre',       // Can be an array.join, 'all', or be omitted.
          hash: '8e245d9679d31e12',   // Size + 64bit checksum of the first and last 64k
          filesize: '129994823',      // Total size, in bytes.
          path: 'foo/bar.mp4',        // Complete path to the video file, it allows
                                      //   to automatically calculate 'hash'.
          filename: 'bar.mp4',        // The video file name. Better if extension
                                      //   is included.
          season: '2',
          episode: '3',
          extensions: ['srt', 'vtt'], // Accepted extensions, defaults to 'srt'.
          limit: '3',                 // Can be 'best', 'all' or an
                                      // arbitrary nb. Defaults to 'best'
          imdbid: '528809',           // 'tt528809' is fine too.
          fps: '23.96',               // Number of frames per sec in the video.
          query: 'Charlie Chaplin',   // Text-based query, this is not recommended.
          gzip: true                  // returns url to gzipped subtitles, defaults to false
      }).then(subtitles => {
          // an array of objects, no duplicates (ordered by
          // matching + uploader, with total downloads as fallback)

          console.log('GTGTGTGTGT::: '+subtitles.length);


      });**/
  }

  addSubtitles (files, autoSelect) {


    // Subtitles are only supported when playing video files
    if (this.state.playing.type !== 'video') return
    if (files.length === 0) return
    const subtitles = this.state.playing.subtitles

    // Read the files concurrently, then add all resulting subtitle tracks
    const tasks = files.map((file) => (cb) => loadSubtitle(file, cb))
    parallel(tasks, function (err, tracks) {
      if (err) return dispatch('error', err)

      for (let i = 0; i < tracks.length; i++) {
        // No dupes allowed
        const track = tracks[i]
        let trackIndex = subtitles.tracks.findIndex((t) =>
          track.filePath === t.filePath)

        // Add the track
        if (trackIndex === -1) {
          trackIndex = subtitles.tracks.push(track) - 1
        }

        // If we're auto-selecting a track, try to find one in the user's language
        if (autoSelect && (i === 0 || isSystemLanguage(track.language))) {
          subtitles.selectedIndex = trackIndex
        }
      }

      // Finally, make sure no two tracks have the same label
      relabelSubtitles(subtitles)
    })
  }

  checkForSubtitles () {
    console.log('checkForSubtitles');
    if (this.state.playing.type !== 'video') return
    const torrentSummary = this.state.getPlayingTorrentSummary()
    if (!torrentSummary || !torrentSummary.progress) return

    torrentSummary.progress.files.forEach((fp, ix) => {
      if (fp.numPieces !== fp.numPiecesPresent) return // ignore incomplete files
      const file = torrentSummary.files[ix]
      if (!this.isSubtitle(file.name)) return
      const filePath = path.join(torrentSummary.path, file.path)
      this.addSubtitles([filePath], false)
    })
  }

  isSubtitle (file) {
    const name = typeof file === 'string' ? file : file.name
    const ext = path.extname(name).toLowerCase()
    return ext === '.srt' || ext === '.vtt'
  }
}

function loadSubtitle (file, cb) {
  // Lazy load to keep startup fast
  const concat = require('simple-concat')
  const LanguageDetect = require('languagedetect')
  const srtToVtt = require('srt-to-vtt')

  // Read the .SRT or .VTT file, parse it, add subtitle track
  const filePath = file.path || file

  const vttStream = fs.createReadStream(filePath).pipe(srtToVtt())

  concat(vttStream, function (err, buf) {
    if (err) return dispatch('error', 'Can\'t parse subtitles file.')

    // Detect what language the subtitles are in
    const vttContents = buf.toString().replace(/(.*-->.*)/g, '')
    let langDetected = (new LanguageDetect()).detect(vttContents, 2)
    langDetected = langDetected.length ? langDetected[0][0] : 'subtitle'
    langDetected = langDetected.slice(0, 1).toUpperCase() + langDetected.slice(1)

    const track = {
      buffer: 'data:text/vtt;base64,' + buf.toString('base64'),
      language: langDetected,
      label: langDetected,
      filePath: filePath
    }

    cb(null, track)
  })
}

// Checks whether a language name like 'English' or 'German' matches the system
// language, aka the current locale
function isSystemLanguage (language) {
  const iso639 = require('iso-639-1')
  const osLangISO = window.navigator.language.split('-')[0] // eg 'en'
  const langIso = iso639.getCode(language) // eg 'de' if language is 'German'
  return langIso === osLangISO
}

// Make sure we don't have two subtitle tracks with the same label
// Labels each track by language, eg 'German', 'English', 'English 2', ...
function relabelSubtitles (subtitles) {
  const counts = {}
  subtitles.tracks.forEach(function (track) {
    const lang = track.language
    counts[lang] = (counts[lang] || 0) + 1
    track.label = counts[lang] > 1 ? (lang + ' ' + counts[lang]) : lang
  })
}
