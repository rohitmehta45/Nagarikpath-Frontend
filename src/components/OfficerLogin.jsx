import {useState} from 'react';
import api from '../services/api';

export default function OfficerLogin({onLogin}) {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const submit=async event=>{
    event.preventDefault();setError('');setLoading(true);
    try { const {data}=await api.post('/auth/login',{email,password});
      if(data.user.role!=='OFFICER') throw new Error('This workspace requires a Government Officer account.');
      localStorage.setItem('databridge_token',data.token);
      localStorage.setItem('databridge_user',JSON.stringify(data.user));
      window.dispatchEvent(new PopStateEvent('popstate'));
      onLogin(data.user);
    } catch(err) { setError(err.message||'Unable to sign in.'); } finally { setLoading(false); }
  };
  return <form className="verification-form" onSubmit={submit}><h3>Secure officer sign-in</h3><p>Sign in with an authorized Government Officer account to open this protected workspace.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>{error&&<p style={{color:'#9b1e2c',fontWeight:700}} role="alert">{error}</p>}<button className="crimson-button" disabled={loading}>{loading?'Signing in…':'Sign in as officer →'}</button></form>;
}
