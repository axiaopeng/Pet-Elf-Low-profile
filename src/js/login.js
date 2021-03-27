let config = {
    local: 'http://127.0.0.1:7002'
}
window.onload = function(){
    let account = document.getElementById('account')
    let pwd = document.getElementById('pwd')
    let login_btn = document.getElementById('login_btn')

    let tip = document.createElement('div');
    let type = null;

    tip.style='padding:8px 12px;background-color: #ff8c3f;border-radius: 10px; color: #431307; border: 1px solid #e7501f; font-weight: 600; position: fixed;top:150px;left: 50%;transform: translateX(-50%);'    
    //检验函数 args1:dom元素 args2:类型
    function check(args1,args2){
       //校验长度
       switch(args2){
        case 'account':
            type = '账号'    
            if(args1.value.trim().length<4 || args1.value.trim().length>16){
                tip.innerText=`${type}的长度在4-16!!!`
                document.body.append(tip)
                setTimeout(()=>{
                    document.body.removeChild(tip)
                },1500)
                throw new Error(args2,'账号长度')
            }   
        break;
        case 'pwd':
            type = '密码' 
            if(args1.value.trim().length<6 || args1.value.trim().length>20){
                tip.innerText=`${type}的长度在6-20!!!`
                document.body.append(tip)
                setTimeout(()=>{
                    document.body.removeChild(tip)
                },1500)
                throw new Error(args2,'密码长度')
            }    
        break;
        }
        //校验空值    
        if(args1.value.trim()==""){
            tip.innerText=`${type}不能为空!!!`
            document.body.append(tip)
            setTimeout(()=>{
                document.body.removeChild(tip)
            },1500)
            throw new Error(args2,'为空')
        }
        //校验特殊字符
        if(!(new RegExp(/^[A-Za-z0-9]+$/)).test(args1.value.trim())){
            tip.innerText=`${type}不能出现特殊字符!!!`
            document.body.append(tip)
            setTimeout(()=>{
                document.body.removeChild(tip)
            },1500)
            throw new Error(args2,'出现特殊字符')
        }

    }
    // 监听登录按钮点击事件
    login_btn.addEventListener('click',async (e) => {
        try{
            check(account,'account')
            check(pwd, 'pwd')
            let res = await (await fetch(config.local+'/login',{
                method: "POST",
			    headers:{ 'Content-Type': 'application/json' },
                mode:'cors',
                body: JSON.stringify({
                    account: account.value.trim(),
                    pwd: pwd.value.trim(),
                })
            })).json();
            //登录成功，保存用户凭证
            if(res.status === 10001){
                sessionStorage.setItem('userCreds', res.creds)
                sessionStorage.setItem('roleId', 1)  //先测试写死角色id
                ctxTip({
                    type: 'success',
                    ctx: '登录成功！'
                })
                //跳转到游戏页面
                setTimeout(()=> {
                    window.location = './main.html'    
                },800)
            }else if(res.status === 20001){ //密码错误
                ctxTip({
                    type: "error",
                    ctx: res.message,
                })                
            }else{
                ctxTip({
                    type: "error",
                    ctx: '登录失败!',
                })
            }
        }catch(err){
            console.log("错误：",err)
        }

    },false)
}