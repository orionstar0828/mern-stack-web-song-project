import { DownOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import axios from 'axios';
import settings from '../settings'

const empty_singer = {
    _id: "",
    firstname: "",
    lastname: "",
    nickname: "",
}

function SingersMenu(props: any) {

    // states

    const [expand, setExpand] = useState(true)
    const [isDeleteSinger, setIsDeleteSinger] = useState(false)
    const [deleteSingerId, setDeleteSingerId] = useState('')
    const [isDeleteSingerModalVisible, setIsDeleteSingerModalVisible] = useState(false);

    // effects

    useEffect(()=>{
        for(let i = 0; i < document.getElementsByClassName("singer-btn").length; i++) {
            let id = (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).getAttribute("id");
            if(props.selectedSinger._id === id)
                (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).classList.add("active");
            else
                (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).classList.remove("active");
        }
    },[props.selectedSinger]);

    useEffect(()=>{
        for(let i = 0; i < document.getElementsByClassName("singer-btn").length; i++) {
            let id = (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).getAttribute("id");
            if(props.selectedSinger._id === id)
                (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).classList.add("active");
            else
                (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).classList.remove("active");
        }
    },[props.selectedSinger._id]);

    useEffect(()=>{
        if(isDeleteSinger) {
            axios.get(`http://${settings.serverIpAddress}:5000/delete_singer/${deleteSingerId}`)
            setIsDeleteSinger(false);
        } else if(!isDeleteSinger && deleteSingerId !== '') {
            props.callbackDelete('singer', deleteSingerId);
        }
    },[isDeleteSinger]);

    // events

    const onMenuClick = () => {
        setExpand(!expand)
    }

    const onSingerClick = async (e: React.MouseEvent<HTMLDivElement>) => {
        let id = e.currentTarget.getAttribute('id');
        await axios.get(`http://${settings.serverIpAddress}:5000/get_singer/${id}`).then( 
            res => {
                let data = res.data as any;
                props.callbackSetSelectedSinger(data.data.singer[0])
                for(let i = 0; i < document.getElementsByClassName("singer-btn").length; i++) {
                    (document.getElementsByClassName("singer-btn")[i] as HTMLDivElement).classList.remove("active");
                }
                (e.target as HTMLDivElement).classList.add('active')
            }
        )
    }

    const onAddSingerClick = async () => {
        props.callbackSetSelectedSinger(empty_singer);
    }
    
    const onDeleteSingerClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        let id = (e.currentTarget.parentElement as HTMLDivElement).getAttribute('id')
        setDeleteSingerId(id as string)
        setIsDeleteSingerModalVisible(true)
        e.stopPropagation()
    }

    const onDeletedSingerYes = () => {
        setIsDeleteSinger(true)
        setIsDeleteSingerModalVisible(false);
    }

    const onDeletedSingerNo = () => {
        setIsDeleteSingerModalVisible(false);
    }

    let icon
    if(expand)
        icon = <DownOutlined />
    else
        icon = <UpOutlined />

    let menuList = props.singers.map((item: any, i: number) => {    
        let id = item._id;
        let name = item.firstname + " " + item.lastname
        if (id !== "") {
            return (<div id={id} key={i} className={props.selectedSinger._id === id ? "singer-btn active" : "singer-btn"} onClick={onSingerClick}>{name}<span title='Delete Singer' onClick={onDeleteSingerClick} className='delete-singer'><CloseOutlined /></span></div>);
        }
    })
    
    return (
        <div className='menu'>
            <div onClick={onMenuClick} className='menu-title'>{icon} Singers</div>
            <div className={expand ? 'menu-list show' : 'menu-list hide'}>
                <div className='add-btn' onClick={onAddSingerClick}>ADD NEW SINGER</div>
                {menuList}
            </div>
            <Modal title="Delete Singer." visible={isDeleteSingerModalVisible} className="delete-modal" footer={[<Button key="yes" type="primary" onClick={onDeletedSingerYes}> Yes </Button>, <Button key="no" onClick={onDeletedSingerNo}> No </Button>,]} onCancel={(e : any) => {e.stopPropagation(); setIsDeleteSingerModalVisible(false);}}>
                Do you want to delete this singer?
            </Modal>
        </div>
    );
}

export default SingersMenu;