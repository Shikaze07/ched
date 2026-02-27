import PusherClient from "pusher-js";

const pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "", {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
  forceTLS: true,
});

export default pusher;
