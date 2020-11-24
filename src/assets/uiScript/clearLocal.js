import isSupportStorage from './isSupportStorage'
function clearLocal(){
    if(isSupportStorage()){
        localStorage.clear();
    }
}
export {clearLocal} 