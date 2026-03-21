export const sendRealSMS = async (to: string, body: string) => {
  const sid = import.meta.env.VITE_TWILIO_SID;
  const token = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const from = import.meta.env.VITE_TWILIO_FROM_PHONE;

  if (!sid || !token || !from) {
    console.warn("Twilio credentials missing in .env file. SMS not sent.");
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  
  const params = new URLSearchParams();
  // Ensure the phone number has a + country code if needed
  const formattedTo = to.startsWith('+') ? to : `+${to.replace(/\D/g, '')}`;

  params.append('To', formattedTo);
  params.append('From', from);
  params.append('Body', body);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + window.btoa(`${sid}:${token}`)
      },
      body: params.toString()
    });

    const data = await response.json();
    console.log("Twilio SMS Dispatch Response:", data);
    return response.ok;
  } catch (error) {
    console.error("Twilio SMS Error:", error);
    return false;
  }
};
