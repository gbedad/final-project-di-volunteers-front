export const formatPhoneNumber = (value) => {
  if (!value) return value;

  // Remove all non-digit characters except '+'
  const phoneNumber = value.replace(/[^\d+]/g, '');

  // Check if it's an international number (starts with +)
  if (phoneNumber.startsWith('+')) {
    // International format
    let formattedNumber = '+';
    for (let i = 1; i < phoneNumber.length; i++) {
      if (i === 3 || i === 6 || i === 9 || i === 12) {
        formattedNumber += ' ';
      }
      formattedNumber += phoneNumber[i];
    }
    return formattedNumber.trim();
  } else {
    // Assuming French local format: 01 23 45 67 89
    if (phoneNumber.length <= 2) return phoneNumber;
    if (phoneNumber.length <= 4)
      return `${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2)}`;
    if (phoneNumber.length <= 6)
      return `${phoneNumber.slice(0, 2)} ${phoneNumber.slice(
        2,
        4
      )} ${phoneNumber.slice(4)}`;
    if (phoneNumber.length <= 8)
      return `${phoneNumber.slice(0, 2)} ${phoneNumber.slice(
        2,
        4
      )} ${phoneNumber.slice(4, 6)} ${phoneNumber.slice(6)}`;
    return `${phoneNumber.slice(0, 2)} ${phoneNumber.slice(
      2,
      4
    )} ${phoneNumber.slice(4, 6)} ${phoneNumber.slice(
      6,
      8
    )} ${phoneNumber.slice(8)}`;
  }
};

export const PhoneInputCell = (props) => {
  const { id, value, field, api } = props;

  const handleChange = (event) => {
    const formattedValue = formatPhoneNumber(event.target.value);
    api.setEditCellValue({ id, field, value: formattedValue });
  };

  return (
    <input
      type="tel"
      value={value || ''}
      onChange={handleChange}
      placeholder="(123) 456-7890"
      style={{
        border: 'none', // Removes the border
        outline: 'none', // Removes the outline on focus
        padding: '4px', // Optional: Add some padding for better appearance
        fontSize: 'inherit', // Inherit font size from parent
        width: '100%', // Make it full width
      }}
    />
  );
};
