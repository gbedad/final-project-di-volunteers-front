export function formatPhoneNumber(phoneNumber) {
  // Insert a space after every two digits
  return phoneNumber.replace(/(\d{2})/g, '$1 ');
}
