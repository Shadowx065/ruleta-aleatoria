const canvas = document.getElementById("ruleta");
const ctx = canvas.getContext("2d");

const textarea = document.getElementById("listaOpciones");
const resultado = document.getElementById("resultado");
const historialUI = document.getElementById("historial");

const modal = document.getElementById("modalResultado");
const textoResultado = document.getElementById("textoResultado");

const btnCerrar = document.getElementById("btnCerrar");
const btnEliminar = document.getElementById("btnEliminar");

let opcionesActivas=[];
let historial=[];

let colores=["#2d7dd2","#ffffff","#d7263d","#000000"];

let angulo=0;
let girando=false;
let ultimoSegmento=-1;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* SONIDO CLICK */

function sonidoClick(){

const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.connect(gain);
gain.connect(audioCtx.destination);

osc.frequency.value=1000;
gain.gain.value=0.05;

osc.start();
osc.stop(audioCtx.currentTime+0.03);

}

/* SONIDO VICTORIA */

function sonidoVictoria(){

const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.connect(gain);
gain.connect(audioCtx.destination);

osc.type="square";

osc.frequency.setValueAtTime(300,audioCtx.currentTime);
osc.frequency.linearRampToValueAtTime(900,audioCtx.currentTime+0.5);

gain.gain.value=0.2;

osc.start();
osc.stop(audioCtx.currentTime+0.5);

}

/* OBTENER OPCIONES */

function obtenerOpciones(){

return textarea.value
.split("\n")
.map(e=>e.trim())
.filter(e=>e!="");

}

/* ACTUALIZAR */

function actualizarOpciones(){

opcionesActivas=[...obtenerOpciones()];

angulo=0;

dibujarRuleta();

}

/* DIBUJAR */

function dibujarRuleta(){

ctx.clearRect(0,0,500,500);

let total=opcionesActivas.length;

if(total===0) return;

let anguloSeccion=(2*Math.PI)/total;

for(let i=0;i<total;i++){

ctx.beginPath();

ctx.moveTo(250,250);

ctx.arc(
250,250,250,
angulo+i*anguloSeccion,
angulo+(i+1)*anguloSeccion
);

ctx.fillStyle=colores[i%colores.length];
ctx.fill();

ctx.save();

ctx.translate(250,250);

let angTexto=angulo+(i+0.5)*anguloSeccion;

ctx.rotate(angTexto);

ctx.font="bold 18px Arial";

ctx.fillStyle= colores[i%colores.length]=="#ffffff"?"#000":"#fff";

if(angTexto%(2*Math.PI)>Math.PI){

ctx.rotate(Math.PI);
ctx.textAlign="left";
ctx.fillText(opcionesActivas[i],-220,0);

}else{

ctx.textAlign="right";
ctx.fillText(opcionesActivas[i],220,0);

}

ctx.restore();

}

}

/* CALCULAR GANADOR */

function calcularGanador(){

let total=opcionesActivas.length;

let anguloSeccion=(2*Math.PI)/total;

let anguloNormal=angulo%(2*Math.PI);

let anguloFlecha=(Math.PI*3/2)-anguloNormal;

anguloFlecha=(anguloFlecha+2*Math.PI)%(2*Math.PI);

let indice=Math.floor(anguloFlecha/anguloSeccion)%total;

let ganador=opcionesActivas[indice];

resultado.innerText="La opción es: "+ganador;

textoResultado.innerText=ganador;

modal.style.display="flex";

sonidoVictoria();

historial.unshift(ganador);

if(historial.length>5) historial.pop();

actualizarHistorial();

}

/* HISTORIAL */

function actualizarHistorial(){

historialUI.innerHTML="";

historial.forEach(item=>{

let li=document.createElement("li");
li.textContent=item;

historialUI.appendChild(li);

});

}

/* GIRAR */

function girar(){

if(girando) return;

angulo = angulo % (Math.PI * 2);

ultimoSegmento=-1;

let total=opcionesActivas.length;

let indiceGanador=Math.floor(Math.random()*total);

let anguloSeccion=(2*Math.PI)/total;

let destino=(Math.PI*3/2)-(indiceGanador+0.5)*anguloSeccion;

destino+=(Math.PI*2)*(3+Math.random()*2);

let inicio=angulo;

let duracion=3500;

let start=null;

girando=true;

function animar(t){

if(!start) start=t;

let progreso=(t-start)/duracion;

if(progreso>1) progreso=1;

let ease=1-Math.pow(1-progreso,3);

angulo=inicio+(destino-inicio)*ease;

let seg=Math.floor((angulo%(2*Math.PI))/anguloSeccion);

if(seg!==ultimoSegmento){

sonidoClick();
ultimoSegmento=seg;

}

dibujarRuleta();

if(progreso<1){

requestAnimationFrame(animar);

}else{

girando=false;
calcularGanador();

}

}

requestAnimationFrame(animar);

}

/* BOTONES MODAL */

btnCerrar.onclick=()=>{

modal.style.display="none";

}

btnEliminar.onclick=()=>{

modal.style.display="none";

}

/* TECLAS */

document.addEventListener("keydown",(e)=>{

const escribiendo=document.activeElement===textarea;

if(!escribiendo&&(e.code==="Space"||e.code==="Enter")){

e.preventDefault();
girar();

}

});

/* INICIO */

actualizarOpciones();
textarea.addEventListener("input",actualizarOpciones);