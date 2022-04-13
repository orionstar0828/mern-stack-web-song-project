import { DownOutlined, UpOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import settings from '../settings'

function FoldersMenu(props: any) {

    // states

    const [expand, setExpand] = useState(true)
    const [isAddFolderModalVisible, setIsAddFolderModalVisible] = useState(false);
    const [isDeleteFolderModalVisible, setIsDeleteFolderModalVisible] = useState(false);
    const [addFolderModalContent, setAddFolderModalContent] = useState("")
    const [selectedModalFolderName, setSelectedModalFolderName] = useState("")
    const [isDeleteFolder, setIsDeleteFolder] = useState(false)
    const [deleteFolderId, setDeleteFolderId] = useState('')

    // effects

    useEffect(()=>{
        for(let i = 0; i < document.getElementsByClassName("node-btn").length; i++) {
            let id = (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).getAttribute("id");
            if(props.selectedItem._id === id)
                (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.add("active");
            else
                (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.remove("active");
        }
    },[]);

    useEffect(()=>{
        for(let i = 0; i < document.getElementsByClassName("node-btn").length; i++) {
            let id = (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).getAttribute("id");
            if(props.selectedItem._id === id)
                (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.add("active");
            else
                (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.remove("active");
        }
    },[props.selectedItem._id]);

    useEffect(()=>{
        if(isDeleteFolder) {
            axios.get(`http://${settings.serverIpAddress}:5000/delete_folder/${deleteFolderId}`)
            setIsDeleteFolder(false);
        } else if(!isDeleteFolder && deleteFolderId !== '') {
            props.callbackDelete('folder', deleteFolderId);
        }
    },[isDeleteFolder]);

    // events

    const onMenuClick = () => {
        setExpand(!expand)
    }

    const onFolderClick = (e: React.MouseEvent<HTMLDivElement>) => {
        let title = e.currentTarget.getAttribute('title')
        props.callbackSelectedItem(e.currentTarget.getAttribute('id'), title, 'folder');
        for(let i = 0; i < document.getElementsByClassName("node-btn").length; i++) {
            (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.remove("active");
        }
        e.currentTarget.classList.add("active");
    }

    const onAddFolderModalItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
        for(let i = 0; i < document.getElementsByClassName("modal-item").length; i++) {
            (document.getElementsByClassName("modal-item")[i] as HTMLDivElement).classList.remove("active");
        }
        e.currentTarget.classList.add("active");
        let itemName = e.currentTarget.getAttribute("item-name");
        setSelectedModalFolderName(itemName as string);
    }

    const onAddFolderModalOk = () => {
        if(selectedModalFolderName === "") {
            alert("please select folder!");
            return;
        }
        props.callbackShowLoadingWindow(true);
        axios.get(`http://${settings.serverIpAddress}:5000/save_folder/${selectedModalFolderName}?path=${settings.songsPath}`).then( 
            res => {
                let data = res.data as any;
                if(data.data as string !== 'duplicate') {
                    props.callbackAddItem(data, "folder", settings.songsPath);
                } else {
                    props.callbackShowLoadingWindow(false);
                }
            }
        )
        setIsAddFolderModalVisible(false);
    }

    const onAddFolderModalCancel = () => {
        setIsAddFolderModalVisible(false);
    }

    const fetchAllFolders = () => {
      return new Promise((resolve, reject) => {
        axios.get(`http://${settings.serverIpAddress}:5000/get_folders?path=${settings.songsPath}`).then( 
          res => {
            let data = res.data as any;
            resolve(data.data.folders);
          }
        )
      });
    }

    const onAddFolderClick = async () => {
        setIsAddFolderModalVisible(true);
        let fetchedData = await fetchAllFolders() as any[];
        let items = fetchedData.map((item: any, i: number) =>{
            return (
                <p className="modal-item" key={i} onClick={onAddFolderModalItemClick} item-name={item} >{item}</p>
            )
        });
        setAddFolderModalContent(items as any);
    }

    const onDeleteFolderClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        let id = (e.currentTarget.parentElement as HTMLDivElement).getAttribute('id')
        setDeleteFolderId(id as string)
        setIsDeleteFolderModalVisible(true)
        e.stopPropagation()
    }

    const onDeletedFolderYes = () => {
        setIsDeleteFolder(true)
        setIsDeleteFolderModalVisible(false);
    }

    const onDeletedFolderNo = () => {
        setIsDeleteFolderModalVisible(false);
    }

    const onFolderReloadClick = async (id: string, name: string) => {
        await axios.get(`http://${settings.serverIpAddress}:5000/reload_folder/${id}/${name}?path=${settings.songsPath}`).then( 
          res => {
            let data = res.data as any;
            if(data.data === 'changed' && props.selectedType === 'folder' && props.selectedItem._id === id) {
                props.callbackSetReloadFolder(true);
            }
          }
        )
      }

    let icon
    if(expand)
        icon = <DownOutlined />
    else
        icon = <UpOutlined />

    let menuList = props.folders.map((item: any, i: number) => {    
        let id = item._id;
        if (id !== "") {
            return (<div id={id} key={i} className={item._id === props.selectedItem._id ? "node-btn active" : "node-btn"} 
                onClick={onFolderClick} 
                title={item.name}>
                    <ReloadOutlined 
                        className='reload-folder' 
                        title='Reload' 
                        onClick={(e: React.MouseEvent<HTMLSpanElement>)=>{onFolderReloadClick(item._id, item.name); e.stopPropagation();}}/>
                    {item.name}
                    <span title='Delete Folder' 
                        onClick={onDeleteFolderClick} 
                        className='delete-folder'>
                            <CloseOutlined /></span>
                </div>);
        }
    })
    return (
        <div className='menu'>
            <div onClick={onMenuClick} className='menu-title'>{icon} Folders</div>
            <div className={expand ? 'menu-list show' : 'menu-list hide'}>
                <div className='add-btn' onClick={onAddFolderClick}>ADD NEW FOLDER</div>
                {menuList}
            </div>
            <Modal title="Please select folder." visible={isAddFolderModalVisible} onOk={onAddFolderModalOk} onCancel={onAddFolderModalCancel} className="add-folder-modal" >
                {addFolderModalContent}
            </Modal>
            <Modal title="Delete Folder." visible={isDeleteFolderModalVisible} className="delete-modal" footer={[<Button key="yes" type="primary" onClick={onDeletedFolderYes}> Yes </Button>, <Button key="no" onClick={onDeletedFolderNo}> No </Button>,]} onCancel={(e : any) => {e.stopPropagation(); setIsDeleteFolderModalVisible(false);}}>
                Do you want to delete this folder and it's songs?
            </Modal>
        </div>
    );
}

export default FoldersMenu;