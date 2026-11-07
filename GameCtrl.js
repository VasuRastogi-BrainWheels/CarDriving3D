import {Game} from './main.js';
import {Siger} from './Siger/Siger.js';
let sg=new Siger()
let Vector3=sg.Vector3
let ScreenWidth = 718 //window.innerHeight;
let ScreenHeight = 384;
const uiLayer=document.querySelector("#ui")
const uiCtx=uiLayer.getContext("2d")
uiLayer.height=ScreenHeight 
uiLayer.width=ScreenWidth 
const canvasUI=function(_canvas,_ctx){
  return{
    clickedCoords:{},
    canvas:_canvas,
    ctx:_ctx,
    updateLoop:true,
    UIButtons:{
        ctx:_ctx,
        map:{
        },
        
        disable(g)
        {
          //disable all buttons of a group or with given id
          for (let btn of Object.values(this.map)) 
          {
              if (btn.group==g){btn.enabled=false}
          }
        },
        enable(g)
        {
          for (let btn of Object.values(this.map)) 
          {
              if (btn.group==g){btn.enabled=true}
          }
        },
        render(btn){
          //draw button 
           /*Button have icon*/
            this.ctx.fillRect(ScreenWidth-40,0, 50,50)
            if(btn.hidden) return
            this.ctx.globalAlpha =btn.pressed?0.5:1
            if(!btn.img && btn.icon){
                btn.img=new Image()
                btn.img.src=btn.icon
            }
            if(btn.icon){
            
              this.ctx.drawImage(btn.img,btn.x,btn.y,btn.w,btn.h)
            
              return
            
            }
            this.ctx.fillStyle = btn.bgColor??"rgba(35, 35, 35, 0.95)";
            this.ctx.fillRect(btn.x,btn.y,btn.w,btn.h)
          //draw border  
            this.ctx.lineWidth=1
            this.ctx.strokeStyle="white"
            this.ctx.strokeRect(btn.x,btn.y,btn.w,btn.h)
            this.ctx.fillStyle = "white";
          //show text  
            this.ctx.font = `8px monospace`;
            this.ctx.fillText(btn.value,btn.x+10,btn.y+5)
           
            
        },
        checkClick(tch,btn){
          if (tch.touching) {return}
          if ((tch.x>btn.x && tch.x<btn.x+btn.w) && (tch.y>btn.y && tch.y<btn.y+btn.h)){//check if btn is touched
              eval(btn.onClick)//call the function
              tch.touching=btn
              btn.pressed=true
            
          }
          
        },
        checkHold(tch,btn){
            if ((tch.x>btn.x && tch.x<btn.x+btn.w) && (tch.y>btn.y && tch.y<btn.y+btn.h)){//check if btn is touched
              eval(btn.onHold)//call the function
              tch.touching=btn
              btn.pressed=true
            
          }
          

        },
        
    
        
  },
  checkInteraction(){
      /*Buttons*/
      //check wether button is clicked or not
      for (let tch in this.clickedCoords) {//loop through each touch pointers
          tch= this.clickedCoords[tch]
          for (let btn of Object.values(this.UIButtons.map)) {//check if any of them is touching a button
               this.UIButtons.checkClick(tch,btn)
               this.UIButtons.checkHold(tch,btn)

          }
          
          
      }
      
  },
  update(){
    
      this.checkInteraction()
      this.ctx.globalAlpha=1
      for (let btn of Object.values(this.UIButtons.map)) {
          this.UIButtons.render(btn)//.bind(this.UIButtons)
          btn.pressed=false
      }
      if(this.updateLoop)requestAnimationFrame(this.update.bind(this))
  },
  setClickCoordinates(event)
  {//stores the touch or mousePointer coords in clickedCoords
          // Get the current visual size of the canvas 
          const displayWidth = this.canvas.clientWidth;
          const displayHeight = this.canvas.clientHeight;
          
          //  Calculate the ratio between internal resolution and display size
          const scaleX = this.canvas.width / displayWidth;
          const scaleY = this.canvas.height / displayHeight;
          let ClickCoordsX = (event.offsetX )* scaleX;
          let ClickCoordsY = (event.offsetY) * scaleY;
          this.clickedCoords[event.pointerId]={x:ClickCoordsX,y:ClickCoordsY,id:event.pointerId,touching:false}
           
          
    },
    deleteClickCoords(event)
    {//when a finger is lifted of ,remove its coordinates 
        event.preventDefault()
        if(this.clickedCoords[event.pointerId].touching){eval(this.clickedCoords[event.pointerId].touching.onRelease);}
        delete this.clickedCoords[event.pointerId]
        
    },
    moveClickCoords(event){
       // event.preventDefault()
        
        if(event.height>0.2||event.width>0.2)
        {
            delete this.clickedCoords[event.pointerId]
             //this.setClickCoordinates(event)
         }

    },
    add(elements){
      this.UIButtons.map=elements
    },
    clear(){
      this.UIButtons.map={}
    },
    
    init(){
      if(this.initialized) return
      this.canvas.addEventListener("pointerdown",this.setClickCoordinates.bind(this))
      this.initialized=true
      this.canvas.addEventListener("pointerup",this.deleteClickCoords.bind(this))
     // this.canvas.addEventListener("pointermove",this.moveClickCoords.bind(this))
     this.canvas.addEventListener("pointercancel",alert)
      this.ctx=this.canvas.getContext("2d")
      this.UIButtons.ctx=this.canvas.getContext("2d")
      this.update()
    }
    
    
    
}
  
}
const GameUi=new canvasUI(uiLayer,uiCtx)

const GameCtl = {
  JoyPad:{ 
   L: {x:40,y:ScreenHeight-90,w:60,h:60,icon:"images/Buttons/L.png", onClick:"Game.Player.car.steerLeft()",onRelease:"Game.Player.car.steerStop()"}, //up
   R: {x:120,y:ScreenHeight-90,w:60,h:60,icon:"images/Buttons/R.png", onClick:"Game.Player.car.steerRight()",onRelease:"Game.Player.car.steerStop()"}, //down

   A: {x:ScreenWidth-100,y:ScreenHeight-100,w:60,h:60,icon:"images/Buttons/A.png",onClick:"Game.Player.car.forwardGear()",onRelease:"Game.Player.car.direction=0"},
   B: {x:ScreenWidth-190,y:ScreenHeight-100,w:60,h:64,icon:"images/Buttons/B.png",onClick:"Game.Player.car.backGear()",onRelease:"Game.Player.car.direction=0"},
    }}
GameUi.add(GameCtl.JoyPad)
GameUi.init()