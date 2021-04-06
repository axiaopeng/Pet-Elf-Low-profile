//该项目采用fetch为唯一请求手段
async function Fetch(obj){
    //如果参数中没有returnWay字段,统一返回json格式数据
    if(obj.loading){
        document.querySelector('#reqLoad').style.width = '100vw'
    }
    let Url = config.localInit+obj.url;
    let res = null;
    if(!obj.returnWay){
        res = await(await fetch(Url,{
            method: obj.method?obj.method:'GET',
            headers: obj.headers?obj.headers:{ 'Content-Type': 'application/json' },
            mode: obj.mode?obj.mode: 'cors',
            body: obj.body?JSON.stringify(obj.body):'',
        })).json();
    }
    document.querySelector('#reqLoad').style.width = 0
    //状态处理
    switch(res.status){
        default:
            return res
    }
}


