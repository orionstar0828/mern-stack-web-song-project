import { DownOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import axios from 'axios';
import settings from '../settings'

function PublicPlaylistsMenu(props: any) {

    // states

    const [expand, setExpand] = useState(true)
    const [isAddPublicPlaylistsModalVisible, setIsAddPublicPlaylistsModalVisible] = useState(false);
    const [inputedModalPublicPlaylistName, setInputedModalPublicPlaylistName] = useState("")
    const [isDeletePublicPlaylist, setIsDeletePublicPlaylist] = useState(false)
    const [deletePublicPlaylistId, setDeletePublicPlaylistId] = useState('')
    const [isDeletePublicPlaylistModalVisible, setIsDeletePublicPlaylistModalVisible] = useState(false);
    const [isQuestoinModalVisible, setIsQuestoinModalVisible] = useState(false);
    
    useEffect(()=>{
        if(isDeletePublicPlaylist) {
            axios.get(`http://${settings.serverIpAddress}:5000/delete_public_playlist/${deletePublicPlaylistId}`)
            setIsDeletePublicPlaylist(false);
        } else if(!isDeletePublicPlaylist && deletePublicPlaylistId !== '') {
            props.callbackDelete('public_playlist', deletePublicPlaylistId);
        }
    },[isDeletePublicPlaylist]);

    // events

    const onMenuClick = () => {
        setExpand(!expand)
    }
    
    const onPublicPlaylistClick = (e: React.MouseEvent<HTMLDivElement>) => {
        let elem = e.currentTarget.getElementsByClassName('delete-public-playlist')[0].innerHTML;
        let title = e.currentTarget.innerHTML.replace(elem, '').replace('<span title="Delete Public Playlist" class="delete-public-playlist"></span>', '')
        props.callbackSelectedItem(e.currentTarget.getAttribute('id'), title, 'public_playlist');
        for(let i = 0; i < document.getElementsByClassName("node-btn").length; i++) {
            (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.remove("active");
        }
        e.currentTarget.classList.add("active");
    }

    const onAddPublicPlaylistModalOk = () => {
        if(inputedModalPublicPlaylistName === "") {
            alert("please input public playlist name!");
            return;
        }
        axios.get(`http://${settings.serverIpAddress}:5000/save_public_playlist/${inputedModalPublicPlaylistName}`).then( 
            res => {
                let data = res.data as any;
                if(data.data as string !== 'duplicate')
                    props.callbackAddItem(data, "public_playlist", "");
            }
        )
        setIsAddPublicPlaylistsModalVisible(false);
    }

    const onAddPublicPlaylistModalCancel = () => {
        setIsAddPublicPlaylistsModalVisible(false);
    }

    const onAddPublicPlaylistClick = async () => {
        await setIsAddPublicPlaylistsModalVisible(true);
        (document.getElementById('public-playlist-name') as HTMLInputElement).value = '';
    }

    const onAddPublicPlaylistNameChange = (e: React.FormEvent<HTMLInputElement>) => {
        setInputedModalPublicPlaylistName(e.currentTarget.value);
    }

    const onDeletePublicPlaylistClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        let id = (e.currentTarget.parentElement as HTMLDivElement).getAttribute('id')
        setDeletePublicPlaylistId(id as string)
        setIsDeletePublicPlaylistModalVisible(true)
        e.stopPropagation()
    }

    const onDeletedPublicPlaylistYes = () => {
        setIsDeletePublicPlaylist(true)
        setIsDeletePublicPlaylistModalVisible(false);
    }

    const onDeletedPublicPlaylistNo = () => {
        setIsDeletePublicPlaylistModalVisible(false);
    }

    const onPublicPlaylistDragOver = (e: any) => {
        let event = e as Event;
        event.stopPropagation();
        event.preventDefault();
    }

    const onPublicPlaylistDrop = async (ev: React.DragEvent<HTMLDivElement>) => {
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
                const song_note = (document.getElementById(uid)?.getElementsByClassName("song-note")[0] as HTMLInputElement)?.value;

                await axios.get(`http://${settings.serverIpAddress}:5000/save_song_in_public_playlist/${id}?song_id=${dragId}&artist=${song_artist}&song=${song_name}&length=${song_length}&path=${song_path}&note=${song_note}`)
            }
            props.callbackSetDragging(false, 0, [])
        } else if(props.dragging.isDrag && props.dragging.dragType === 1) {
            for(const dragId of props.dragging.dragIds) {
                const uid = `queue-${dragId}`;
                const song_artist = document.getElementById(uid)?.getElementsByClassName("queue-artist")[0]?.textContent;
                const song_name = document.getElementById(uid)?.getElementsByClassName("queue-song")[0]?.textContent;
                const song_length = document.getElementById(uid)?.getElementsByClassName("queue-length")[0]?.textContent;
                const song_path = document.getElementById(uid)?.getElementsByClassName("queue-path")[0]?.textContent;
                const song_note = (document.getElementById(uid)?.getElementsByClassName("queue-note")[0] as HTMLInputElement)?.value;

                await axios.get(`http://${settings.serverIpAddress}:5000/save_song_in_public_playlist/${id}?song_id=${dragId}&artist=${song_artist}&song=${song_name}&length=${song_length}&path=${song_path}&note=${song_note}`)
            }
            props.callbackSetDragging(false, 0, [])
        }
        if(props.dragging.isDrag && (props.dragging.dragType >= 1 && props.dragging.dragType <= 3)) {
            if(props.selectedItem._id === id && props.selectedType === 'public_playlist') {
                props.callbackChangePublicPlaylist(true);
            }
        }
    }

    const onPublicPlaylistDoublClick = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsQuestoinModalVisible(true)
    }

    const onReplaceQueue = (e: React.MouseEvent<HTMLDivElement>) => {
        props.callbackOperationQueue('public-playlist-replace');
        setIsQuestoinModalVisible(false)
    }

    const onAddToQueue = (e: React.MouseEvent<HTMLDivElement>) => {
        props.callbackOperationQueue('public-playlist-add');
        setIsQuestoinModalVisible(false)
    }

    const onQuestionCancel = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsQuestoinModalVisible(false)
    }

    const onPublicPlaylistDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const id = e.currentTarget.getAttribute('id');
        props.callbackSetDragging(true, 4, [id])
    }

    let icon
    if(expand)
        icon = <DownOutlined />
    else
        icon = <UpOutlined />

    let menuList = props.publicPlaylists.map((item: any, i: number) => {    
        let id = item._id;
        if (id !== "") {
            return (<div id={id} key={i} className={item._id === props.selectedItem._id ? "node-btn active" : "node-btn"} onClick={onPublicPlaylistClick} onDrop={onPublicPlaylistDrop} onDragOver={onPublicPlaylistDragOver} onDoubleClick={onPublicPlaylistDoublClick} onDragStart={onPublicPlaylistDragStart} draggable={true}>{item.name}<span title='Delete Public Playlist' onClick={onDeletePublicPlaylistClick} className='delete-public-playlist'><CloseOutlined /></span></div>);
        }
    })
    return (
        <div className='menu'>
            <div onClick={onMenuClick} className='menu-title'>{icon} Public Playlists</div>
            <div className={expand ? 'menu-list show' : 'menu-list hide'}>
                <div className='add-btn' onClick={onAddPublicPlaylistClick}>ADD NEW PLAYLIST</div>
                {menuList}
            </div>
            <Modal title="Please input public playlist name." visible={isAddPublicPlaylistsModalVisible} onOk={onAddPublicPlaylistModalOk} onCancel={onAddPublicPlaylistModalCancel} className="add-modal" >
                <p style={{textAlign: "center", marginTop: 10}}><input id="public-playlist-name" onChange={onAddPublicPlaylistNameChange} /></p>
            </Modal>
            <Modal title="Delete Public Playlist." visible={isDeletePublicPlaylistModalVisible} className="delete-modal" footer={[<Button key="yes" type="primary" onClick={onDeletedPublicPlaylistYes}> Yes </Button>, <Button key="no" onClick={onDeletedPublicPlaylistNo}> No </Button>,]} onCancel={(e : any) => {e.stopPropagation(); setIsDeletePublicPlaylistModalVisible(false);}}>
                Do you want to delete this public playlist?
            </Modal>
            <Modal title="Questions" visible={isQuestoinModalVisible} className="question-modal" footer={[]} onCancel={(e : any) => {e.stopPropagation(); setIsQuestoinModalVisible(false);}}>
                <Button key="add" type="primary" onClick={onAddToQueue}> Add ALL to Queue </Button> <Button key="replace" type="primary" onClick={onReplaceQueue}> Replace Current Queue </Button> <Button key="cancel" onClick={onQuestionCancel}> CANCEL </Button>
            </Modal>
        </div>
    );
}

export default PublicPlaylistsMenu;