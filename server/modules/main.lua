local nk = require("nakama");  -- lua script의 local은 java script의 let과 같다. require은 모듈을 가져오는 것이다.

local function match_create_func(context, payload)
    local limit = 1
    local authoritative = true -- 클라이언트에서 조종을 못하게 한다.
    local min_size = 0 
    local max_size = 3 -- 최대 3명, max_size + 1이 한 매치당 최대 들어갈 수 있는 인원이기 때문에 5명이 로그인하게 되면 새로운 매치가 생기게 된다.
    local label = nil -- null은 LuaScript에서는 nil이다.

    local matches = nk.match_list(limit, authoritative, label, min_size, max_size) -- 이미 생성된 매치 리스트 가져오기

    -- 이미 매치가 있다면 가장 사람 많은 매치 ID return
    if (#matches > 0) then -- LuaScript에서는 #이 length이다. 그리고 index는 0이 아닌 1부터 시작한다. 
        table.sort(matches, function(a, b)  -- 내림차순으로 정렬
            return a.size > b.size
        end)
        return matches[1].match_id
    end

    nk.logger_info("Hello, rpc!") -- 로그를 찍음 java script의 console.log()와 비슷한 기능이고 my-config.yml에서 로그 레벨을 warn에서 info로 바꾼뒤 서버를 재실행하면 logfile.log 파일이 생긴다.
    local module_name = "module_a"
    local params = {
        ["label"] = "module_a"
    }

    local match_id = nk.match_create(module_name, params) -- match_id를 리턴한다.
    
    return match_id -- client에서 match_id를 받게한다.
end

nk.register_rpc(match_create_func, "create_match_rpc")
