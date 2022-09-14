import { useEffect, useRef, useState } from "react";
import Chat from "./Chat";

const PlayView = () => {
    const [isHit, setIsHit] = useState(false);
    const setTimeOutRef = useRef(null); // Box is hitted!!!를 2초정도만 띄우고 싶을때 사용하는 변수
 
    const gameApp = window.pc.app.gameApp;
    if (!gameApp.playerMap) { // 이미 접속한 사람이 없다면 Map 컬렉션을 새로 만듦
        gameApp.playerMap = new Map();
    }

    const OP_CODE_POSITION = 1;
    const OP_CODE_INITIAL_DATA = 2;
    const OP_CODE_PLAYER_SPAWN = 3;

    useEffect(() => {
        if (!gameApp) return; // 로그인하기 전에는 실행되면 안된다.
        gameApp.socket.onmatchdata = (matchState) => { // 서버에서 클라이언트로 브로드캐스트를 통해 보내준 player의 position 데이터는 socket.onmatchdata를 통해 받을 수 있다.
            let jsonResult = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(matchState.data))) // position 값을 잘 읽을 수 있게함
            switch (matchState.op_code) {
                case OP_CODE_POSITION:
                    onPlayerMove(jsonResult)
                    break;
                case OP_CODE_INITIAL_DATA:
                    onHandleInitialData(jsonResult)
                    break;
                case OP_CODE_PLAYER_SPAWN:
                    onPlayerSpawn(jsonResult)
                    // 나의 플레이어 스폰
                    // 전에 들어온 사람 x
                    // 내 이후에 들어온 상대방 
                    break;
                default:
                    break;
            }
        }

        gameApp.socket.onmatchpresence = (matchPresence) => {
            console.log('matchPresence', matchPresence);
            const match_id = matchPresence.match_id;
            const leaves = matchPresence.leaves;
            const joins = matchPresence.joins;

            if (leaves && leaves.length > 0) {
                leaves.forEach(player => destroyPlayer(player.user_id));
            }
        }

    }, [])

    const destroyPlayer = (user_id) => {
        const playerMap = gameApp.playerMap;
        const playerEntity = playerMap.get(user_id);
        if (playerEntity) {
            playerMap.delete(user_id);
            setTimeout((p) => {
                p.destroy();
            }, 0, playerEntity);
        }
    }

    const onHandleInitialData = (data) => { // 두번째로 접속한 사람이 이전에 접속한 사람들을 스폰하게한다.
        const myAccountId = gameApp.user.user_id;
        for (const player of data.players) {
            if (myAccountId === player.user_id) {
                continue;
            }
            setTimeout(() => {
                onPlayerSpawn(player);
                // 나보다 전에 들어온 상대방 플레이어 스폰
            }, 500);
        }
    };

    const onPlayerSpawn = (data) => {
        // if(window.pc.app.gameApp.user.user_id === data.user_id) {}
        let playerEntity = window.pc.app.root.findByName("Player");
        let newPlayerEntity = playerEntity.clone(); // 캐릭터 에셋 생성

        if (data.position) { // 서버에서 지정한 좌표값이 있으면 수행됨
            let position = data.position;
            newPlayerEntity.rigidbody.teleport(position[0], position[1], position[2]);
        } else {
            newPlayerEntity.rigidbody.teleport(0, 5, 0);
        }

        newPlayerEntity.tags.clear();
        newPlayerEntity.tags.add(data.user_id);

        newPlayerEntity.enabled = true;
        let sceneRoot = window.pc.app.root.findByName("Root");
        sceneRoot.addChild(newPlayerEntity);

        gameApp.playerMap.set(data.user_id, newPlayerEntity);
    }

    const onPlayerMove = (data) => {
        // 자신의 데이터는 무시해주기 
        if (data.user_id === gameApp.user.user_id) return;
        const position = data.position;
        const playerEntity = window.pc.app.gameApp.playerMap.get(data.user_id);
        const vectorPosition = new window.pc.Vec3(position[0], position[1], position[2]);
        // 상대방을 움직여주기
        if (playerEntity) {
            playerEntity.script.pointAndClick.movePlayerTo(vectorPosition)
        }
    }

    useEffect(() => {
        window.pc.app.on("boxHit", listener);
        return () => {
            window.pc.app.off("boxHit", listener);
        }
        //   window.addEventListener("message", listener)

        //   return () => {
        //     window.removeEventListener("message", listener);
        //   }
    }, [])

    const listener = (event) => {
        // if (event.origin !== "http://localhost:3000")
        //   return;
        clearTimeout(setTimeOutRef.current);
        setIsHit(true);
        setTimeOutRef.current = setTimeout(() => {
            setIsHit(false);
        }, 30000);
    }

    return (
        <div>
            {/* {isHit && <div className='Popup'>Touched!!!</div>} */}
            {isHit && <Chat />}
        </div>
    )
}

export default PlayView