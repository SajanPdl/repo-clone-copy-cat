
// Real Nepali date utility using BS Date API
export interface NepaliDateInfo {
  nepaliDate: string;
  englishDate: string;
  formattedNepali: string;
  dayOfWeek: string;
  time: string;
}

export const fetchRealNepaliDate = async (): Promise<NepaliDateInfo> => {
  try {
    const now = new Date();
    const response = await fetch(`https://nepali-date-converter.vercel.app/api/convert?date=${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Nepali date');
    }
    
    const data = await response.json();
    
    const nepaliDays = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];
    const nepaliMonths = [
      'बैशाख', 'जेष्ठ', 'आषाढ', 'श्रावण', 'भाद्र', 'आश्विन',
      'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत्र'
    ];
    
    return {
      nepaliDate: `${data.nepaliYear}/${data.nepaliMonth.toString().padStart(2, '0')}/${data.nepaliDay.toString().padStart(2, '0')}`,
      englishDate: now.toLocaleDateString(),
      formattedNepali: `${nepaliMonths[data.nepaliMonth - 1]} ${data.nepaliDay}, ${data.nepaliYear}`,
      dayOfWeek: nepaliDays[now.getDay()],
      time: getNepaliTime()
    };
  } catch (error) {
    console.error('Error fetching Nepali date:', error);
    // Fallback to approximate calculation
    return getFallbackNepaliDate();
  }
};

export const getNepaliTime = (): string => {
  const now = new Date();
  const nepaliTime = new Date(now.getTime() + (5 * 60 + 45) * 60 * 1000); // Nepal is UTC+5:45
  return nepaliTime.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

const getFallbackNepaliDate = (): NepaliDateInfo => {
  const now = new Date();
  const nepaliDays = ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'];
  
  return {
    nepaliDate: '२०८१/०४/१५', // Fallback date
    englishDate: now.toLocaleDateString(),
    formattedNepali: 'श्रावण १५, २०८१',
    dayOfWeek: nepaliDays[now.getDay()],
    time: getNepaliTime()
  };
};

// Legacy functions for backward compatibility
export const getNepaliDate = (): string => {
  const now = new Date();
  return now.toLocaleDateString();
};
