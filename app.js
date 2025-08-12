function serializeForm(form){return Object.fromEntries(new FormData(form).entries());}
async function fakeSubmit(){return new Promise(r=>setTimeout(r,700));}

function setupForm(id, okId){
  const form=document.getElementById(id);
  const ok=document.getElementById(okId);
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload=serializeForm(form);
    console.log(id, payload); // TODO: replace with your API call
    const btn=form.querySelector('button');
    btn.disabled=true;
    await fakeSubmit();
    btn.disabled=false;
    if(ok) ok.classList.remove('hidden');
    form.reset();
  });
}

setupForm('customer-form','customer-success');
setupForm('merchant-form','merchant-success');
