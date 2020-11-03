let canvas          = document.getElementById("canvas");
let ctx             = canvas.getContext("2d");

//Ресайзинг канвы
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

//Коффициент скалирования
let zoom            = 0.3;
//Позиция карты в отношении к глобальным координатам
let position        = {x:0,y:0};
let mouseDown       = false;
let mouseDownPosition = {x:0,y:0};
let mousePosition   = {x:0,y:0};
// Объект со всеми планетам 
// x,y,r-радиус,owner-Айди владельца,res-ресурсов на планете,maxRes-ЛимитРесурсов,plusRes-Возобновляемые ресурсы,Skin-картинка планеты,connects[]
let planets         = [];
let players         = Array();
players[0]          = {name:"None",color:"#bdc3c7"};
players[1]          = {name:"Gamer",color:"#2980b9"};
let mainPlayer      = {id:1,token:"365487"}
let selectPlanet    = 0;
let selectButton    = {pathPlanet:false,addPlanet:false};
//let connections     = [];

let rockets     = [];

function draw() {
    
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    //Прорисовка линии прокладки пути ракет
    if (selectButton.pathPlanet) {
        
        let planet = planets[selectPlanet];
        let player = players[mainPlayer.id]
        
        ctx.beginPath();
        ctx.moveTo((position.x + planet.x) * zoom, (position.y + planet.y) * zoom);
        ctx.lineTo(mousePosition.x * zoom, mousePosition.y * zoom);
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([4,8]);
        ctx.stroke();
    }
    
    //Прорисовка планет
    for (prop in planets) {
        
        let planet = planets[prop];
        let player = players[planet.owner]
        
        //Прорисовка соединений
        for (connectProp in planet.connects) {

            let connect = planet.connects[connectProp];
            let planetTo = planets[connect];
            
            ctx.beginPath();
            ctx.moveTo((position.x + planet.x) * zoom, (position.y + planet.y) * zoom);
            ctx.lineTo((position.x + planetTo.x) * zoom, (position.y + planetTo.y) * zoom);
            ctx.strokeStyle = player.color;
            ctx.lineWidth = 1;
            ctx.setLineDash([4,8]);
            ctx.stroke();
        }
        
        //Прорисовка планет
        ctx.beginPath();
        ctx.arc((planet.x + position.x) * zoom, (planet.y + position.y) * zoom, planet.r * zoom, 0, 2 * Math.PI);
        ctx.fillStyle = player.color;
        ctx.fill();
        

        
    }
    
    //Прорисовка выбора
    if (selectPlanet) {
        //Прорисовка ариала выделенной планеты
        let planet = planets[selectPlanet];
        let player = players[planet.owner]

        ctx.beginPath();
        ctx.arc((planet.x + position.x) * zoom, (planet.y + position.y) * zoom, (planet.r + 10) * zoom, 0, 2 * Math.PI);
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc((planet.x + position.x) * zoom, (planet.y + position.y) * zoom, (200 + (planet.r*2)) * zoom, 0, 2 * Math.PI);
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4,4]);
        ctx.stroke();

        //Прорисовка линии рессурсов планеты
        ctx.beginPath();
        ctx.moveTo((position.x + (planet.x - 50)) * zoom, (position.y + (planet.y - planet.r) - 30) * zoom);
        ctx.lineTo((position.x + (planet.x + 50)) * zoom, (position.y + (planet.y - planet.r) - 30) * zoom);
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 10 * zoom;
        ctx.setLineDash([]);
        ctx.stroke();


        let procentRes = (planet.res / planet.maxRes) * 100;

        ctx.beginPath();
        ctx.moveTo((position.x + (planet.x - 50)) * zoom, (position.y + (planet.y - planet.r) - 30) * zoom);
        ctx.lineTo((position.x + (planet.x - 50 + procentRes)) * zoom, (position.y + (planet.y - planet.r) - 30) * zoom);
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 10 * zoom;
        ctx.setLineDash([]);
        ctx.stroke();
        
    }
    
    moveRockets();
    
    //Прорисовка ракет
    for (prop in rockets) {
        let rocket = rockets[prop];
        
        ctx.beginPath();
        ctx.arc((rocket.x + position.x) * zoom, (rocket.y + position.y) * zoom, 5 * zoom, 0, 2 * Math.PI);
        ctx.fillStyle = players[mainPlayer.id].color;
        ctx.fill();
        
    }
    
    
}
setInterval(draw,1000/60);

