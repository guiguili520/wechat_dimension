import isSupportStorage from './isSupportStorage'
function clearSession(){
    if(isSupportStorage()){
        sessionStorage.clear();
    }
}

export {clearSession}