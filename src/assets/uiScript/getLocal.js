import isSupportStorage from './isSupportStorage'
function getLocal(key){
    if(isSupportStorage()){
        return localStorage.getItem(key);
    }
}
export {getLocal}