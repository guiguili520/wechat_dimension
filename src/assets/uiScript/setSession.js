import isSupportStorage from './isSupportStorage'
function setSession(key,val){
    if(isSupportStorage()){
        sessionStorage.setItem(key,val);
    }
}
export {setSession}