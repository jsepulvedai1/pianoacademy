async function testLeads() {
  const query = `
    query {
      allLeads {
        id
        nombre
        estado
        servicio
        fuente
      }
    }
  `;
  const response = await fetch('http://localhost:8000/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const json = await response.json();
  console.log(JSON.stringify(json, null, 2));
}

testLeads();
