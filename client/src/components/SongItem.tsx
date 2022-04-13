import React, { useEffect, useState } from 'react';
import Highlighter from 'react-highlight-words';
import axios from 'axios';
import settings from '../../src/settings';

function SongItem(props: any) {

    const [note, setNote] = useState('');
    const [prevNote, setPrevNote] = useState('');

    useEffect(() => {
        setNote(props.data.note);
        setPrevNote(props.data.note);
    }, [props.data.note])

    function onSongDragStart(ev: React.DragEvent<HTMLDivElement>): void
    {
        if(props.dragging.dragIndexes.includes(props.index))
            props.callbackSetDragging(true, 2, props.dragging.dragIds, props.dragging.dragIndexes )
        else
            props.callbackSetDragging(true, 2, [props.data._id], [props.index] )
        ev.stopPropagation();
    }

    function onSongDoubleClick(ev: React.MouseEvent<HTMLTableRowElement>): void
    {
        const id = (ev.currentTarget as HTMLTableRowElement).id;
        props.callbackSetSelQueueId(id);
    }

    const onNoteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        let n = (e.currentTarget as HTMLInputElement).value;
        setPrevNote(n);
        document.getElementsByClassName('song-item')[props.index].setAttribute('draggable', 'false');
    }

    const onNoteBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        let n = (e.currentTarget as HTMLInputElement).value;
        if(prevNote !== n) {
            await axios.get(`http://${settings.serverIpAddress}:5000/save_note?path=${props.data.path}&note=${n}`).then( 
                res => {
                    props.callbackSetNote(props.index, n, props.data.path);
                }
            )
        }
        document.getElementsByClassName('song-item')[props.index].setAttribute('draggable', 'true');
    }

    const onNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let n = (e.currentTarget as HTMLInputElement).value;
        setNote(n);
    }

    const onSongItemClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        e.stopPropagation();
        if(e.ctrlKey) {
          props.callbackAddDragItem(props.data._id, props.index, 'ctrl')
          props.callbackSetPrevIndex(props.index)
        } else if(e.shiftKey) {
          props.callbackAddDragItem(props.data._id, props.index, 'shift')
        } else {
          props.callbackSetDragging(false, 2, [props.data._id], [props.index])
          props.callbackSetPrevIndex(props.index)
        }
        props.callbackRightMenu(10000, 100000, -1);
    }

    const onNoteKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        let n = (e.currentTarget as HTMLInputElement).value;
        if(e.key === 'Enter') {
            if(prevNote !== n) {
                await axios.get(`http://${settings.serverIpAddress}:5000/save_note?path=${props.data.path}&note=${n}`).then( 
                    res => {
                        props.callbackSetNote(props.index, n, props.data.path);
                    }
                )
            }
        }
    }

    function onContextMenu(ev: React.MouseEvent<HTMLTableRowElement>): void
    {
      if(props.selectedType === 'public_playlist' || props.selectedType === 'singer_playlist') {
        let tableTop = document.getElementById("queue-table")?.offsetTop as number;
        let posY = ev.pageY - tableTop + 35;
        let tableLeft = document.getElementById("queue-table")?.offsetLeft as number;
        let posX = ev.pageX - tableLeft;
        props.callbackRightMenu(posX, posY, props.index);
      }
      ev.stopPropagation();
      ev.preventDefault();
    }

    return (
        <tr className={(props.dragging.dragType === 2 && props.dragging.dragIndexes.includes(props.index)) ? "song-item active" : "song-item"} 
            id={`song-${props.data._id}`} 
            draggable={true} 
            onDragStart={onSongDragStart} 
            onDoubleClick={onSongDoubleClick}
            onClick={onSongItemClick} 
            onContextMenu={onContextMenu} >
            {props.selectedType === 'queue_history' ? <td>{props.data.singer_name}</td> : null}
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
            <td className={props.selectedType === 'folder' ? '' : 'none'}><input className='song-note' type='text' value={note} style={{border: '1px solid #ccc'}} onFocus={onNoteFocus} onBlur={onNoteBlur} onChange={onNoteChange} onKeyDown={onNoteKeyDown} onClick={(e: any) => {e.stopPropagation()}} onDragStart={(e: any) => {e.stopPropagation(); e.preventDefault()}} draggable={false}/></td>
        </tr>
    );
}

export default SongItem;