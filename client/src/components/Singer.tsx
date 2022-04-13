import React, { useEffect, useState } from 'react';
import axios from 'axios';
import settings from "../settings";
import { Input, Button } from 'antd';

function Singer(props: any) {

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [nickname, setNickname] = useState("");

    useEffect(() => {
        setFirstname(props.selectedSinger.firstname)
        setLastname(props.selectedSinger.lastname)
        setNickname(props.selectedSinger.nickname.replace(/@n@/g, '\n'))
    }, [props.selectedSinger]);

    async function onClickSinger(e: any) {
        if(firstname === '' || lastname === '') {
            alert('please input firstname or lastname');
            return;
        }
        if(props.selectedSinger._id === '') {
            await axios.get(`http://${settings.serverIpAddress}:5000/save_singer?firstname=${firstname}&lastname=${lastname}&nickname=${nickname}`).then( 
                res => {
                    let data = res.data as any;
                    props.callbackAddItem(data.data, "singer", "");
                    props.callbackSetSelectedSinger(data.data.singer, 'add')
                }
            )
        } else {
            let nickNameArr = nickname.split('\n');
            let nicknames = nickNameArr.join('@n@')
            await axios.get(`http://${settings.serverIpAddress}:5000/update_singer/${props.selectedSinger._id}?firstname=${firstname}&lastname=${lastname}&nickname=${nicknames}`).then( 
                res => {
                    props.callbackSetSelectedSinger({}, "update")
                }
            )
        }
    }

    function onFirstnameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFirstname(e.currentTarget.value)
    };

    function onLastnameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setLastname(e.currentTarget.value)
    };

    function onNicknameChange(e: any) {
        let nicknames = e.currentTarget.value;
        setNickname(nicknames)
    };

    let buttonTitle;
    if(props.selectedSinger._id)
        buttonTitle = "Update Singer";
    else
        buttonTitle = "Add Singer";
    return (
        <div className="singer-part">
            <div className="singer-part">
                <div className="main-title" style={{marginTop: 5, paddingBottom: 5}}>Singer Information</div>
                <div className="singer-wrap">
                    <div>
                        <div style={{marginBottom: 10}}>First Name: <Input name="firstname" placeholder="First Name" onChange={onFirstnameChange} value={firstname} style={{width: 'auto'}}/></div>
                        <div>Last Name: <Input name="lastname" placeholder="Last Name" onChange={onLastnameChange} value={lastname} style={{width: 'auto'}} /></div>
                    </div>
                    <div style={{display: 'flex'}}>
                        <div>Nick Name:</div> <div style={{width: '100%'}}><textarea style={{whiteSpace: 'pre-wrap', width: '100%', marginLeft: 5, height: 70, padding: '2px 5px', borderColor: '#ddd', borderRadius: 3}} placeholder="Nicknames" onChange={onNicknameChange} value={nickname}></textarea></div>
                    </div>
                    <div style={{textAlign: 'center', width: '100%'}}>
                        <Button className="singer-button" type="primary" onClick={onClickSinger}>{buttonTitle}</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Singer;