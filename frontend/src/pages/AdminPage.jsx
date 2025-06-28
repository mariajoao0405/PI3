import React, { useEffect, useState } from 'react';

const PaginaAdmin = () => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken || 'Nenhum token encontrado');
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Página de Admin (Placeholder)</h1>
      <p><strong>Token JWT:</strong></p>
      <pre style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '5px' }}>
        {token}
      </pre>
    </div>
  );
};

export default PaginaAdmin;