import moment from "moment";

/* ===========================================================
   Base Helpers — Read Room Item from Redux Cart
   =========================================================== */

export const getRoomItem = (cartItems, room_id) => {
  return cartItems.find((i) => i.room_id === room_id) || null;
};

export const getValue = (cartItems, room_id, key) => {
  const item = getRoomItem(cartItems, room_id);
  return item ? item[key] : "";
};

/* ===========================================================
   Room Fields
   =========================================================== */

export const getQuantity = (cartItems, room_id) =>
  getValue(cartItems, room_id, "roomcount") || 1;

export const getAdult = (cartItems, room_id) =>
  getValue(cartItems, room_id, "adult");

export const getChild = (cartItems, room_id) =>
  getValue(cartItems, room_id, "child_cate");

export const getOccupantName = (cartItems, room_id) =>
  getValue(cartItems, room_id, "selectoccupant");

export const getOccupantId = (cartItems, room_id) =>
  getValue(cartItems, room_id, "occupant_id");

export const getAmount = (cartItems, room_id) =>
  getValue(cartItems, room_id, "amount") || 0;

export const getBookId = (cartItems, room_id) =>
  getValue(cartItems, room_id, "book_id");

export const getGuestName = (cartItems, room_id) =>
  getValue(cartItems, room_id, "guest_name");

export const getGuestEmail = (cartItems, room_id) =>
  getValue(cartItems, room_id, "guest_email");

export const getGuestMobile = (cartItems, room_id) =>
  getValue(cartItems, room_id, "guest_mobile");

export const getAdditionalInfo = (cartItems, room_id) =>
  getValue(cartItems, room_id, "additional_info");

/* ===========================================================
   State Checks
   =========================================================== */

export const isBooked = (cartItems, room_id) => {
  const id = getBookId(cartItems, room_id);
  return id && id !== "";
};

export const hasGuestFields = (cartItems, room_id) => {
  return getAdditionalInfo(cartItems, room_id) === "Yes";
};

/* ===========================================================
   Validation Helpers
   =========================================================== */

export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,6}$/;
  return regex.test(email);
};

export const validateGuestForm = (cartItems, room_id) => {
  const fails = [];

  const name = getGuestName(cartItems, room_id);
  const email = getGuestEmail(cartItems, room_id);
  const mobile = getGuestMobile(cartItems, room_id);

  if (!name) fails.push("Guest Name is required.");
  if (!email || !isValidEmail(email)) fails.push("Invalid Email.");
  if (!mobile || mobile.length !== 10) fails.push("Mobile must be 10 digits.");

  return fails;
};

/* ===========================================================
   Date Helpers
   =========================================================== */

export const formatDate = (date) => moment(date).format("YYYY-MM-DD");
export const displayDate = (date) => moment(date).format("DD-MM-YYYY");

/* ===========================================================
   UI Helpers
   =========================================================== */

export const redIf = (condition, color = "red") => {
  return condition ? color : "#D1D1D1";
};

export const disableIf = (condition) => {
  return condition ? 0.5 : 1;
};

export const showCurrency = (value) => {
  if (!value) return "0.00";
  return Number(value).toFixed(2);
};
