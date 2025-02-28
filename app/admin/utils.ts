export function getData(saidas: any[]) {  
  // Group exits by date
  const saidasPorDia = saidas.reduce((acc, saida) => {
    const dataTime = new Date(saida.created_at);
    dataTime.setHours(dataTime.getHours() - 3);
    const data = dataTime.toLocaleDateString('pt-BR');

    if (!acc[data]) {
      acc[data] = {
        data,
        totalAlunos: 0,
        alunos: [],
      };
    }
    const time = new Date(saida.horario_saida);
    time.setHours(time.getHours() - 3);

    acc[data].alunos.push({
      nome: saida.aluno_nome,
      ra: saida.aluno_ra,
      horarioSaida: time.toLocaleTimeString('pt-BR'),
      data,
      motivo: saida.motivo,
    });
    acc[data].totalAlunos++;
    return acc;
  }, {});

  const diasAula = Object.values(saidasPorDia);
  const mediaSaidasPorDia = Math.round(saidas.length / diasAula.length);

  return { diasAula, mediaSaidasPorDia };
}