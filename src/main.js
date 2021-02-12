window.onload = function(){

  //(args1, args2), y轴起点, y轴层数
  let limitArea = [{
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
  }];
  let gl = new globalCreate({limitArea})
//初始化人物数据格式
  let newRole = { 
    name: '卓泽鹏',
    positionX: 100,
    positionY: 200,
    limitArea: limitArea.map(item => item.area)
  }
  let newRole2 = {
    name: '傻密',
    positionX: 150,
    positionY: 250
  }
  let myself = new roleCreate(newRole)
  let roleObj2 = new roleCreate(newRole2)
  let moveControl = true  //控制移动频率


  window.addEventListener('keydown',function(e){ 
    //对话输入框 
    let box = document.querySelector('#chatInputBox')
    //控制人物模块监听， 使用了 key 37、38、39、40
    if(moveControl){
      moveControl = false
      this.setTimeout(() => {
        switch(e.keyCode){
          case 37:
            myself.move('left')
            break; 
          case 38:
            myself.move('up')
            break;
          case 39:
            myself.move('right')
            break;
          case 40:
            myself.move('down')
            break;              
        }
        moveControl = true
      },100)
    }
    //控制对话框  Ctrl + Enter   
    if(13 === e.keyCode && e.ctrlKey){
      myself.status = 1;   //开启对话状态
      box.style.display = 'block';
      box.children[0].focus();
    }
    // 按ESC
    if(27 === e.keyCode){
      myself.status = 0;
      box.style.display = 'none'
    }
    //发送信息   shift+enter
    if(13 === e.keyCode && e.shiftKey){
      myself.dialogBox();
    }
  })
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
    this.role.style = `position: absolute;top:${this.positionY}px;left:${this.positionX}px;width:48px;height:42px; background:url(../roleImg/${parseInt(Math.ceil(Math.random()*7))}.png) no-repeat;background-position:0 0`
    let nameDiv = document.createElement('div')
    nameDiv.innerText = this.name
    nameDiv.style = `width: 80px;text-align: center;position:absolute;top:-15px;font-size: 12px;left:-16px`

    this.role.id = 'mainRole'
    this.role.append(nameDiv)
    let map =  document.getElementById('map')
    map.append(this.role);

    //默认参数
       //默认角色状态0为普通状态， 1为对话状态 ，
    this.status = 0  
       //默认角色坐标Y轴
    this._positionY = parseInt(this.role.style.top.substr(0, this.role.style.top.length - 2));
       //默认角色坐标X轴
    this._positionX = parseInt(this.role.style.left.substr(0, this.role.style.left.length - 2));
    this.moveSpeedX = 12     //精灵图X轴移动间距
    this.moveSpeedY = 8      //精灵图Y轴移动间距
    this.lastMove = 'down'   //第一次默认上次触发
    this.moveNum = 0         //第一次默认触发次数
    Object.defineProperties(this,{   //监听X\Y坐标
      'positionX':{
        configurable:true,//属性可配置
        set: function(v){
          this._positionX = v;
          //测试可以成功在这里更改样式,在这里进行页面跳转
          if(this.positionX>540&&this.positionY<150){
            map.style.backgroundColor="#000"
          }
        },
        get: function(){
          return this._positionX;
        }
      },
      "positionY":{
        configurable:true,//属性可配置
        set: function(v){
          console.log(v)
          this._positionY = v;
        },
        get: function(){
          return this._positionY;
        }
      },
    })
  },
  // 移动
  move:function(type){
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
        if(this.positionY<(item[1]-42)&&this.positionY-(item[1]-42)>-this.moveSpeedY){
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
    console.log(limitArr)
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
        this.positionY -= this.moveSpeedY
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
        this.positionX += this.moveSpeedX
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
        this.positionY += this.moveSpeedY
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
        this.positionX -= this.moveSpeedX
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
  dialogBox:function(){
    if(this.status != 1) return;
    let dialog = document.createElement('div');
    allText = document.getElementById('inputTextarea').value;
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
  this.init();   
}
//全局原型
globalCreate.prototype = {
  init: function(){
    //渲染限制区域
    this.limitArea.forEach(item => {
      let limit_area = document.createElement('div')
      limit_area.style = `position: absolute;top: ${item.area[1]}px;left: ${item.area[0]}px; width: ${item.area[2]}px; height: ${item.area[3]}px;background-color: ${item.backgroundColor}`
      document.getElementById('map').append(limit_area)
    })
  }
}
