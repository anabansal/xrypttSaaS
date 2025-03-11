import { initializePaddle} from "@paddle/paddle-js";
// import Paddle from "@paddle/paddle-js";
import { useEffect, useState } from 'react';

export default function Payment() {
  const [paddle, setPaddle] = useState(null);

  useEffect(() => {
    initializePaddle({
      environment: "sandbox",
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
    }).then((paddleInstance) => setPaddle(paddleInstance));
  }, []);

  const handleCheckout = () => {
    if (!paddle) return alert("Paddle not initialized");

    paddle.Checkout.open({
      items: [
        {
          priceId: "pri_01jnrexyz6v8dy126m9a9g3mfw", // Replace with actual price ID
          quantity: 1,
        },
      ],
      settings: {
        displayMode: "overlay",
        theme: "dark",
        successUrl: "http://localhost:5173/",
      },
    });
  };

  return (
    <button onClick={handleCheckout}>Pay Now</button>
  );
}

