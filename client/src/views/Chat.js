import React from 'react'
import { useState, useEffect, useRef, useCallback } from "react";
import { socket, SocketContext } from "../service/socket";
import NicknameForm from "./NicknameForm";
import ChatRoom from "./ChatRoom";


const Chat = () => {
    const prevNickname = useRef(null); // prevNickname 변경은 컴포넌트를 리렌더링 하지않습니다.
    const [nickname, setNickname] = useState("김첨지");

    useEffect(() => { // 컴포넌트 unmount시 실행
        return () => {
            socket.disconnect();
        }
        }, []);

    useEffect(() => {
        if (prevNickname.current) {
            socket.emit("UPDATE_NICKNAME", { // 서버에는 이전 닉네임과 바뀐 닉네임을 전송해줍니다.
            prevNickname: prevNickname.current,
            nickname,
            });
        } else {
            socket.emit("JOIN_ROOM", { nickname });
        }
        }, [nickname]);

    const handleSubmitNickname = useCallback(newNickname => {
        prevNickname.current = nickname;
        setNickname(newNickname);
        },
        [nickname]
    );

    return (
    <SocketContext.Provider value={socket}>
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <NicknameForm handleSubmitNickname={handleSubmitNickname} />
        <ChatRoom nickname={nickname} />
      </div>
    </SocketContext.Provider>
    )
}

export default Chat