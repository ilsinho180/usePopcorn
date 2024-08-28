import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import StarRating from "./StarRating";

// function Test() {
//   const [rating, setRating] = useState(0);
//   return (
//     <div>
//       <StarRating color="red" size={48} onSetRating={setRating} />
//       <p>The movie is rated: {rating}!</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating maxRating={5} />
    <StarRating
      maxRating={5}
      color="green"
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
      className="test"
      defaultRating={4}
    /> */}
    {/* <Test /> */}
  </React.StrictMode>
);
