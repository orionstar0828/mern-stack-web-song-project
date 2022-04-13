import React, { useEffect, useState } from 'react';
import Highlighter from 'react-highlight-words';
import axios from 'axios';
import settings from '../../src/settings';

function QueueItem(props: any) {

  const [index, setIndex] = useState("");
  const [note, setNote] = useState('');
  const [prevNote, setPrevNote] = useState('');

  useEffect(() => {
    setNote(props.data.note);
    setPrevNote(props.data.note);
  }, [props.data.note])

  useEffect(() => {
    let tmp = props.index + 1;
    let str_num = "";
    if(tmp < 10)
      str_num = "00" + tmp;
    else if(tmp < 100)
      str_num = "0" + tmp;
    else
      str_num = tmp
    setIndex(str_num);
  }, []);

  function handleDragStart(ev: React.DragEvent<HTMLDivElement>): void
  {
    if(props.dragging.dragIndexes.includes(props.index))
      props.callbackSetDragging(true, 1, props.dragging.dragIds, props.dragging.dragIndexes )
    else
      props.callbackSetDragging(true, 1, [props.data.song_id], [props.index] )
    ev.stopPropagation();
  }

  function handleDragOver(ev: React.DragEvent<HTMLDivElement>): void
  {
    if(props.dragging.isDrag) {
      for(let i = 0; i < document.getElementsByClassName("queue-item").length; i++) {
        document.getElementsByClassName("queue-item")[i].classList.remove("top-border");
      }
      (ev.target as HTMLDivElement).parentElement?.classList.add("top-border");
    }
    ev.stopPropagation();
    ev.preventDefault();
  }

  function handleDrop(ev: React.DragEvent<HTMLDivElement>): void
  {
    if(props.dragging.isDrag) {
      if(props.dragging.dragType === 4 || props.dragging.dragType === 5) {
        props.callbackQuestionModal(props.dragging.dragIds, props.dragging.dragType);
      } else {
        for(let i = 0; i < document.getElementsByClassName("queue-item").length; i++) {
          document.getElementsByClassName("queue-item")[i].classList.remove("top-border");
        }
        props.callbackSetSelIndex(props.index);
      }
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  function handleDragLeave(ev: any): void
  {
    for(let i = 0; i < document.getElementsByClassName("queue-item").length; i++) {
      document.getElementsByClassName("queue-item")[i].classList.remove("top-border");
    }
    ev.stopPropagation();
    ev.preventDefault();
  }

  function handleContextMenu(ev: React.MouseEvent<HTMLTableRowElement>): void
  {
    let tableTop = document.getElementById("queue-table")?.offsetTop as number;
    let posY = ev.pageY - tableTop + 21;
    let tableLeft = document.getElementById("queue-table")?.offsetLeft as number;
    let posX = ev.pageX - tableLeft;
    props.callbackRightMenu(posX, posY, props.index);
    ev.stopPropagation();
    ev.preventDefault();
  }

  function onSingerChange(e: any) {
    let value = e.target.value;
    props.callbackSingerChange(props.index, value);
  }

  function onSelectClick(e: React.MouseEvent<HTMLSelectElement>) {
    e.stopPropagation();
  }

  const onQueueItemClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.stopPropagation();
    if(e.ctrlKey) {
      props.callbackAddDragItem(props.data.song_id, props.index, 'ctrl')
      props.callbackSetPrevIndex(props.index)
    } else if(e.shiftKey) {
      props.callbackAddDragItem(props.data.song_id, props.index, 'shift')
    } else {
      props.callbackSetDragging(false, 1, [props.data.song_id], [props.index])
      props.callbackSetPrevIndex(props.index)
    }
    props.callbackRightMenu(10000, 100000, -1);
  }

  const onNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let n = (e.currentTarget as HTMLInputElement).value;
    setNote(n);
  }

  const onNoteFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    let n = (e.currentTarget as HTMLInputElement).value;
    setPrevNote(n);
    document.getElementsByClassName('queue-item')[props.index].setAttribute('draggable', 'false');
  }

  const onNoteKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
      e.preventDefault();
      if(prevNote !== note) {
        await axios.get(`http://${settings.serverIpAddress}:5000/save_note/?path=${props.data.file_path}&note=${note}`).then( 
          res => {
              props.callbackSetNote(props.index, note, props.data.file_path);
          }
        )
      }
    }
  }

  const onNoteBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if(prevNote !== note) {
      await axios.get(`http://${settings.serverIpAddress}:5000/save_note?path=${props.data.file_path}&note=${note}`).then( 
        res => {
            props.callbackSetNote(props.index, note, props.data.file_path);
        }
      )
    }
    document.getElementsByClassName('queue-item')[props.index].setAttribute('draggable', 'true');
  }

  let table_html = props.singers.map((item: any, i: number) => {     
    // Return the element. Also pass key
    if(item._id !== '') {
      let singer = `${item.firstname} ${item.lastname}`;
      return (<option value={item._id} key={i}>
                {singer}
        </option>)
    }
  })

  return (
    <tr className={(props.dragging.dragType === 1 && props.dragging.dragIndexes.includes(props.index)) ? "queue-item active" : "queue-item"}
      id={`queue-${props.data.song_id}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onContextMenu={handleContextMenu} 
      onClick={onQueueItemClick}>
      <td className="queue-index">{index}</td>
      <td className="queue-singer">
        <select disabled={false}
          style={{ width: 180, height: 30 }}
          placeholder="Select a singer"
          value={props.data.singer_id}
          onChange={onSingerChange}
          className="singer-select"
          onClick={onSelectClick}
        >
        <option value="">Select a singer.</option>
        {table_html}
        </select>
      </td>
      <td className="queue-artist">
        <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[props.searchArtistText]}
            autoEscape
            textToHighlight={props.data.artist ? props.data.artist.toString() : ''}
        />
      </td>
      <td className="queue-song">
        <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[props.searchSongText]}
            autoEscape
            textToHighlight={props.data.song ? props.data.song.toString() : ''}
        />
        </td>
      <td className="queue-length">{props.data.length}</td>
      <td className="queue-path">{props.data.file_path}</td>
      <td><input className='queue-note' value={note} style={{border: '1px solid #ccc'}} onFocus={onNoteFocus} onBlur={onNoteBlur} onChange={onNoteChange} onKeyDown={onNoteKeyDown} onClick={(e: any) => {e.stopPropagation()}}/></td>
    </tr>
  );
}

export default QueueItem;