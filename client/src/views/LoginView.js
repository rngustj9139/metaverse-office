import { useState } from "react";
import { Client } from "@heroiclabs/nakama-js";

const LoginView = ({ setStep }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault(); // 페이지가 refresh되는 것을 막는다.
        // 나카마 서버와 프론트엔드 단을 연결한다.
        var useSSL = false; // production 모드에서는 SSL을 true로 하고 개발 단계에서는 false로 함
        var client = new Client("defaultkey", "127.0.0.1", "7350", useSSL);

        try {
            const session = await client.authenticateEmail(email, password, true, username)  // 로그인 후 응답으로 세션을 가져온다.
            // console.log('session', session);

            const socket = client.createSocket(); // 소켓은 채팅과 같은 실시간 처리에 사용된다. (nakama socket 이용)
            let appearOnline = true;
            let connectionTimeout = 30;

            await socket.connect(session, appearOnline, connectionTimeout);
            // console.log('socket result', socketResult);
            // const match = await socket.createMatch();
            // // console.log('match', match);

            // const matchId = match.match_id;
            // const result = await socket.joinMatch(matchId);
            // console.log('result', result);

            const { payload } = await socket.rpc('create_match_rpc') // 클라이언트에서 rpc 콜을 하면 서버쪽해서 해당 rpc id를 가지고있는 상태이면 특정한 값을 받을 수 있다. (payload안에 match id가 들어가있다.)

            const { match_id, self } = await socket.joinMatch(payload);
            window.pc.app.gameApp = {}; // 리엑트는 nakama Client의 클라이언트와 소켓을 통해 nakama server와 통신이 가능했음, 플레이 켄버스도 나카마 서버와 통신이 가능하게 하기위해 리엑트쪽에서 window객체 안에 client와 socket을 넣어서 플레이캔버스로 전달한다.(플레이캔버스의 캐릭터의 위치를 서버쪽으로 전달하기 위해서(sendMatchState를 통해) => 다른 브라우저가 접속해도 이전부터 존재해온 캐릭터의 위치가 변하는것을 볼 수 있다(움직이면))
            window.pc.app.gameApp.client = client;
            window.pc.app.gameApp.socket = socket;
            window.pc.app.gameApp.match_id = match_id;
            window.pc.app.gameApp.user = self; // self는 자기 자신(user)를 의미
            window.pc.app.gameApp.username = username; // username: state 변수값

            await socket.sendMatchState(match_id, 3, JSON.stringify({ user_id: self.user_id })); // 스폰에 관한 op code는 3 (클라이언트에서 스폰정보를 서버로 보내고 서버는 브로드캐스트로 모든 유저에게 각 유저에 대한 스폰정보를 다시 날린다.)

            setStep(1);
        } catch (error) {
            console.log('error', error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit} style={{ pointerEvents: 'auto' }}> {/* pointerEvents를 줘야지 브라우저에서 인풋창에 클릭을 할 수 있다. */}
                <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <input placeholder="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
                <button type="submit">로그인</button>
            </form>
        </div>
    )
}

export default LoginView