function getDomPosition(dom){
    return {
        left:dom.getBoundingClientRect().left+document.documentElement.scrollLeft,
        top:dom.getBoundingClientRect().top+document.documentElement.scrollTop
    }
}

module.exports={
    getDomPosition
}