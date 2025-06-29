import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaginaListarEstudantes = () => {
  const [estudantes, setEstudantes] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('authToken');
    if (!t) return window.location.href = '/login';
    setToken(t);
    fetchEstudantes(t);
  }, []);

  const fetchEstudantes = async (token) => {
    try {
      const res = await axios.get('http://localhost:3000/students/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEstudantes(res.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar estudantes:', err);
      setMensagem('Erro ao carregar estudantes.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Perfis de Estudantes</h2>

      {mensagem && <div className="alert alert-info">{mensagem}</div>}

      {estudantes.length > 0 ? (
        <table className="table table-bordered table-striped mt-4">
          <thead>
            <tr>
              <th>ID</th>
            <th>Nome</th>
              <th>Curso</th>
              <th>Ano</th>
              <th>Idade</th>
              <th>Áreas de Interesse</th>
              <th>Competências Técnicas</th>
              <th>Soft Skills</th>
              <th>CV</th>
            </tr>
          </thead>
          <tbody>
            {estudantes.map(est => (
              <tr key={est.id}>
                <td>{est.id}</td>
                <td>{est.user?.nome || 'N/A'}</td>
                <td>{est.curso}</td>
                <td>{est.ano}</td>
                <td>{est.idade}</td>
                <td>{est.areas_interesse}</td>
                <td>{est.competencias_tecnicas}</td>
                <td>{est.soft_skills}</td>
                <td>
                  {est.cv_url ? (
                    <a href={est.cv_url} target="_blank" rel="noreferrer">Ver CV</a>
                  ) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">Nenhum estudante registado ainda.</p>
      )}
    </div>
  );
};

export default PaginaListarEstudantes;
