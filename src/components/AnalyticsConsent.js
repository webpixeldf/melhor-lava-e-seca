'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
const KEY = 'mls-cookie-consent-v1';
const ADS = 'AW-18305955963';
const GA = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA4_ID || '') ? process.env.NEXT_PUBLIC_GA4_ID : null;
function google(granted) {
  const state = granted ? 'granted' : 'denied';
  window.gtag?.('consent', 'update', {analytics_storage:state,ad_storage:state,ad_user_data:state,ad_personalization:state});
}
export default function AnalyticsConsent() {
 const [choice,setChoice] = useState(null);
 const [visible,setVisible] = useState(false);
 const pathname = usePathname();
 useEffect(()=>{let saved;try{saved=localStorage.getItem(KEY);}catch{} setChoice(saved === 'accepted' ? 'accepted' : saved === 'denied' ? 'denied' : null);setVisible(!saved || !['accepted','denied'].includes(saved));},[]);
 useEffect(()=>{
  if(choice !== 'accepted') return;
  if(!document.getElementById('mls-google-tag')) {
   window.dataLayer=window.dataLayer||[];
   window.gtag=function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   google(true);
   window.gtag('js',new Date());
   window.gtag('config',ADS);
   if(GA) window.gtag('config',GA,{send_page_view:false});
   const script=document.createElement('script');script.id='mls-google-tag';script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${ADS}`;document.head.appendChild(script);
  }
  const click=(event)=>{
   const link=event.target.closest?.('a[href]');if(!link) return;
   const host=new URL(link.href).hostname;
   if(!(host==='amzn.to' || host==='amazon.com.br' || host.endsWith('.amazon.com.br'))) return;
   window.gtag?.('event','affiliate_click',{link_domain:host,product:link.dataset.product || link.textContent.trim().slice(0,80),page_path:window.location.pathname});
   // Conversão de clique de saída, sem atribuir receita nem simular compra.
   window.gtag?.('event','conversion',{send_to:`${ADS}/CR2fCOHGtMwcEPvw-phE`});
  };
  document.addEventListener('click',click);
  return ()=>document.removeEventListener('click',click);
 },[choice]);
 useEffect(()=>{if(choice==='accepted' && GA) window.gtag?.('event','page_view',{send_to:GA,page_location:window.location.href,page_title:document.title,page_path:pathname});},[choice,pathname]);
 function save(value) {
  try{localStorage.setItem(KEY,value);}catch{}
  const revoke=choice==='accepted' && value==='denied';
  if(revoke){
   google(false);
   for(const entry of document.cookie.split(';')){
    const name=entry.split('=')[0].trim();
    if(!/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
    for(const domain of ['',window.location.hostname,`.${window.location.hostname.replace(/^www\./,'')}`]) document.cookie=`${name}=; Max-Age=0; path=/${domain?`; domain=${domain}`:''}`;
   }
  }
  setChoice(value);setVisible(false);
  // Recarrega sem as tags para encerrar também o código já carregado.
  if(revoke) window.location.reload();
 }
 return <>
  <div className="cookie-settings container"><button type="button" onClick={()=>setVisible(true)}>Preferências de cookies</button></div>
  {visible && <section className="cookie-banner" aria-label="Preferências de cookies">
   <div><strong>Você escolhe os cookies</strong><p>Com sua permissão, usamos ferramentas do Google para medir visitas e cliques em ofertas. Você pode recusar e continuar navegando. <a href="/privacidade/">Leia a política de privacidade.</a></p></div>
   <div className="cookie-actions"><button type="button" onClick={()=>save('denied')}>Recusar opcionais</button><button type="button" onClick={()=>save('accepted')}>Aceitar opcionais</button></div>
  </section>}
 </>;
}