function addResAllPlanets() {
    
    for (prop in planets) {
        
        let planet = planets[prop];
        let player = players[planet.owner]
        
        if (planet.owner) {
            let resAdd = planet.res + planet.addRes;
            planet.res =Math.min(planet.maxRes,resAdd);
        }
        
    }
    
}
setInterval(addResAllPlanets,5000);

function addMoveRockets() {
    
    
    
    for (prop in planets) {
        
        let planet = planets[prop];
        
        if (planet.connects.length == 0) {
           continue;
        }
        
        let howCan = planet.res - planet.maxRes/2;
        
        if (howCan < 0) {
            continue;
        }
        
        let countPlanetsHowSend = 0;
        
        for (let i = 0; i < planet.connects.length; i++) {

            if (planets[planet.connects[i]].res < planets[planet.connects[i]].maxRes) {
                
                countPlanetsHowSend++;
                
            }
            
        }
        if (countPlanetsHowSend == 0) {
            continue;
        }

        let countSend = howCan/countPlanetsHowSend;
        
        if (countSend < 1) {
            continue;
        }
        
        if (countSend > planet.sendRes) {
            countSend = planet.sendRes;
        }
        
            
        for (connectProp in planet.connects) {
            
            let connect = planet.connects[connectProp];
            
            let planetTo = planets[connect];

            let res = countSend;

            //Хватает ли ресурсов для отправки
//            if (planet.res < planet.maxRes/2) {
//                continue;
//            }

            //Нужны ли там рессурсы
//            if (planetTo.owner == planet.owner && planetTo.res >= planetTo.maxRes) {
//                continue;
//            }
            
            if (planets[planet.connects[connectProp]].res >= planets[planet.connects[connectProp]].maxRes) {
                continue;
            }

            planet.res -= res;

            rockets.push({
                x:      planet.x,
                y:      planet.y,
                planet: prop,
                xStart: planet.x,
                yStart: planet.y,
                xTo:    planetTo.x,
                yTo:    planetTo.y,
                planetTo:connect,
                step:   1,
                res:    res,
                owner:  planet.owner});

        }
    }
    
}
setInterval(addMoveRockets,1000);

function moveRockets() {
    
    for (prop in rockets) {
        
        let rocket = rockets[prop];
        
        rocket.step++;
        
        rocket.x += (rocket.xTo - rocket.xStart)/100;
        rocket.y += (rocket.yTo - rocket.yStart)/100;
        
        if(rocket.step > 100) {
            addResFromRocket(rocket.owner,rocket.planetTo,rocket.res);
            delete rockets[prop];
        }
        
    }
    
}

