export function formatDate(date) {
  let formattedDate;
  let dd = date.getDate();

  let mm = date.getMonth() + 1;
  const yyyy = date.getFullYear();
  if (dd < 10) {
    dd = `0${dd}`;
  }

  if (mm < 10) {
    mm = `0${mm}`;
  }

  formattedDate = `${dd}/${mm}/${yyyy}`;
  return formattedDate;
}
