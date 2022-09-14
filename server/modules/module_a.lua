local nk = require("nakama");
local M = {}

OP_CODE_POSITION = 1
OP_CODE_INITIAL_DATA = 2
OP_CODE_PLAYER_SPAWN = 3

local function on_player_move(context, dispatcher, tick, state, message) 
    local player = state.presences[message.sender.session_id]
    if player == nil then
        return
    end

    local ok, decode_data = pcall(nk.json_decode, message.data) -- message.data는 플레이어의 position값이고 이 데이터를 안전하게 받아오기 위해 pcall을 수행한다.

    if not ok then
        nk.session_disconnect(message.sender.session_id)
        return
    end

    player.info["position"] = decode_data.position;
    dispatcher.broadcast_message(OP_CODE_POSITION, message.data) -- 서버로들어온 postion 데이터를 다른 클리아언트들에게 보내준다.
end

local function on_player_spawn(context, dispatcher, tick, state, message)
    local player = state.presences[message.sender.session_id]
    if player == nil then
        return
    end

    dispatcher.broadcast_message(OP_CODE_PLAYER_SPAWN, message.data)
end

function M.match_init(context, initial_state)
    local state = {
        presences = {}, -- 유저들이 접속할때마다 유저를 presences에 넣는다.
        empty_ticks = 0
    }
    local tick_rate = 30 -- 1 tick per second = 1 MatchLoop func invocations per second
    local label = ""

    return state, tick_rate, label
end

function M.match_join_attempt(context, dispatcher, tick, state, presence, metadata)
    local acceptuser = true
    return state, acceptuser
end

function M.match_join(context, dispatcher, tick, state, presences)
    for _, presence in ipairs(presences) do -- presence는 유저가 스폰되면 얻어지는 데이터이다.(유저 데이터), 배열의 forloop는 ipairs사용, 객체의 forloop는 pairs사용

        state.presences[presence.session_id] = presence
        state.presences[presence.session_id].info = {
            user_id = presence.user_id,
            position = { 0, 3, 0 }
        }
    end

    -- 두번째로 접속한 사용자는 첫번째로 접속한 사용자를 볼 수가 없다.(반대는 가능) 그래서 두번째로 접속한 사용자에게 서버가 이전에 들어온 유저들의 spawn정보를 보내준다.
    local player_infos = {} -- 배열을 만듦
    for _, p in pairs(state.presences) do
        table.insert(player_infos, p.info)
    end

    local player_init_data = {
        players = player_infos,
        tick = tick
    }

    dispatcher.broadcast_message(OP_CODE_INITIAL_DATA, nk.json_encode(player_init_data), presences) -- 모든 클라이언트들에게 전송

    return state
end

function M.match_leave(context, dispatcher, tick, state, presences)
    for _, presence in ipairs(presences) do
        state.presences[presence.session_id] = nil
    end

    return state
end

function M.match_loop(context, dispatcher, tick, state, messages) -- 매 틱마다 실행되는 함수이다.
    for _, message in ipairs(messages) do -- messages 안에 플레이켄버스에서 보낸 sendMatchState 정보가 들어있다. print는 luaScript의 console.log이다. (매틱마다 메세지가 들어온다.)
        if (message.op_code == OP_CODE_POSITION) then -- OP_CODE_POSITION는 상수이다. (1이다. => 움직이는것에 대한 함수를 호출한다는 의미이다.)
            local ok = pcall(on_player_move, context, dispatcher, tick, state, message) -- 루아스크립트에서 함수를 호출할려면 pcall을 쓰는게 좋다. (에러나 성공결과를 표시해준다.) (실행하려는 함수는 on_player_move이다.)
            if not ok then
                nk.session_disconnect(message.sender.session_id) -- 함수가 잘 실행이 안되면 세션을 끊어버린다.(메세지를 보낸사람의 세션을 끊는다.)
            end
        end
        if (message.op_code == OP_CODE_PLAYER_SPAWN) then
            local ok = pcall(on_player_spawn, context, dispatcher, tick, state, message)
            if not ok then
                nk.session_disconnect(message.sender.session_id)
            end
        end
    end

    return state
end

function M.match_terminate(context, dispatcher, tick, state, grace_seconds)
    return state
end

function M.match_signal(context, dispatcher, tick, state, data)
    return state, data
end

return M
