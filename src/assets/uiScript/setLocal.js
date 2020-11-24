import isSupportStorage from './isSupportStorage'
function setLocal(key,val){
    if(isSupportStorage()){
        localStorage.setItem(key,val);
    }
}

export {setLocal}