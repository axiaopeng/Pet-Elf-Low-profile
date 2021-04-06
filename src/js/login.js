window.onload = function(){
    let account = document.getElementById('account');
    let pwd = document.getElementById('pwd');
    let review_pwd = document.getElementById('review_pwd');
    let chooseBoxI = document.getElementById('chooseBoxI');
    let chooseNum = 1;
    let roleAll = [{
        type: 1,
        roleName: '蚊香泳士'
    },{
        type: 2,
        roleName: '小火龙'
    },{
        type: 3,
        roleName: '可达鸭'
    },{
        type: 4,
        roleName: '臭泥'
    },{
        type: 5,
        roleName: '杰尼龟'
    },{
        type: 6,
        roleName: '皮卡丘'
    },{
        type: 7,
        roleName: '妙蛙种子'
    },]
    //登录模式下 登录按钮
    let login_btn = document.getElementById('login_btn');
    //登录模式下 注册按钮
    let register_btn = document.getElementById('register_btn');

    //注册模式下 注册按钮
    let reg_btn = document.getElementById('reg_btn');
    //注册模式下 返回登录按钮
    let return_btn = document.getElementById('return_btn');
    
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
    //确认密码失去焦点监听事件
    review_pwd.addEventListener('blur',(e) => {
        if(review_pwd.value !== document.getElementById('reg_pwd').value){
            ctxTip({
                type: "error",
                ctx: '两次密码不一致',
            }) 
        }
    })
    // 监听登录按钮点击事件
    login_btn.addEventListener('click',async (e) => {
        try{
            check(account,'account')
            check(pwd, 'pwd')
            let res = await (await fetch(config.localInit+'/login',{
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
                //一、显示选择角色框
                document.getElementById('chooseBoxO').style.display = 'block';
                ctxTip({
                    type: 'success',
                    ctx: '登录成功！'
                })
                //二、登录返回所有角色 ，无角色则需先创建
                setTimeout(()=>{
                    document.getElementById('chooseBoxI').style.width= '620px'
                },0)
                setTimeout(()=>{
                    chooseBoxI.style.height= '520px'
                },0)
                //将角色渲染进去
                if(res.roles.length){
                    res.roles.forEach(item => {
                        showRole(item,{type:1,...res})
                    });
                }
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
    //显示可选角色函数
    function showRole(item,res){
        let role = document.createElement('div')
        role.id = 'roleid-' + item.id;
        if(res&&res.lastRoleId&&item.id === res.lastRoleId){
            sessionStorage.setItem('roleId', item.id)  //首次角色id赋值，预防没有选择角色情况
            role.className = 'roleCard active';
        }else{
            role.className= 'roleCard'
        }
        role.innerHTML = `
            <div class="roleImg"></div>
            <div class="roleName"></div>`
        role.getElementsByClassName('roleImg')[0].style.background = `url(./roleImg/${parseInt(Math.ceil(Math.random()*7))}.png) no-repeat`;
        role.getElementsByClassName('roleImg')[0].style.backgroundSize = '384px auto';
        role.getElementsByClassName('roleName')[0].innerText = item.role_name;
        document.getElementsByClassName('roleCards')[0].insertBefore(role, document.getElementById('addRole'))
        //监听选中角色事件
        role.addEventListener('click', function(e){
            if(document.getElementsByClassName('active').length){
                document.getElementsByClassName('active')[0].className = 'roleCard';
            }
            this.className = 'roleCard active';
            sessionStorage.setItem('roleId', this.id.split('-')[1])  //选中时重新存储角色id
        },false)
        if(res&&res.type===2){
            if(document.getElementsByClassName('active').length){
                document.getElementsByClassName('active')[0].className = 'roleCard';
            }
            role.className = 'roleCard active';
            sessionStorage.setItem('roleId', item.id)  //选中时重新存储角色id
        }
    } 
    //监听进入游戏按钮
    document.getElementById('enterGame').addEventListener('click',()=> {
        //先判断是否有角色和已选中角色
        if(document.getElementsByClassName('roleCard').length&&sessionStorage.getItem('roleId')){
            ctxTip({
                type: "success",
                ctx: '正在进入...',
            })  
            //进入游戏页面
            setTimeout(() => {
                window.location = './main.html'
            }, 1000)
        }else{
            ctxTip({
                type: "error",
                ctx: '请先选择一个角色!',
            })
        }
    },false)

    //注册模式下 注册按钮
    reg_btn.addEventListener('click', async (e) => {
        try{
            if(review_pwd.value !== document.getElementById('reg_pwd').value){
                ctxTip({
                    type: "error",
                    ctx: '两次密码不一致',
                })
                return; 
            }
            check(document.getElementById('reg_account'),'account')
            check(document.getElementById('reg_pwd'), 'pwd')
            let res = await (await fetch(config.localInit+'/register',{
                method: "POST",
			    headers:{ 'Content-Type': 'application/json' },
                mode:'cors',
                body: JSON.stringify({
                    account: document.getElementById('reg_account').value.trim(),
                    pwd: document.getElementById('reg_pwd').value.trim(),
                })
            })).json();
            //注册成功
            if(res.status === 10004){
                sessionStorage.setItem('userCreds', res.creds)
                sessionStorage.setItem('roleId', 1)  //先测试写死角色id
                ctxTip({
                    type: 'success',
                    ctx: '注册成功！'
                })
                //改为登录模式
                setTimeout(()=> {
                    document.getElementById('reg_account').value = '';
                    document.getElementById('reg_pwd').value = '';
                    review_pwd.value = '';
                    document.getElementById('loginForm').style.display = 'block';
                    document.getElementById('registerForm').style.display = 'none';
                },800)
            }else if(res.status === 20002){ //注册失败，账号已存在
                ctxTip({
                    type: "error",
                    ctx: res.message,
                })                
            }else{                          //其他注册失败原因
                ctxTip({
                    type: "error",
                    ctx: '注册失败!',
                })
            }
        }catch(err){
            console.log("错误：",err)
        }
    },false)
    //监听切换按钮点击事件
    register_btn.addEventListener('click', () => {
        document.getElementById('loginForm').style.display = 'none'
        document.getElementById('registerForm').style.display = 'block'
    },false)
    return_btn.addEventListener('click', ()=> {
        document.getElementById('reg_account').value = '';
        document.getElementById('reg_pwd').value = '';
        review_pwd.value = '';
        document.getElementById('loginForm').style.display = 'block'
        document.getElementById('registerForm').style.display = 'none'
    },false)

    //切换角色
    document.getElementsByClassName('leftBtn')[0].addEventListener('click', () => {
        chooseNum--;
        if(chooseNum<1){
            chooseNum = 7;
        }
        document.querySelector('.centerCtx>.roleImg').style.background= `url(./roleImg/${chooseNum}.png) no-repeat`
        document.querySelector('.centerCtx>.roleName').innerText = roleAll[chooseNum-1].roleName
    })
    document.getElementsByClassName('rightBtn')[0].addEventListener('click', ()=> {
        chooseNum++;
        if(chooseNum>7){
            chooseNum = 1;
        }
        document.querySelector('.centerCtx>.roleImg').style.background= `url(./roleImg/${chooseNum}.png) no-repeat`
        document.querySelector('.centerCtx>.roleName').innerText = roleAll[chooseNum-1].roleName
    })
    //显示选择角色框
    document.getElementById('addRole').addEventListener('click', () => {
        document.getElementById('chooseRole').style.visibility='visible';
    })
    //关闭选择角色框
    document.querySelector('.chooseRole>.close').addEventListener('click', () => {
        document.getElementById('chooseRole').style.visibility='hidden';
    })
    //创建角色
    document.getElementById('createRole').addEventListener('click',async () => {
        let roleName = document.getElementById('roleNameInp').value.trim();
        if(roleName == null||roleName == ''){
            ctxTip({
                type: 'error',
                ctx: '请输入角色名称！'
            })
            return 
        }
        let res = await (await fetch(config.localInit+'/user/createRole',{
            method: "POST",
            headers:{ 'Content-Type': 'application/json' },
            mode:'cors',
            body: JSON.stringify({
                creds:  sessionStorage.getItem('userCreds'),
                type: chooseNum,
                roleName: document.getElementById('roleNameInp').value.trim(),
            })
        })).json();
        if(res.status === 20003){
            ctxTip({
                type: 'error',
                ctx: '该角色名称已存在，请重新输入！'
            })
        }else if(res.status === 10005){
            ctxTip({
                type: 'success',
                ctx: '创建成功！'
            })
            showRole(res.data,{type:2})
            document.getElementById('chooseRole').style.visibility='hidden';
            document.getElementById('roleNameInp').value = "";

        }
    })
}