import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCwRTnYr1MlqTi_xeJ0FqfEOZZ9_34_Rhs",
  authDomain: "finger-sercurity.firebaseapp.com",
  databaseURL: "https://finger-sercurity-default-rtdb.firebaseio.com",
  projectId: "finger-sercurity",
  storageBucket: "finger-sercurity.appspot.com",
  messagingSenderId: "475109845889",
  appId: "1:475109845889:web:71035ff2f1d65f59795680",
  measurementId: "G-Y57S6S0P68",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

let listIDFinger = [];

const getFingers = ref(database, "finger/");
onValue(getFingers, (snapshot) => {
  const data = snapshot.val();
  const fingers = Object.values(data);
  const names = Object.keys(data);

  let isDoor = false;
  fingers.forEach((finger) => {
    for (let i = 0; i <= 127; i++) {
      if (finger[`${i}`] === true) {
        isDoor = true;
      }
    }
  });

  // Auto close door after 5 seconds
  names.forEach((name) => {
    const fingerItems = fingers[names.indexOf(name)];
    const idItems = Object.keys(fingerItems);

    idItems.forEach((id) => {
      setTimeout(() => {
        setStatusFinger(name, id, false);
      }, 5000);
    });
  });

  if (isDoor) {
    setDoor(true);
    console.log("DOOR is OPEN");
  } else {
    setDoor(false);
    console.log("DOOR is CLOSE");
  }
});

get(child(ref(getDatabase()), "finger/"))
  .then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const fingers = Object.values(data);
      const names = Object.keys(data);
      names.forEach((name) => {
        const fingerItems = fingers[names.indexOf(name)];
        const idItems = Object.keys(fingerItems);
        console.log(name, idItems);
        renderUser(name, idItems);
        idItems.forEach((id) => {
          listIDFinger.push(id);
        });
      });
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error(error);
  });

// setInterval(() => {
//   console.log("listIDFinger", listIDFinger);
// }, 10000);

const setDoor = (status) => {
  set(ref(database, "door"), status);
};

const setStatusFinger = (name, id, status) => {
  set(ref(database, "finger/" + name + "/" + id), status);
};

const addFinger = (name, id) => {
  if (listIDFinger.includes(id) || id === "") {
    alert("ID already exists");
  } else {
    setStatusFinger(name, id, true);
    alert("Add Finger Success");
    window.location.reload(true);
  }
};

document.getElementById("add-finger").addEventListener("click", (e) => {
  e.preventDefault();
  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;

  addFinger(name, id);
});

setStatusFinger("Hoang", "18", true);

document.getElementById("remove-finger").addEventListener("click", (e) => {
  e.preventDefault();
  const id = document.getElementById("id").value;
  const name = document.getElementById("name").value;

  removeFinger(name, id);
});

const removeFinger = (name, id) => {
  if (listIDFinger.includes(id)) {
    remove(ref(database, "finger/" + name + "/" + id));
    window.location.reload(true);
  } else {
    alert("Not found ID");
  }
};
const renderUser = (name, id) => {
  console.log(id);
  id.forEach((i, index) => {
    const html = `
     <tr>
      <th class="number" scope="row">${index + 1}</th>
      <td>${name}</td>
      <td>${i}</td>
      <td class="btn-del"></td>
    </tr>
      `;
    document.querySelector(".table-user").innerHTML += html;

    const btnDel = document.createElement("button");
    btnDel.classList.add("btn");
    btnDel.classList.add("btn-default");
    btnDel.textContent = "❌";

    const allBtnDel = document.querySelectorAll(".btn-del");
    allBtnDel.forEach((btn, index) => {
      btn.appendChild(btnDel);
    });
    btnDel.addEventListener("click", (e) => {
      e.preventDefault();
      removeFinger(name, i);
    });
  });
};
