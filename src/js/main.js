window.onload = async function(){

  //(args1, args2), y轴起点, y轴层数
  let globalConfig = {
    limitArea:[{
      area: [ 0, 40, 20, 30],
      backgroundColor: "#fff"
    }, {
      area: [ 80, 100, 20, 10],
      backgroundColor: "#eee"
    }, {
      area: [ 240, 180, 50, 100],
      backgroundColor: "blue"
    }, {
      area: [ 400, 400, 200, 100],
      backgroundColor: "red"
    }, {
      area: [ 600, 100, 50, 50],
      backgroundColor: "#e3e3e3"
    }, {
      area: [ 400, 100, 90, 50],
      backgroundColor: "#e3e3e3"
    }, {
      area: [ 500, 100, 40, 50],
      backgroundColor: "#e3e3e3"
    }, {
      area: [ 50, 300, 50, 100],
      backgroundColor: "#e3e3e3"
    }, {
      area: [ 150, 400, 200, 80],
      backgroundColor: "#e3e3e3"
    }],
    entrance: [{
      area: [540,100,60,50],
      backgroundColor: '#000',
    },{
      area: [1000,600,50,50],
      backgroundColor: '#eee',
    }]
  }
  this.gl = new globalCreate(globalConfig)
  this.glUsers = {};
  //初始化 当前用户 人物数据 
  initMyself(); //目前未返回对象

  //初始化 当前用户 人物数据、人物事件 ,先决条件 globalConfig.limitArea 存在 
  async function initMyself(){
    let res = await Fetch({
      url: '/user/myself',
      method: 'POST',
      body:{
        userCreds: sessionStorage.getItem('userCreds'),
        roleId: sessionStorage.getItem('roleId'),
      }
    })
    if(res.status === 10002){
      this.glUsers.myself = new roleCreate({
        ...res.data,
        limitArea: globalConfig.limitArea.map(item => item.area)  //可以每个地图重新赋值,减少编译器压力
      })
      //地图定位当前位置
      window.gl.mapX = this.glUsers.myself.positionX - 200;
      document.getElementById('map').style.marginLeft = -window.gl.mapX +"px"
      window.gl.mapY = this.glUsers.myself.positionY -100;
      document.getElementById('map').style.marginTop = -window.gl.mapY +"px"
      
      this.glUsers.myself.initSocket();
    }else{
      ctxTip({
        type: 'error',
        ctx: '获取角色信息失败，请重新登录！'
      })
      setTimeout(() => {
        window.location = './login.html'
      }, 1000)
    }

    let moveControl = true  //控制移动频率
    //当前人物键盘按下事件keydown初始化
    window.addEventListener('keydown',function(e){ 
      //对话输入框 
      let box = document.querySelector('#chatInputBox')
      //控制人物模块监听， 使用了 key 37、38、39、40
      if(moveControl){
        moveControl = false
        setTimeout(() => {
          switch(e.keyCode){
            case 37:
              glUsers.myself.move('left')
              break; 
            case 38:
              glUsers.myself.move('up')
              break;
            case 39:
              glUsers.myself.move('right')
              break;
            case 40:
              glUsers.myself.move('down')
              break;              
          }
          moveControl = true
        },100)
      }
      //控制对话框  Ctrl + Enter   
      if(13 === e.keyCode && e.ctrlKey){
        glUsers.myself.status = 1;   //开启对话状态
        box.style.display = 'block';
        box.children[0].focus();
      }
      // 按ESC
      if(27 === e.keyCode){
        glUsers.myself.status = 0; //恢复普通状态
        box.style.display = 'none'
      }
      //发送信息   shift+enter
      if(13 === e.keyCode && e.shiftKey){
        glUsers.myself.ws.emit('dialogBoxMessage',{
          message: document.getElementById('inputTextarea').value
        })
        glUsers.myself.dialogBox(document.getElementById('inputTextarea').value);
      }
    })
    //监听进度保存事件按钮, 只更新坐标
    document.querySelector('#saveProg').addEventListener('click',async () => {
      let res = await Fetch({
        url: '/user/updateMyself',
        method: 'POST',
        body: {
          userCreds: sessionStorage.getItem('userCreds'),
          roleId: sessionStorage.getItem('roleId'),
          positionX: glUsers.myself.positionX,
          positionY: glUsers.myself.positionY,
        },
        // loading: true,
      })
      if(res.status === 10003){
        glUsers.myself.ws.emit('quit')
        ctxTip({
          type: 'success',
          ctx: '保存成功，即将退出！'
        })
        setTimeout(() => {
          window.location = './login.html'
        },2000)
      }
    })
    //监听页面因为外部元素导致页面关闭 消失 触发退出事件
    window.onbeforeunload = function(event) {
      glUsers.myself.ws.emit('quit')
    };
    return glUsers.myself
  }


}

