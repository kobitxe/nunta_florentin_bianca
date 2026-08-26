import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Panel from './admin/Panel.jsx'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError('Email o contraseña incorrectos.')
    setEnviando(false)
  }

  return (
    <div className="login">
      <h1>Panel de la boda</h1>
      <form onSubmit={onSubmit}>
        <div className="campo">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="campo">
          <label htmlFor="login-pass">Contraseña</label>
          <input
            id="login-pass"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="rsvp__enviar" type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        {error && <p className="aviso aviso--error">{error}</p>}
      </form>
    </div>
  )
}

export default function Admin() {
  const [sesion, setSesion] = useState(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setListo(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, nueva) => setSesion(nueva))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return (
      <div className="admin">
        <p className="aviso aviso--info">Supabase no está configurado (revisa las variables de entorno).</p>
      </div>
    )
  }

  return <div className="admin">{!listo ? null : sesion ? <Panel email={sesion.user?.email} /> : <Login />}</div>
}
