import isSupportStorage from './isSupportStorage'
function removeSession(key){
    if(isSupportStorage()){
        sessionStorage.removeItem(key);
    }
}

export {removeSession}