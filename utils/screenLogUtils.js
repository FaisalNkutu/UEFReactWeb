// utils/screenLogUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getScreenLogsForUser = async (userId) => {
  const key = `screenLogs_${userId}`;
  const logs = await AsyncStorage.getItem(key);
  return JSON.parse(logs || '[]');
};

export const filterLogs = (logs, { screen = null, date = null }) => {
  return logs.filter(log => {
    const logDate = new Date(log.timestamp).toISOString().slice(0, 10);
    const matchScreen = !screen || log.screen === screen;
    const matchDate = !date || logDate === date;
    return matchScreen && matchDate;
  });
};

export const aggregateScreenTime = (logs) => {
  return logs.reduce((acc, log) => {
    acc[log.screen] = (acc[log.screen] || 0) + log.duration;
    return acc;
  }, {});
};

export const exportLogsAsJson = (logs) => {
  return JSON.stringify(logs, null, 2);
};

export const exportLogsAsCSV = (logs) => {
  const header = 'Screen,Duration (s),Timestamp\n';
  const rows = logs.map(log => `${log.screen},${log.duration},${log.timestamp}`);
  return header + rows.join('\n');
};