function addResFromRocket(owner,planet,res) {

    if (planet in planets) {
    
        if(planets[planet].owner != owner) {
            if (res > planets[planet].res) {
                planets[planet].res = res;
                planets[planet].owner = owner;
            } else {
                planets[planet].res -= res;
            }

        } else {
            let resAdd = planets[planet].res + res;
            planets[planet].res = Math.min(planets[planet].maxRes,resAdd);
        }
        
    } else {
        console.log('Obj no in arr');
    }
    
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getPlanetFromPosition(x,y) {
    
    for (prop in planets) {
        
        let planet = planets[prop];
        
        let distance = Math.sqrt(Math.pow(((position.x + planet.x) * zoom) - x,2) + Math.pow(((position.y + planet.y)*zoom) - y,2));
        
        
        if (distance < planet.r*zoom) {
            
            return prop;

        }
        
    }
    
}

function getDistancePlanet(planetProp1,planetProp2) {
    
    let planet1 = planets[planetProp1];
    let planet2 = planets[planetProp2];
    
    return Math.sqrt(Math.pow(planet1.x - planet2.x,2) + Math.pow(planet1.y - planet2.y,2));

}

function msgInfo(text) {
    let textInfo = document.getElementById("infoText");
    textInfo.value = text + '\r\n' + textInfo.value;
}


//UI
function UIdeletePlanet() {
    
    delete planets[selectPlanet];
    
    for (prop in planets) {
        
        let indexConnect = planets[prop].connects.indexOf(selectPlanet);

            if (indexConnect != -1) {
                
                planets[prop].connects.splice(indexConnect,1);
                
            }

    }
    
    selectPlanet = 0;
    
}

function UIaddConnection() {

    if (planets[selectPlanet].owner == mainPlayer.id) {
        selectButton.pathPlanet = true;
    }
    
    
}

function UIaddPlanet() {
    
    selectButton.addPlanet = true;
    
}

function UIcreateMap() {
    
    let linePath = [{x1:0,y1:0,x2:2000,y2:2000},{x1:0,y1:2000,x2:2000,y2:0}];
    
    for (let i = 0; i < linePath.length; i++) {

        let a = (linePath[i].x2 - linePath[i].x1) / 10;
        let b = (linePath[i].y2 - linePath[i].y1) / 10;
        
        let currentA = (linePath[i].x2 - linePath[i].x1) / 10;
        let currentB = (linePath[i].y2 - linePath[i].y1) / 10;
        
        for (let t = 0; t < 10; t++) {
            
            let xPoint = (currentA * t) + a;
            let yPoint = (currentB * t) + b;
            
            let countPlanetsFromPoint = getRandomInt(10);
            
            for (let planetInterat = 0; planetInterat < countPlanetsFromPoint; planetInterat++) {

                let xOffset = getRandomInt(200) - 100;
                let yOffset = getRandomInt(200) - 100;
                
                let planetR = getRandomInt(50) + 5; 
                
                let collision = false;
                
                for (prop in planets) {
                    let planet = planets[prop];
                    let distance = Math.sqrt(Math.pow(planet.x - (linePath[i].x1 + xPoint + xOffset),2) + Math.pow(planet.y - (linePath[i].y1 + yPoint + yOffset),2));
                    
                    if (distance < planet.r + planetR + 20) {
                        collision = true;
                    }
                }

                if (!collision) {
                    planets.push({
                        x:linePath[i].x1 + xPoint + xOffset,
                        y: linePath[i].y1 + yPoint + yOffset,
                        r:planetR,
                        owner:0,
                        res:350,
                        maxRes:650,
                        plusRes:31,
                        skin:'standart',
                        sendRes:25,
                        addRes:36,
                        connects:[]});
                }
            }
        }
        
    }
    
}
UIcreateMap();

function UIbuyPlanet() {
    
   if (!planets[selectPlanet].owner) {
       planets[selectPlanet].owner = mainPlayer.id;
   } else {
       console.log("Планета кому то пренадлежит");
   }
    
}

function UIupdatePlanetInfo() {

    UIshowLeftPanel();
    
//    let planetInfo = document.getElementById("planetInfo");
//    if (selectPlanet) {
//        
//        text = 'Владелец: ' + planets[selectPlanet].owner + '\r\n';
//        text += 'Ресурсы: ' + planets[selectPlanet].res + '\r\n';
//        text += 'Макс. ресурсов: ' + planets[selectPlanet].maxRes + '\r\n';
//        text += 'Радиус: ' + planets[selectPlanet].r + '\r\n';
//        text += 'Отправка ресурсов: ' + planets[selectPlanet].sendRes + '\r\n';
//        text += 'Соединений: ' + planets[selectPlanet].connects.length + '\r\n';
//        
//    } else {
//        
//        text = '';
//        
//    }
//    planetInfo.value = text;
    
}

function UIshowLeftPanel() {
    
    let leftPanel = document.getElementById('leftPanel');
    
    if(selectPlanet) {
        leftPanel.style.display = 'block';
    } else {
        leftPanel.style.display = 'none';
    }
    
}

//Events
canvas.addEventListener("mousedown", function(e) {
    
    mouseDownPosition.x = e.clientX;
    mouseDownPosition.y = e.clientY;
    
    let planetClick = getPlanetFromPosition(e.clientX,e.clientY);
    

    if (planetClick) {
        
        if (selectButton.pathPlanet) {

            let connectPlanets = {
                isConnect:  false,
                reverse:    false,
                connectId:  0
            };
            
            let planet = planets[selectPlanet];
            let planetTo = planets[planetClick];
            
            //Проверим есть ли у выбранной планеты связь с планетой To
            let indexConnect = planet.connects.indexOf(planetClick);
            if (indexConnect != -1) {
                connectPlanets.isConnect    = true;
                connectPlanets.reverse      = false;
                connectPlanets.connectId    = indexConnect;
            }

            //Проверим у планеты To 
            indexConnect = planetTo.connects.indexOf(selectPlanet);
            if (indexConnect != -1) {
                connectPlanets.isConnect    = true;
                connectPlanets.reverse      = true;
                connectPlanets.connectId    = indexConnect;
            }

            if (connectPlanets.isConnect) {

                console.log('ok');

                if (connectPlanets.reverse) {
                    planets[planetClick].connects.splice(connectPlanets.connectId,1);
                    planets[selectPlanet].connects.push(planetClick);
                } else {
                    planets[selectPlanet].connects.splice(connectPlanets.connectId,1);
                }
          
            } else {
                
                let distancePlanet = getDistancePlanet(selectPlanet,planetClick);

                if (distancePlanet - planets[selectPlanet].r < 200 + (planets[planetClick].r*2)) {
                    planets[selectPlanet].connects.push(planetClick);
                } else {
                    msgInfo('Планета находится слишком далеко');
                }
                
            }
        }
        
        selectPlanet = planetClick;
        
    } else {
        
        if (selectButton.addPlanet) {
            
            planets.push({x:(mouseDownPosition.x  / zoom - position.x),y:(mouseDownPosition.y / zoom - position.y),r:10,owner:1,res:350,maxRes:650,plusRes:31,skin:'standart',sendRes:25,addRes:36,connects: []});
            
            selectButton.addPlanet
        }
        
        selectPlanet = 0;
    }

    selectButton.pathPlanet = false;
    selectButton.addPlanet = false;
    mouseDown = true;
    UIupdatePlanetInfo();
    
});
canvas.addEventListener("mouseup", function() {mouseDown = false;});
canvas.addEventListener("mousemove", function(e) {
    
    if (mouseDown) {
        position.x  = position.x + ((e.clientX / zoom) - mousePosition.x);
        position.y  = position.y + ((e.clientY / zoom) - mousePosition.y);
    }
    mousePosition.x = e.clientX / zoom; 
    mousePosition.y = e.clientY / zoom;
});

//Скалирование
canvas.addEventListener("wheel",function(e) {
   
    e = e || window.event;
    var delta = e.deltaY || e.detail || e.wheelDelta;

    //console.log(delta);
    
    if (delta<0) {
        zoom = zoom + (zoom/10);
    } else {
        zoom = zoom - (zoom/10);
    }
    
//    if (zoom<1) {
//        zoom = zoom + ((delta/zoom) * 0.001);
//    } else {
//        zoom = zoom + ((delta*zoom) * 0.001);                
//    }

    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    
});