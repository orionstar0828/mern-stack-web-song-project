import { useState, useEffect } from 'react';
import SongItem from './SongItem';
import axios from 'axios';
import settings from "../settings";
import { Pagination } from 'antd';
import { PlaylistRightMenu} from './RightMenu'

function Songs(props: any) {

  const [tableData, setTableData] = useState([]);

  const [titleName, setTitleName] = useState("");
  const [searchArtist, setSearchArtist] = useState("");
  const [searchSong, setSearchSong] = useState("");
  const [searchNote, setSearchNote] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [sortBy, setSortBy] = useState('artist');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [rightPosX, setRightPosX] = useState(100000);
  const [rightPosY, setRightPosY] = useState(100000);
  const [rightSelIndex, setRightSelIndex] = useState(-1);

  const callbackSetDragging = (isDrag: boolean, dragType: number, dragIds: [], dragIndexes: [] = []) => {
    props.callbackSetDragging(isDrag, dragType, dragIds, dragIndexes);
  }

  function callbackSetSelQueueId(sel_queue_id: string) {
    props.callbackSetSelQueueId(sel_queue_id);
  }

  useEffect(() => {
    async function fetchPublicPlaylists() {
      await axios.get(`http://${settings.serverIpAddress}:5000/show_public_playlist/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}&search_note=${searchNote}`).then( 
        res => {
          let data = res.data as any;
          setTableData(data.data.files);
          setTitleName(props.selectedItem.name);
        }
      )
      props.callbackChangePublicPlaylist(false);
    }
    if(props.changePublicPlaylists)
      fetchPublicPlaylists();
  }, [props.changePublicPlaylists])

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
    async function fetchSongs() {
      if(props.selectedType === 'folder') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_folder/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}&search_note=${searchNote}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === 'public_playlist') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_public_playlist/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "singer_playlist") {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_singer_playlist/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "queue_history") {
        await axios.get(`http://${settings.serverIpAddress}:5000/queue_history/${props.selectedItem.name}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.queue);
            setTitleName(props.selectedItem.name);
          }
        )
      }
    }
    if(props.selectedItem._id !== '') {
      fetchSongs();
    }
  }, [currentPage, props.pathForNote, props.changedNote])

  useEffect(() => {
    async function fetchSongs() {
      if(props.selectedType === 'folder') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_folder/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}&search_note=${searchNote}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === 'public_playlist') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_public_playlist/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "singer_playlist") {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_singer_playlist/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "queue_history") {
        await axios.get(`http://${settings.serverIpAddress}:5000/queue_history/${props.selectedItem.name}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.queue);
            setTitleName(props.selectedItem.name);
          }
        )
      }
    }
    if(props.selectedItem._id !== '') {
      fetchSongs();
    }
  }, [sortOrder, sortBy])

  useEffect(() => {
    async function fetchSongs() {
      if(props.selectedType === 'folder') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_folder/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}&search_note=${searchNote}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === 'public_playlist') {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_public_playlist/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "singer_playlist") {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_singer_playlist/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "queue_history") {
        await axios.get(`http://${settings.serverIpAddress}:5000/queue_history/${props.selectedItem.name}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.queue);
            setTitleName(props.selectedItem.name);
          }
        )
      }
    }
    if(props.selectedItem._id !== '') {
      setCurrentPage(1);
      fetchSongs();
    }
  }, [searchArtist, searchSong, searchNote])

  useEffect(() => {
    async function fetchSingerPlaylists() {
      await axios.get(`http://${settings.serverIpAddress}:5000/show_singer_playlist/${props.selectedItem._id}?page=${currentPage}&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
        res => {
          let data = res.data as any;
          setTableData(data.data.files);
          setTitleName(props.selectedItem.name);
        }
      )
      props.callbackChangeSingerPlaylist(false);
    }
    if(props.changeSingerPlaylists)
      fetchSingerPlaylists();
  }, [props.changeSingerPlaylists])
  
  useEffect(() => {
    async function fetchData() {
      if(props.selectedType === "folder") {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_folder/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}&search_note=${searchNote}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
        props.callbackShowLoadingWindow(false);
        setCurrentPage(1)
      } else if(props.selectedType === "public_playlist") {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_public_playlist/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "singer_playlist") {
        await axios.get(`http://${settings.serverIpAddress}:5000/show_singer_playlist/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.files);
            setTitleName(props.selectedItem.name);
          }
        )
      } else if(props.selectedType === "queue_history") {
        await axios.get(`http://${settings.serverIpAddress}:5000/queue_history/${props.selectedItem.name}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}`).then( 
          res => {
            let data = res.data as any;
            setTotalCount(data.data.total_count);
            setTableData(data.data.queue);
            setTitleName(props.selectedItem.name);
          }
        )
      }
    }
    if(props.selectedType !== "") {
      setCurrentPage(1);
      fetchData()
    }
    if(props.selectedItem._id === '' && props.selectedType === 'none') {
      setTableData([]);
      setTitleName('');
    }
  }, [props.selectedItem]);

  useEffect(() => {
    async function fetchSongs() {
      await axios.get(`http://${settings.serverIpAddress}:5000/show_folder/${props.selectedItem._id}?page=1&page_size=${settings.pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}&search_artist=${searchArtist}&search_song=${searchSong}&search_note=${searchNote}`).then( 
        res => {
          let data = res.data as any;
          setTotalCount(data.data.total_count);
          setTableData(data.data.files);
          setTitleName(props.selectedItem.name);
        }
      )
    }
    if(props.selectedItem._id !== '' && props.selectedType === 'folder' && props.relaodFolder) {
      setCurrentPage(1);
      fetchSongs();
      props.callbackSetReloadFolder(false)
    }
  }, [props.relaodFolder])

  const onArtistChange = (e:any)=>{
    setSearchArtist(e.target.value? e.target.value:'');
  }

  const onSongNameChange = (e:any) =>{
    setSearchSong(e.target.value? e.target.value:'');
  }

  const onSongNoteChange = (e:any) =>{
    setSearchNote(e.target.value? e.target.value:'');
  }

  const onSort = (sortKey:any) =>{
    if(sortKey === sortBy) {
      if(sortOrder === 1)
        setSortOrder(-1)
      else
        setSortOrder(1)
    } else {
      setSortBy(sortKey);
      setSortOrder(1)
    }
  }

  const onFolderPageChange = (page: number) => {
    setCurrentPage(page);
  }

  const callbackSetNote = (key: number, note: string, path: string) => {
    let temp = tableData.slice() as any
    temp[key].note = note;
    setTableData(temp)
    props.callbackSetNote(path, note);
  }

  const callbackSetPrevIndex = (index: number) => {
    setPrevIndex(index);
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
      props.callbackSetDragging(false, 2, dragIds, dragIndexes)
    } else if(type === 'shift') {
      let dragIds = []
      let dragIndexes = []
      if(prevIndex === -1) {
        props.callbackSetDragging(false, 2, [id], [index])
        setPrevIndex(index)
      } else {
        if(prevIndex === index) return;
        if(prevIndex > index) {
          for(let i = prevIndex; i >= index; i--) {
            dragIds.unshift((tableData[i] as any)._id)
            dragIndexes.unshift(i)
          }
        } else if(prevIndex < index) {
          for(let i = index; i >= prevIndex; i--) {
            dragIds.unshift((tableData[i] as any)._id)
            dragIndexes.unshift(i)
          }
        }
        props.callbackSetDragging(false, 2, dragIds, dragIndexes)
      }
    }
  }

  function callbackRightMenu(posX: number, posY: number, right_sel_index: number) {
    setRightPosX(posX);
    setRightPosY(posY);
    setRightSelIndex(right_sel_index);
  }

  let table_html;
  if(tableData) {
    table_html = tableData.map((item: any, i: number) => {     
    // Return the element. Also pass key
      return (<SongItem
        data={item} key={i}
        index={i}
        dragging={props.dragging}
        callbackSetDragging={callbackSetDragging}
        callbackSetSelQueueId={callbackSetSelQueueId} 
        searchArtistText={searchArtist}
        searchNoteText={searchNote}
        searchSongText={searchSong}
        selectedType={props.selectedType}
        callbackSetNote={callbackSetNote}
        callbackSetPrevIndex={callbackSetPrevIndex} 
        callbackAddDragItem={callbackAddDragItem} 
        callbackRightMenu={callbackRightMenu}/>);
    })
  } else {
    table_html = 'Loading...';
  }

  return (
    <div className={props.page === 'singers' && props.selectedSinger._id === '' ? 'songs-part hide' : 'songs-part'}>
      <div className="main-title">
        {props.page === 'songs' ? titleName : null } 
        {props.selectedItem._id !== '' ?
          <span className='extra-option'>
            {totalCount > settings.pageSize ? <Pagination simple current={currentPage} defaultCurrent={1} total={totalCount} defaultPageSize={settings.pageSize} onChange={onFolderPageChange} /> : null }
          </span>: 
        null }
      </div>
      <table id="table-header-fixed"></table>
      <table id="song-table">
          <thead>
              <tr>
                  {props.selectedType === 'queue_history' ? <th>SINGER</th> : null}
                  <th><span onClick= {(e:any)=>{onSort('artist')}} style={{cursor:'pointer'}}>ARTIST</span> 
                     <input type="text" id="artist-search" className="search-field" placeholder="Filter artists"
                      onChange = {onArtistChange} value={searchArtist} />
                  </th>
                  <th > <span onClick={(e:any)=>{onSort('name')}} style={{cursor:'pointer'}}>SONG</span> 
                    <input type="text" id="song-search" className="search-field" placeholder="Filter songs" 
                     onChange = {onSongNameChange} value ={searchSong} />
                  </th>
                  <th>LENGTH</th>
                  <th>FILE PATH</th>
                  <th className={props.selectedType === 'folder' ? '' : 'none'}>NOTE <input type="text" id="note-search" className="search-field" placeholder="Filter notes" 
                     onChange = {onSongNoteChange} value ={searchNote} /></th>
                  
              </tr>
          </thead>
          <tbody>
              {table_html}
          </tbody>
      </table>
      
      <PlaylistRightMenu 
        posX={rightPosX} 
        posY={rightPosY} 
        selIndex={rightSelIndex} 
        tableData={tableData}
        dragging={props.dragging} 
        callbackSetDragging={callbackSetDragging}
        selectedType={props.selectedType} 
        selectedItem={props.selectedItem} />

    </div>
  );
}

export default Songs;