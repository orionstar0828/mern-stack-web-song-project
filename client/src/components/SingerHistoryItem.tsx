import React from 'react';
import Highlighter from 'react-highlight-words';

function SingerHistoryItem(props: any) {

    function onSongDragStart(ev: React.DragEvent<HTMLDivElement>): void
    {
        if(props.dragging.dragIndexes.includes(props.index))
            props.callbackSetDragging(true, 3, props.dragging.dragIds, props.dragging.dragIndexes )
        else
            props.callbackSetDragging(true, 3, [props.data._id], [props.index] )
        ev.stopPropagation();
    }

    function onSongDoubleClick(ev: React.MouseEvent<HTMLTableRowElement>): void
    {
        const id = (ev.currentTarget as HTMLTableRowElement).id;
        props.callbackSetSelQueueId(id);
    }

    const onSongItemClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.stopPropagation();
        if(e.ctrlKey) {
          props.callbackAddDragItem(props.data._id, props.index, 'ctrl')
          props.callbackSetPrevIndex(props.index)
        } else if(e.shiftKey) {
          props.callbackAddDragItem(props.data._id, props.index, 'shift')
        } else {
          props.callbackSetDragging(false, 3, [props.data._id], [props.index])
          props.callbackSetPrevIndex(props.index)
        }
    }

    return (
        <tr className={(props.dragging.dragType === 3 && props.dragging.dragIndexes.includes(props.index)) ? "song-item active" : "song-item"}
            id={`singer-history-${props.data._id}`} 
            draggable={true} 
            onDragStart={onSongDragStart} 
            onDoubleClick={onSongDoubleClick}
            onClick={onSongItemClick} >
            <td className="song-date">
                {props.data.date}
            </td>
            <td className="song-artist">
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[props.searchArtistText]}
                    autoEscape
                    textToHighlight={props.data.artist ? props.data.artist.toString() : ''}
                />
            </td>
            <td className="song-name">
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[props.searchSongText]}
                    autoEscape
                    textToHighlight={props.data.name ? props.data.name.toString() : ''}
                />
            </td>
            <td className="song-length">{props.data.length}</td>
            <td className="song-path">{props.data.path}</td>
        </tr>
    );
}

export default SingerHistoryItem;