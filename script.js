document.addEventListener('DOMContentLoaded', () => {
  const qs=(s,c=document)=>c.querySelector(s); const qsa=(s,c=document)=>[...c.querySelectorAll(s)];

  // Image gallery
  const lightbox=qs('#lightbox'), lightboxImage=qs('#lightboxImage'), closeLightbox=qs('#closeLightbox');
  qsa('.gallery-card[data-image]').forEach(card=>card.addEventListener('click',()=>{if(!lightbox||!lightboxImage)return;lightboxImage.src=card.dataset.image;lightbox.showModal();}));
  closeLightbox?.addEventListener('click',()=>lightbox.close());
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});

  // Video gallery videoDialog?.addEventListener('click',e=>{if(e.target===videoDialog)closeVideoDialog();});

  // Engine sound experience
  const audio=qs('#audio'), heroEngineButton=qs('#heroEngineButton'), heroHint=qs('#heroEngineHint');
  const setEngineState=playing=>{heroEngineButton?.classList.toggle('engine-on',playing);if(heroHint)heroHint.textContent=playing?'Soundcheck läuft – erneut klicken zum Stoppen.':'Originalen M4 Soundcheck abspielen.';};
  const toggleAudio=()=>{if(!audio)return;if(audio.paused){audio.play().then(()=>setEngineState(true)).catch(()=>{});}else{audio.pause();setEngineState(false);}};
  heroEngineButton?.addEventListener('click',toggleAudio); audio?.addEventListener('ended',()=>setEngineState(false));

  // Booking form and mandatory legal confirmations
  const form=qs('#requestForm'), submit=qs('#submitRequest'), wa=qs('#dynamicWhatsApp'), status=qs('#formStatus'); const checks=qsa('.legal-required');
  const fields={name:qs('#requestName'),phone:qs('#requestPhone'),email:qs('#requestEmail'),tariff:qs('#requestTariff'),from:qs('#requestFrom'),to:qs('#requestTo'),message:qs('#requestMessage')};
  const allAccepted=()=>checks.length>0&&checks.every(c=>c.checked);
  const complete=()=>Object.values(fields).slice(0,6).every(el=>el&&el.value.trim());
  const buildText=()=>`Hallo SS Prestige Cars,\n\nich möchte eine Mietanfrage für den BMW M4 Competition senden.\n\nName: ${fields.name.value}\nTelefon: ${fields.phone.value}\nE-Mail: ${fields.email.value}\nTarif: ${fields.tariff.value}\nVon: ${fields.from.value}\nBis: ${fields.to.value}\nNachricht: ${fields.message.value||'-'}\n\nZusatzkilometer: CHF 0.80 / km\n\nIch bestätige, dass ich AGB, Mietbedingungen sowie Reservierungs- und Stornierungsbedingungen gelesen und akzeptiert und Datenschutzerklärung sowie Impressum zur Kenntnis genommen habe.`;
  const update=()=>{const accepted=allAccepted();submit.disabled=!accepted;wa.classList.toggle('disabled',!accepted);wa.setAttribute('aria-disabled',String(!accepted));if(accepted){wa.href=`https://wa.me/41797862408?text=${encodeURIComponent(buildText())}`;}else{wa.href='#';}};
  checks.forEach(c=>c.addEventListener('change',update)); Object.values(fields).forEach(el=>el?.addEventListener('input',update)); update();
  wa?.addEventListener('click',e=>{if(!allAccepted()){e.preventDefault();status.textContent='Bitte zuerst alle Pflichtbestätigungen setzen.';status.className='form-status error';return;}if(!complete()){e.preventDefault();status.textContent='Bitte Name, Telefon, E-Mail, Tarif sowie Von/Bis vollständig ausfüllen.';status.className='form-status error';return;}wa.href=`https://wa.me/41797862408?text=${encodeURIComponent(buildText())}`;});
  form?.addEventListener('submit',e=>{e.preventDefault();if(!allAccepted()){status.textContent='Bitte zuerst alle Pflichtbestätigungen setzen.';status.className='form-status error';return;}if(!form.checkValidity()){form.reportValidity();return;}const subject=encodeURIComponent('Mietanfrage BMW M4 Competition – SS Prestige Cars');const body=encodeURIComponent(buildText());status.textContent='E-Mail-Anfrage wird geöffnet …';status.className='form-status';window.location.href=`mailto:ssprestigecars.ch@gmail.com?subject=${subject}&body=${body}`;});
});
