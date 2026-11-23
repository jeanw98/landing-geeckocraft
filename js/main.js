/* Geecko Craft · landing. JavaScript sin dependencias: pieles, formulario, contacto y movimiento.
   Todo el contenido ya está en el HTML; este archivo solo agrega comportamiento. */
(function(){
  'use strict';

  // TODO Jean: número real de WhatsApp (también está en los enlaces wa.me del index.html).
  var CONTACTO={whatsapp:'593000000000', email:'contacto@geeckocraft.com'};
  var API='/api/propuesta';
  var MAX_AUDIO=4*1024*1024;

  var root=document.documentElement, body=document.body;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var byId=function(id){return document.getElementById(id)};
  var ease=function(x){return 1-Math.pow(1-x,3)};
  var clamp=function(v){return Math.max(0,Math.min(1,v))};
  var state={skin:'std',pres:null,canal:'WhatsApp',enviando:false};

  /* ================= pieles ================= */
  function lum(hex){
    var n=parseInt(hex.slice(1),16),c=[(n>>16)&255,(n>>8)&255,n&255].map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
    return .2126*c[0]+.7152*c[1]+.0722*c[2];
  }
  // aclara hacia papel para que una piel oscura se lea sobre tinta
  function mezclar(hex,t){
    var n=parseInt(hex.slice(1),16),a=[(n>>16)&255,(n>>8)&255,n&255],b=[238,236,230];
    return 'rgb('+a.map(function(v,i){return Math.round(v+(b[i]-v)*t)}).join(',')+')';
  }
  function applySkin(skin){
    state.skin=skin;
    if(skin==='std'){
      ['--piel','--piel-leg','--piel-txt','--gk-stroke','--piel-fondo'].forEach(function(p){root.style.removeProperty(p)});
    }else{
      var L=lum(skin);
      root.style.setProperty('--piel',skin);
      root.style.setProperty('--piel-leg',L<.12?mezclar(skin,.45):skin);
      root.style.setProperty('--piel-txt',L>.3?'#151514':'#FBFAF7');
      root.style.setProperty('--gk-stroke',L<.04?mezclar(skin,.3):skin);
      root.style.setProperty('--piel-fondo',skin);
    }
    $('.sw[data-skin]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.skin===skin))});
    byId('f-hex').textContent=skin==='std'?'degradado':skin.toUpperCase();
    byId('color').value=skin==='std'?'':skin;
    document.dispatchEvent(new CustomEvent('gcpiel',{detail:skin}));
  }
  function setSkin(skin,origen){
    if(origen!==false) return cambioConOla(function(){applySkin(skin)},origen,skin);
    applySkin(skin);
  }
  $('.sw[data-skin]').forEach(function(b){b.addEventListener('click',function(){setSkin(b.dataset.skin,b)})});
  byId('color-propio').addEventListener('input',function(e){setSkin(e.target.value,false)});

  function redibujar(){
    if(reduce) return;
    $('use.dibuja').forEach(function(u){u.classList.remove('anim');void u.getBoundingClientRect();u.classList.add('anim')});
    $('.h1 .luz').forEach(function(w){w.classList.remove('pulso');void w.offsetWidth;w.classList.add('pulso')});
  }
  // ola circular desde el botón tocado (View Transitions, con capa de color como respaldo)
  function cambioConOla(aplicar,origen,piel){
    if(reduce){aplicar();return;}
    var r=origen&&origen.getBoundingClientRect?origen.getBoundingClientRect():null;
    var x=r?r.left+r.width/2:innerWidth/2, y=r?r.top+r.height/2:innerHeight/2;
    var R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    var circ=['circle(0px at '+x+'px '+y+'px)','circle('+R+'px at '+x+'px '+y+'px)'];
    if(document.startViewTransition){
      try{
        var vt=document.startViewTransition(aplicar);
        vt.ready.then(function(){root.animate({clipPath:circ},{duration:800,easing:'cubic-bezier(.6,0,.2,1)',pseudoElement:'::view-transition-new(root)'})}).catch(function(){});
        vt.finished.then(redibujar,redibujar);
        return;
      }catch(e){}
    }
    if(!document.body.animate){aplicar();return;}
    var ola=document.createElement('div');ola.className='ola';
    ola.style.setProperty('--c',piel==='std'?'var(--grad)':piel);
    document.body.appendChild(ola);
    var a=ola.animate({clipPath:circ},{duration:520,easing:'cubic-bezier(.6,0,.2,1)',fill:'forwards'});
    a.onfinish=function(){aplicar();redibujar();ola.animate({opacity:[1,0]},{duration:420,fill:'forwards'}).onfinish=function(){ola.remove()}};
  }

  /* ================= comentarios al margen ================= */
  var tNotas=byId('toggle-notas');
  tNotas.setAttribute('aria-pressed',String(!body.classList.contains('sin-notas')));
  tNotas.addEventListener('click',function(){
    var on=tNotas.getAttribute('aria-pressed')!=='true';
    tNotas.setAttribute('aria-pressed',String(on));
    body.classList.toggle('sin-notas',!on);
    try{localStorage.setItem('gc-notas',on?'1':'0')}catch(e){}
  });

  /* ================= contacto ================= */
  $('[data-copiar]').forEach(function(b){
    b.addEventListener('click',function(e){
      if(!navigator.clipboard) return; // sin portapapeles, el mailto hace su trabajo
      e.preventDefault();
      var txt=b.getAttribute('data-copiar'), lbl=b.querySelector('.lbl'), antes=lbl?lbl.textContent:'';
      navigator.clipboard.writeText(txt).then(function(){
        if(lbl){lbl.textContent='¡Copiado!';setTimeout(function(){lbl.textContent=antes},1600)}
      },function(){location.href=b.href});
    });
  });

  var dock=byId('dock'), dockBtn=byId('dock-btn');
  function cerrarDock(){dock.classList.remove('abierto');dockBtn.setAttribute('aria-expanded','false')}
  dockBtn.addEventListener('click',function(){var a=dock.classList.toggle('abierto');dockBtn.setAttribute('aria-expanded',String(a))});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dock.classList.contains('abierto')){cerrarDock();dockBtn.focus()}});
  $('.canal',dock).forEach(function(a){a.addEventListener('click',function(){if(!a.hasAttribute('data-copiar'))cerrarDock()})});
  var heroSec=document.querySelector('.hero-sec'), muda=byId('muda'), pieEl=document.querySelector('.pie');
  function dockScroll(){
    var pasado=heroSec.getBoundingClientRect().bottom<80;
    var mr=muda.getBoundingClientRect();
    var enMuda=mr.top<innerHeight*.6&&mr.bottom>innerHeight*.4;
    var enPie=pieEl.getBoundingClientRect().top<innerHeight-40;
    var ver=pasado&&!enMuda&&!enPie;
    dock.classList.toggle('visible',ver);
    if(!ver) cerrarDock();
  }
  addEventListener('scroll',dockScroll,{passive:true});dockScroll();

  /* ================= formulario ================= */
  var form=byId('form-muda'), idea=byId('idea'), fIdea=byId('f-idea'), contador=byId('contador');
  var inpC=byId('contacto'), err=byId('error'), boton=form.querySelector('.boton'), botonTxt=boton.querySelector('span');

  $('.chip[data-pres]').forEach(function(c){c.addEventListener('click',function(){
    var ya=state.pres===c.dataset.pres;
    state.pres=ya?null:c.dataset.pres;
    $('.chip[data-pres]').forEach(function(o){o.setAttribute('aria-pressed',String(!ya&&o===c))});
    byId('presupuesto').value=state.pres||'';
    byId('f-pres').textContent=state.pres||'por definir';
  })});

  function pintarIdea(){
    var v=idea.value.trim();
    fIdea.textContent=v?'“'+v+'”':(voz.blob?'Nota de voz · '+fmtT(voz.seg):'Tu idea aparece aquí mientras escribes.');
    fIdea.classList.toggle('vacia',!v&&!voz.blob);
    contador.textContent=idea.value.length+'/400';
  }
  idea.addEventListener('input',pintarIdea);

  var ejemplos=['una app para reservar canchas de indor en Cuenca','la tienda en línea de mi taller de cerámica','un sistema de turnos para mi consultorio','una web para mi restaurante en Montañita','automatizar las facturas de mi distribuidora'];
  var iEj=0;
  setInterval(function(){if(document.activeElement!==idea&&!idea.value){iEj=(iEj+1)%ejemplos.length;idea.placeholder=ejemplos[iEj]}},3200);

  $('.chip[data-canal]').forEach(function(c){c.addEventListener('click',function(){
    state.canal=c.dataset.canal;
    var wa=state.canal==='WhatsApp';
    $('.chip[data-canal]').forEach(function(o){o.setAttribute('aria-pressed',String(o===c))});
    byId('canal').value=state.canal;
    inpC.type=wa?'tel':'email';
    inpC.placeholder=wa?'+593 99 123 4567':'tu@correo.com';
    inpC.setAttribute('autocomplete',wa?'tel':'email');
    inpC.setAttribute('inputmode',wa?'tel':'email');
    byId('f-canal').textContent=state.canal;
  })});

  /* ---- escribir o hablar ---- */
  var puedeGrabar=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
  var tabs={escribir:byId('tab-escribir'),hablar:byId('tab-hablar')}, modoActual='escribir';
  if(puedeGrabar) document.querySelector('.modos').hidden=false;
  function modo(m,foco){
    modoActual=m;
    Object.keys(tabs).forEach(function(k){
      tabs[k].setAttribute('aria-selected',String(k===m));
      tabs[k].tabIndex=k===m?0:-1;
      byId('panel-'+k).hidden=k!==m;
    });
    if(foco) tabs[m].focus();
    if(m==='hablar') dibujaOnda(null);
  }
  tabs.escribir.addEventListener('click',function(){modo('escribir')});
  tabs.hablar.addEventListener('click',function(){modo('hablar')});
  document.querySelector('.modos').addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();modo(modoActual==='escribir'?'hablar':'escribir',true)}
  });

  var voz={seg:0,grabando:false,iv:null,rec:null,stream:null,an:null,ac:null,raf:0,partes:[],blob:null,tipo:''};
  var bG=byId('grabar'), cvO=byId('onda'), tV=byId('t-voz'), nV=byId('voz-nota'), historial=[];
  function fmtT(s){return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
  function dibujaOnda(datos){
    var r=cvO.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2); if(!r.width) return;
    cvO.width=r.width*d;cvO.height=r.height*d;var c=cvO.getContext('2d');c.scale(d,d);c.clearRect(0,0,r.width,r.height);
    var n=Math.floor(r.width/6), col=getComputedStyle(root).getPropertyValue('--piel-leg').trim()||'#00C8CF';
    c.fillStyle=voz.grabando||voz.blob?col:'#3A3A36';
    for(var i=0;i<n;i++){var v=datos?datos[i]:.08;var h=Math.max(2,v*r.height);c.fillRect(i*6,(r.height-h)/2,3,h)}
  }
  function bucle(){
    var v=0;
    if(voz.an){var a=new Uint8Array(voz.an.fftSize);voz.an.getByteTimeDomainData(a);var s=0;for(var i=0;i<a.length;i++){var x=(a[i]-128)/128;s+=x*x}v=Math.min(1,Math.sqrt(s/a.length)*4)}
    historial.push(v);var n=Math.floor(cvO.getBoundingClientRect().width/6);while(historial.length>n)historial.shift();
    dibujaOnda(new Array(Math.max(0,n-historial.length)).fill(.06).concat(historial));
    voz.raf=requestAnimationFrame(bucle);
  }
  function tipoAudio(){
    var t=['audio/webm;codecs=opus','audio/webm','audio/mp4;codecs=mp4a.40.2','audio/mp4'];
    for(var i=0;i<t.length;i++) if(MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t[i])) return t[i];
    return '';
  }
  function empezar(st){
    voz.stream=st;voz.partes=[];voz.blob=null;voz.seg=0;historial=[];
    try{voz.ac=new (window.AudioContext||window.webkitAudioContext)();var src=voz.ac.createMediaStreamSource(st);voz.an=voz.ac.createAnalyser();voz.an.fftSize=512;src.connect(voz.an)}catch(e){voz.an=null}
    var tipo=tipoAudio();
    voz.rec=tipo?new MediaRecorder(st,{mimeType:tipo,audioBitsPerSecond:48000}):new MediaRecorder(st);
    voz.tipo=voz.rec.mimeType||tipo||'audio/webm';
    voz.rec.ondataavailable=function(e){if(e.data&&e.data.size)voz.partes.push(e.data)};
    voz.rec.onstop=function(){
      voz.blob=voz.partes.length?new Blob(voz.partes,{type:voz.tipo}):null;
      if(voz.blob&&voz.blob.size>MAX_AUDIO){voz.blob=null;nV.textContent='La nota quedó muy pesada. Graba una más corta o escribe tu idea.';}
      else if(voz.blob){nV.textContent='Nota de voz lista ('+fmtT(voz.seg)+'). Toca el micrófono para grabarla de nuevo.';}
      pintarIdea();dibujaOnda(historial.length?historial:null);
    };
    voz.rec.start(1000);
    voz.grabando=true;tV.textContent='0:00';bG.classList.add('on');bG.setAttribute('aria-label','Terminar nota de voz');
    nV.textContent='Grabando… vuelve a tocar para terminar.';
    voz.iv=setInterval(function(){voz.seg++;tV.textContent=fmtT(voz.seg);if(voz.seg>=120)terminar()},1000);
    bucle();
  }
  function terminar(){
    voz.grabando=false;clearInterval(voz.iv);cancelAnimationFrame(voz.raf);
    bG.classList.remove('on');bG.setAttribute('aria-label','Grabar de nuevo');
    try{if(voz.rec&&voz.rec.state!=='inactive')voz.rec.stop()}catch(e){}
    if(voz.stream)voz.stream.getTracks().forEach(function(t){t.stop()});
    if(voz.ac&&voz.ac.close)voz.ac.close();
    voz.stream=null;voz.an=null;voz.ac=null;
  }
  bG.addEventListener('click',function(){
    if(voz.grabando){terminar();return;}
    navigator.mediaDevices.getUserMedia({audio:true}).then(empezar,function(){
      nV.textContent='No pudimos usar el micrófono. Revisa el permiso del navegador o escribe tu idea.';
    });
  });

  /* ---- enviar ---- */
  function waLink(texto){return 'https://wa.me/'+CONTACTO.whatsapp+'?text='+encodeURIComponent(texto)}
  function resumen(texto,contacto){
    return 'Hola Geecko Craft, quiero construir algo.\n\nIdea: '+(texto||'(les mandé una nota de voz de '+fmtT(voz.seg)+')')+
      '\nPresupuesto: '+(state.pres||'por definir')+
      '\nColor de mi marca: '+(state.skin==='std'?'por definir':state.skin)+
      '\nRespóndanme por '+state.canal+': '+contacto;
  }
  function mostrarError(msg,conWa){
    err.textContent=msg;
    if(conWa){
      var a=document.createElement('a');a.href=waLink(resumen(idea.value.trim(),inpC.value.trim()));a.target='_blank';a.rel='noopener';a.textContent='mándanosla por WhatsApp';
      err.appendChild(document.createTextNode(' Mientras tanto, '));err.appendChild(a);err.appendChild(document.createTextNode('.'));
    }
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(state.enviando) return;
    if(voz.grabando) terminar();
    var contacto=inpC.value.trim(), texto=idea.value.trim();
    if(!texto&&!voz.blob){mostrarError('Falta tu idea. Escribe una frase o graba una nota de voz.');(modoActual==='hablar'?bG:idea).focus();return;}
    if(state.canal==='Correo'&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contacto)){mostrarError('Ese correo no parece completo. Revisa que tenga @ y dominio.');inpC.focus();return;}
    if(state.canal==='WhatsApp'&&contacto.replace(/\D/g,'').length<9){mostrarError('Déjanos tu número de WhatsApp con código de país, por ejemplo +593 99 123 4567.');inpC.focus();return;}
    err.textContent='';

    var fd=new FormData(form);
    if(voz.blob) fd.append('audio',voz.blob,'nota-de-voz.'+(voz.tipo.indexOf('mp4')>-1?'m4a':'webm'));
    if(voz.blob) fd.append('duracion',String(voz.seg));
    state.enviando=true;boton.disabled=true;botonTxt.textContent='Enviando…';

    fetch(API,{method:'POST',body:fd,headers:{Accept:'application/json'}})
      .then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok||!j.ok)throw new Error(j.error||'');return j})})
      .then(function(j){
        botonTxt.textContent='Enviado';
        setSkin(state.skin==='std'?'#2E4BFF':state.skin,boton);
        byId('f-num').textContent='propuesta #'+(j.id||'----');
        byId('sello').hidden=false;
        byId('ahora').hidden=false;
        byId('ya-wa').href=waLink(resumen(texto,contacto));
      })
      .catch(function(ex){
        state.enviando=false;boton.disabled=false;botonTxt.textContent='Enviar mi idea';
        mostrarError(ex.message||'No pudimos enviar tu idea en este momento.',true);
      });
  });

  /* ================= movimiento: un gesto distinto por sección ================= */
  if(reduce||!('IntersectionObserver' in window)) return;
  root.classList.add('anim');

  // hero: el gecko se dibuja
  $('#gecko-hero use.dibuja').forEach(function(u){u.classList.add('anim')});

  function fx(sel,tipo,stagger){$(sel).forEach(function(el,k){el.setAttribute('data-fx',tipo);if(stagger)el.style.setProperty('--d',Math.min(k*stagger,.8)+'s')})}
  fx('.sec .etq:not(.dinero .etq)','aparece');
  fx('.nota','aparece');
  fx('.sec .intro, #como h2','desliza');
  fx('.tabla-scroll tbody tr','barre',.08);
  fx('.dinero > .etq, .dinero > h3','aparece');
  fx('.leyenda > div','aparece',.12);
  fx('.commit','izq',.14);
  fx('#form-muda','campos');
  fx('.ficha','gira');
  fx('.clasico','aparece');
  fx('.rara','desliza');

  // precios: palabras que se angostan
  $('[data-fx="ancho"]').forEach(function(h){
    var w=parseFloat((getComputedStyle(h).fontVariationSettings.match(/[\d.]+/)||[70])[0])||70, i=0, frag=document.createDocumentFragment();
    Array.prototype.slice.call(h.childNodes).forEach(function(n){
      if(n.nodeType!==3){frag.appendChild(n);return;}
      n.textContent.split(/(\s+)/).forEach(function(part){
        if(!part) return;
        if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));return;}
        var s=document.createElement('span');s.className='pw';s.textContent=part;s.style.setProperty('--d',(i++*.08)+'s');s.style.setProperty('--w',w);frag.appendChild(s);
      });
    });
    h.innerHTML='';h.appendChild(frag);
  });
  $('[data-fx="renglones"] .renglon>span').forEach(function(s,k){s.style.setProperty('--d',(k*.12)+'s')});

  // bitácora: título que se tipea y hash que se decodifica
  var hb=document.querySelector('[data-fx="tipear"]'), hbTxt=hb?hb.textContent:'';
  function tipear(){
    var c=0;hb.setAttribute('aria-label',hbTxt);hb.textContent='';hb.classList.add('tipeo');
    (function p(){c++;hb.textContent=hbTxt.slice(0,c);if(c<hbTxt.length)setTimeout(p,70);else setTimeout(function(){hb.classList.remove('tipeo');hb.removeAttribute('aria-label')},1600)})();
  }
  function decodificar(el){
    var fin=el.textContent, chars='0123456789abcdef', n=0;
    var iv=setInterval(function(){
      n++;el.textContent=fin.split('').map(function(ch,i){return i<n/2?ch:chars[Math.floor(Math.random()*16)]}).join('');
      if(n>=fin.length*2){clearInterval(iv);el.textContent=fin;el.classList.add('parpadea')}
    },35);
  }
  // precios: entran limpios y cuentan; el tachado va atado al scroll (pin, como proyectos)
  function contar(td){
    if(!td||td.dataset.contado) return; td.dataset.contado=1;
    var nodo=td.querySelector('.monto')||td.lastChild, final=parseInt(nodo.textContent.replace(/\D/g,''),10), t0=null;
    function fmt(v){return '$'+String(v).replace(/\B(?=(\d{3})+(?!\d))/g,'.')}
    function paso(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/900);nodo.textContent=fmt(Math.round(final*ease(p)));if(p<1)requestAnimationFrame(paso)}
    nodo.textContent='$0';setTimeout(function(){requestAnimationFrame(paso)},350);
  }

  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var el=e.target; io.unobserve(el);
      var d=parseFloat(el.style.getPropertyValue('--d')||0)*1000;
      el.classList.add('in');
      if(el.matches('.tabla-scroll')){
        var filas=$('tbody tr',el);
        filas.forEach(function(r,k){setTimeout(function(){r.classList.add('in');setTimeout(function(){contar(r.querySelector('.precio'))},200)},k*110)});
      }
      if(el.matches('.commit')) setTimeout(function(){decodificar(el.querySelector('.hash'))},d+100);
      if(el===hb) tipear();
    });
  },{threshold:.2,rootMargin:'0px 0px -6% 0px'});
  $('[data-fx]:not(tr), .bar, .relleno, .tabla-scroll').forEach(function(el){io.observe(el)});
  $('.bar div').forEach(function(d,k){d.style.setProperty('--d',(.15+k*.18)+'s')});

  /* ---- todo lo que va atado al scroll ---- */
  var prog=byId('progreso'), geck=byId('gecko-hero'), h1=document.querySelector('.h1');
  var lema=$('.lema span'), proms=$('.prom'), fases=document.querySelector('.fases'), pasos=$('.fase'), pend=false;
  var desde=[132,58,62], hasta=[58,92,130];

  // proyectos: carril horizontal fijado mientras bajas (escritorio)
  var proy=document.querySelector('.proyectos'), carril=byId('carril'), pista=byId('pista'), alto=null, dist=0;
  function armarPin(){
    var on=innerWidth>=900;
    proy.classList.toggle('pin',on);
    if(on){
      if(!alto){alto=document.createElement('div');alto.className='carril-alto';carril.parentNode.insertBefore(alto,carril);alto.appendChild(carril);}
      pista.style.transform='';dist=Math.max(0,pista.scrollWidth-innerWidth);
      var hp=pista.offsetHeight;carril.style.setProperty('--h',hp+'px');
      alto.style.height=(hp+dist)+'px';
    }else if(alto){alto.style.height='';pista.style.transform='';dist=0;}
  }
  armarPin();addEventListener('resize',armarPin);
  // con teclado, el carril fijado se mueve hasta la tarjeta enfocada
  pista.addEventListener('focusin',function(e){
    if(!alto||!dist) return;
    var li=e.target.closest('.pista > li'); if(!li) return;
    var q=clamp((li.offsetLeft-40)/dist);
    scrollTo({top:alto.getBoundingClientRect().top+scrollY-Math.max(16,(innerHeight-pista.offsetHeight)/2)+q*dist,behavior:'instant'});
  });

  // precios: tabla fija mientras bajas (como proyectos); el scroll tacha de a uno; al soltar entra el mensaje
  var preciosAlto=byId('precios-alto'), preciosSticky=document.querySelector('#precios .precios-sticky');
  var tablaPrecios=document.querySelector('#precios .tabla-scroll');
  var caro=document.querySelector('#precios .caro'), montosPrecios=[], distTacha=0, tachadosHasta=-1;
  function armarPinPrecios(){
    if(!preciosAlto||!preciosSticky||!tablaPrecios) return;
    montosPrecios=$('.monto',tablaPrecios);
    montosPrecios.forEach(function(m,k){m.style.setProperty('--d',(k*.07)+'s')});
    var h=tablaPrecios.offsetHeight;
    distTacha=Math.round(innerHeight*(innerWidth<720?.95:1.4));
    preciosAlto.classList.add('pin');
    preciosAlto.style.height=(h+distTacha)+'px';
    preciosAlto.style.setProperty('--ph',h+'px');
  }
  function tacharConScroll(){
    if(!preciosAlto||!distTacha||!montosPrecios.length) return;
    var ar=preciosAlto.getBoundingClientRect();
    var topPin=Math.max(16,(innerHeight-tablaPrecios.offsetHeight)/2);
    // q=0 al enganchar el sticky; q=1 al soltarlo (igual que proyectos)
    var q=clamp((topPin-ar.top)/distTacha);
    // precios limpios un momento, luego tacha de arriba a abajo con el scroll
    var strike=clamp((q-.06)/.74);
    var n=Math.min(montosPrecios.length, Math.floor(strike*montosPrecios.length+.0001));
    if(n-1!==tachadosHasta){
      montosPrecios.forEach(function(m,i){m.classList.toggle('tacha',i<n)});
      tachadosHasta=n-1;
    }
    // mensaje entra al terminar el tachado, cuando el pin ya suelta
    if(caro) caro.classList.toggle('in',q>=.95&&tachadosHasta>=montosPrecios.length-1);
  }
  armarPinPrecios();addEventListener('resize',armarPinPrecios);

  function onScroll(){
    pend=false;
    if(alto&&dist&&proy.classList.contains('pin')){var ar=alto.getBoundingClientRect();var topPin=Math.max(16,(innerHeight-pista.offsetHeight)/2);var q=clamp((topPin-ar.top)/dist);pista.style.transform='translate3d('+(-q*dist).toFixed(1)+'px,0,0)';}
    tacharConScroll();
    var y=scrollY, max=root.scrollHeight-innerHeight;
    prog.style.transform='scaleX('+(max>0?y/max:0)+')';
    if(y<innerHeight*1.4){geck.style.transform='translateY('+(y*.18)+'px) rotate('+(y*.012)+'deg)';h1.style.transform='translateY('+(y*-.06)+'px)'}
    // diferencias: la de atrás se encoge y se apaga cuando la siguiente la tapa
    proms.forEach(function(p,k){
      var sig=proms[k+1]; if(!sig){p.style.transform='';p.style.filter='';return;}
      var top=parseFloat(getComputedStyle(sig).top), r=sig.getBoundingClientRect();
      var q=clamp(1-(r.top-top)/(innerHeight*.8));
      p.style.transform='scale('+(1-q*.06)+')';p.style.filter='brightness('+(1-q*.35)+')';
    });
    // pasos: riel que se llena y enciende cada paso
    var fr=fases.getBoundingClientRect(), pf=clamp((innerHeight*.75-fr.top)/(fr.height*.9));
    fases.style.setProperty('--p',pf.toFixed(3));
    pasos.forEach(function(f,k){f.classList.toggle('on',pf>=k/pasos.length+.04||pf>=.98)});
    // pie: el lema cambia de ancho al entrar
    var pr=pieEl.getBoundingClientRect(), pp=ease(clamp((innerHeight-pr.top)/(innerHeight*.75)));
    lema.forEach(function(s,k){s.style.fontVariationSettings="'wdth' "+(desde[k]+(hasta[k]-desde[k])*pp).toFixed(1)});
  }
  addEventListener('scroll',function(){if(!pend){pend=true;requestAnimationFrame(onScroll)}},{passive:true});
  addEventListener('resize',onScroll);
  onScroll();

  /* ---- fondo: curvas de nivel en WebGL detrás de toda la página ---- */
  var cv=byId('terreno');
  var gl=cv.getContext('webgl2',{premultipliedAlpha:true,antialias:false}); if(!gl) return;
  var vs='#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var fs='#version 300 es\nprecision highp float;out vec4 o;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1,c2,c3;uniform float sc,amp;'+
  'vec3 p3(vec3 x){return mod(((x*34.)+1.)*x,289.);}'+
  'float sn(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.);vec3 p=p3(p3(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));vec3 mm=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);mm=mm*mm;mm=mm*mm;vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;mm*=1.79284291400159-.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(mm,g);}'+
  'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=gl_FragCoord.xy/r.y*1.5+vec2(0.,sc);vec2 mp=m/r.y*1.5+vec2(0.,sc);'+
  'float n=sn(p*.8+vec2(t*.025,t*.018))*.65+sn(p*1.9-vec2(t*.03,-t*.02))*.22;'+
  'float d=distance(p,mp);n+=.45*exp(-d*d*5.);'+
  'float k=n*8.;float g=min(fract(k),1.-fract(k));float w=fwidth(k);'+
  'float mayor=1.-step(.5,mod(floor(k+.5),5.));'+
  'float l=1.-smoothstep(0.,w*(1.2+mayor*.9),g);'+
  'float s=clamp(uv.x*.45+(1.-uv.y)*.55,0.,1.);vec3 col=s<.5?mix(c1,c2,s*2.):mix(c2,c3,s*2.-1.);'+
  'float halo=exp(-d*d*2.2);float al=l*(.17+mayor*.24+halo*.6)*amp;vec3 c=col*al+col*halo*.07*amp;o=vec4(c,max(al,halo*.07*amp));}';
  function sh(tipo,src){var s=gl.createShader(tipo);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null}
  var v=sh(gl.VERTEX_SHADER,vs), f=sh(gl.FRAGMENT_SHADER,fs); if(!v||!f) return;
  var pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var la=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,2,gl.FLOAT,false,0,0);
  var U={};['r','t','m','c1','c2','c3','sc','amp'].forEach(function(n){U[n]=gl.getUniformLocation(pr,n)});
  function rgb(h){var n=parseInt(h.slice(1),16);return[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255]}
  var STD=[rgb('#C2F04A'),rgb('#00C8CF'),rgb('#2E4BFF')], col=STD.map(function(c){return c.slice()}), meta=STD;
  document.addEventListener('gcpiel',function(e){var s=e.detail;meta=s==='std'?STD:[rgb(s),rgb(s),rgb(s)]});
  var movil=innerWidth<720;
  var dpr=movil?Math.min(devicePixelRatio||1,1.25):Math.min(devicePixelRatio||1,1.5), W=0,H=0;
  function talla(){var b=cv.getBoundingClientRect();W=Math.max(1,Math.round(b.width*dpr));H=Math.max(1,Math.round(b.height*dpr));cv.width=W;cv.height=H;gl.viewport(0,0,W,H)}
  talla();addEventListener('resize',talla);
  var mx=-9999,my=-9999,tx=-9999,ty=-9999,ultToque=-1e9;
  function apunta(x,y){tx=x*dpr;ty=(innerHeight-y)*dpr;if(mx<-9000){mx=tx;my=ty}ultToque=performance.now()}
  addEventListener('pointermove',function(e){apunta(e.clientX,e.clientY)},{passive:true});
  addEventListener('touchstart',function(e){var p=e.touches[0];if(p)apunta(p.clientX,p.clientY)},{passive:true});
  addEventListener('touchmove',function(e){var p=e.touches[0];if(p)apunta(p.clientX,p.clientY)},{passive:true});
  // zonas donde el brillo sube: hero, proyectos, servicios, formulario y pie
  var zonas=$('.hero-sec, #proyectos, #precios, #muda, .pie'), ampMeta=1, ampAct=0, scAct=0, velScroll=0, yPrev=scrollY;
  function medirZonas(){
    var best=0;zonas.forEach(function(z){var r=z.getBoundingClientRect();var vis=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top))/innerHeight;if(vis>best)best=vis});
    ampMeta=(.4+.6*Math.min(1,best*1.4))*(movil?.7:1);
  }
  addEventListener('scroll',function(){medirZonas();velScroll+=scrollY-yPrev;yPrev=scrollY},{passive:true});medirZonas();
  var visible=true, ultimo=0, paso=movil?33:0, t0=performance.now();
  new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)requestAnimationFrame(frame)}).observe(cv);
  function frame(ts){
    if(!visible||document.hidden) return;
    requestAnimationFrame(frame);
    if(ts-ultimo<paso) return; ultimo=ts;
    var tt=(ts-t0)/1000;
    if(ts-ultToque>2500){ // sin cursor ni dedo: el brillo pasea solo y reacciona al scroll
      tx=W*(.62+.28*Math.sin(tt*.31));ty=H*(.55+.3*Math.cos(tt*.23))-velScroll*dpr*.6;if(mx<-9000){mx=tx;my=ty}
    }
    velScroll*=.9;
    mx+=(tx-mx)*.06;my+=(ty-my)*.06;
    ampAct+=(ampMeta-ampAct)*.05;scAct+=(scrollY/innerHeight*.55-scAct)*.08;
    gl.uniform1f(U.sc,scAct);gl.uniform1f(U.amp,ampAct);
    for(var i=0;i<3;i++)for(var j=0;j<3;j++)col[i][j]+=(meta[i][j]-col[i][j])*.06;
    gl.uniform2f(U.r,W,H);gl.uniform1f(U.t,tt);gl.uniform2f(U.m,mx,my);
    gl.uniform3fv(U.c1,col[0]);gl.uniform3fv(U.c2,col[1]);gl.uniform3fv(U.c3,col[2]);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,3);
  }
  document.addEventListener('visibilitychange',function(){if(!document.hidden)requestAnimationFrame(frame)});
  requestAnimationFrame(frame);setTimeout(function(){cv.classList.add('on')},300);
})();
