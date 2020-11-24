import getDomPosition from './getDomPosition'
function magnifyGlass(arg){
            //默认参数
            var def={
                width:200,
                mulriple:2,
                position:'right'
            };
            var opt=Object.assign({},arg,def);
            
            var target=document.getElementById(opt.id);
            if(target.style.position==''){
                target.style.position='relative';
            }
            
            target.style.background="url("+opt.img+") no-repeat";
            target.style.backgroundSize="100%";
            //滤镜
            function Glass(target,opt){
                var gls=document.createElement('div');
                gls.style.width=opt.width+'px';
                gls.style.height=opt.width+'px';
                gls.style.position='absolute';
                gls.style.background='#fff';
                gls.style.opacity=0.6;
                gls.style.filter='alpha(opacity=60)';
                gls.style.display='none';
                gls.style.cursor='crosshair';
                
                target.appendChild(gls);
                //获取边界
                var limitX=target.clientWidth;
                var limitY=target.clientHeight;
                target.addEventListener('mouseenter',function(){
                    showGlass.show();
                })
                //target区域添加mousemove事件
                 target.addEventListener('mousemove',function(e){
                    
                    if(e.target==target){
                        gls.style.display='block';
                        //左右边界
                        if(e.offsetX-opt.width/2<=0){
                            gls.style.left=0;
                        }else if(e.offsetX>=limitX-opt.width){
                            gls.style.left=limitX-opt.width+'px';
                        }else{
                            gls.style.left=e.offsetX-opt.width/2+'px';
                        }
                        
                        gls.style.top=e.offsetY-opt.width/2+'px';
                    }else{
                       
                        if(e.offsetX-opt.width/2+parseInt(e.target.style.left)<=0){
                            gls.style.left=0;
                        }else if(e.offsetX+parseInt(e.target.style.left)>=limitX-opt.width/2){
                            gls.style.left=limitX-opt.width+'px';
                        }else{
                            e.target.style.left=e.offsetX-opt.width/2+parseInt(e.target.style.left)+'px';
                        }
                        //上下边界
                        if(e.offsetY-opt.width/2+parseInt(e.target.style.top)<=0){
                            gls.style.top=0;
                        }else if(e.offsetY+parseInt(e.target.style.top)>=limitY-opt.width/2){
                            gls.style.top=limitY-opt.width+'px';
                        }else{
                            e.target.style.top=e.offsetY-opt.width/2+parseInt(e.target.style.top)+'px';
                        }
                       
                    }
                    showGlass.changePosition(parseInt(e.target.style.left),parseInt(e.target.style.top));
                });
                //target添加mouseleave事件
                target.addEventListener('mouseleave',function(){
                    gls.style.display='none';
                    showGlass.hide();
                })
            }
            //显示区域
            function ShowPlace(target,opt){
                var position=getDomPosition(target);
                var showPlace = document.createElement('div');
                document.body.appendChild(showPlace);
                showPlace.style.width=opt.width*opt.mulriple+'px';
                showPlace.style.height=opt.width*opt.mulriple+'px';
                showPlace.style.position='absolute';
                showPlace.style.display='none';
                showPlace.style.left=position.left+target.clientWidth+5+'px';
                showPlace.style.top=position.top+'px';
                showPlace.style.border="1px solid #ddd";
                showPlace.style.backgroundImage="url("+opt.img+")";
                showPlace.style.backgroundPosition="0px 0px";
                showPlace.style.backgroundRepeat="no-repeat";
                showPlace.style.backgroundSize=opt.mulriple*target.clientWidth+'px';

                this.changePosition=function(x,y){
                
                    showPlace.style.backgroundPosition='-'+opt.mulriple*x+'px -'+opt.mulriple*y+'px';
                }
                this.hide=function(){
                    showPlace.style.display='none';
                }
                this.show=function(){
                    showPlace.style.display='block';
                }
            }
            var showGlass= new ShowPlace(target,opt);
            new Glass(target,opt);
}
export {magnifyGlass}