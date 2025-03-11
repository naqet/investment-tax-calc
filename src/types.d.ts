export {};

declare global {
  enum Currency {
    USD = "USD",
    PLN = "PLN",
    EUR = "EUR",
  }

  enum EntryType {
    BUY = "BUY",
    SELL = "SELL",
    COMMISSION = "COMMISSION",
    TAX = "TAX",
    DIVIDEND = "DIVIDEND",
  }

  type Entry = {
        id: string;
    asset: string;
    amount: number;
    price: number;
    currency: Currency;
    type: EntryType;
  };

  type QueueNode = {
    next?: QueueNode;
    value: Entry;
  };
}
