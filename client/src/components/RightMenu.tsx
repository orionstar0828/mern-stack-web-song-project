import { Button } from 'antd';
import settings from '../../src/settings';
import io from 'socket.io-client';
import axios from 'axios';

let socket = null;

function QueueRightMenu(props: any) {
  
  function onRemoveSongClick(ev: any) {
    if(props.dragging.dragIndexes.includes(props.selIndex) && props.dragging.dragType === 1) {
      let n = 0;
      for(let index of props.dragging.dragIndexes) {
        props.queue.splice(index - n, 1);
        n++;
      }
      props.callbackSetDragging(false, 0, []);
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', props.queue);
    } else {
      props.queue.splice(props.selIndex, 1);
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', props.queue);
    }
  }

  const onMoveToNextClick = () => {
    if(props.dragging.dragIndexes.includes(props.selIndex) && props.dragging.dragType === 1) {
      let newSelIndex = 1;
      for(let index of props.dragging.dragIndexes) {
        if(index === 0) continue;
        props.queue.splice(newSelIndex, 0, props.queue.splice(index, 1)[0]);
        newSelIndex++;
      }
      props.callbackSetDragging(false, 0, []);
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', props.queue);
    } else {
      props.queue.splice(1, 0, props.queue.splice(props.selIndex, 1)[0]);
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', props.queue);
    }
  }

  const onPlayImmediatelyClick = () => {
    props.callbackPlayImmediate(props.selIndex);
  }

  const onPauseAfterThisSong = () => {
    props.callbackSetPauseIndex(props.selIndex);
  }

  const onQueueSuffle = () => {
    props.callbackQueueSuffle();
  }
  return (
    <div id="right-menu" style={{top: props.posY, left: props.posX}}>
      <div><Button type="link" onClick={onRemoveSongClick}>Remove From Queue</Button></div>
      <div><Button type="link" onClick={onMoveToNextClick}>Move To Next</Button></div>
      <div><Button type="link" onClick={onPlayImmediatelyClick}>Play Immediately</Button></div>
      <div><Button type="link" onClick={onPauseAfterThisSong}>Pause Queue After This Song</Button></div>
      <div><Button type="link" onClick={onQueueSuffle}>Shuffle</Button></div>
    </div>
  );
}

function PlaylistRightMenu(props: any) {
  
  async function onRemovePlaylistClick(ev: any) {
    if(props.dragging.dragIndexes.includes(props.selIndex) && props.dragging.dragType === 2) {
      let n = 0;
      for(let index of props.dragging.dragIndexes) {
        props.tableData.splice(index - n, 1);
        n++;
      }
      props.callbackSetDragging(false, 0, []);
      const playlistId = props.selectedItem._id;
      if(props.selectedType === 'public_playlist') {
        for(let songId of props.dragging.dragIds) {
          await axios.get(`http://${settings.serverIpAddress}:5000/delete_public_playlist_song/${playlistId}/${songId}`)
        }
      } else if(props.selectedType === 'singer_playlist') {
        for(let songId of props.dragging.dragIds) {
          await axios.get(`http://${settings.serverIpAddress}:5000/delete_singer_playlist_song/${playlistId}/${songId}`)
        }
      }
    } else {
      const songId = props.tableData[props.selIndex]._id;
      const playlistId = props.selectedItem._id;
      props.tableData.splice(props.selIndex, 1);
      if(props.selectedType === 'public_playlist') {
        await axios.get(`http://${settings.serverIpAddress}:5000/delete_public_playlist_song/${playlistId}/${songId}`) 
      } else if(props.selectedType === 'singer_playlist') {
        await axios.get(`http://${settings.serverIpAddress}:5000/delete_singer_playlist_song/${playlistId}/${songId}`)
      }
    }
  }

  return (
    <div id="right-menu" style={{top: props.posY, left: props.posX}}>
      <div><Button type="link" onClick={onRemovePlaylistClick}>Remove From Playlist</Button></div>
    </div>
  );
}

export { QueueRightMenu, PlaylistRightMenu };