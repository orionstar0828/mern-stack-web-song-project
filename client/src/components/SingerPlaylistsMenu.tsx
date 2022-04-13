import { DownOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import axios from 'axios';
import settings from '../settings'

function SingerPlaylistsMenu(props: any) {

    // states

    const [expand, setExpand] = useState(true)
    const [isAddSingerPlaylistsModalVisible, setIsAddSingerPlaylistsModalVisible] = useState(false);
    const [inputedModalSingerPlaylistName, setInputedModalSingerPlaylistName] = useState("")
    const [isDeleteSingerPlaylist, setIsDeleteSingerPlaylist] = useState(false)
    const [deleteSingerPlaylistId, setDeleteSingerPlaylistId] = useState('')
    const [isDeleteSingerPlaylistModalVisible, setIsDeleteSingerPlaylistModalVisible] = useState(false);
    const [isQuestoinModalVisible, setIsQuestoinModalVisible] = useState(false);

    // effects

    useEffect(()=>{
        if(isDeleteSingerPlaylist) {
            axios.get(`http://${settings.serverIpAddress}:5000/delete_singer_playlist/${deleteSingerPlaylistId}`)
            setIsDeleteSingerPlaylist(false);
        } else if(!isDeleteSingerPlaylist && deleteSingerPlaylistId !== '') {
            props.callbackDelete('singer_playlist', deleteSingerPlaylistId);
        }
    },[isDeleteSingerPlaylist]);

    // events

    const onMenuClick = () => {
        setExpand(!expand)
    }
    
    const onSingerPlaylistClick = (e: React.MouseEvent<HTMLDivElement>) => {
        let elem = e.currentTarget.getElementsByClassName('delete-singer-playlist')[0].innerHTML;
        let title = e.currentTarget.innerHTML.replace(elem, '').replace('<span title="Delete Singer Playlist" class="delete-singer-playlist"></span>', '')
        props.callbackSelectedItem(e.currentTarget.getAttribute('id'), title, 'singer_playlist');
        for(let i = 0; i < document.getElementsByClassName("node-btn").length; i++) {
            (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.remove("active");
        }
        e.currentTarget.classList.add("active");
    }

    const onAddSingerPlaylistModalOk = () => {
        if(inputedModalSingerPlaylistName === "") {
            alert("please input singer playlist name!");
            return;
        }
        axios.get(`http://${settings.serverIpAddress}:5000/save_singer_playlist/${inputedModalSingerPlaylistName}/${props.selectedSinger._id}`).then( 
            res => {
                let data = res.data as any;
                if(data.data as string !== 'duplicate')
                    props.callbackAddItem(data.data, "singer_playlist", "");
            }
        )
        setIsAddSingerPlaylistsModalVisible(false);
    }

    const onAddSingerPlaylistModalCancel = () => {
        setIsAddSingerPlaylistsModalVisible(false);
    }

    const onAddSingerPlaylistClick = async () => {
        await setIsAddSingerPlaylistsModalVisible(true);
        (document.getElementById('singer-playlist-name') as HTMLInputElement).value = '';
    }

    const onAddSingerPlaylistNameChange = (e: React.FormEvent<HTMLInputElement>) => {
        setInputedModalSingerPlaylistName(e.currentTarget.value);
    }

    const onDeleteSingerPlaylistClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        let id = (e.currentTarget.parentElement as HTMLDivElement).getAttribute('id')
        setDeleteSingerPlaylistId(id as string)
        setIsDeleteSingerPlaylistModalVisible(true)
        e.stopPropagation()
    }

    const onDeletedSingerPlaylistYes = () => {
        setIsDeleteSingerPlaylist(true)
        setIsDeleteSingerPlaylistModalVisible(false);
    }

    const onDeletedSingerPlaylistNo = () => {
        setIsDeleteSingerPlaylistModalVisible(false);
    }

    const onSingerPlaylistDragOver = (e: any) => {
        let event = e as Event;
        event.stopPropagation();
        event.preventDefault();
    }

    const onSingerPlaylistDrop = async (ev: React.DragEvent<HTMLDivElement>) => {
        const id = ev.currentTarget.getAttribute('id');
        if(props.dragging.isDrag && (props.dragging.dragType === 2 || props.dragging.dragType === 3)) {
            for(const dragId of props.dragging.dragIds) {
                let uid = '';
                if(props.dragging.dragType === 2)
                    uid = `song-${dragId}`;
                else if(props.dragging.dragType === 3)
                    uid = `singer-history-${dragId}`;
                const song_artist = document.getElementById(uid)?.getElementsByClassName("song-artist")[0]?.textContent;
                const song_name = document.getElementById(uid)?.getElementsByClassName("song-name")[0]?.textContent;
                const song_length = document.getElementById(uid)?.getElementsByClassName("song-length")[0]?.textContent;
                const song_path = document.getElementById(uid)?.getElementsByClassName("song-path")[0]?.textContent;
                const song_note = document.getElementById(uid)?.getElementsByClassName("song-note")[0]?.textContent;
                await axios.get(`http://${settings.serverIpAddress}:5000/save_song_in_singer_playlist/${id}?song_id=${dragId}&artist=${song_artist}&song=${song_name}&length=${song_length}&path=${song_path}&note=${song_note}`)
            }
            props.callbackSetDragging(false, 0, [])
        } else if(props.dragging.isDrag && props.dragging.dragType === 1) {
            for(const dragId of props.dragging.dragIds) {
                const uid = `queue-${dragId}`;
                const song_artist = document.getElementById(uid)?.getElementsByClassName("queue-artist")[0]?.textContent;
                const song_name = document.getElementById(uid)?.getElementsByClassName("queue-song")[0]?.textContent;
                const song_length = document.getElementById(uid)?.getElementsByClassName("queue-length")[0]?.textContent;
                const song_path = document.getElementById(uid)?.getElementsByClassName("queue-path")[0]?.textContent;
                const song_note = document.getElementById(uid)?.getElementsByClassName("song-note")[0]?.textContent;
                await axios.get(`http://${settings.serverIpAddress}:5000/save_song_in_singer_playlist/${id}?song_id=${dragId}&artist=${song_artist}&song=${song_name}&length=${song_length}&path=${song_path}&note=${song_note}`)
            }
            props.callbackSetDragging(false, 0, [])
        }
        if(props.dragging.isDrag && (props.dragging.dragType >= 1 && props.dragging.dragType <= 3)) {
            if(props.selectedType === 'singer_playlist' && props.selectedItem._id === id) {
                props.callbackChangeSingerPlaylist(true);
            }
        }
    }

    const onPublicPlaylistDoublClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsQuestoinModalVisible(true)
    }

    const onReplaceQueue = (e: React.MouseEvent<HTMLDivElement>) => {
        props.callbackOperationQueue('singer-playlist-replace');
        setIsQuestoinModalVisible(false)
    }

    const onAddToQueue = (e: React.MouseEvent<HTMLDivElement>) => {
        props.callbackOperationQueue('singer-playlist-add');
        setIsQuestoinModalVisible(false)
    }

    const onQuestionCancel = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsQuestoinModalVisible(false)
    }

    const onPublicPlaylistDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const id = e.currentTarget.getAttribute('id');
        props.callbackSetDragging(true, 5, [id])
    }

    let icon
    if(expand)
        icon = <DownOutlined />
    else
        icon = <UpOutlined />

    let menuList;
    let add_part
    if(props.selectedSinger._id !== '' && props.selectedSinger !== undefined && props.singerPlaylists) {
        add_part = <div className='add-btn' onClick={onAddSingerPlaylistClick}>ADD NEW PLAYLIST</div>
        menuList = props.singerPlaylists.map((item: any, i: number) => {
            let id = item._id;
            if (id !== "") {
                return (<div id={id} key={i} className={item._id === props.selectedItem._id ? "node-btn active" : "node-btn"} onClick={onSingerPlaylistClick} onDrop={onSingerPlaylistDrop} onDragOver={onSingerPlaylistDragOver} onDoubleClick={onPublicPlaylistDoublClick} onDragStart={onPublicPlaylistDragStart} draggable={true}>{item.name}<span title='Delete Singer Playlist' onClick={onDeleteSingerPlaylistClick} className='delete-singer-playlist'><CloseOutlined /></span></div>);
            }
        })
    } else {
        menuList = '';
        add_part = '';
    }
    return (
        <div className='menu'>
            <div onClick={onMenuClick} className='menu-title'>{icon} Singer Playlists</div>
            <div className={expand ? 'menu-list show' : 'menu-list hide'}>
                {add_part}
                {menuList}
            </div>
            <Modal title="Please input singer playlist name." visible={isAddSingerPlaylistsModalVisible} onOk={onAddSingerPlaylistModalOk} onCancel={onAddSingerPlaylistModalCancel} className="add-modal" >
                <p style={{textAlign: "center", marginTop: 10}}><input id="singer-playlist-name" onChange={onAddSingerPlaylistNameChange} /></p>
            </Modal>
            <Modal title="Delete Singer Playlist." visible={isDeleteSingerPlaylistModalVisible} className="delete-modal" footer={[<Button key="yes" type="primary" onClick={onDeletedSingerPlaylistYes}> Yes </Button>, <Button key="no" onClick={onDeletedSingerPlaylistNo}> No </Button>,]} onCancel={(e : any) => {e.stopPropagation(); setIsDeleteSingerPlaylistModalVisible(false);}}>
                Do you want to delete this singer playlist?
            </Modal>
            <Modal title="Questions" visible={isQuestoinModalVisible} className="question-modal" footer={[]} onCancel={(e : any) => {e.stopPropagation(); setIsQuestoinModalVisible(false);}}>
                <Button key="add" type="primary" onClick={onAddToQueue}> Add ALL to Queue </Button> <Button key="replace" type="primary" onClick={onReplaceQueue}> Replace Current Queue </Button> <Button key="cancel" onClick={onQuestionCancel}> CANCEL </Button>
            </Modal>
        </div>
    );
}

export default SingerPlaylistsMenu;