//角色构造函数
function roleCreate(initObj){
  this.name = initObj.name  //名称
  this.positionX = initObj.positionX || 0;  // 初始坐标X轴
  this.positionY = initObj.positionY || 0;  // 初始坐标Y轴
  this.limitArea = initObj.limitArea || [];
  //使用构造函数时初始化
  this.init()
}

// 角色原型
roleCreate.prototype = {
  //初始化
  init:function(){
    this.role = document.createElement('div')
    this.role.style = `position: absolute;top:${this.positionY}px;left:${this.positionX}px;width:48px;height:42px; background:url(./roleImg/${parseInt(Math.ceil(Math.random()*7))}.png) no-repeat;background-position:0 0`
    let nameDiv = document.createElement('div')
    nameDiv.innerText = this.name
    nameDiv.style = `width: 80px;text-align: center;position:absolute;top:-15px;font-size: 12px;left:-16px`

    this.role.id = 'mainRole'
    this.role.append(nameDiv)
    let map =  document.getElementById('map')
    map.append(this.role);

    //默认参数 ，需要判断是自己还是其他人， 不需要给其他人一些不需要的资源
       //默认角色状态0为普通状态， 1为对话状态 ，
    this.status = 0  
       //默认角色坐标Y轴
    this._positionY = parseInt(this.role.style.top.substr(0, this.role.style.top.length - 2));
       //默认角色坐标X轴
    this._positionX = parseInt(this.role.style.left.substr(0, this.role.style.left.length - 2));
    this.moveSpeedX = 12     //精灵图X轴移动间距
    this.moveSpeedY = 8      //精灵图Y轴移动间距
    this.lastMove = 'down'   //移动方向 默认 down
    this.moveNum = 0         //第一次默认触发次数
    //监听角色坐标 关联到 下副地图入口
    Object.defineProperties(this,{   
       'positionX':{
         configurable:true,//属性可配置
         set: function(v){
           if(this.positionX -v<0){
             this.lastMove = 'right' 
           }else if(this.positionX -v>0){
             this.lastMove = 'left'
           }
           this._positionX = v;
           if(this.limitArea.length){
            //在这里进行页面跳转
             window.gl.entrance.some(item => {
             if(this.positionX>item.area[0]&&this.positionX<(item.area[0]+item.area[2]-32)&&this.positionY>item.area[1]&&this.positionY<(item.area[1]+item.area[3]-24)){
               document.querySelector('#loading').style.display= 'block'
             }
             })
            // 在这里进行地图移动X
             if(this.positionX-window.gl.mapX > 700){  //往右走
             window.gl.mapX += this.moveSpeedX
             map.style.marginLeft = -window.gl.mapX +"px"
             }  
             if(this.positionX - window.gl.mapX < 100){   //往左走
             window.gl.mapX -= this.moveSpeedX
             map.style.marginLeft = -window.gl.mapX +"px"
             }
             //在这里关联socket
             this.ws.emit('behavior',{
               positionX: v
             })          
           }
         },
         get: function(){
           return this._positionX;
         }
       },
       "positionY":{
         configurable:true,//属性可配置
         set: function(v){
           if(this.positionY - v>0){
             this.lastMove = 'up' 
           }else if(this.positionY - v<0){
             this.lastMove = 'down'
           }
           this._positionY = v;
           if(this.limitArea.length){
             //在这里进行页面跳转
             window.gl.entrance.some(item => {
             if(this.positionX>item.area[0]&&this.positionX<(item.area[0]+item.area[2]-32)&&this.positionY>item.area[1]&&this.positionY<(item.area[1]+item.area[3]-24)){
               document.querySelector('#loading').style.display= 'block'
             }
             })
             // 在这里进行地图移动
             if(this.positionY-window.gl.mapY>500){  //往下走
             window.gl.mapY += this.moveSpeedY
             map.style.marginTop = -window.gl.mapY +"px"
             }  
             if(this.positionY - window.gl.mapY < 100){   //往上走
             window.gl.mapY -= this.moveSpeedY
             map.style.marginTop = -window.gl.mapY +"px"
             }
             //在这里关联socket
             this.ws.emit('behavior',{
               positionY: v
             })          
           }
         },
         get: function(){
           return this._positionY;
         }
       },
    }) 
  },
  //初始化gl-socket
  initSocket: function(){
      //即时连接 联机关键 this.ws
      this.ws = io('ws://127.0.0.1:7001/glSocket',{query: {
        userCreds: sessionStorage.getItem('userCreds'),
        X: this.positionX,
        Y: this.positionY,
      }})
      // 渲染范围内其他人 初始化   +-1000 内的其他人
      this.ws.on('init',async (res) => {
        if(res.others&&res.others.length){
          await this.ws.emit('initInOther') //用个很奇怪的方式触发其他人初始化 我

          let glUsers2 = {}
          res.others.forEach(item => {
            if(glUsers[item.id]){
              document.getElementById('map').removeChild(glUsers[item.id].role)  //html中移除DOM元素
            }
            glUsers2[item.id] = new roleCreate({
              name: item.role_name,
              positionX: item.position_x,
              positionY: item.position_y,
            })
          })
          glUsers = {                       //每次重连之前只留自己
            myself: glUsers.myself,
            ...glUsers2
          }

        }
      })
      //其他人进入 初始化 他
      this.ws.on('otherEnter', (res) => {
        if(glUsers[res.id]){
          document.getElementById('map').removeChild(glUsers[res.id].role)  //html中移除DOM元素
        }
        glUsers[res.id] = new roleCreate({
          name: res.role_name,
          positionX: res.position_x,
          positionY: res.position_y,
        })
      })
      //其他人退出 删除 他
      this.ws.on('otherQuit',(res) => {
        document.getElementById('map').removeChild(glUsers[res.roleid].role)  //html中移除DOM元素
        delete glUsers[res.roleid]                                            //js中删除对应的角色对象
      })

      this.ws.on('behavior', res => {
        glUsers[res.id].positionX = res.position_x
        glUsers[res.id].positionY = res.position_y
        glUsers[res.id].move(glUsers[res.id].lastMove,'fromDefine')
      })
      this.ws.on('dialogBoxMessage', res => {
        console.log(glUsers[res.roleid])
        console.log('test', res)
        glUsers[res.roleid].dialogBox(res.message)
      })
      this.ws.on('disconnect',res => {
        console.log('socket连接中断',res)
      })
      this.ws.on('error', err => { 
        console.log('socket连接中发送错误',error)
      })
  },
  // 移动
  move:function(type,way){
    //判断角色状态
    if(this.status!=0) return
    //判断角色可以移动方向
    let limitArr = [];   //存放限制方向z
    this.limitArea.forEach(item => {
      //在x轴限制范围内
      if(this.positionX>(item[0]-40)&&this.positionX<(item[0]+item[2])){
        if(this.positionY>=(item[1]+item[3])&&this.positionY-(item[1]+item[3]) < this.moveSpeedY){
          //不能往上
          limitArr.push('up')
        }
        if(this.positionY<=(item[1]-42)&&this.positionY-(item[1]-42)>=-this.moveSpeedY){
          //不能往下
          limitArr.push('down')
        }
      }
      //在y轴限制范围内
      if(this.positionY>(item[1]-42)&&this.positionY<(item[1]+item[3])){
        if(this.positionX>item[0]&&this.positionX-(item[0]+item[2])<this.moveSpeedX){
          //不能往左
          limitArr.push('left')
        }
        if(this.positionX<=(item[0]-40)&&this.positionX-(item[0]-40)>=-this.moveSpeedX){
          //不能往右
          limitArr.push('right')
        }
      }
    })
    if(limitArr.indexOf(type)>-1) return;
    switch(type){
      case 'up':
        if(this.lastMove != 'up'){
          this.lastMove = 'up'
          this.moveNum = 0;
        } 
        //移动动画开始  
        this.role.style.backgroundPosition = `${this.moveNum*-48}px -150px`
        //移动动画结束
        //位移逻辑开始
        if(!way){
          this.positionY -= this.moveSpeedY
        }
        this.role.style.top = this.positionY +'px'
        //位移逻辑结束
        this.moveNum++;
        if(this.moveNum==4){
          this.moveNum = 0;
        } 
        break;
      case 'right': 
        if(this.lastMove != 'right'){
          this.lastMove = 'right'
          this.moveNum = 0;
        }  

        //移动动画开始 
        this.role.style.backgroundPosition = `${this.moveNum*-48}px -100px`
        //移动动画结束
        //位移逻辑开始
        if(!way){
          this.positionX += this.moveSpeedX
        }
        this.role.style.left = this.positionX  +'px'
        //位移逻辑结束
        this.moveNum++;
        if(this.moveNum==4){
          this.moveNum = 0;
        }  
        break;
      case 'down':
        if(this.lastMove != 'down'){
          this.lastMove = 'down'
          this.moveNum = 0;
        }   

        //移动动画开始
        this.role.style.backgroundPosition = `${this.moveNum*-48}px 0`
        //移动动画结束
        //位移逻辑开始
        if(!way){
          this.positionY += this.moveSpeedY
        }
        this.role.style.top = this.positionY +'px'
        //位移逻辑结束
        this.moveNum++;
        if(this.moveNum==4){
          this.moveNum = 0;
        }
        break;
      case 'left':
        if(this.lastMove != 'left'){
          this.lastMove = 'left'
          this.moveNum = 0;
        }   

        //移动动画结束
        this.role.style.backgroundPosition = `${this.moveNum*-48}px -50px`
        //移动动画结束
        //位移逻辑开始
        if(!way){
          this.positionX -= this.moveSpeedX
        }
        this.role.style.left = this.positionX +'px'
        //位移逻辑结束
        this.moveNum++;
        if(this.moveNum==4){
          this.moveNum = 0;
        }
        break;  
    }
  },
  // 言语框
  dialogBox:function(allText){
    if(this.status != 1&&this.limitArea.length) return;
    let dialog = document.createElement('div');
    let i=0,timer=null;
    switch(this.lastMove){
      case 'down':
        dialog.className = "dialogDown"
        dialog.style = "z-index: 100;padding: 2px 4px;background-color: #fff;min-height: 24px;min-width: 100px;border: 1px solid #000;position: absolute;top:50px;left:0px;border-radius: 10px;"
        break;
      case 'left':
        dialog.className = "dialogRight"
        dialog.style = "z-index: 100;padding: 2px 6px;background-color: #fff;min-height: 24px;min-width: 100px;border: 1px solid #000;position: absolute;top:0;left:50px;border-radius: 10px;"
        break;
      case 'right':
        dialog.className = "dialogLeft"
        dialog.style = "z-index: 100;padding: 2px 4px;background-color: #fff;min-height: 24px;min-width: 100px;border: 1px solid #000;position: absolute;top:0;right:50px;border-radius: 10px;"
        break; 
      case 'up':
        dialog.className = "dialogDown"
        dialog.style = "z-index: 100;padding: 2px 4px;background-color: #fff;min-height: 24px;min-width: 100px;border: 1px solid #000;position: absolute;top:50px;left:0px;border-radius: 10px;"
        break;                 
    }
    this.role.append(dialog)
    timer = setInterval(()=> {
      i++;
      if(i>allText.length){
        clearInterval(timer)
        setTimeout(() => {
          this.role.removeChild(dialog)
        },1000)
      }
      dialog.innerText = allText.slice(0,i)
    }, 200)
    setTimeout(() => {
      document.getElementById('inputTextarea').value =""
    },100)
  },
}

// 全局构造函数
function globalCreate(initObj){
  //全局限制区域
  this.limitArea = initObj.limitArea;  
  this.entrance = initObj.entrance;  
  this.mapX = 0;
  this.mapY = 0;
  this.init();   
}
//全局原型
globalCreate.prototype = {
  init: function(){
    //渲染入口区域
    this.entrance.forEach(item => {
      let enter_area = document.createElement('div');
      enter_area.style = `position: absolute;top: ${item.area[1]}px;left: ${item.area[0]}px; width: ${item.area[2]}px; height: ${item.area[3]}px;background-color: ${item.backgroundColor}`
      document.getElementById('map').append(enter_area)
    })
    //渲染限制区域
    this.limitArea.forEach(item => {
      let limit_area = document.createElement('div')
      limit_area.style = `position: absolute;top: ${item.area[1]}px;left: ${item.area[0]}px; width: ${item.area[2]}px; height: ${item.area[3]}px;background-color: ${item.backgroundColor}`
      document.getElementById('map').append(limit_area)
    })
    //
  }
}
