import React from 'react';
import {getServiceUrl,getDomain} from '../../servicelocator.js';


export default class CommentsDisabled extends React.Component {
    render() {

        var iStyle = {
            width: '100%',
            height: '190px',
            border: 'none'
        };

        var frameUrl = getServiceUrl('core') + '/edit?comment_article=' + encodeURIComponent(window.location.href);
        if (this.props.isAuthor) {
            return (<iframe src={frameUrl} style={ iStyle }/>);
        } else { // do not open iframe if it isn't author
            return (
                <div className="well enable-comment text-left">
                    <h4>Comments disabled</h4>

                    <p>Comments haven't been enabled by author</p>

                </div>);
        }

    }
}

CommentsDisabled.propTypes = {
    isAuthor: React.PropTypes.bool
};