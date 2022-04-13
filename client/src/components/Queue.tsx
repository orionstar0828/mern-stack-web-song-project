import React, { useState, useEffect } from 'react';
import QueueItem from './QueueItem';
import { QueueRightMenu } from './RightMenu';
import settings from '../../src/settings';
import {StopOutlined, PauseOutlined, CaretRightOutlined, StepForwardOutlined }from '@ant-design/icons';
import io from 'socket.io-client';
import axios from 'axios';
import Draggable from "react-draggable";
import {VideoPlayer} from './videoplayer/components/VideoPlayer';
import { Modal, Button, Slider } from 'antd'

const empty_queue = [{
  song_id: "",
  singer_id: "",
  singer_name: "",
  artist: "",
  song: "",
  length: "",
  file_path: '',
  note: '',
}]

function Queue(props: any) {

  const [selIndex, setSelIndex] = useState(-1);
  const [rightPosX, setRightPosX] = useState(100000);
  const [rightPosY, setRightPosY] = useState(100000);
  const [rightSelIndex, setRightSelIndex] = useState(-1);

  const [searchArtist, setSearchArtist] = useState("");
  const [searchSinger, setSearchSinger] = useState("");
  const [searchSong, setSearchSong] = useState("");
  const [searchNote, setSearchNote] = useState("");
  const [queue, setQueue] = useState(empty_queue);
  const [isStartPlaying, setIsStartPlaying] = useState(false);
  const [isPlayVideo, setIsPlayVideo] = useState(false);
  const [playingState, setPlayingState] = useState("play");
  const [vidoeName, setVideoName]= useState("");
  const [videoURL, setVideoURL] = useState("");
  const [hideVideo, setHideVideo] = useState(false);
  const [nowDate, setNowDate] = useState('');
  const [playingTime, setPlayingTime] = useState("");
  const [title, setTitle] = useState('CURRENT QUEUE');
  const [pauseIndex, setPauseIndex] = useState(-1);
  const [isQuestoinModalVisible, setIsQuestoinModalVisible] = useState(false);
  const [playlistId, setPlaylistId] = useState([]);
  const [playlistType, setPlaylistType] = useState('');
  const [volume, setVolume] = useState(50);
  const [prevIndex, setPrevIndex] = useState(-1);
  
  let socket = null;

  useEffect(() => {
    socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
    socket.on('changeQueue', function (current_queue) {
        setQueue(current_queue);
    });
  }, []);

  useEffect(() => {
    if(props.click === 1) {
      if(rightPosX !== 100000) {
        setRightPosX(100000);
        setRightPosY(100000);
      }
      props.callbackSetDragging(false, 0, [])
      props.toSetClick(0);
    }
  }, [props.click]);

  useEffect(() => {
    if(selIndex !== -1) {
      if(props.dragging.dragType === 2 || props.dragging.dragType === 3) {
        for(let i = props.dragging.dragIds.length - 1; i >= 0; i--) {
          let id = '';
          if(props.dragging.dragType === 2)
            id = 'song-' + props.dragging.dragIds[i]
          else if(props.dragging.dragType === 3)
            id = 'singer-history-' + props.dragging.dragIds[i]
          const song_artist = document.getElementById(id)?.getElementsByClassName("song-artist")[0]?.textContent;
          const song_name = document.getElementById(id)?.getElementsByClassName("song-name")[0]?.textContent;
          const song_length = document.getElementById(id)?.getElementsByClassName("song-length")[0]?.textContent;
          const song_path = document.getElementById(id)?.getElementsByClassName("song-path")[0]?.textContent;
          const song_note = (document.getElementById(id)?.getElementsByClassName("song-note")[0] as HTMLInputElement)?.value;

          let check = false;
          queue.map((item: any, i: number) => {
            if(item.file_path === song_path) {
              check = true;
              return;
            }
          })
          if(check) {
            continue;
          }

          let item;
          if(props.page === 'singers') {
            item = {
              "song_id": props.dragging.dragIds[i],
              "singer_id": props.selectedSinger._id,
              "singer_name": props.selectedSinger.firstname + " " + props.selectedSinger.lastname,
              "artist": song_artist,
              "song": song_name,
              "length": song_length,
              "file_path": song_path,
              "note": song_note
            }
          } else {
            item = {
              "song_id": props.dragging.dragIds[i],
              "singer_id": "",
              "singer_name": "",
              "artist": song_artist,
              "song": song_name,
              "length": song_length,
              "file_path": song_path,
              "note": song_note
            }
          }
          queue.splice(selIndex, 0, item as any)
        }
        props.callbackSetDragging(false, 0, []);
      } else if(props.dragging.dragType === 1) {
        let newSelIndex = selIndex;
        if(!props.dragging.dragIndexes.includes(newSelIndex)) {
          let n = 0;
          for(let index of props.dragging.dragIndexes) {
            if(index <= newSelIndex) {
              queue.splice(newSelIndex - 1, 0, queue.splice(index - n, 1)[0]);
              n++;
            } else {
              queue.splice(newSelIndex, 0, queue.splice(index, 1)[0]);
              newSelIndex++;
            }
          }
        }
        props.callbackSetDragging(false, 0, []);
        socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
        socket.emit('changeQueue', queue);
      }
      setSelIndex(-1)
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', queue);
    }
  }, [selIndex]);

  useEffect(() => {
    if(props.selQueueId !== "") {
      let id = '';
      if(props.selQueueId.length === 29)
        id = props.selQueueId.replace('song-', '');
      else
        id = props.selQueueId.replace('singer-history-', '');
        
      let check = false;
      queue.map((item: any, i: number) => {
        if(item.song_id === id) {
          check = true;
          return;
        }
      })
      if(check) {
        props.callbackSetSelQueueId("");
        return;
      }
      const song_artist = document.getElementById(props.selQueueId)?.getElementsByClassName("song-artist")[0]?.textContent;
      const song_name = document.getElementById(props.selQueueId)?.getElementsByClassName("song-name")[0]?.textContent;
      const song_length = document.getElementById(props.selQueueId)?.getElementsByClassName("song-length")[0]?.textContent;
      const song_path = document.getElementById(props.selQueueId)?.getElementsByClassName("song-path")[0]?.textContent;
      const song_note = (document.getElementById(props.selQueueId)?.getElementsByClassName("song-note")[0] as HTMLInputElement)?.value;

      let item;
      if(props.page === 'singers') {
        item = {
          "song_id": id,
          "singer_id": props.selectedSinger._id,
          "singer_name": props.selectedSinger.firstname + " " + props.selectedSinger.lastname,
          "artist": song_artist,
          "song": song_name,
          "length": song_length,
          "file_path": song_path,
          "note": song_note
        }
      } else {
        item = {
          "song_id": id,
          "singer_id": "",
          "singer_name": "",
          "artist": song_artist,
          "song": song_name,
          "length": song_length,
          "file_path": song_path,
          "note": song_note
        }
      }
      
      queue.push(item as any);

      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', queue);

      props.callbackSetSelQueueId("");
    }
  }, [props.selQueueId]);

  useEffect(() => {
    async function fetchData() {
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.on('currentQueue', function (current_queue) {
          setQueue(current_queue);
      });
      socket.emit('fetchCurrentQueue');
      setTitle('CURRENT QUEUE');
    }
    fetchData()
  }, []);

  useEffect(() => {
    async function setNote() {
      queue.map((item: any, i: number) => {
        if(item.file_path === props.pathForNote) {
          let t = {
            "song_id": item.song_id,
            "singer_id": item.singer_id,
            'singer_name': item.singer_name,
            'artist': item.artist,
            'song': item.song,
            'length': item.length,
            'file_path': item.file_path,
            'note': props.changedNote
          }
          queue.splice(i, 1, t);
          return;
        }
      })
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', queue);
    }
    if(props.pathForNote !== '') {
      setNote();
      props.callbackSetPathForNote('');
    }
  }, [props.changedNote, props.pathForNote]);

  useEffect(() => {
    async function getAllQueueHistory() {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_all_queue_history`).then( 
        res => {
          let data = res.data as any;
          props.callbackSetQueueHistory(data.data.queue_history);
        }
      )
    }
    if(nowDate !== "") {
      getAllQueueHistory();
    }
  }, [nowDate]);

  useEffect(() => {
    async function doOperationQueue() {
      if(props.selectedType === 'public_playlist' && props.selectedItem._id !== '') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_all_public_playlist/${props.selectedItem._id}`).then( 
          res => {
            let data = res.data as any;
            if(props.operationQueue === 'public-playlist-add') {
              let tempQueue = queue.slice();
              data.data.files.map((item: any, i: number) => {
                if(!tempQueue.some((item1: any) => {return item1.file_path === item.path})) {
                  let t = {
                    "song_id": item._id,
                    "singer_id": '',
                    'singer_name': '',
                    'artist': item.artist,
                    'song': item.name,
                    'length': item.length,
                    'file_path': item.path,
                    'note': item.note
                  }
                  tempQueue.push(t);
                }
              })
              setQueue(tempQueue);
              socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
              socket.emit('changeQueue', tempQueue);
            } else if(props.operationQueue === 'public-playlist-replace') {
              let tempQueue = new Array()
              data.data.files.map((item: any, i: number) => {
                  let t = {
                    "song_id": item._id,
                    "singer_id": '',
                    'singer_name': '',
                    'artist': item.artist,
                    'song': item.name,
                    'length': item.length,
                    'file_path': item.path,
                    'note': item.note
                  }
                  tempQueue.push(t);
              })
              setQueue(tempQueue);
              socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
              socket.emit('changeQueue', tempQueue);
            }
          }
        )
      } else if(props.selectedType === 'singer_playlist' && props.selectedItem._id !== '') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_all_singer_playlist/${props.selectedItem._id}`).then( 
          res => {
            let data = res.data as any;
            if(props.operationQueue === 'singer-playlist-add') {
              let tempQueue = queue.slice();
              data.data.files.map((item: any, i: number) => {
                if(!tempQueue.some((item1: any) => {return item1.file_path === item.path})) {
                  let t = {
                    "song_id": item._id,
                    "singer_id": '',
                    'singer_name': '',
                    'artist': item.artist,
                    'song': item.name,
                    'length': item.length,
                    'file_path': item.path,
                    'note': item.note
                  }
                  tempQueue.push(t);
                }
              })
              setQueue(tempQueue);
              socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
              socket.emit('changeQueue', tempQueue);
            } else if(props.operationQueue === 'singer-playlist-replace') {
              let tempQueue = new Array()
              data.data.files.map((item: any, i: number) => {
                  let t = {
                    "song_id": item._id,
                    "singer_id": '',
                    'singer_name': '',
                    'artist': item.artist,
                    'song': item.name,
                    'length': item.length,
                    'file_path': item.path,
                    'note': item.note
                  }
                  tempQueue.push(t);
              })
              setQueue(tempQueue);
              socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
              socket.emit('changeQueue', tempQueue);
            }
          }
        )
      }
      props.callbackOperationQueue('')
    }
    if(props.operationQueue !== '')
      doOperationQueue();
  }, [props.operationQueue]);

  function doOperationPublicQueue(ids: [string], operation: string) {
    let id = ids[0];
    if(playlistType === 'public-playlist') {
      axios.get(`http://${settings.serverIpAddress}:5000/show_all_public_playlist/${id}`).then( 
        res => {
          let data = res.data as any;
          if(operation === 'add') {
            let tempQueue = queue.slice();
            data.data.files.map((item: any, i: number) => {
              if(!tempQueue.some((item1: any) => {return item1.file_path === item.path})) {
                let t = {
                  "song_id": item._id,
                  "singer_id": '',
                  'singer_name': '',
                  'artist': item.artist,
                  'song': item.name,
                  'length': item.length,
                  'file_path': item.path,
                  'note': item.note
                }
                tempQueue.push(t);
              }
            })
            setQueue(tempQueue);
            socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
            socket.emit('changeQueue', tempQueue);
          } else if(operation === 'replace') {
            let tempQueue = new Array()
            data.data.files.map((item: any, i: number) => {
                let t = {
                  "song_id": item._id,
                  "singer_id": '',
                  'singer_name': '',
                  'artist': item.artist,
                  'song': item.name,
                  'length': item.length,
                  'file_path': item.path,
                  'note': item.note
                }
                tempQueue.push(t);
            })
            setQueue(tempQueue);
            socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
            socket.emit('changeQueue', tempQueue);
          }
        }
      )
    } else if(playlistType === 'singer-playlist') {
      axios.get(`http://${settings.serverIpAddress}:5000/show_all_singer_playlist/${id}`).then( 
        res => {
          let data = res.data as any;
          if(operation === 'add') {
            let tempQueue = queue.slice();
            data.data.files.map((item: any, i: number) => {
              if(!tempQueue.some((item1: any) => {return item1.file_path === item.path})) {
                let t = {
                  "song_id": item._id,
                  "singer_id": '',
                  'singer_name': '',
                  'artist': item.artist,
                  'song': item.name,
                  'length': item.length,
                  'file_path': item.path,
                  'note': item.note
                }
                tempQueue.push(t);
              }
            })
            setQueue(tempQueue);
            socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
            socket.emit('changeQueue', tempQueue);
          } else if(operation === 'replace') {
            let tempQueue = new Array()
            data.data.files.map((item: any, i: number) => {
                let t = {
                  "song_id": item._id,
                  "singer_id": '',
                  'singer_name': '',
                  'artist': item.artist,
                  'song': item.name,
                  'length': item.length,
                  'file_path': item.path,
                  'note': item.note
                }
                tempQueue.push(t);
            })
            setQueue(tempQueue);
            socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
            socket.emit('changeQueue', tempQueue);
          }
        }
      )
    }
    props.callbackSetDragging(false, 0, [])
  }

  const callbackSetPrevIndex = (index: number) => {
    setPrevIndex(index);
  }

  const callbackSetDragging = (isDrag: boolean, dragType: number, dragIds: [], dragIndexes: [] = []) => {
    props.callbackSetDragging(isDrag, dragType, dragIds, dragIndexes);
  }

  function callbackSetSelIndex(sel_index: number) {
    setSelIndex(sel_index);
  }

  function callbackRightMenu(posX: number, posY: number, right_sel_index: number) {
    setRightPosX(posX);
    setRightPosY(posY);
    setRightSelIndex(right_sel_index);
  }

  const onReplaceQueue = async (e: React.MouseEvent<HTMLDivElement>) => {
    doOperationPublicQueue(playlistId as any, 'replace')
    setIsQuestoinModalVisible(false)
  }

  const onAddToQueue = async (e: React.MouseEvent<HTMLDivElement>) => {
    doOperationPublicQueue(playlistId as any, 'add')
    setIsQuestoinModalVisible(false)
  }

  const onQuestionCancel = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsQuestoinModalVisible(false)
    props.callbackSetDragging(false, 0, [])
  }

  function onDrop(ev: any): void
  {
    if(props.dragging.isDrag && (props.dragging.dragType === 2 || props.dragging.dragType === 3)) {
      for(let i = 0; i < document.getElementsByClassName("queue-item").length; i++) {
        document.getElementsByClassName("queue-item")[i].classList.remove("top-border");
      }
      let event = ev as Event;
      event.stopPropagation();
      for(let i = 0; i < props.dragging.dragIds.length; i++) {
        let id = '';
        if(props.dragging.dragType === 2)
          id = 'song-' + props.dragging.dragIds[i];
        else if(props.dragging.dragType === 3)
          id = 'singer-history-' + props.dragging.dragIds[i];
        
        const song_artist = document.getElementById(id)?.getElementsByClassName("song-artist")[0]?.textContent;
        const song_name = document.getElementById(id)?.getElementsByClassName("song-name")[0]?.textContent;
        const song_length = document.getElementById(id)?.getElementsByClassName("song-length")[0]?.textContent;
        const song_path = document.getElementById(id)?.getElementsByClassName("song-path")[0]?.textContent;
        const song_note = (document.getElementById(id)?.getElementsByClassName("song-note")[0] as HTMLInputElement)?.value;

        let check = false;
        queue.map((item: any, i: number) => {
          if(item.file_path === song_path) {
            check = true;
            return;
          }
        })
        if(check) {
          continue;
        }
        let item;
        
        if(props.page === 'singers') {
          item = {
            "song_id": props.dragging.dragIds[i],
            "singer_id": props.selectedSinger._id,
            "singer_name": props.selectedSinger.firstname + " " + props.selectedSinger.lastname,
            "artist": song_artist,
            "song": song_name,
            "length": song_length,
            "file_path": song_path,
            "note": song_note
          }
        } else {
          item = {
            "song_id": props.dragging.dragIds[i],
            "singer_id": "",
            "singer_name": "",
            "artist": song_artist,
            "song": song_name,
            "length": song_length,
            "file_path": song_path,
            "note": song_note
          }
        }
        queue.push(item as any);
      }
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', queue);
      props.callbackSetDragging(false, 0, [])
    } else if(props.dragging.isDrag && props.dragging.dragType === 4) {
      setPlaylistId(props.dragging.dragIds)
      setPlaylistType('public-playlist')
      setIsQuestoinModalVisible(true)
    } else if(props.dragging.isDrag && props.dragging.dragType === 5) {
      setPlaylistId(props.dragging.dragIds)
      setPlaylistType('singer-playlist')
      setIsQuestoinModalVisible(true)
    }
  }

  function onDragOver(ev: any): void
  {
      let event = ev as Event;
      event.stopPropagation();
      event.preventDefault();
  }

  const onSearchArtist = (e:any)=>{
    setSearchArtist(e.target.value? e.target.value:'');    
  }

  const onSearchSong = (e:any)=>{
    setSearchSong(e.target.value? e.target.value:'');    
  }

  const onSearchNote = (e:any)=>{
    setSearchNote(e.target.value? e.target.value:'');    
  }

  const callbackSingerChange = (index:number, singer_id:string)=>{
    if(props.dragging.dragIndexes.includes(index) && props.dragging.dragType === 1) {
      for(let i of props.dragging.dragIndexes) {
        let curItem = queue[i];
        let singer_name = '';
        props.singers.map((item: any, i: number) => {
          if(item._id === singer_id) singer_name = item.firstname + " " + item.lastname;
          return;
        })
        let item = {
          "song_id": curItem.song_id,
          "singer_id": singer_id,
          "singer_name": singer_name,
          "artist": curItem.artist,
          "song": curItem.song,
          "length": curItem.length,
          "file_path": curItem.file_path,
          "note": curItem.note
        }
        queue.splice(i, 1, item);
      }
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', queue);
    } else {
      let curItem = queue[index];
      let singer_name = '';
      props.singers.map((item: any, i: number) => {
        if(item._id === singer_id) singer_name = item.firstname + " " + item.lastname;
        return;
      })
      let item = {
        "song_id": curItem.song_id,
        "singer_id": singer_id,
        "singer_name": singer_name,
        "artist": curItem.artist,
        "song": curItem.song,
        "length": curItem.length,
        "file_path": curItem.file_path,
        "note": curItem.note
      }
      queue.splice(index, 1, item);
  
      socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
      socket.emit('changeQueue', queue);
    }
  }

  const controlPlayingVideo = async (state:string)=>{
    if(isStartPlaying === false) {
      if(state === 'play') {
        if(queue.length > 0) {
          playVideo(queue[0])
          setIsStartPlaying(true)
        }
      }
    }
    else {
      if(state === 'stop') {
        setPlayingTime('');
        setIsPlayVideo(false)
        setIsStartPlaying(false);
      } else if(state === 'next') {
        if(isPlayVideo) {
          if(queue[1])
            playVideo(queue[1])
          else {
            setPlayingTime('');
            setIsPlayVideo(false)
            setIsStartPlaying(false);
          }
          let item = queue[0];
          axios.get(`http://${settings.serverIpAddress}:5000/save_queue?song_id=${item.song_id}&singer_id=${item.singer_id}&singer_name=${item.singer_name}&artist=${item.artist}&song=${item.song}&length=${item.length}&file_path=${item.file_path}&note=${item.note}`).then( 
              res => {
                  let data = res.data as any;
                  setNowDate(data.data.queue.date);
              }
          )
          if(props.selectedSinger._id === item.singer_id) {
            props.callbackChangeSingerHistory(true);
          }
          queue.shift();
          socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
          socket.emit('changeQueue', queue);
          if(pauseIndex === 0) {
            setPauseIndex(-1);
          } else {
            if(pauseIndex !== -1)
              setPauseIndex(pauseIndex - 1);
          }
        }
      } else {
        if(isPlayVideo) {
          setPlayingState(state);
        }
      }
    }
  }

  async function playVideo(video: any) {
    setVideoName(video.singer_name + ' | ' + video.artist + ' - ' + video.song);
    setVideoURL(`http://${settings.serverIpAddress}:5000/video?path=${video.file_path}`);
    setIsPlayVideo(true);
    setHideVideo(false);
    setPlayingState('play');
  }

  const setNextVideo = () => {
    if(queue.length > 0) {
      playVideo(queue[0])
    } else {
      setIsStartPlaying(false);
    }
  }

  const onVideoEnded = () => {
    setIsPlayVideo(false);
    setPlayingTime('');
    let item = queue[0];
    axios.get(`http://${settings.serverIpAddress}:5000/save_queue?song_id=${item.song_id}&singer_id=${item.singer_id}&singer_name=${item.singer_name}&artist=${item.artist}&song=${item.song}&length=${item.length}&file_path=${item.file_path}&note=${item.note}`).then( 
        res => {
            let data = res.data as any;
            setNowDate(data.data.queue.date);
        }
    )
    if(props.selectedSinger._id === item.singer_id) {
      props.callbackChangeSingerHistory(true);
    }
    queue.shift();
    socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
    socket.emit('changeQueue', queue);
    if(pauseIndex === 0) {
      setPauseIndex(-1);
      setIsPlayVideo(false);
      setIsStartPlaying(false);
    } else {
      if(pauseIndex !== -1)
        setPauseIndex(pauseIndex - 1);
      setTimeout(() => {
        setNextVideo();
      }, settings.songDelay * 1000);
    }
  }

  const onChangePlayingTime = (time:string) =>{
    setPlayingTime(time);
  }

  const onShowHideVideo = ()=>{
    setHideVideo(!hideVideo);
  }

  const callbackPlayImmediate = async (index: number) => {
    setIsPlayVideo(false);
    let video = queue[index];
    setVideoName(video.singer_name + ' | ' + video.artist + ' - ' + video.song);
    setVideoURL(`http://${settings.serverIpAddress}:5000/video?path=${video.file_path}`);

    setIsPlayVideo(true);
    setHideVideo(false);
    
    queue.splice(0, 0, queue.splice(index, 1)[0]);
    socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
    socket.emit('changeQueue', queue);
  }

  const callbackSetPauseIndex = (index: number) => {
    setPauseIndex(index);
  }

  const callbackChangeVideoState = (state: string) => {
    setPlayingState(state);
  }

  const callbackQueueSuffle = () => {
    let startPoint = 0;
    if(isPlayVideo) {
      startPoint = 1
    }
    let tempQueue = queue.slice();
    var j, x, i;
    for (i = tempQueue.length - 1; i >= startPoint; i--) {
      j = Math.floor(Math.random() * (i + 1));
      if(startPoint === 1 && j === 0)
          j++;
      x = tempQueue[i];
      tempQueue[i] = tempQueue[j];
      tempQueue[j] = x;
    }
    setQueue(tempQueue);
    socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
    socket.emit('changeQueue', tempQueue);
  }

  const callbackQuestionModal = (id: [string], type: number) => {
    setPlaylistId(id as any)
    if(type === 4)
      setPlaylistType('public-playlist')
    else if(type === 5)
      setPlaylistType('singer-playlist')
    setIsQuestoinModalVisible(true)
  }

  const onVolumeChange = (value: number) => {
    setVolume(value);
  }

  const callbackSetNote = (key: number, note: string, path: string) => {
    props.callbackSetNote(path, note);
  }

  const callbackAddDragItem = (id: string, index: number, type: string) => {
    if(type === 'ctrl') {
      let dragIds = props.dragging.dragIds.slice();
      let dragIndexes = props.dragging.dragIndexes.slice();
      let spot = -1;
      let del = false;
      for(let i = 0; i < dragIndexes.length; i++) {
        if(index === dragIndexes[i]) {
          spot = i;
          del = true;
          break;
        } else if(index < dragIndexes[0]) {
          spot = 0;
          break;
        } else if(index > dragIndexes[dragIndexes.length - 1]) {
          spot = dragIndexes.length;
          break;
        } else if(index > dragIndexes[i] && index < dragIndexes[i + 1]) {
          spot = i + 1;
          break;
        }
      }
      if(del) {
        dragIds.splice(spot, 1);
        dragIndexes.splice(spot, 1);
      } else {
        if(spot === -1)
          spot = 0;
        dragIds.splice(spot, 0, id)
        dragIndexes.splice(spot, 0, index)
      }
      props.callbackSetDragging(false, 1, dragIds, dragIndexes)
    } else if(type === 'shift') {
      let dragIds = []
      let dragIndexes = []
      if(prevIndex === -1) {
        props.callbackSetDragging(false, 1, [id], [index])
        setPrevIndex(index)
      } else {
        if(prevIndex === index) return;
        if(prevIndex > index) {
          for(let i = prevIndex; i >= index; i--) {
            dragIds.unshift(queue[i].song_id)
            dragIndexes.unshift(i)
          }
        } else if(prevIndex < index) {
          for(let i = index; i >= prevIndex; i--) {
            dragIds.unshift(queue[i].song_id)
            dragIndexes.unshift(i)
          }
        }
        props.callbackSetDragging(false, 1, dragIds, dragIndexes)
      }
    }
  }

  let queue_items = queue.map((item: any, i: number) => {     
    if(item.artist.toString().toLowerCase().includes(searchArtist.toLowerCase()) &&
    item.singer_name.toString().toLowerCase().includes(searchSinger.toLowerCase()) &&
    item.note.toString().toLowerCase().includes(searchNote.toLowerCase()) &&
    item.song.toString().toLowerCase().includes(searchSong.toLowerCase()) && item.song_id !== '')
    {
      return (
        <QueueItem
          data={item}
          key={`${item.song_id}${i}`}
          index={i}
          dragging={props.dragging}
          singers={props.singers}
          callbackSetDragging={callbackSetDragging}
          callbackSetSelIndex={callbackSetSelIndex}
          callbackRightMenu={callbackRightMenu}
          searchArtistText={searchArtist}
          searchSingerText={searchSinger}
          searchSongText={searchSong}
          searchSongNote={searchNote}
          callbackSingerChange = {callbackSingerChange}
          callbackQuestionModal={callbackQuestionModal}
          callbackAddDragItem={callbackAddDragItem}
          callbackSetPrevIndex={callbackSetPrevIndex}
          callbackSetNote={callbackSetNote}
        />
      ) 
    }
  })

  return (
    <div id="queue-section">
      <div className="queue-section">
        <div style={{textAlign: "left"}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1px 10px 0"}}>
            <span className="current-letter" >{title}</span>
            <span className="current-time">{playingTime}</span>
            <span className="current-buttongroup">
              <CaretRightOutlined className="video-icon" title='Play Video' onClick={()=>{controlPlayingVideo("play")}}/>
              <PauseOutlined className="video-icon" title='Pause Video' onClick={()=>{controlPlayingVideo("pause")}}/>
              <StopOutlined className="video-icon" title='Stop Queue' onClick={()=>{controlPlayingVideo("stop")}} style={{fontSize: 18}}/>
              <StepForwardOutlined className="video-icon" title='Next Video' onClick={()=>{controlPlayingVideo("next")}}/>
            </span>
            <span><Slider value={volume} max={100} min={0} onChange={onVolumeChange} className='volume-control'/></span>
            <span className="current-video" onClick={(e:any)=>{onShowHideVideo();}}>SHOW/HIDE VIDEO</span>
          </div>
        </div>
        <div id="table-wrapper" onDrop={onDrop} onDragOver={onDragOver}>
          <table id="queue-table">
            <thead>
              <tr>
                <th>#</th>
                <th>SINGER <input type="text" id="singer-search" className="search-field" placeholder="Filter singers"
                  onChange={(e:any)=>{
                    setSearchSinger(e.target.value? e.target.value:'');  
                  }}  /></th>
                <th>ARTIST <input type="text" id="artist-search" className="search-field" placeholder="Filter artists" 
                  onChange = {onSearchArtist} /></th>
                <th>SONG <input type="text" id="song-search" className="search-field" placeholder="Filter songs" 
                onChange = {onSearchSong} /></th>
                <th>LENGTH</th>
                <th>FILE PATH</th>
                <th>NOTES <input type="text" id="note-search" className="search-field" placeholder="Filter notes" 
                     onChange = {onSearchNote} value ={searchNote} /></th>
              </tr>
            </thead>
            <tbody>
              {queue_items}
            </tbody>
          </table>
          <QueueRightMenu 
            posX={rightPosX} 
            posY={rightPosY} 
            selIndex={rightSelIndex} 
            queue={queue}
            callbackPlayImmediate={callbackPlayImmediate} 
            callbackSetPauseIndex={callbackSetPauseIndex} 
            callbackQueueSuffle={callbackQueueSuffle} 
            dragging={props.dragging} 
            callbackSetDragging={callbackSetDragging}/>

          { isPlayVideo?
            <Draggable axis="both">
              <div className={hideVideo?"videoplayer-container hide-video":"videoplayer-container"}>
                <VideoPlayer url={videoURL} title={vidoeName} volume={volume}
                playingState={playingState} playingTime = {onChangePlayingTime}
                onVideoEnded={onVideoEnded} callbackChangeVideoState={callbackChangeVideoState}
                onVolumeChange={onVolumeChange} />
              </div>
            </Draggable>:null
          }

          <Modal title="Questions" visible={isQuestoinModalVisible} className="question-modal" footer={[]} onCancel={(e : any) => {e.stopPropagation(); setIsQuestoinModalVisible(false);}}>
              <Button key="add" type="primary" onClick={onAddToQueue}> Add ALL to Queue </Button> <Button key="replace" type="primary" onClick={onReplaceQueue}> Replace Current Queue </Button> <Button key="cancel" onClick={onQuestionCancel}> CANCEL </Button>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default Queue;