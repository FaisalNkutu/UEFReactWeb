// utils/ScreenTimeTracker.js

let latestLog = ''; // Add this at the top

export const logScreenTime = (screenName, userId) => {
  const timestamp = new Date().toISOString();
  latestLog = `📺 User ${userId} viewed screen: ${screenName} at ${timestamp}`;
  console.log(latestLog);

  fetch(`http://192.168.91.1:8085/api/screen-logs/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenName, timestamp }),
  }).catch((err) => {
    console.error('❌ Failed to log screen usage', err);
  });
};

// ✅ New helper to get latest log
export const getLatestScreenLog = () => latestLog;
