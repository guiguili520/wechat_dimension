import isSupportStorage from './isSupportStorage'
function removeLocal(key){
    if(isSupportStorage()){
        localStorage.removeItem(key);
    }
}

export {removeLocal}