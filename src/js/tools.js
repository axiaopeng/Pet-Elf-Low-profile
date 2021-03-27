//内容提示, type: success or error or warning or info or DIY 
function ctxTip(obj){
    let tip = document.createElement('div');
    tip.style='padding:8px 12px;background-color: #ff8c3f;border-radius: 10px; color: #431307;  font-weight: 600; position: fixed;top:150px;left: 50%;transform: translateX(-50%);'    
    tip.style.color = '#fff';
    tip.innerText=obj.ctx
    switch(obj.type){
        case 'success':
            tip.style.backgroundColor = '#67C23A';
            break;
        case 'error':
            tip.style.backgroundColor = '#F56C6C';
            break;
        case 'warning':
            tip.style.backgroundColor = '#E6A23C';
            break;
        case 'info':
            tip.style.backgroundColor = '#909399';
            break; 
        case 'DIY':
            Object.keys(obj.style).forEach((item ,index) => {
                tip.style.item = Object.values[index]
            }) 
            break;
        default: 

    }
    document.body.append(tip)
    //提示的持续时间 obj.duration 控制
    setTimeout(()=>{
        document.body.removeChild(tip)
    },obj.duration?obj.duration:1500)
}