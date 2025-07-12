import React, { useState } from 'react';

function Registo() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://pi3-q1c2.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email_institucional: email,
          password,
          tipo_utilizador: 'administrador', 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Registo efetuado com sucesso!');
        setNome('');
        setEmail('');
        setPassword('');
      } else {
        setMensagem( `❌ Erro: ${data.message || 'Erro desconhecido.'}`);
      }
    } catch (err) {
      setMensagem('❌ Erro ao conectar ao servidor.');
    }
  };

  return (
    <div>
      <h2>Registo de Utilizador</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label>Email institucional:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Palavra-passe:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Registar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}

export default Registo;