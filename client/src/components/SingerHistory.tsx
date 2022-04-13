import React, { useState, useEffect } from 'react';
import SingerHistoryItem from './SingerHistoryItem';
import axios from 'axios';
import settings from "../settings";

const enum SORT{INCREASING, DECREASING};

function SingerHistory(props: any) {

  const [files, setFiles] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [searchArtist, setSearchArtist] = useState("");
  const [searchSong, setSearchSong] = useState("");
  const [sortArtist, setSortArtist] = useState(SORT.DECREASING);
  const [sortSong, setSortSong] = useState(SORT.DECREASING);
  const [prevIndex, setPrevIndex] = useState(-1);


  const callbackSetDragging = (isDrag: boolean, dragType: number, dragIds: [], dragIndexes: [] = []) => {
    props.callbackSetDragging(isDrag, dragType, dragIds, dragIndexes);
  }
  
  function callbackSetSelQueueId(sel_queue_id: string) {
    props.callbackSetSelQueueId(sel_queue_id);
  }

  useEffect(() => {
    async function fetchData() {
      await axios.get(`http://${settings.serverIpAddress}:5000/singer_history/` + props.selectedSinger._id).then( 
        res => {
          let data = res.data as any;
          setFiles(data.data.singer_history);
          setTableData(data.data.singer_history);
        }
      )
    }
    if(props.selectedSinger._id !== "") {
      fetchData()
    }
  }, [props.selectedSinger._id]);

  useEffect(() => {
    async function fetchSingerHistory() {
      await axios.get(`http://${settings.serverIpAddress}:5000/singer_history/` + props.selectedSinger._id).then( 
        res => {
          let data = res.data as any;
          setFiles(data.data.singer_history);
          setTableData(data.data.singer_history);
        }
      )
      props.callbackChangeSingerHistory(false);
    }
    if(props.changeSingerHistory) {
      fetchSingerHistory()
    }
  }, [props.changeSingerHistory]);

  const onArtistChange = (e:any)=>{
    setSearchArtist(e.target.value? e.target.value:'');    
    let filteredData = files.filter((entry:any) =>
      (entry.artist as string).toString().toLowerCase().includes((e.target.value as string).toLowerCase()) && 
      (entry.name as string).toString().toLowerCase().includes(searchSong.toLowerCase())
    );
    setTableData(filteredData);
  }

  const onSongNameChange = (e:any) =>{
    setSearchSong(e.target.value? e.target.value:'');
    let filteredData = files.filter((entry:any) =>
      entry.name.toString().toLowerCase().includes(e.target.value.toLowerCase()) && 
      entry.artist.toString().toLowerCase().includes(searchArtist.toLowerCase())
    );
    setTableData(filteredData);
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
      props.callbackSetDragging(false, 3, dragIds, dragIndexes)
    } else if(type === 'shift') {
      let dragIds = []
      let dragIndexes = []
      if(prevIndex === -1) {
        props.callbackSetDragging(false, 3, [id], [index])
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
        props.callbackSetDragging(false, 3, dragIds, dragIndexes)
      }
    }
  }

  const onSort = (sortKey:any) =>{
    let data = tableData;
    switch(sortKey)
    {
      case 'artist':
        switch(sortArtist)
        {
          case SORT.INCREASING:
            setSortArtist(SORT.DECREASING);
            data.sort((a:any,b:any) => b[sortKey].localeCompare(a[sortKey]));
            break;
          default:
            setSortArtist(SORT.INCREASING);
            data.sort((a:any,b:any) => a[sortKey].localeCompare(b[sortKey]));
            break;
        }
        break;
      case 'name':
        switch(sortSong)
        {
          case SORT.INCREASING:
            setSortSong(SORT.DECREASING);
            data.sort((a:any,b:any) => b[sortKey].localeCompare(a[sortKey]));
            break;
          default:
            setSortSong(SORT.INCREASING);
            data.sort((a:any,b:any) => a[sortKey].localeCompare(b[sortKey]));
            break;
        }
        break;
      default:
        break;
    }
    setTableData(data);
  }

  let table_html;
  if(tableData) {
    table_html = tableData.map((item: any, i: number) => {     
      // Return the element. Also pass key
      return (<SingerHistoryItem
        data={item} key={i}
        index={i}
        dragging={props.dragging}
        callbackSetDragging={callbackSetDragging}
        callbackSetSelQueueId={callbackSetSelQueueId} 
        searchArtistText={searchArtist}
        searchSongText={searchSong}
        callbackSetPrevIndex={callbackSetPrevIndex} 
        callbackAddDragItem={callbackAddDragItem} />);
    })
  } else {
    table_html = 'Loading...';
  }

  return (
    <div className={props.selectedSinger._id === '' ? 'singer-history-part hide' : 'singer-history-part'}>
      <table id="table-header-fixed"></table>
      <table id="singer-history-table">
        <thead>
          <tr>
            <th>Date</th>
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
          </tr>
        </thead>
        <tbody>
          {table_html}
        </tbody>
      </table>
    </div>
  );
}

export default SingerHistory;