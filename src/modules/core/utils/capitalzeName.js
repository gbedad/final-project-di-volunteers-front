export const capitalizeFamiluName = (fullname) => {
  const nameParts = fullname.split(/[\s-]+/);
  if (nameParts.length < 2) {
    return fullname;
  }

  // Capitalize composed names
  const capitalizedNames = nameParts.map(
    (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  );

  // Reconstruct the name
  const separator = fullname.includes('-') ? '-' : ' ';
  const capitalizedFullname = capitalizedNames.join(separator);

  return capitalizedFullname;
};
