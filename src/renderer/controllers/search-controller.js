/**
 * Created by juanjimenez on 20/03/2017.
 */

/// CommonJS import
const PirateBay = require('thepiratebay')
const {dispatch} = require('../lib/dispatcher')

// Controls the UI checking for new versions of the app, prompting install
module.exports = class SearchController {
    constructor (state) {
        this.state = state
    }

    // Shows a modal saying that we have an update
    search (text) {


    }
    openSearch () {
        const state = this.state
        console.log('openSearch  :: ');

        state.location.go({
            url: 'search'
        }, function (err) {
            if (err) { dispatch('error', err) }
        })
    }
    // Don't show the modal again until the next version

}