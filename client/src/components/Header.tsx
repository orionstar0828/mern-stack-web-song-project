import { Button } from 'antd';
import React from 'react';

function Header(props: any) {

    // tabs click events
    const onSongsBtnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        props.callbackSetPage('songs');
    }

    const onSingersBtnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        props.callbackSetPage('singers');
    }

    return (
        <div className="header text-center">
            <div className="tab-title">
                <Button className={props.page === 'songs'? "songs-btn active" : 'songs-btn'}onClick={onSongsBtnClick}>Songs</Button>
                <Button className={props.page === 'singers' ? 'singers-btn active' : 'singers-btn'} onClick={onSingersBtnClick}>Singers</Button>
            </div>
        </div>
    );
}

export default Header;