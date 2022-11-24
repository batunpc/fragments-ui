// src/app.js

//import { Auth, getUser } from "./auth";
import authHandler from "../utils/index";
import {
  getFragmentById,
  getUserFragments,
  postFragment,
  deleteFragment,
} from "./api";

async function init() {
  const user = await authHandler(); // User info

  if (user) createFragmentCard();

  // Form where fragment is created
  const createFragmentForm = document.getElementById("create-fragment-form");

  // Dropdown menu to select fragment type
  const fragmentTypeDropdown = document.getElementById(
    "fragment-type-dropdown"
  ) as HTMLSelectElement;

  // Textarea where fragment data is written
  const fragmentInput = document.getElementById(
    "fragmentData"
  ) as HTMLInputElement;

  // == POST == //
  createFragmentForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fragmentType = fragmentTypeDropdown.value;
    const fragmentData = fragmentInput.value.trim();

    const fragment = await postFragment(user, fragmentType, fragmentData);

    createFragmentCard();
    fragmentInput.value = "";
    console.log("Fragment created", { fragment });
    console.log(`Posted fragment of type ${fragmentType}`);
  });

  // // CONVERT: Convert Form and Fragment ID
  // const convertForm = document.querySelector("#convert-form");
  // const convertFragmentIdInput = document.querySelector(
  //   "#convert-fragment-id-input"
  // ) as HTMLInputElement; // ENTER fragment id here
  // const convertFragmentType = document.querySelector(
  //   "#convert-fragment-type"
  // ) as HTMLSelectElement; // SELECT fragment type here

  // fragmentForm?.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   //postFragment(user, fragmentType.value, fragmentInput.value);
  //   postFragment(user, fragmentType.value, fragmentInput.value);
  //   createFragmentCard();
  // });

  // convertForm?.addEventListener("submit", (e) => {
  //   e.preventDefault();
  //   getFragmentById(
  //     user,
  //     convertFragmentIdInput.value,
  //     convertFragmentType.value
  //   );
  // });

  function createFragmentCard() {
    const listOfFragments = getUserFragments(user, true);
    listOfFragments.then((data) => {
      const metadataCard = document.querySelector(
        "#metadataCard"
      ) as HTMLElement;
      metadataCard.innerHTML = "";
      data?.fragments.data.forEach((fragment: any) => {
        const fragmentDiv = document.createElement("div");
        fragmentDiv.setAttribute(
          "style",
          `color: #233142;
           background-color: #DBE2EF;
           margin: 10px; 
           padding: 10px; 
           width: 90%; 
           overflow: scroll; 
           display: inline-block; 
           vertical-align: top; 
           text-align: left; 
           border-radius: 20px; 
           border: 5px solid #103664; 
           font-size: 17px;`
        );

        const formattedDate = new Date(fragment.created).toLocaleString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );

        fragmentDiv.innerHTML = `<span> Fragment ID:</span> <i> ${fragment.id} </i> <br>
                                <span> Content-Type:</span> <i>${fragment.type}</i> <br>
                                <span> Fragment Size:</span> ${fragment.size}  <br>
                                <span> Created:</span> ${formattedDate}  `;
        // == Delete button == //
        const deleteBtn = document.createElement("button");
        deleteBtn.setAttribute("class", "btn btn-outline-danger btn-sm");
        deleteBtn.setAttribute("style", "float: right;");
        deleteBtn.innerHTML = "Delete Fragment";
        deleteBtn.addEventListener("click", async () => {
          await deleteFragment(user, fragment.id);
          createFragmentCard();
        });
        fragmentDiv.appendChild(deleteBtn);

        // == Get Data button == //
        const getDataBtn = document.createElement("button");
        getDataBtn.setAttribute("class", "btn btn-outline-primary btn-sm");
        getDataBtn.setAttribute("style", "float: right; margin-right: 10px;");
        getDataBtn.innerHTML = "Get Data";
        fragmentDiv.appendChild(getDataBtn);

        fragmentDiv.querySelectorAll("span").forEach((span) => {
          span.setAttribute(
            "style",
            ` color: #3F72AF; font-weight: 700; font-family: 'Courier New', Courier, monospace;`
          );
        });
        fragmentDiv.querySelectorAll("i").forEach((i) => {
          i.setAttribute(
            "style",
            // fragment id and content-type
            "background-color: #3C4048; color: #00ABB3; padding: 2px 5px; border-radius: 5px; font-weight: 500;"
          );
        });

        metadataCard?.appendChild(fragmentDiv);
      });
    });
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
