import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';

import Title from './Title';

import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Box from '@mui/material/Box';

import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
// import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import Badge from '@mui/material/Badge';

import ArticleIcon from '@mui/icons-material/Article';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import { shortDescription, longDescription } from '../js/statusDescription';

import { displayPhone } from '../js/phoneNumbersSpace';

function preventDefault(event) {
  event.preventDefault();
}
function createData(
  userid,
  first_name,
  last_name,
  email,
  phone,
  mission,
  created_at,
  status,
  is_active,
  trueValuesCount,
  test_voltaire_passed,
  interviews
) {
  return {
    userid,
    first_name,
    last_name,
    email,
    phone,
    mission,
    created_at,
    status,
    is_active,
    trueValuesCount,
    test_voltaire_passed,
    interviews,
  };
}
//Pagination
function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page">
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page">
        {theme.direction === 'rtl' ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page">
        {theme.direction === 'rtl' ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page">
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

export default function Users(props) {
  // console.log('FORM PROPS', props.data);
  const navigate = useNavigate();
  const location = useLocation();

  const users = props.data;
  // console.log(users);
  // const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null);
  const [dataActive, setDataActive] = useState([]);
  const [activeUsers, setActiveUsers] = useState(null);
  const [countUsersByStatus, setCountUsersByStatus] = useState({});

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // console.log("location====>>>", location);
  // Generate Order Data
  const handleRowClick = (userId) => {
    setSelectedUser(userId);
    navigate('/change-status', {
      state: { userId, userLogged: location.state.userLogged },
    });
  };
  // console.log(selectedUser);

  // console.log(users);

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

  // console.log(users);
  const calculateTrueValues = (users) => {
    return users.map((user) => {
      const trueValues = [
        user.id_received,
        user.cv_received,
        user.b3_received,
        // user.convention_received,
      ].filter((value) => value === true);
      return { ...user, trueValuesCount: trueValues.length };
    });
  };
  const usersWithTrueValuesCount = calculateTrueValues(users);

  // console.log(usersWithTrueValuesCount);

  const rows = usersWithTrueValuesCount.map((item, key = item.id) => {
    console.log(item.interviews);
    return createData(
      item.id,
      item.first_name,
      item.last_name,
      item.email,
      item.phone,
      item.mission.title,
      item.created_at,
      item.status,
      item.is_active,
      item.interviews,
      item.trueValuesCount,
      item.convention_received,
      item.test_voltaire_passed
    );
  });

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // console.log(rows);
  return (
    <TableContainer component={Paper}>
      <Title>All Users</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>FIRST NAME</TableCell>
            <TableCell>LAST NAME</TableCell>
            <TableCell>EMAIL</TableCell>
            <TableCell>PHONE</TableCell>
            <TableCell>MISSION</TableCell>
            <TableCell>CREATED</TableCell>
            <TableCell>STATUS</TableCell>
            <TableCell>INTERVIEWS</TableCell>
            <TableCell>DOCS.</TableCell>
            <TableCell>CONV.</TableCell>
            <TableCell align="right">ACTIVE</TableCell>
          </TableRow>
        </TableHead>
        {/* <TableBody>
          {rows.length !== 0 ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => handleRowClick(row.userid)}
                selected={selectedUser === row.userid}>
                <TableCell>{row.userid}</TableCell>
                <TableCell>{row.first_name}</TableCell>
                <TableCell>{row.last_name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.mission}</TableCell>
                <TableCell>
                  {new Date(row.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="right">
                  {row.is_active ? <VerifiedIcon color="success" /> : ''}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow sx={{ width: '100%' }}>
              <LinearProgress />
            </TableRow>
          )}
        </TableBody> */}
        <TableBody>
          {(rowsPerPage > 0
            ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            : rows
          ).map((row) => (
            <TableRow
              style={{ height: 40 }}
              key={row.userid}
              onClick={() => handleRowClick(row.userid)}
              selected={selectedUser === row.userid}>
              <TableCell style={{ width: 160 }} align="left">
                {row.first_name}
              </TableCell>
              <TableCell style={{ width: 160 }} align="left">
                {row.last_name}
              </TableCell>
              <TableCell style={{ width: 220 }} align="left">
                {row.email}
              </TableCell>
              <TableCell style={{ width: 160 }} align="left">
                {displayPhone(row.phone)}
              </TableCell>
              <TableCell style={{ width: 160 }} align="left">
                {row.mission}
              </TableCell>
              <TableCell style={{ width: 160 }} align="left">
                {new Date(row.created_at).toLocaleDateString()}
              </TableCell>
              <Tooltip title={longDescription(row.status)}>
                <TableCell style={{ width: 160 }} align="left">
                  {row.status}
                </TableCell>
              </Tooltip>
              <TableCell style={{ width: 160 }} align="left">
                {row.interviews}
              </TableCell>
              <TableCell style={{ width: 60 }} align="left">
                <Badge
                  badgeContent={`${row.trueValuesCount}/4`}
                  color={row.convention_received && 'success'}>
                  <ReceiptLongIcon />
                </Badge>
              </TableCell>
              <TableCell style={{ width: 60 }} align="left">
                <Badge
                  badgeContent={`${row.trueValuesCount}/4`}
                  color={row.test_voltaire_passed ? 'success' : 'secondary'}>
                  <ArticleIcon />
                </Badge>
              </TableCell>
              <TableCell style={{ width: 80 }} align="right">
                {row.is_active ? (
                  <VerifiedUserIcon fontSize="small" color="success" />
                ) : row.test_voltaire_passed === true ? (
                  <AssignmentTurnedInIcon />
                ) : (
                  ''
                )}
              </TableCell>
            </TableRow>
          ))}

          {emptyRows > 0 && (
            <TableRow style={{ height: 40 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[10, 15, 20, { label: 'All', value: -1 }]}
              colSpan={4}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        {/* See more orders */}
      </Link>
    </TableContainer>
  );
}
