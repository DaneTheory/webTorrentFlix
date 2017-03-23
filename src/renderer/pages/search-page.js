
/**
 * Created by juanjimenez on 20/03/2017.
 */
var React = require('react')
var prettyBytes = require('prettier-bytes')
const PirateBay = require('thepiratebay')
const ExtraTorrentAPI = require('extratorrent-api').Website;
const extraTorrentAPI = new ExtraTorrentAPI();



var Checkbox = require('material-ui/Checkbox').default

const {dispatch} = require('../lib/dispatcher')

class SearchPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            torrents:[],
            searchTxt:'',
            isLoading:false,
        };

       this.onSubmitSearch=this.onSubmitSearch.bind(this)
       this.handleChange=this.handleChange.bind(this)
       this.renderBtns=this.renderBtns.bind(this)


    }
    handleChange(event) {
        this.setState({searchTxt: event.target.value});
    }
    onSubmitSearch(evt){
        let text = this.state.searchTxt.toLowerCase();

        console.log(text);

        this.setState({isLoading:true})

        this.searchExraTorrent(text);

        return;

        PirateBay.search(text, {
            category: 'all',    // default - 'all' | 'all', 'audio', 'video', 'xxx',
                                //                   'applications', 'games', 'other'
                                //
                                // You can also use the category number:
                                // `/search/0/99/{category_number}`
            filter: {
                verified: false    // default - false | Filter all VIP or trusted torrents
            },
            page: 0,            // default - 0 - 99
            orderBy: 'leeches', // default - name, date, size, seeds, leeches
            sortBy: 'desc'      // default - desc, asc
        }).then(results => this.parseResults(results))
            .catch(err => console.log(err))



    }

    searchExraTorrent(text){
        console.log('searhKAT');
        text = text==''?'ettv':text;
        extraTorrentAPI.search({
            with_words: text,
            seeds_from:100,
        }).then(res => this.parseResultsExtraTorrent(res.results))
            .catch(err => console.error(err));
    }


    componentDidMount(){
        this.onSubmitSearch(null)
    }


    parseResultsExtraTorrent(results){

        var etRes = []

        for(var i=0;i<results.length;i++){
            var item = results[i];
            var parsedItem ={testID:i,magnetLink:item.magnet,name:item.title,uploadDate:item.date_added};

            etRes.push(parsedItem)
        }

        this.parseResults(etRes)

    }
    parseResults(results){
        this.setState({isLoading:false})

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
            <img className="addSearchItem" src="./add.png"  onClick={()=> dispatch('addTorrent', torrentdata.magnetLink)}/>
        )
    }

    renderSearchHeader(){
        return(
            <div key='torrent-piratebay' className='torrent-piratebay'>
                <form  >
                    <input  placeholder="Enter movie or TV show" value={this.state.searchTxt} onChange={this.handleChange} onClick={()=>this.setState({searchTxt:''})}/>
                    <img src="./find.svg" onClick={(evt)=>this.onSubmitSearch(evt)}/>
                </form>
            </div>
        )
    }

    renderLoading(){
        if(this.state.isLoading){
            return (
                <div className="centerSearch">
                    <img src="./loading.svg"/>
                </div>
            )
        }else{
            return (this.state.torrents.length>0) ?  this.state.torrents: ( <div className="centerSearchGif">
                    <img src="./sad.gif"/>
                    <span>nope...</span>
                </div>);

        }
    }

    render() {


        return (
        <div className="torrent-piratebay-container">
            {this.renderSearchHeader()}
            {this.renderLoading()}

        </div>

        )
    }
}
module.exports = SearchPage;
