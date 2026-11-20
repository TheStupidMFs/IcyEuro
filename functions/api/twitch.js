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
    const streamRes=await fetch(`${TWITCH_API}/streams?user_id=${user.id}`,{headers:auth});
    const live=(await streamRes.json()).data?.[0];
    if(live){
      return new Response(JSON.stringify({live:true,title:live.title,game:live.game_name,viewers:live.viewer_count,startedAt:live.started_at}),{headers});
    }
    const videosRes=await fetch(`${TWITCH_API}/videos?user_id=${user.id}&first=1&type=archive&sort=time`,{headers:auth});
    const video=(await videosRes.json()).data?.[0];
    return new Response(JSON.stringify({live:false,latestVideo:video?{id:video.id,title:video.title,duration:video.duration,url:video.url,createdAt:video.created_at}:null}),{headers});
  }catch(error){
    return new Response(JSON.stringify({error:'Unable to load Twitch broadcast'}),{status:502,headers});
  }
}