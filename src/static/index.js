"use strict";

/** @type {Map<string, Queue>} */
const db = new Map();

/** @param {SubmitEvent} event  */
function handleSubmit(event) {
  event.preventDefault();
  const form = /** @type {HTMLFormElement} */ (event.target);
  const formData = new FormData(form);

  /** @type {Entry} */
  const data = {
    id: crypto.randomUUID(),
    asset: formData.get("asset").toString(),
    type: /** @type {EntryType}*/ (formData.get("type")),
    amount: +formData.get("amount"),
    price: +formData.get("price"),
    currency: /** @type {Currency}*/ (formData.get("currency")),
  };

  switch (data.type) {
    case "BUY":
      handleBuy(data);
      break;
    case "SELL":
      handleSell(data);
      break;
    case "COMMISSION":
    case "TAX":
    case "DIVIDEND":
      break;
    default:
      throw Error("Invalid entry type");
  }

  form.reset();
}

/** @param {Entry} data */
function handleBuy(data) {
  const prevData = db.get(data.asset.toString());

  if (prevData) {
    prevData.enqueue(data);
  } else {
    const queue = new Queue();
    queue.enqueue(data);
    db.set(data.asset.toString(), queue);
  }
  addToTable(data);
}

/** @param {Entry} data */
function handleSell(data) {
  addToTable(data);
  const buys = db.get(data.asset.toString());

  let amountToSell = data.amount;
  let profit = 0;

  while (true) {
    const node = buys.deque();
    const entry = node.value;
    amountToSell -= entry.amount;

    if (amountToSell > 0) {
      profit += entry.amount * data.price - entry.amount * entry.price;
      continue;
    }

    const sold = amountToSell === 0 ? entry.amount : Math.abs(amountToSell);
    profit += sold * data.price - sold * entry.price;

    entry.amount = +(entry.amount - sold).toFixed(2);
    buys.pushTail(entry);
    break;
  }
  console.log(profit);
}

/** @param {Entry} data */
function addToTable(data) {
  const row = createRecord(data);

  const table = document.querySelector("tbody");
  table.insertAdjacentElement("afterbegin", row);
}

/**
 * @param {Entry} data
 * @returns HTMLTableRowElement
 * */
function createRecord(data) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <th>${data.asset}</th>
    <th>${data.type}</th>
    <th>${data.amount}</th>
    <th>${data.price}</th>
    <th>${data.currency}</th>
  `;

  return row;
}

class Queue {
  /**
   * @type {QueueNode | undefined}
   * */
  head;
  /**
   * @private
   * @type {QueueNode | undefined}
   * */
  tail;

  /**
   * @type {number}
   * */
  length = 0;

  walk() {
    if (!this.head) {
      return;
    }

    let curr = this.head;
    while (curr) {
      console.log(curr.value);
      curr = this.head.next;
    }
  }

  /** @param {Entry} data */
  enqueue(data) {
    /** @type {QueueNode}*/
    const node = {
      value: data,
    };

    if (this.length === 0) {
      this.tail = node;
      this.head = node;
      this.length++;
      return;
    }

    const head = this.head;
    head.next = node;
    this.head = node;
    this.length++;
  }

  /** @param {Entry} data */
  pushTail(data) {
    /** @type {QueueNode}*/
    const node = {
      value: data,
    };

    if (this.length === 0) {
      this.tail = node;
      this.head = node;
      this.length++;
      return;
    }

    const tail = this.tail;
    node.next = tail;
    this.tail = node;
    this.length++;
  }

  /** @returns {QueueNode | undefined} */
  deque() {
    if (this.length === 0) {
      return;
    }

    if (this.length === 1) {
      const node = this.tail;
      this.head = undefined;
      this.tail = undefined;
      this.length--;
      return node;
    }

    const node = this.tail;
    this.tail = this.tail.next;
    this.length--;
    return node;
  }
}
