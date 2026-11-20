const TWITCH_TOKEN_URL='https://id.twitch.tv/oauth2/token';
const TWITCH_API='https://api.twitch.tv/helix';
const USER_LOGIN='icyeuro';

export async function onRequestGet({env}){
  const headers={'content-type':'application/json','cache-control':'public, max-age=60'};
  if(!env.TWITCH_CLIENT_ID||!env.TWITCH_CLIENT_SECRET){
    return new Response(JSON.stringify({error:'Twitch credentials are not configured'}),{status:503,headers});
  }
  try{
    const tokenRes=await fetch(TWITCH_TOKEN_URL,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.TWITCH_CLIENT_ID,client_secret:env.TWITCH_CLIENT_SECRET,grant_type:'client_credentials'})});
    if(!tokenRes.ok) throw new Error('Token request failed');
    const {access_token}=await tokenRes.json();
    const auth={Authorization:`Bearer ${access_token}`,'Client-Id':env.TWITCH_CLIENT_ID};

    const userRes=await fetch(`${TWITCH_API}/users?login=${USER_LOGIN}`,{headers:auth});
    const user=(await userRes.json()).data?.[0];
    if(!user) throw new Error('Twitch user not found');

    const [streamRes,videosRes,clipsRes]=await Promise.all([
      fetch(`${TWITCH_API}/streams?user_id=${user.id}`,{headers:auth}),
      fetch(`${TWITCH_API}/videos?user_id=${user.id}&first=1&type=archive&sort=time`,{headers:auth}),
      fetch(`${TWITCH_API}/clips?broadcaster_id=${user.id}&first=3`,{headers:auth})
    ]);

    const live=(await streamRes.json()).data?.[0];
    const video=(await videosRes.json()).data?.[0];
    const clips=((await clipsRes.json()).data||[]).map(clip=>({
      id:clip.id,
      title:clip.title,
      url:clip.url,
      thumbnail:clip.thumbnail_url,
      views:clip.view_count,
      createdAt:clip.created_at
    }));

    const payload={
      live:Boolean(live),
      title:live?.title||null,
      game:live?.game_name||null,
      viewers:live?.viewer_count||null,
      startedAt:live?.started_at||null,
      latestVideo:video?{id:video.id,title:video.title,duration:video.duration,url:video.url,createdAt:video.created_at}:null,
      clips
    };
    return new Response(JSON.stringify(payload),{headers});
  }catch(error){
    return new Response(JSON.stringify({error:'Unable to load Twitch content'}),{status:502,headers});
  }
}