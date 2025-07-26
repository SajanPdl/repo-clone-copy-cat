
// Nepali date utilities
export const getNepaliDate = (): string => {
  const date = new Date();
  
  // Simple conversion - you can enhance this with a proper Nepali calendar library
  const nepaliMonths = [
    'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
    'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
  ];
  
  const nepaliDays = [
    'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
  ];
  
  // Approximate Nepali date (you should use a proper conversion library)
  const nepaliYear = date.getFullYear() + 57; // Rough conversion
  const month = date.getMonth();
  const day = date.getDay();
  const dateNum = date.getDate();
  
  return `${nepaliDays[day]}, ${nepaliMonths[month]} ${dateNum}, ${nepaliYear}`;
};

export const getNepaliTime = (): string => {
  const date = new Date();
  return date.toLocaleTimeString('ne-NP', { 
    hour12: true,
    hour: '2-digit',
    minute: '2-digit'
  });
};
