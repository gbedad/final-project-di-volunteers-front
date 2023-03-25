import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Title from './Title';



function preventDefault(event) {
  event.preventDefault();
}
function createData(userid, first_name, last_name, email, mission, created_at, status) {
    return { userid, first_name, last_name, email, mission, created_at, status };
  }
export default function Users(props) {

  console.log(props.data)
  const navigate = useNavigate()
  const location = useLocation()

  const users = props.data
    // const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null);
    const [dataActive, setDataActive] = useState([]);
    const [activeUsers, setActiveUsers] = useState(null)
    const [countUsersByStatus, setCountUsersByStatus] = useState({})
  
    console.log("location====>>>", location);
// Generate Order Data
const handleRowClick = (userId) => {
  setSelectedUser(userId);
  navigate('/change-status', {state: {userId, userLogged: location.state.userLogged}})
};
console.log(selectedUser);

console.log(users);

// useEffect(() => {
//     const fetchUserList = async () => {
//         try {
//           const response = await axios.post('/all-users');
//           console.log(response)

          
//           const filteredData = response.data.filter(item => item.is_active === true);
//           const rowCounts = response.data.reduce((acc, item) => {
//             const { status } = item;
//             acc[status] = (acc[status] || 0) + 1;
//             return acc;
//           }, {});
//           setUsers(response.data)
//           setDataActive(filteredData);
//           setActiveUsers(filteredData.length);
//           setCountUsersByStatus(rowCounts)

//         //   return response.data;
//         } catch (error) {
//           console.error(error);
//         }
      
//       };
     
//         fetchUserList()
//       }, [])

//     console.log("Active Users", activeUsers)
//     console.log("By Status", countUsersByStatus)
   
    console.log(users);

    const rows = users.map((item, key=item.id) => {
     return   createData(
    item.id,
    item.first_name,
    item.last_name,
    item.email,
    item.mission.title,
    item.created_at,
    item.status
        )
    })
    

  return (
    !rows ? (
      <Stack sx={{ color: 'grey.500' }} spacing={2} direction="row">
        <CircularProgress color="secondary" />
      </Stack>
    ) :(

   
    <React.Fragment>
      <Title>Recent Users</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>FIRST NAME</TableCell>
            <TableCell>LAST NAME</TableCell>
            <TableCell>EMAIL</TableCell>
            <TableCell>MISSION</TableCell>
            <TableCell>CREATED</TableCell>
            <TableCell align="right">STATUS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows ? rows.map((row) => (
            <TableRow key={row.id} onClick={() => handleRowClick(row.userid)} selected={selectedUser === row.userid}>
                <TableCell>{row.userid}</TableCell >
                <TableCell>{row.first_name}</TableCell>
                <TableCell>{row.last_name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.mission}</TableCell>
                <TableCell>{row.created_at}</TableCell>
                <TableCell align="right">{row.status}</TableCell>
            </TableRow>
          )) :
          (
            <CircularProgress color="secondary" />
          )}
        </TableBody>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        {/* See more orders */}
      </Link>
    </React.Fragment>
     )
  );
}