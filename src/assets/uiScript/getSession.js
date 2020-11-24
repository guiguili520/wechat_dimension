import isSupportStorage from './isSupportStorage'
function getSession(key){
    if(isSupportStorage()){
        return sessionStorage.getItem(key);
    }
}
export {getSession}