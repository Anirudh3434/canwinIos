import { Pusher } from '@pusher/pusher-websocket-react-native';

let pusherInstance = null;

export const initPusher = async (channelName, onMessageCallback) => {
  try {
    if (!pusherInstance) {
      const pusher = Pusher.getInstance();
      await pusher.init({
        apiKey: 'f372f610309af25c0911',
        cluster: 'ap2',
        onConnectionStateChange: (current, previous) => {
          console.log(`Pusher: ${previous} → ${current}`);
        },
        onError: (message, code, error) => {
          console.error(`Pusher Error [${code}]: ${message}`, error);
        },
      });

      await pusher.connect();

      await pusher.subscribe({
        channelName: channelName,
        onEvent: (event) => {
          if (event.eventName === 'message' && typeof onMessageCallback === 'function') {
            onMessageCallback(event);
          }
        },
      });

      pusherInstance = pusher;
      console.log('✅ Pusher initialized and subscribed');
    }
  } catch (error) {
    console.error('❌ Pusher initialization error:', error);
  }
};

export const disconnectPusher = async (channelName) => {
  if (pusherInstance) {
    await pusherInstance.unsubscribe({ channelName });
    await pusherInstance.disconnect();
    pusherInstance = null;
    console.log('🔌 Pusher disconnected');
  }
};
