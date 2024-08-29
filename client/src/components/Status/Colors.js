export const getStatusColor = (status) => {
  switch (status) {
    case "Working":
      return "#03c03c";
    case "Working Remotely":
      return "#77dd77";
    case "On Vacation":
      return "#cfcfc4";
    case "Business Trip":
      return "#aec6cf";
    default:
      return "#000000";
  }
};
