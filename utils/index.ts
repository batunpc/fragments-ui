import { Auth, getUser } from "../src/auth";

const authHandler = async () => {
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const userSection = document.querySelector("#user");
  const user = await getUser();

  loginBtn
    ? loginBtn.addEventListener("click", () => Auth.federatedSignIn())
    : null;

  logoutBtn ? logoutBtn.addEventListener("click", () => Auth.signOut()) : null;

  if (!user) {
    logoutBtn?.setAttribute("disabled", "true");
    return;
  }

  console.log({ user });
  userSection?.attributes.removeNamedItem("hidden");
  loginBtn?.setAttribute("disabled", "true");
  userSection
    ?.querySelector(".username")
    ?.appendChild(document.createTextNode(user?.username));
  loginBtn?.classList.add("hidden");

  return user;
};

export default authHandler;
