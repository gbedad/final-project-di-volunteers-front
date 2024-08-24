let rows = [
  {
    id: 1,
    first_name: 'Toto',
    last_name: 'Bodruche',
    phone: '07 45 65 67 89',
    email: 'toto@example.com',
    dateCreated: new Date('2023-03-09'),
  },
  {
    id: 2,
    first_name: 'Victoire',
    last_name: 'Navet',
    phone: '07 45 00 67 01',
    email: 'victoireo@example.com',
    dateCreated: new Date('2023-03-09'),
  },
];

const getAll = () => {
  //real axios
  // return axios.get('/seller', {});

  //virtual axios
  return new Promise((resolve, reject) => {
    const res = { data: rows };
    resolve(res);
  });
};

const saveRow = (row) => {
  //real axios
  // return axios.patch('/seller', row);

  //virtual axios
  return new Promise((resolve, reject) => {
    if (row.isNew) rows.push(row);
    else rows = rows.map((r) => (r.id === row.id ? row : r));
    resolve({ data: row });
  });
};

const deleteRow = (rowId) => {
  //real axios
  // return axios.delete(`/seller/${rowId}`);

  //virtual axios
  return new Promise((resolve, reject) => {
    const deletedRow = rows.find((r) => r.id === rowId);
    rows = rows.filter((r) => r.id !== rowId);
    resolve({ data: deletedRow });
  });
};

export default {
  getAll,
  saveRow,
  deleteRow,
};
