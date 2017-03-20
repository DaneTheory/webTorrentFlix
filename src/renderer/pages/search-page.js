
/**
 * Created by juanjimenez on 20/03/2017.
 */
var React = require('react')
var prettyBytes = require('prettier-bytes')
const PirateBay = require('thepiratebay')


var Checkbox = require('material-ui/Checkbox').default

const {dispatch} = require('../lib/dispatcher')

class SearchPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            torrents:[],
            searchTxt:'',
        };

       this.onSubmitSearch=this.onSubmitSearch.bind(this)
       this.handleChange=this.handleChange.bind(this)
       this.renderBtns=this.renderBtns.bind(this)

    }
    handleChange(event) {
        this.setState({searchTxt: event.target.value});
    }
    onSubmitSearch(evt){
        let text = this.state.searchTxt;

        console.log(text);

        PirateBay.search(text, {
            category: 0
        }).then(results => this.parseResults(results))
            .catch(err => console.log(err))

    }



    parseResults(results){
        const style = {}

            const gradient = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.4) 100%)'

            style.backgroundImage = gradient

        var res = [];


        results.forEach( (item) => this.renderTorrentsearch(item,res))
        console.log('res:: '+res.length);
        this.setState({torrents:res})
    }

    renderTorrentsearch(item,res){
        console.log(JSON.stringify(item))
        let itemTorrent = (
            <div
                id={item.testID && ('torrent-' + item.testID)}
                key={item.torrentKey}

                className='torrentSearchItem'
            >

                {item.name}
                <div>{item.uploadDate}</div>

                {this.renderBtns(item)}

            </div>

        )
        res.push(itemTorrent)

    }

    renderBtns(torrentdata){

        return (
            <i
                key='add-button'
                title='Add to torrents'
                style={{width:60,height:60,}}
                className={'icon add'}
                onClick={()=> dispatch('addTorrent', torrentdata.magnetLink)}>
                add
            </i>

        );
    }

    renderSearchHeader(){
        return(
            <div key='torrent-piratebay' className='torrent-piratebay'>
                <form onSubmit={(evt)=>this.onSubmitSearch(evt)} >
                    <input  placeholder="Enter movie or TV show" value={this.state.searchTxt} onChange={this.handleChange}/>
                    <button type="submit" >OK</button>

                </form>

            </div>
        )
    }

    render() {


        return (
        <div key='torrent-list' className='torrent-list'>
            {this.renderSearchHeader()}
            {this.state.torrents}
        </div>

        )
    }
}
module.exports = SearchPage;
