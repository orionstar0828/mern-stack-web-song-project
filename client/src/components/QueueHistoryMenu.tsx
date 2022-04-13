import { DownOutlined, UpOutlined, CloseOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import axios from 'axios';
import settings from '../settings'

function QueueHistoryMenu(props: any) {

    // states

    const [expand, setExpand] = useState(true)
    const [isDeleteQueueHistory, setIsDeleteQueueHistory] = useState(false)
    const [isDeleteQueueHistoryModalVisible, setIsDeleteQueueHistoryModalVisible] = useState(false);
    const [deleteQueueHistoryId, setDeleteQueueHistoryId] = useState('')

    useEffect(()=>{
        if(isDeleteQueueHistory) {
            if(deleteQueueHistoryId !== '') {
                axios.get(`http://${settings.serverIpAddress}:5000/delete_queue_history/${deleteQueueHistoryId}`)
            } else {
                props.emptyCurrentQueue();
            }
            setIsDeleteQueueHistory(false);
        } else if(!isDeleteQueueHistory && deleteQueueHistoryId !== '') {
            props.callbackDelete('queue_history', deleteQueueHistoryId);
        }
    },[isDeleteQueueHistory]);

    // events

    const onMenuClick = () => {
        setExpand(!expand)
    }

    const onDeleteQueueHistoryClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        let id = (e.currentTarget.parentElement as HTMLDivElement).getAttribute('id')
        setDeleteQueueHistoryId(id as string)
        setIsDeleteQueueHistoryModalVisible(true)
        e.stopPropagation()
    }

    const onDeletedQueueHistoryYes = () => {
        setIsDeleteQueueHistory(true)
        setIsDeleteQueueHistoryModalVisible(false);
    }

    const onDeletedQueueHistoryNo = () => {
        setIsDeleteQueueHistoryModalVisible(false);
    }

    const onQueueHistoryClick = (e: React.MouseEvent<HTMLDivElement>) => {
        let title;
        let elem = e.currentTarget.getElementsByClassName('delete-queue-history')[0].innerHTML;
        if(e.currentTarget.getAttribute('id')) {
            title = e.currentTarget.innerHTML.replace(elem, '').replace('<span title="Delete Queue History" class="delete-queue-history"></span>', '')
        } else {
            title = e.currentTarget.innerHTML.replace(elem, '').replace('<span title="Delete Current Queue" class="delete-queue-history"></span>', '')
        }
        props.callbackSelectedItem(e.currentTarget.getAttribute('id'), title, 'queue_history');
        for(let i = 0; i < document.getElementsByClassName("node-btn").length; i++) {
            (document.getElementsByClassName("node-btn")[i] as HTMLDivElement).classList.remove("active");
        }
        e.currentTarget.classList.add("active");
    }

    let icon
    if(expand)
        icon = <DownOutlined />
    else
        icon = <UpOutlined />

    let menuList = props.queueHistory.map((item: any, i: number) => {    
        return (<div id={item} key={i} className={props.selectedItem._id === item ? 'node-btn active' : 'node-btn'} onClick={onQueueHistoryClick}>{item}<span title='Delete Queue History' onClick={onDeleteQueueHistoryClick} className="delete-queue-history"><CloseOutlined /></span></div>);
    })

    return (
        <div className='menu'>
            <div onClick={onMenuClick} className='menu-title'>{icon} Queue History</div>
            <div className={expand ? 'menu-list show' : 'menu-list hide'}>
                {menuList}
            </div>
            <Modal title="Delete Queue History." visible={isDeleteQueueHistoryModalVisible} className="delete-modal" footer={[<Button key="yes" type="primary" onClick={onDeletedQueueHistoryYes}> Yes </Button>, <Button key="no" onClick={onDeletedQueueHistoryNo}> No </Button>,]} onCancel={(e : any) => {e.stopPropagation(); setIsDeleteQueueHistoryModalVisible(false);}}>
                Do you want to delete this queue history?
            </Modal>
        </div>
    );
}

export default QueueHistoryMenu;