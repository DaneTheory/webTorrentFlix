
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

        PirateBay.search(text, {
            category: 0
        }).then(results => this.parseResults(results))
            .catch(err => console.log(err))

    }


    componentDidMount(){
        this.onSubmitSearch(null)
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
