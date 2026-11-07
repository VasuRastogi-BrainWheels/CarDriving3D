import {Siger} from "./Siger/Siger.js"
import {map }  from "./CityMap.js"

let sg=new Siger()
function mulberry32(seed) {
    return function() {
        seed |= 0; // Ensure seed is a 32-bit integer
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t ^ t >>> 7;
        t = t ^ t >>> 15;
        return (t >>> 0) / 4294967296; // Number between 0 and 1
    }
}




let globalSeed = 99
let getNextRandom = mulberry32(globalSeed);

function rand(min, max) {
    let seededRandom = getNextRandom();
  
  
  return Math.floor(seededRandom * (max - min + 1)) + min;
}

function chooseRand(list){
  return list[parseInt(rand(0,list.length-1))]
}

const engine=new sg.SigerEngine()
engine.init()

var a,b;
let choosen="A"
var n=0;
let userCar=chooseRand(["Yellow","Red","Blue","Orange"])
userCar="Grey"
var CarSizes={
	Red:[2,6,2],
	Blue:[1.7,3.3,2],
	Yellow:[0.02,0.1,0.03],
	
	Grey:[2,6,2],
	
}
let CityWorld	
export let Game={
	Camera:null,
	ScreenWidth:718,
	ScreenHeight:384,
	Frame:0,
	Score:0,
   
	
	Player:{
		tile:[3,27,0],
		car:null,
		rank:0,
		points:0,
		powerup:null,
		coins:0,
		update(){
			
			//this.car.lookAt(this.car.position,this.car.direction,new sg.Vector3([0,1,0]))
			
		}
	},
	async start(){
		
		this.ScreenWidth=window.innerWidth
		this.ScreenHeight=window.innerHeight

		if(this.ScreenWidth<this.ScreenHeight)
		{
			this.ScreenWidth=window.innerHeight
			this.ScreenHeight=window.innerWidth
		}
		engine.invokeRenderer(document.querySelector("#renderer"),this.ScreenWidth,this.ScreenHeight)
		CityWorld= new getGameWorld("City",engine.getDefaultWorld(),map)
		let fog=new sg.Fog( [0.8, 0.9, 1, 1],15,700)
		CityWorld.SigerWorld.add(fog)
		let car=await sg.Object3D(`models/Cars/${userCar}.obj`)
		car.position=new sg.Vector3( [27*65, 0, 28*65+12])
		car.scale=new sg.Vector3(CarSizes[userCar])
		car=new sg.VehicleBody3D(car)
		car.steering.angle=270*Math.PI/180
		

		car=CityWorld.SigerWorld.add(car)
		Game.Player.car=car
		await CityWorld.init()
		
		

		car.invokeFPSControll()
		//this.Camera.setPosition(new sg.Vector3( [18.47, 12, 30.7]))
		this.Camera.mountTo(car,new sg.Vector3( [0,15,-40]))
		
	}
}
class getGameWorld{
	constructor(name,sgWorld,map){
		this.name=name
		this.UnitSize=65
		this.rows=31
		this.columns=31
		this.width=this.UnitSize*this.rows/2
		this.height=this.UnitSize*this.columns/2
		this.SigerWorld=sgWorld
		this.Enteties={A:0,B:0,C:0}
		this.mapData=map
		this.miniMap={
			rows:31,
			columns:31,
		    unitSize:5,
			canvas:document.querySelector("#map"),
			ctx:document.querySelector("#map").getContext("2d"),
			data:[],
			init(){
				let row=[]
		        for(let i=0;i<=this.rows;i++) row.push(0)		        
		        for (let i=0;i<=this.columns;i++) this.data.push([...row])
		       //set canvas size
		        this.canvas.width=this.rows*this.unitSize
		    	this.canvas.height=this.columns*this.unitSize

		        				
		   },
		   draw(){
		   	let u=this.unitSize
		   	let w=this.rows*u
		   	let h=this.columns*u
		   	this.ctx.fillStyle='cyan'

		   	this.ctx.fillRect(0,0,w,h)
		   	this.ctx.fillStyle='white'

		   	for (var y = 0; y <= this.rows; y++) 
		   	{
		   		for (var x = 0; x <= this.columns; x++) 
		   		{
		   			let road=this.data[y][x]
		   			if (road) this.ctx.fillRect(x*u,y*u,u,u)
		   		}
		   	}
		   	let cx=Math.round(Game.Player.car.position.x/65)
		   	let cy=Math.round(Game.Player.car.position.z/65)
		   	this.ctx.fillStyle="green"
		   	this.ctx.fillRect(cx*u,cy*u,u,u)
		   	if(!this.data[cy][cx]) Game.Player.car.maxSpeed=2.7
		   	else Game.Player.car.maxSpeed=6
		   }
		}
	
		this.SigerMap=new sg.SimpleGridMap(31,31,this.UnitSize,{autoScale:false,padding:0,plane:"xz"})
		this.addedEntities={
			buildings:{},
			roads:{},
			trees:{}
		}
		this.background={
			canvas:null,
			ctx:null,
			offset:0,
			load(){
				this.canvas=document.querySelector("#background")
				this.ctx=background.getContext("2d")
				this.img=new Image()
				this.img.src="images/sky.png"
			},
			draw(){
				
				this.offset+=Game.Player.car.velocity.x*(-0.1)// scroll sky on x axis opposite to car movement
				this.ctx.clearRect(0,0,Game.ScreenWidth,Game.ScreenHeight )
				for (var i = -1; i <2; i++) {//draw 3 images of sky for scrolling(initially -screenWidth,0,ScreenWidth)
						this.ctx.drawImage(this.img,this.offset+i*710,0,730,200 )
					}	
					
				
			}
		}

		



	}
	render(){
	
		
		this.SigerWorld.render()
		this.background.draw()
		Game.Player.update()
		
	}
	async addRoad(cell,angleY,specialByte){
		this.miniMap.data[cell[1]][cell[0]]=1
		let roadBlocks={
			AAAA:"B",
			OAOA:['H','E'],
			AOAO:['G',"F"],
			OAAO:'A',
			OOAA:"I",
			AOOA:"J",
			AAOO:"K",
			AAOA:"N",
			AAAO:"C",
			OAAA:"L",
			AOAA:"M"


		}

		let size=[1,1,1]
		let choosen=roadBlocks[specialByte.replace("0","O")]?roadBlocks[specialByte.replace("0","O")]:"A" // randomly choose a road from the list
		if(specialByte=="OAOA"|| specialByte=="AOAO")choosen=choosen[(cell[0]+cell[1])%2]
		if(choosen=="E")		size=[1,1,1.23]
		if(choosen=="F")		size=[1.23,1,1]
		let roadEntity=this.addedEntities.roads[choosen] // get its object3d
		if(roadEntity) {
			roadEntity=roadEntity.duplicate(cell,{ //duplicate entiy if already present at new cell
				rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
			})
			roadEntity.colliders=null
			return
		}

		let roadObj=await sg.Object3D(`models/Roads/${choosen}.obj`,{
			rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
		})

		roadEntity=this.SigerMap.addObject(roadObj,cell,new sg.Vector3(size))
		roadEntity.colliders=null
		this.addedEntities.roads[choosen]=roadEntity // store the entity for future duplication
		
	}
	async addTree(cell,angleY,specialByte){
		let trees=["A","B","C",'D']
		let choosen=chooseRand(trees) // randomly choose a tree from the list
		let treeEntity=this.addedEntities.trees[choosen] // get its object3d 
		if(treeEntity) {
			treeEntity=treeEntity.duplicate(cell,{ //duplicate entiy if already present at new cell
				rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
			})
			treeEntity.colliders='base'
			return
		}
		treeEntity=await sg.Object3D(`models/Trees/${choosen}.obj`,{
			rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
		})
		treeEntity=this.SigerMap.addObject(treeEntity,cell,new sg.Vector3([0.8,27,0.8]))
		this.addedEntities.trees[choosen]=treeEntity // store the entity for future duplication
	}
	async addBuilding(cell,angleY,specialByte){
		let buildings=["A","B","C"]
		let sizes={A:[1.8,50,0.8],B:[0.8,70,0.8],C:[0.8,50,0.8]}
		let choosen=chooseRand(buildings) // randomly choose a building from the list
		let buildingEntity=this.addedEntities.buildings[choosen] // get its object3d 
		if(buildingEntity) {
			buildingEntity.duplicate(cell,{ //duplicate entiy if already present at new cell
				rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
			})
			return
		}
		buildingEntity=await sg.Object3D(`models/buildings/${choosen}.obj`,{
			rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
		})
		buildingEntity=this.SigerMap.addObject(buildingEntity,cell,new sg.Vector3(sizes[choosen]))
		this.addedEntities.buildings[choosen]=buildingEntity // store the entity for future duplication
	}
	async addBillBoard(cell,angleY,specialByte){
		let BillBoard=this.addedEntities.billboard
		if(BillBoard){
			BillBoard=BillBoard.duplicate(cell,{ //duplicate entiy if already present at new cell
				rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
			})
		BillBoard.colliders="base"//sg.BoundingBox.bindSubMesh(BillBoard,BillBoard.Mesh.groups['base'])

			return
		}
		BillBoard=await sg.Object3D(`models/Decorations/Billboard.obj`,{
			rotation:new sg.Vector3([0,angleY*Math.PI/180,0])
		})
		BillBoard=this.SigerMap.addObject(BillBoard,cell,new sg.Vector3([1,30,1]))
		BillBoard.colliders="base"
		BillBoard.BoundingBox=null//sg.BoundingBox.bindSubMesh(BillBoard,BillBoard.Mesh.groups['base'])
		console.log(BillBoard.Mesh.groups['base'])
		console.log(BillBoard.dimension)
		this.addedEntities.billboard=BillBoard // store the entity for future duplication


	}
	async init(){
		this.miniMap.init()
	//Load background 
		this.background.load()
	//Store world camera as global var	
		Game.Camera=this.SigerWorld.Camera
	//get and add floor	
		this.floor=await sg.Object3D("models/GrassBase.obj")
		this.floor.scale=new sg.Vector3([this.width+this.UnitSize,2,this.height+this.UnitSize])
		this.floor.position=new sg.Vector3([this.width,-2,this.height])
		this.floor=this.SigerWorld.add(this.floor)
	//Add entites from map 
		let objectAdder={
			building:this.addBuilding.bind(this),
			tree:this.addTree.bind(this),
			road:this.addRoad.bind(this),
			billboard:this.addBillBoard.bind(this)
		}
		for(let i=0;i<this.mapData.length;i++)
		{   
			let data=this.mapData[i]
			let entity=data[0]
			let angleY=data[1]
			let specialByte=data[2]
			let cell=[data[3],data[4]]
			if(objectAdder[entity]) await objectAdder[entity](cell,angleY,specialByte)
		}

	    
	this.SigerWorld.add(this.SigerMap)
	this.miniMap.draw()
	Game.Player.car.useMap(this.SigerMap)

	
	
	}
}

function Main(){
	Game.Frame++	
	let perThen=performance.now()	
		CityWorld.render()
		requestAnimationFrame(Main)
		document.querySelector("speed").innerHTML=Math.abs(Game.Player.car.speed*10).toFixed(2)+"m/s"
	let now=performance.now()
	if (Game.Frame%20==0)document.querySelector("fps").innerHTML=parseInt(1000/(now-perThen))+"FPS"

}
function animateCamera(){
	Game.Camera.position.x+=0.1
	Game.Camera.position.y+=0.1
	if(Game.Camera.position.x>0) requestAnimationFrame(animateCamera)
	else Main()
}


await Game.start()

Main()
setInterval(CityWorld.miniMap.draw.bind(CityWorld.miniMap),10)