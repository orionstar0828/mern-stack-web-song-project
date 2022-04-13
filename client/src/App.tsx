import React, { useState, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import axios from 'axios';
import io from 'socket.io-client';
import 'antd/dist/antd.css';

import settings from "./settings";
import Header from './components/Header'
import FoldersMenu from './components/FoldersMenu';
import PublicPlaylistsMenu from './components/PublicPlaylistsMenu';
import QueueHistoryMenu from './components/QueueHistoryMenu';
import SingerPlaylistsMenu from './components/SingerPlaylistsMenu';
import SingersMenu from './components/SingersMenu';
import Songs from './components/Songs';
import Singer from './components/Singer';
import SingerHistory from './components/SingerHistory';
import Queue from './components/Queue';

import './App.css';

const { TabPane } = Tabs;

// global variables

const empty_value = [{
  _id: "",
  name: "",
  path: "",
  firstname: "",
  lastname: "",
  nickname: "",
  singer_id: '',
}]

function App() {

  // states

  const [dragging, setDragging] = useState({
    isDrag: false,
    dragType: 0,
    dragIds: [],
    dragIndexes: [],
  });
  const [folders, setFolders] = useState(empty_value);
  const [publicPlaylists, setPublicPlaylists] = useState(empty_value);
  const [singers, setSingers] = useState(empty_value);
  const [singerPlaylists, setSingerPlaylists] = useState(empty_value);
  const [queueHistory, setQueueHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(empty_value[0]);
  const [selectedSinger, setSelectedSinger] = useState(empty_value[0]);
  const [selectedType, setSelectedType] = useState("none");
  const [selQueueId, setSetQueueId] = useState("");
  const [click, setClick] = useState(0);
  const [page, setPage] = useState("songs");
  const [tabTitle, setTabTitle] = useState("Songs");
  const [changeSingerHistory, setChangeSingerHistory] = useState(false);
  const [changePublicPlaylists, setChangePublicPlaylists] = useState(false);
  const [changeSingerPlaylists, setChangeSingerPlaylists] = useState(false);
  const [showLoadingWindow, setShowLoadingWindow] = useState(false);
  const [operationQueue, setOperationQueue] = useState('');
  const [relaodFolder, setReloadFolder] = useState(false);
  const [changedNote, setChangedNote] = useState('');
  const [pathForNote, setPathForNote] = useState('');
  // const and local variables

  let socket = null;

  // effects
  
  useEffect(() => {
    async function fetchSingerPlaylists(id: string) {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_singer_playlists/${id}`).then( 
        res => {
          let data = res.data as any;
          setSingerPlaylists(data.data.playlists)
        }
      )
    }
    async function fetchMyAPI() {
      await axios.get(`http://${settings.serverIpAddress}:5000`).then( 
        res => {
          let data = res.data as any;
          if(data.data.folders[0]) {
            setSelectedType("folder");
            setSelectedItem(data.data.folders[0]);
            setFolders(data.data.folders);
          }
          if(data.data.public_playlists[0]) {
            setPublicPlaylists(data.data.public_playlists);
          }
          if(data.data.queue_history[0]) {
            setQueueHistory(data.data.queue_history);
          }
          if(data.data.singers[0]) {
            setSingers(data.data.singers);
            setSelectedSinger(data.data.singers[0]);
            if(data.data.singers[0]._id !== '')
              fetchSingerPlaylists(data.data.singers[0]._id)
          }
        }
      )
    }
    fetchMyAPI()
  }, []);

  useEffect(() => {
    if(selectedItem._id === '')
      setTabTitle('Songs');
    else
      setTabTitle(selectedItem.name);
  }, [selectedItem._id]);

  // Header component callback

  const callbackSetPage = (page: string) => {
    setPage(page);
    if(page === 'songs') {
      if(selectedType === 'singer_playlist') {
        if(folders[0]) {
          setSelectedType('folder');
          setSelectedItem(folders[0])
        } else {
          setSelectedType('none');
          setSelectedItem(empty_value[0])
        }
      }
    } else if(page === 'singers') {
      if(selectedType === 'public_playlist' || selectedType === 'queue_history') {
        if(folders[0]) {
          setSelectedType('folder');
          setSelectedItem(folders[0])
        } else {
          setSelectedType('none');
          setSelectedItem(empty_value[0])
        }
      }
    }
  }

  const callbackSetDragging = (isDrag: boolean, dragType: number, dragIds: [], dragIndexes: [] = []) => {
    setDragging(current => ({
      ...current,
      isDrag: isDrag,
      dragType: dragType,
      dragIds: dragIds,
      dragIndexes: dragIndexes
    }))
  }

  function handleDragEnter(ev: React.DragEvent<HTMLDivElement>): void
  {
    setDragging(current => ({
      ...current,
      isDrag: false,
      dragType: 0,
      dragIds: [],
      dragIndexes: []
    }))
  }

  function callbackSetSelQueueId(sel_queue_id: string) {
    setSetQueueId(sel_queue_id);
  }

  function handleClick() {
    setClick(1);
  }

  function handleContextMenu(ev: React.MouseEvent<HTMLTableRowElement>) {
    setClick(1);
    ev.stopPropagation();
    ev.preventDefault();
  }

  function handleSetClick(click: number) {
    setClick(click);
  }

  const callbackSetSelectedSinger = async (singer: any, param: string = "") => {
    if(param === 'add') {
      setSelectedSinger(singer);
      setSingerPlaylists([]);
      if(selectedType !== 'folder') {
        if(folders[0]) {
          setSelectedType('folder');
          setSelectedItem(folders[0]);
        } else {
          setSelectedType('none');
          setSelectedItem(empty_value[0]);
        }
      }
    } else if(param === 'update') {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_singers`).then( 
        res => {
          let data = res.data as any;
          setSingers(data.data.singers)
        }
      )
    } else {
      setSelectedSinger(singer);
      if(singer._id !== '') {
        await axios.get(`http://${settings.serverIpAddress}:5000/get_singer_playlists/${singer._id}`).then( 
          res => {
            let data = res.data as any;
            setSingerPlaylists(data.data.playlists)
          }
        )
      } else {
        setSingerPlaylists([])
      }
      if(selectedType === 'singer_playlist') {
        if(folders[0]) {
          setSelectedType('folder');
          setSelectedItem(folders[0]);
        } else {
          setSelectedType('none');
          setSelectedItem(empty_value[0]);
        }
      }
    }
  }

  const callbackSetSingerPlaylists = (playlists: any) => {
    setSingerPlaylists(playlists);
  }

  const callbackSelectedItem = async(id: string, name: string, type: string)=> {
    let item = {
      "_id": id,
      "name": name,
    }
    setSelectedType(type);
    setSelectedItem(item as any);
  }

  const callbackAddItem = async(data: any, type: string, path: string)=> {
    if(type === "folder") {
      let tmp = folders.slice();
      let folder = {
        "_id": data.data.folder.id,
        "name": data.data.folder.name,
        "path": path
      }
      tmp.push(folder as any);
      setFolders(tmp);
      setSelectedType(type);
      setSelectedItem(folder as any);
    } else if(type === "public_playlist") {
      let tmp = publicPlaylists.slice();
      let playlist = {
        "_id": data.data.playlist.id,
        "name": data.data.playlist.name,
      }
      tmp.push(playlist as any);
      setPublicPlaylists(tmp);
      //setSelectedType(type);
      //setSelectedItem(playlist as any);
    } else if(type === "singer") {
      let tmp = singers.slice();
      let singer = {
        "_id": data.singer._id,
        "firstname": data.singer.firstname,
        "lastname": data.singer.lastname,
        "nickname": data.singer.nickname,
      }
      tmp.push(singer as any);
      setSingers(tmp);
    } else if(type === "singer_playlist") {
      let tmp = singerPlaylists.slice();
      let playlist = {
        "_id": data.playlist._id,
        "name": data.playlist.name,
        "singer_id": data.playlist.singer_id,
      }
      tmp.push(playlist as any);
      setSingerPlaylists(tmp);
      //setSelectedType(type);
      //setSelectedItem(playlist as any);
    }
  }

  const callbackSetQueueHistory = (queue_history: any) => {
    setQueueHistory(queue_history);
  }

  const emptyCurrentQueue = () => {
    socket = io(`${settings.socketUrl}`, {transports: ["websocket"]});
    socket.emit('changeQueue', []);
  }

  const callbackDelete = async (type: string, id: string) => {
    if(type === 'folder') {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_folders_in_db`).then( 
        res => {
          let data = res.data as any;
          setFolders(data.data.folders)
          if(selectedType === 'folder') {
            if(selectedItem._id === id) {
              if(data.data.folders[0]) {
                setSelectedItem(data.data.folders[0])
              } else {
                setSelectedType('none');
                setSelectedItem(empty_value[0])
              }
            }
          }
        }
      )
    } else if(type === 'queue_history') {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_all_queue_history`).then( 
        res => {
          let data = res.data as any;
          setQueueHistory(data.data.queue_history)
          if(selectedType === 'queue_history') {
            if(selectedItem._id === id) {
              if(data.data.queue_history[0]) {
                setSelectedItem(data.data.queue_history[0])
              } else {
                setSelectedType('none');
                setSelectedItem(empty_value[0])
              }
            }
          }
        }
      )
    } else if(type === 'singer') {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_singers`).then( 
        res => {
          let data = res.data as any;
          setSingers(data.data.singers)
          if(selectedSinger._id === id) {
            if(data.data.singers[0]) {
              setSelectedSinger(data.data.singers[0])
            } else {
              setSelectedSinger(empty_value[0])
            }
          }
        }
      )
    } else if(type === 'public_playlist') {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_all_public_playlists`).then( 
        res => {
          let data = res.data as any;
          setPublicPlaylists(data.data.public_playlists)
          if(selectedType === 'public_playlist') {
            if(selectedItem._id === id) {
              if(data.data.public_playlists[0]) {
                setSelectedItem(data.data.public_playlists[0])
              } else {
                setSelectedType('none');
                setSelectedItem(empty_value[0])
              }
            }
          }
        }
      )
    } else if(type === 'singer_playlist') {
      await axios.get(`http://${settings.serverIpAddress}:5000/get_all_singer_playlists`).then( 
        res => {
          let data = res.data as any;
          setSingerPlaylists(data.data.singer_playlists)
          if(selectedType === 'singer_playlist') {
            if(selectedItem._id === id) {
              if(data.data.singer_playlists[0]) {
                setSelectedItem(data.data.singer_playlists[0])
              } else {
                setSelectedType('none');
                setSelectedItem(empty_value[0])
              }
            }
          }
        }
      )
    }
  }

  const callbackChangeSingerHistory = (changed: boolean) => {
    setChangeSingerHistory(changed)
  }

  const callbackChangePublicPlaylist = (changed: boolean) => {
    setChangePublicPlaylists(changed)
  }

  const callbackChangeSingerPlaylist = (changed: boolean) => {
    setChangeSingerPlaylists(changed)
  }

  const callbackShowLoadingWindow = (show: boolean) => {
    setShowLoadingWindow(show)
  }

  const callbackOperationQueue = (option: string) => {
    setOperationQueue(option);
  }

  const callbackSetReloadFolder = (val: boolean) => {
    setReloadFolder(val);
  }

  const callbackSetNote = async (path: string, note: string) => {
    await axios.get(`http://${settings.serverIpAddress}:5000/update_public_playlists_note?path=${path}&note=${note}`) 
    await axios.get(`http://${settings.serverIpAddress}:5000/update_singer_playlists_note?path=${path}&note=${note}`) 
    await axios.get(`http://${settings.serverIpAddress}:5000/update_queue_history_note?path=${path}&note=${note}`)
    setChangedNote(note);
    setPathForNote(path);
  }

  const callbackSetPathForNote = (path: string) => {
    setPathForNote(path);
  }

  let sidebar;
  let mainSection;
  if(page === 'songs') {
    sidebar = <div className='sidebar'>
      <FoldersMenu
        page={page}
        folders={folders}
        selectedItem = {selectedItem}
        selectedType = {selectedType}
        callbackAddItem={callbackAddItem}
        callbackSelectedItem={callbackSelectedItem}
        callbackDelete={callbackDelete}
        callbackShowLoadingWindow={callbackShowLoadingWindow}
        callbackSetReloadFolder={callbackSetReloadFolder}
      />
      <PublicPlaylistsMenu
        publicPlaylists={publicPlaylists}
        selectedItem = {selectedItem}
        selectedType = {selectedType}
        callbackAddItem={callbackAddItem}
        callbackSelectedItem={callbackSelectedItem}
        callbackDelete={callbackDelete}
        dragging={dragging}
        callbackSetDragging={callbackSetDragging}
        callbackChangePublicPlaylist={callbackChangePublicPlaylist}
        callbackOperationQueue={callbackOperationQueue}
        />
      <QueueHistoryMenu
        queueHistory={queueHistory}
        selectedItem = {selectedItem}
        selectedType = {selectedType}
        callbackSelectedItem={callbackSelectedItem}
        callbackDelete={callbackDelete}
        emptyCurrentQueue={emptyCurrentQueue}
      />
    </div>;
    mainSection = <div className="songs-section main-section">
      <Songs 
        selectedItem = {selectedItem}
        selectedType = {selectedType}
        dragging={dragging}
        callbackSetDragging={callbackSetDragging}
        callbackSetSelQueueId={callbackSetSelQueueId}
        selectedSinger={selectedSinger}
        page={page}
        callbackChangePublicPlaylist={callbackChangePublicPlaylist}
        changePublicPlaylists={changePublicPlaylists}
        relaodFolder={relaodFolder}
        callbackSetReloadFolder={callbackSetReloadFolder}
        callbackShowLoadingWindow={callbackShowLoadingWindow}
        click={click}
        toSetClick={handleSetClick}
        callbackSetNote={callbackSetNote}
        changedNote={changedNote}
        pathForNote={pathForNote}
      />
    </div>
  } else if(page === 'singers') {
    sidebar = <div className='sidebar'>
      <SingersMenu
        singers={singers}
        selectedSinger={selectedSinger}
        callbackSetSingerPlaylists={callbackSetSingerPlaylists}
        callbackSetSelectedSinger={callbackSetSelectedSinger}
        callbackDelete={callbackDelete}
      />
      <FoldersMenu 
        page={page}
        folders={folders}
        selectedItem = {selectedItem}
        selectedType = {selectedType}
        callbackAddItem={callbackAddItem}
        callbackSelectedItem={callbackSelectedItem}
        callbackDelete={callbackDelete}
        callbackShowLoadingWindow={callbackShowLoadingWindow}
        callbackSetReloadFolder={callbackSetReloadFolder}
      />
      <SingerPlaylistsMenu
        singerPlaylists={singerPlaylists}
        dragging={dragging}
        callbackSetDragging={callbackSetDragging}
        selectedItem = {selectedItem}
        selectedType = {selectedType}
        callbackAddItem={callbackAddItem}
        callbackSelectedItem={callbackSelectedItem}
        selectedSinger={selectedSinger}
        callbackDelete={callbackDelete}
        callbackChangeSingerPlaylist={callbackChangeSingerPlaylist}
        callbackOperationQueue={callbackOperationQueue}
      />
    </div>;
    mainSection = <div className="singers-section main-section">
      <Singer
        callbackAddItem={callbackAddItem}
        selectedSinger={selectedSinger}
        callbackSetSelectedSinger={callbackSetSelectedSinger}
      />
      {selectedSinger._id !== '' ? 
      <Tabs defaultActiveKey="songs">
        <TabPane tab={tabTitle} key="songs" id='tab-songs'>
          <Songs
            selectedItem = {selectedItem}
            selectedType = {selectedType}
            dragging={dragging}
            callbackSetDragging={callbackSetDragging}
            callbackSetSelQueueId={callbackSetSelQueueId}
            selectedSinger={selectedSinger}
            page={page}
            callbackChangeSingerPlaylist={callbackChangeSingerPlaylist}
            changeSingerPlaylists={changeSingerPlaylists}
            relaodFolder={relaodFolder}
            callbackSetReloadFolder={callbackSetReloadFolder}
            callbackShowLoadingWindow={callbackShowLoadingWindow}
            click={click}
            toSetClick={handleSetClick}
            callbackSetNote={callbackSetNote}
            changedNote={changedNote}
            pathForNote={pathForNote}
        />
        </TabPane>
        <TabPane tab="Singer History" key="singer_history" id='tab-singer-history'>
          <SingerHistory 
            dragging={dragging}
            callbackSetDragging={callbackSetDragging}
            callbackSetSelQueueId={callbackSetSelQueueId}
            selectedSinger={selectedSinger}
            callbackChangeSingerHistory={callbackChangeSingerHistory}
            changeSingerHistory={changeSingerHistory}
          />
        </TabPane>
      </Tabs>
      : null }
    </div>
  }

  return (
    <div className="App full-height" onDragEnd={handleDragEnter} onClick={handleClick} onContextMenu={handleContextMenu}>
      <Header page={page} callbackSetPage={callbackSetPage}></Header>
      <div className='wrapper'>
        {sidebar}
        {mainSection}
        <Queue 
          dragging={dragging}
          callbackSetDragging={callbackSetDragging}
          selQueueId={selQueueId}
          callbackSetSelQueueId={callbackSetSelQueueId}
          singers={singers}
          click={click}
          toSetClick={handleSetClick}
          page={page}
          selectedSinger={selectedSinger}
          selectedType = {selectedType}
          selectedItem = {selectedItem}
          callbackSetQueueHistory={callbackSetQueueHistory}
          callbackChangeSingerHistory={callbackChangeSingerHistory}
          operationQueue={operationQueue}
          callbackOperationQueue={callbackOperationQueue}
          changedNote={changedNote}
          pathForNote={pathForNote}
          callbackSetNote={callbackSetNote}
          callbackSetPathForNote={callbackSetPathForNote}
        />
      </div>
      { showLoadingWindow ? 
        <div id='loading-screen' style={{display: 'block'}}><LoadingOutlined /></div>
        : 
        <div id='loading-screen' style={{display: 'none'}}><LoadingOutlined /></div>
      }
    </div>
  );
}

export default App;
