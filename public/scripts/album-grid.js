requirejs.config({
    paths: {
        jquery: ['https://code.jquery.com/jquery-1.11.3.min'],
        lodash: ['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash'],
        react: ['https://fb.me/react-0.14.0'],
        reactDom: ['https://fb.me/react-dom-0.14.0']
    }
});

require(['jquery', 'lodash', 'react', 'reactDom'], function ($, _, React, ReactDOM) {

    // Key notes from ReactJS documentation:
    // - Try to keep as many of your components as possible stateless.
    // - http://facebook.github.io/react/tips/communicate-between-components.html

    const DEFAULT_ALBUM_GRID_TEXT = 'Music I\'m listening to.  Hover to play!';

    const Marquee = React.createClass({
        marqueeScroll: function(elm, amt) {
        $(elm).delay(650);
        $(elm).animate({
                left: amt+'px'
            },
            70 * -amt,'linear',
            function() {
                $(this).delay(650);
                $(this).animate(
                    {left:'0px'},
                    70 * -amt,'linear',
                    function() {
                        marqueeScroll(elm,amt);
                    });
            });
        },
        setMarqueeHTML(content, wrapper){
            var wrapperWidth = 235; //wrapper.width()

            var content_left_position = (wrapperWidth - content.width()) /2;

            content.stop(true);

            if (content_left_position<0) {
                this.marqueeScroll(content.css('left', '0px'), content_left_position * 2);
            } else {
                content.css('left', content_left_position + 'px');
            }
        },
        componentDidUpdate() {
            // http://www.sitepoint.com/jquery-vs-raw-javascript-1-dom-forms/
            // using native calls like getElementsByClassName is
            this.setMarqueeHTML($('.gridit-message-content', this.getDOMNode()), $(this.getDOMNode()));
        },
        render: function () {
            return (
                <div className="marquee">
                    <span className="gridit-message-content" dangerouslySetInnerHTML={{__html: this.props.text}} />
                </div>
            )
        }
    });

    const AlbumGrid = React.createClass({
        getInitialState: function() {
            return {
                trackData: [],
                marqueeText: DEFAULT_ALBUM_GRID_TEXT,
                mounted: false
            };
        },
        handleOnMouseEnterAlbum: function (i) {
            let artistName = this.state.trackData[i].artist.name,
                trackName = this.state.trackData[i].name;

            this.myAudioComponent.setAttribute('src', this.state.trackData[i].preview_url);
            this.myAudioComponent.play();

            // this.state should be treated as immutable.

            this.setState({
                trackData: this.state.trackData,
                marqueeText: '<b>' + artistName + '</b> - ' + trackName,
                mounted: true
            });
        },
        handleOnMouseLeave: function (i) {
            this.myAudioComponent.pause();

            this.setState({
                trackData: this.state.trackData,
                marqueeText: DEFAULT_ALBUM_GRID_TEXT,
                mounted: true
            });
        },
        componentDidMount: function() {
            const self = this;
            // Invoked once, both on the client and server, immediately before the initial rendering occurs.
            // If you call setState within this method, render() will see the updated state and will be executed only
            // once despite the state change.
            $.get("https://warm-dawn-5935.herokuapp.com/json", function (data) {
                const keyPlaylistData = _(data.tracks.items)
                    .pluck('track')
                    .map(function (track) {
                        debugger;
                        return {
                            artist: _.first(track.artists),
                            album: {
                                name: track.album.name,
                                images: track.album.images,
                                uri: track.album.uri
                            },
                            name: track.name,
                            link: track.external_urls.spotify,
                            uri: track.uri,
                            preview_url: track.preview_url
                        }
                    })
                    .uniq('album.uri')
                    .take(9)
                    .value();

                self.setState({
                    trackData: keyPlaylistData,
                    marqueeText: DEFAULT_ALBUM_GRID_TEXT,
                    mounted: true
                });
            });
        },
        render: function () {
            var extraProperties = !this.state.mounted ? { hidden: true } : {};

            return (
                <div className="wrapper" onMouseLeave={this.handleOnMouseLeave} {...extraProperties}>
                    <div className="album-grid">
                    {this.state.trackData.map((track, i) =>
                    <a href={track.link}>
                        <img src={_.last(track.album.images).url} onMouseEnter={this.handleOnMouseEnterAlbum.bind(this, i)} />
                    </a>)}
                    </div>
                    <Marquee text={this.state.marqueeText} />
                    <audio ref={(ref) => this.myAudioComponent = ref} controls hidden />
                </div>
            );
        }
    });

    ReactDOM.render(
        <AlbumGrid />,
        document.getElementById('album-grid-container')
    );
});
